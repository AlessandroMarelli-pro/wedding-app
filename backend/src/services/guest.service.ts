import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import * as Papa from 'papaparse';
import { Repository } from 'typeorm';
import { CSVUpload, UploadStatus } from '../entities/csv-upload.entity';
import { Guest } from '../entities/guest.entity';

export interface CSVRow {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  partySize: number;
  dietaryRestrictions?: string;
  specialRequests?: string;
}

export interface ProcessedCSVResult {
  totalRows: number;
  processedRows: number;
  errorRows: number;
  warningRows: number;
  errors: string[];
  detailedErrors: CSVValidationError[];
  warnings: CSVWarning[];
  summary: CSVProcessingSummary;
  guests: Guest[];
}

export interface CSVValidationError {
  row: number;
  field?: string;
  value?: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

export interface CSVWarning {
  row: number;
  field?: string;
  value?: string;
  message: string;
  code?: string;
}

export interface CSVProcessingSummary {
  duplicatesSkipped: number;
  emptyRowsSkipped: number;
  validationErrors: number;
  dataWarnings: number;
  fieldsProcessed: string[];
  processingTime: number;
}

@Injectable()
export class GuestService {
  private readonly HASH_CODE_LENGTH = 8;
  private readonly HASH_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    @InjectRepository(CSVUpload)
    private readonly csvUploadRepository: Repository<CSVUpload>,
  ) {}

  /**
   * Get the RSVP confirmation for a guest by their hash code.
   * Returns the RSVPConfirmation entity if found, otherwise null.
   */
  async getRSVPConfirmationByHashCode(hashCode: string) {
    const guest = await this.guestRepository.findOne({
      where: { hashCode: hashCode.toUpperCase() },
      relations: ['rsvpConfirmation'],
    });
    if (!guest) {
      throw new BadRequestException('Guest not found');
    }
    return guest.rsvpConfirmation || null;
  }

  /**
   * Get the RSVP confirmation for a guest by their guest ID.
   * Returns the RSVPConfirmation entity if found, otherwise null.
   */
  async getRSVPConfirmationByGuestId(guestId: string) {
    const guest = await this.guestRepository.findOne({
      where: { id: guestId },
      relations: ['rsvpConfirmation'],
    });
    if (!guest) {
      throw new BadRequestException('Guest not found');
    }
    return guest.rsvpConfirmation || null;
  }
  async getAllGuests(): Promise<Guest[]> {
    return this.guestRepository.find({
      relations: ['rsvpConfirmation'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async getGuestByHashCode(hashCode: string): Promise<Guest | null> {
    return this.guestRepository.findOne({
      where: { hashCode: hashCode.toUpperCase() },
    });
  }

  async getGuestsByUpload(csvUploadId: string): Promise<Guest[]> {
    return this.guestRepository.find({
      where: { csvUploadId },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async processCSVFile(
    fileContent: string,
    filename: string,
    uploadedBy: string,
  ): Promise<CSVUpload> {
    // Create CSV upload record
    const csvUpload = this.csvUploadRepository.create({
      filename,
      uploadedBy,
      status: UploadStatus.PROCESSING,
      totalRows: 0,
      processedRows: 0,
      errorRows: 0,
    });

    const savedUpload = await this.csvUploadRepository.save(csvUpload);

    try {
      const result = await this.parseAndValidateCSV(
        fileContent,
        savedUpload.id,
      );

      // Update upload record with results
      savedUpload.totalRows = result.totalRows;
      savedUpload.processedRows = result.processedRows;
      savedUpload.errorRows = result.errorRows;
      savedUpload.status =
        result.errorRows > 0 ? UploadStatus.FAILED : UploadStatus.COMPLETED;

      // Store enhanced error information
      const errorReport = {
        simpleErrors: result.errors,
        detailedErrors: result.detailedErrors,
        warnings: result.warnings,
        summary: result.summary,
      };
      savedUpload.errorLog = JSON.stringify(errorReport);

      await this.csvUploadRepository.save(savedUpload);
      return savedUpload;
    } catch (error: any) {
      // Mark as failed
      savedUpload.status = UploadStatus.FAILED;
      savedUpload.errorLog = JSON.stringify([error.message]);
      await this.csvUploadRepository.save(savedUpload);
      throw error;
    }
  }

  private async parseAndValidateCSV(
    fileContent: string,
    csvUploadId: string,
  ): Promise<ProcessedCSVResult> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const errors: string[] = [];
      const detailedErrors: CSVValidationError[] = [];
      const warnings: CSVWarning[] = [];
      const guests: Guest[] = [];
      const fieldsProcessed = new Set<string>();

      let rowNumber = 0;
      let duplicatesSkipped = 0;
      let emptyRowsSkipped = 0;
      let validationErrors = 0;
      let dataWarnings = 0;

      Papa.parse<CSVRow>(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          const cleanHeader = header.trim();
          fieldsProcessed.add(cleanHeader);
          return cleanHeader;
        },
        step: async (row) => {
          rowNumber++;

          // Check for empty rows
          if (this.isRowEmpty(row.data)) {
            emptyRowsSkipped++;
            warnings.push({
              row: rowNumber,
              message: 'Empty row skipped',
              code: 'EMPTY_ROW',
            });
            return;
          }
          try {
            const validationResult = this.validateCSVRowWithDetails(
              row.data,
              rowNumber,
            );

            // Add warnings to collection
            warnings.push(...validationResult.warnings);
            dataWarnings += validationResult.warnings.length;

            if (validationResult.errors.length > 0) {
              // Add detailed errors
              detailedErrors.push(...validationResult.errors);
              validationErrors += validationResult.errors.length;

              // Add simple error message
              const errorMessages = validationResult.errors.map(
                (e) => e.message,
              );
              errors.push(`Row ${rowNumber}: ${errorMessages.join(', ')}`);
              return;
            }

            const guest = await this.createGuestFromCSVRow(
              validationResult.validatedRow,
              csvUploadId,
            );
            guests.push(guest);
          } catch (error: any) {
            if (error.message.includes('already exists')) {
              duplicatesSkipped++;
              warnings.push({
                row: rowNumber,
                message: error.message,
                code: 'DUPLICATE_GUEST',
                value: `${row.data.firstName} ${row.data.lastName}`,
              });
            } else {
              validationErrors++;
              errors.push(`Row ${rowNumber}: ${error.message}`);
              detailedErrors.push({
                row: rowNumber,
                message: error.message,
                severity: 'error',
                code: 'PROCESSING_ERROR',
              });
            }
          }
        },
        complete: () => {
          const processingTime = Date.now() - startTime;

          resolve({
            totalRows: rowNumber,
            processedRows: guests.length,
            errorRows: errors.length,
            warningRows: warnings.length,
            errors,
            detailedErrors,
            warnings,
            summary: {
              duplicatesSkipped,
              emptyRowsSkipped,
              validationErrors,
              dataWarnings,
              fieldsProcessed: Array.from(fieldsProcessed),
              processingTime,
            },
            guests,
          });
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  }

  private isRowEmpty(row: any): boolean {
    if (!row) return true;

    const values = Object.values(row);
    return values.every(
      (value) =>
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === ''),
    );
  }

  private validateCSVRowWithDetails(
    row: CSVRow,
    rowNumber: number,
  ): {
    validatedRow: CSVRow;
    errors: CSVValidationError[];
    warnings: CSVWarning[];
  } {
    const errors: CSVValidationError[] = [];
    const warnings: CSVWarning[] = [];
    const validatedRow = { ...row };
    // Validate firstName
    if (!validatedRow.firstName || typeof validatedRow.firstName !== 'string') {
      errors.push({
        row: rowNumber,
        field: 'firstName',
        value: validatedRow.firstName,
        message: 'firstName is required',
        severity: 'error',
        code: 'REQUIRED_FIELD',
      });
    } else {
      validatedRow.firstName = validatedRow.firstName.trim();
      if (validatedRow.firstName.length === 0) {
        errors.push({
          row: rowNumber,
          field: 'firstName',
          value: validatedRow.firstName,
          message: 'firstName cannot be empty',
          severity: 'error',
          code: 'EMPTY_FIELD',
        });
      } else if (validatedRow.firstName.length > 50) {
        errors.push({
          row: rowNumber,
          field: 'firstName',
          value: validatedRow.firstName,
          message: 'firstName must be 50 characters or less',
          severity: 'error',
          code: 'FIELD_TOO_LONG',
        });
      }
    }

    // Validate lastName
    if (!validatedRow.lastName || typeof validatedRow.lastName !== 'string') {
      errors.push({
        row: rowNumber,
        field: 'lastName',
        value: validatedRow.lastName,
        message: 'lastName is required',
        severity: 'error',
        code: 'REQUIRED_FIELD',
      });
    } else {
      validatedRow.lastName = validatedRow.lastName.trim();
      if (validatedRow.lastName.length === 0) {
        errors.push({
          row: rowNumber,
          field: 'lastName',
          value: validatedRow.lastName,
          message: 'lastName cannot be empty',
          severity: 'error',
          code: 'EMPTY_FIELD',
        });
      } else if (validatedRow.lastName.length > 50) {
        errors.push({
          row: rowNumber,
          field: 'lastName',
          value: validatedRow.lastName,
          message: 'lastName must be 50 characters or less',
          severity: 'error',
          code: 'FIELD_TOO_LONG',
        });
      }
    }

    // Validate email (optional)
    if (validatedRow.email && typeof validatedRow.email === 'string') {
      validatedRow.email = validatedRow.email.trim();
      if (validatedRow.email.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(validatedRow.email)) {
          errors.push({
            row: rowNumber,
            field: 'email',
            value: validatedRow.email,
            message: 'email format is invalid',
            severity: 'error',
            code: 'INVALID_EMAIL',
          });
        }
      } else {
        validatedRow.email = undefined;
      }
    }

    // Validate partySize (required, defaults to 1)
    if (
      validatedRow.partySize !== undefined &&
      validatedRow.partySize !== null
    ) {
      const originalPartySize = validatedRow.partySize;

      if (typeof validatedRow.partySize === 'string') {
        const parsedPartySize = parseInt(
          (validatedRow.partySize as string).trim(),
          10,
        );
        if (isNaN(parsedPartySize)) {
          errors.push({
            row: rowNumber,
            field: 'partySize',
            value: String(originalPartySize),
            message: 'partySize must be a valid number',
            severity: 'error',
            code: 'INVALID_NUMBER',
          });
        } else {
          validatedRow.partySize = parsedPartySize;
          warnings.push({
            row: rowNumber,
            field: 'partySize',
            value: String(originalPartySize),
            message: `Party size converted from string to number: "${originalPartySize}" → ${parsedPartySize}`,
            code: 'TYPE_CONVERSION',
          });
        }
      }

      if (typeof validatedRow.partySize === 'number') {
        if (
          !Number.isInteger(validatedRow.partySize) ||
          validatedRow.partySize < 1 ||
          validatedRow.partySize > 20
        ) {
          errors.push({
            row: rowNumber,
            field: 'partySize',
            value: String(originalPartySize),
            message: 'partySize must be an integer between 1 and 20',
            severity: 'error',
            code: 'OUT_OF_RANGE',
          });
        } else if (validatedRow.partySize > 10) {
          warnings.push({
            row: rowNumber,
            field: 'partySize',
            value: String(validatedRow.partySize),
            message: `Large party size detected: ${validatedRow.partySize} guests`,
            code: 'LARGE_PARTY',
          });
        }
      } else if (typeof validatedRow.partySize !== 'number') {
        errors.push({
          row: rowNumber,
          field: 'partySize',
          value: String(originalPartySize),
          message: 'partySize must be a valid number',
          severity: 'error',
          code: 'INVALID_TYPE',
        });
      }
    } else {
      // Default to 1 if not provided
      validatedRow.partySize = 1;
      warnings.push({
        row: rowNumber,
        field: 'partySize',
        message: 'partySize not provided, defaulting to 1',
        code: 'DEFAULT_VALUE',
      });
    }

    // Validate dietaryRestrictions (optional)
    if (
      validatedRow.dietaryRestrictions &&
      typeof validatedRow.dietaryRestrictions === 'string'
    ) {
      validatedRow.dietaryRestrictions =
        validatedRow.dietaryRestrictions.trim();
      if (validatedRow.dietaryRestrictions.length === 0) {
        validatedRow.dietaryRestrictions = undefined;
      } else if (validatedRow.dietaryRestrictions.length > 1000) {
        errors.push({
          row: rowNumber,
          field: 'dietaryRestrictions',
          value: validatedRow.dietaryRestrictions.substring(0, 50) + '...',
          message: 'dietaryRestrictions must be 1000 characters or less',
          severity: 'error',
          code: 'FIELD_TOO_LONG',
        });
      } else if (validatedRow.dietaryRestrictions.length > 500) {
        warnings.push({
          row: rowNumber,
          field: 'dietaryRestrictions',
          value: validatedRow.dietaryRestrictions.substring(0, 50) + '...',
          message: `Long dietary restrictions text: ${validatedRow.dietaryRestrictions.length} characters`,
          code: 'LONG_TEXT',
        });
      }
    }

    // Validate specialRequests (optional)
    if (
      validatedRow.specialRequests &&
      typeof validatedRow.specialRequests === 'string'
    ) {
      validatedRow.specialRequests = validatedRow.specialRequests.trim();
      if (validatedRow.specialRequests.length === 0) {
        validatedRow.specialRequests = undefined;
      } else if (validatedRow.specialRequests.length > 1000) {
        errors.push({
          row: rowNumber,
          field: 'specialRequests',
          value: validatedRow.specialRequests.substring(0, 50) + '...',
          message: 'specialRequests must be 1000 characters or less',
          severity: 'error',
          code: 'FIELD_TOO_LONG',
        });
      } else if (validatedRow.specialRequests.length > 500) {
        warnings.push({
          row: rowNumber,
          field: 'specialRequests',
          value: validatedRow.specialRequests.substring(0, 50) + '...',
          message: `Long special requests text: ${validatedRow.specialRequests.length} characters`,
          code: 'LONG_TEXT',
        });
      }
    }

    return { validatedRow, errors, warnings };
  }

  private validateCSVRow(row: CSVRow, rowNumber: number): CSVRow {
    const errors: string[] = [];

    // Validate firstName
    if (!row.firstName || typeof row.firstName !== 'string') {
      errors.push('firstName is required');
    } else {
      row.firstName = row.firstName.trim();
      if (row.firstName.length === 0) {
        errors.push('firstName cannot be empty');
      } else if (row.firstName.length > 50) {
        errors.push('firstName must be 50 characters or less');
      }
    }

    // Validate lastName
    if (!row.lastName || typeof row.lastName !== 'string') {
      errors.push('lastName is required');
    } else {
      row.lastName = row.lastName.trim();
      if (row.lastName.length === 0) {
        errors.push('lastName cannot be empty');
      } else if (row.lastName.length > 50) {
        errors.push('lastName must be 50 characters or less');
      }
    }

    // Validate email (optional)
    if (row.email && typeof row.email === 'string') {
      row.email = row.email.trim();
      if (row.email.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors.push('email format is invalid');
        }
      } else {
        row.email = undefined;
      }
    }

    // Validate phoneNumber (optional)
    if (row.phoneNumber && typeof row.phoneNumber === 'string') {
      row.phoneNumber = row.phoneNumber.trim();
      if (row.phoneNumber.length > 0) {
        // Remove common phone number formatting characters
        const cleanPhone = row.phoneNumber.replace(/[\s\-\(\)\+\.]/g, '');

        // Basic phone number validation (digits only, 10-15 characters)
        if (!/^\d{10,15}$/.test(cleanPhone)) {
          errors.push(
            'phoneNumber must be 10-15 digits (formatting characters like spaces, dashes, parentheses will be removed)',
          );
        } else if (row.phoneNumber.length > 20) {
          errors.push('phoneNumber must be 20 characters or less');
        }
      } else {
        row.phoneNumber = undefined;
      }
    }

    // Validate partySize (required, defaults to 1)
    if (row.partySize !== undefined && row.partySize !== null) {
      if (typeof row.partySize === 'string') {
        const parsedPartySize = parseInt((row.partySize as string).trim(), 10);
        if (isNaN(parsedPartySize)) {
          errors.push('partySize must be a valid number');
        } else {
          row.partySize = parsedPartySize;
        }
      }

      if (typeof row.partySize === 'number') {
        if (
          !Number.isInteger(row.partySize) ||
          row.partySize < 1 ||
          row.partySize > 20
        ) {
          errors.push('partySize must be an integer between 1 and 20');
        }
      } else if (typeof row.partySize !== 'number') {
        errors.push('partySize must be a valid number');
      }
    } else {
      // Default to 1 if not provided
      row.partySize = 1;
    }

    // Validate dietaryRestrictions (optional)
    if (
      row.dietaryRestrictions &&
      typeof row.dietaryRestrictions === 'string'
    ) {
      row.dietaryRestrictions = row.dietaryRestrictions.trim();
      if (row.dietaryRestrictions.length === 0) {
        row.dietaryRestrictions = undefined;
      } else if (row.dietaryRestrictions.length > 1000) {
        errors.push('dietaryRestrictions must be 1000 characters or less');
      }
    }

    // Validate specialRequests (optional)
    if (row.specialRequests && typeof row.specialRequests === 'string') {
      row.specialRequests = row.specialRequests.trim();
      if (row.specialRequests.length === 0) {
        row.specialRequests = undefined;
      } else if (row.specialRequests.length > 1000) {
        errors.push('specialRequests must be 1000 characters or less');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return row;
  }

  private async createGuestFromCSVRow(
    row: CSVRow,
    csvUploadId: string,
  ): Promise<Guest> {
    // Check for duplicate (firstName + lastName combination)
    const existingGuest = await this.guestRepository.findOne({
      where: {
        firstName: row.firstName,
        lastName: row.lastName,
      },
    });

    if (existingGuest) {
      throw new Error(`Guest ${row.firstName} ${row.lastName} already exists`);
    }

    // Generate unique hash code
    const hashCode = await this.generateUniqueHashCode();
    const guest = this.guestRepository.create({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phoneNumber: row.phoneNumber,
      partySize: row.partySize,
      dietaryRestrictions: row.dietaryRestrictions,
      specialRequests: row.specialRequests,
      hashCode,
      csvUploadId,
    });

    return this.guestRepository.save(guest);
  }

  async generateUniqueHashCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const hashCode = this.generateRandomHashCode();

      const existingGuest = await this.guestRepository.findOne({
        where: { hashCode },
      });

      if (!existingGuest) {
        return hashCode;
      }

      attempts++;
    }

    throw new Error(
      'Unable to generate unique hash code after maximum attempts',
    );
  }

  private generateRandomHashCode(): string {
    let result = '';
    const bytes = crypto.randomBytes(this.HASH_CODE_LENGTH);

    for (let i = 0; i < this.HASH_CODE_LENGTH; i++) {
      const randomIndex = bytes[i] % this.HASH_CODE_CHARS.length;
      result += this.HASH_CODE_CHARS[randomIndex];
    }

    return result;
  }

  async deleteGuest(id: string): Promise<void> {
    const guest = await this.guestRepository.findOne({ where: { id } });
    if (!guest) {
      throw new BadRequestException(`Guest with ID ${id} not found`);
    }

    await this.guestRepository.remove(guest);
  }

  async deleteGuestsByUpload(csvUploadId: string): Promise<void> {
    await this.guestRepository.delete({ csvUploadId });
  }

  async getCSVUploads(): Promise<CSVUpload[]> {
    const guests = await this.csvUploadRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['guests'],
    });

    return guests;
  }

  async getCSVUpload(id: string): Promise<CSVUpload | null> {
    return this.csvUploadRepository.findOne({ where: { id } });
  }

  /**
   * Get detailed CSV upload report with enhanced error information
   */
  async getCSVUploadReport(csvUploadId: string): Promise<{
    upload: CSVUpload;
    errorReport?: {
      simpleErrors: string[];
      detailedErrors: CSVValidationError[];
      warnings: CSVWarning[];
      summary: CSVProcessingSummary;
    };
  }> {
    const upload = await this.csvUploadRepository.findOne({
      where: { id: csvUploadId },
    });

    if (!upload) {
      throw new Error('CSV upload not found');
    }

    let errorReport;
    if (upload.errorLog) {
      try {
        errorReport = JSON.parse(upload.errorLog);
      } catch (error) {
        // Fallback for old format
        errorReport = {
          simpleErrors: JSON.parse(upload.errorLog),
          detailedErrors: [],
          warnings: [],
          summary: {
            duplicatesSkipped: 0,
            emptyRowsSkipped: 0,
            validationErrors: 0,
            dataWarnings: 0,
            fieldsProcessed: [],
            processingTime: 0,
          },
        };
      }
    }

    return { upload, errorReport };
  }

  /**
   * Get CSV validation statistics
   */
  async getCSVValidationStats(): Promise<{
    totalUploads: number;
    successfulUploads: number;
    failedUploads: number;
    totalRowsProcessed: number;
    totalErrors: number;
    commonErrors: { code: string; count: number; message: string }[];
    commonWarnings: { code: string; count: number; message: string }[];
  }> {
    const uploads = await this.csvUploadRepository.find();

    let totalRowsProcessed = 0;
    let totalErrors = 0;
    const errorCounts = new Map<string, { count: number; message: string }>();
    const warningCounts = new Map<string, { count: number; message: string }>();

    for (const upload of uploads) {
      totalRowsProcessed += upload.totalRows;
      totalErrors += upload.errorRows;

      if (upload.errorLog) {
        try {
          const errorReport = JSON.parse(upload.errorLog);

          // Count detailed errors
          if (errorReport.detailedErrors) {
            for (const error of errorReport.detailedErrors) {
              const code = error.code || 'UNKNOWN';
              const existing = errorCounts.get(code) || {
                count: 0,
                message: error.message,
              };
              errorCounts.set(code, {
                count: existing.count + 1,
                message: error.message,
              });
            }
          }

          // Count warnings
          if (errorReport.warnings) {
            for (const warning of errorReport.warnings) {
              const code = warning.code || 'UNKNOWN';
              const existing = warningCounts.get(code) || {
                count: 0,
                message: warning.message,
              };
              warningCounts.set(code, {
                count: existing.count + 1,
                message: warning.message,
              });
            }
          }
        } catch (error) {
          // Skip malformed error logs
        }
      }
    }

    const commonErrors = Array.from(errorCounts.entries())
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const commonWarnings = Array.from(warningCounts.entries())
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalUploads: uploads.length,
      successfulUploads: uploads.filter(
        (u) => u.status === UploadStatus.COMPLETED,
      ).length,
      failedUploads: uploads.filter((u) => u.status === UploadStatus.FAILED)
        .length,
      totalRowsProcessed,
      totalErrors,
      commonErrors,
      commonWarnings,
    };
  }
}
