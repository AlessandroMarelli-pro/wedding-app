import Papa from 'papaparse';
import { prisma } from './prisma';

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
}

export interface CSVValidationError {
  row: number;
  field?: string;
  message: string;
  value?: string;
}

export interface CSVWarning {
  row: number;
  field?: string;
  message: string;
  value?: string;
}

export interface CSVProcessingSummary {
  totalGuests: number;
  totalPartySize: number;
  emailsProvided: number;
  phoneNumbersProvided: number;
  dietaryRestrictionsProvided: number;
  specialRequestsProvided: number;
}

export class CSVProcessor {
  private readonly HASH_CODE_LENGTH = 8;

  async processCSVFile(
    fileContent: string,
    filename: string,
    uploadedBy: string,
  ): Promise<any> {
    // Create CSV upload record
    const csvUpload = await prisma.cSVUpload.create({
      data: {
        filename,
        uploadedBy,
        status: 'PROCESSING',
        totalRows: 0,
        processedRows: 0,
        errorRows: 0,
      },
    });

    try {
      const result = await this.parseAndValidateCSV(fileContent, csvUpload.id);

      // Update upload record with results
      await prisma.cSVUpload.update({
        where: { id: csvUpload.id },
        data: {
          totalRows: result.totalRows,
          processedRows: result.processedRows,
          errorRows: result.errorRows,
          status: result.errorRows > 0 ? 'FAILED' : 'COMPLETED',
          errorLog: JSON.stringify({
            simpleErrors: result.errors,
            detailedErrors: result.detailedErrors,
            warnings: result.warnings,
            summary: result.summary,
          }),
        },
      });

      return csvUpload;
    } catch (error: any) {
      // Mark as failed
      await prisma.cSVUpload.update({
        where: { id: csvUpload.id },
        data: {
          status: 'FAILED',
          errorLog: JSON.stringify([error.message]),
        },
      });
      throw error;
    }
  }

  private async parseAndValidateCSV(
    fileContent: string,
    csvUploadId: string,
  ): Promise<ProcessedCSVResult> {
    const errors: string[] = [];
    const detailedErrors: CSVValidationError[] = [];
    const warnings: CSVWarning[] = [];
    let processedRows = 0;
    let errorRows = 0;
    let warningRows = 0;

    const summary: CSVProcessingSummary = {
      totalGuests: 0,
      totalPartySize: 0,
      emailsProvided: 0,
      phoneNumbersProvided: 0,
      dietaryRestrictionsProvided: 0,
      specialRequestsProvided: 0,
    };

    try {
      // Parse CSV
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
      });

      if (parseResult.errors.length > 0) {
        throw new Error(`CSV parsing failed: ${parseResult.errors[0].message}`);
      }

      const rows = parseResult.data as any[];
      const totalRows = rows.length;

      if (totalRows === 0) {
        throw new Error('CSV file is empty');
      }

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 1;

        try {
          const validatedRow = this.validateCSVRow(row, rowNumber);

          if (validatedRow.errors.length > 0) {
            detailedErrors.push(...validatedRow.errors);
            errorRows++;
            continue;
          }

          if (validatedRow.warnings.length > 0) {
            warnings.push(...validatedRow.warnings);
            warningRows++;
          }

          // Create guest record
          await this.createGuestFromCSVRow(validatedRow.data, csvUploadId);
          processedRows++;

          // Update summary
          summary.totalGuests++;
          summary.totalPartySize += validatedRow.data.partySize;
          if (validatedRow.data.email) summary.emailsProvided++;
          if (validatedRow.data.phoneNumber) summary.phoneNumbersProvided++;
          if (validatedRow.data.dietaryRestrictions)
            summary.dietaryRestrictionsProvided++;
          if (validatedRow.data.specialRequests)
            summary.specialRequestsProvided++;
        } catch (error: any) {
          detailedErrors.push({
            row: rowNumber,
            message: `Failed to process row: ${error.message}`,
          });
          errorRows++;
        }
      }

      // Generate summary errors
      if (errorRows > 0) {
        errors.push(`${errorRows} rows failed validation`);
      }
      if (warningRows > 0) {
        errors.push(`${warningRows} rows have warnings`);
      }

      return {
        totalRows,
        processedRows,
        errorRows,
        warningRows,
        errors,
        detailedErrors,
        warnings,
        summary,
      };
    } catch (error: any) {
      throw new Error(`CSV processing failed: ${error.message}`);
    }
  }

  private validateCSVRow(
    row: any,
    rowNumber: number,
  ): { data: CSVRow; errors: CSVValidationError[]; warnings: CSVWarning[] } {
    const errors: CSVValidationError[] = [];
    const warnings: CSVWarning[] = [];

    // Required fields validation
    const firstName = this.getStringValue(row, 'firstname', 'firstName');
    const lastName = this.getStringValue(row, 'lastname', 'lastName');
    const partySize = this.getNumberValue(row, 'partysize', 'partySize');

    if (!firstName) {
      errors.push({
        row: rowNumber,
        field: 'firstName',
        message: 'First name is required',
      });
    }

    if (!lastName) {
      errors.push({
        row: rowNumber,
        field: 'lastName',
        message: 'Last name is required',
      });
    }

    if (partySize === null || partySize < 1) {
      errors.push({
        row: rowNumber,
        field: 'partySize',
        message: 'Party size must be a positive number',
        value: row.partysize || row.partySize,
      });
    }

    // Optional fields
    const email = this.getStringValue(row, 'email');
    const phoneNumber = this.getStringValue(row, 'phonenumber', 'phoneNumber');
    const dietaryRestrictions = this.getStringValue(
      row,
      'dietaryrestrictions',
      'dietaryRestrictions',
    );
    const specialRequests = this.getStringValue(
      row,
      'specialrequests',
      'specialRequests',
    );

    // Email validation
    if (email && !this.isValidEmail(email)) {
      errors.push({
        row: rowNumber,
        field: 'email',
        message: 'Invalid email format',
        value: email,
      });
    }

    // Phone number validation
    if (phoneNumber && !this.isValidPhoneNumber(phoneNumber)) {
      warnings.push({
        row: rowNumber,
        field: 'phoneNumber',
        message: 'Phone number format may be invalid',
        value: phoneNumber,
      });
    }

    if (errors.length > 0) {
      return { data: {} as CSVRow, errors, warnings };
    }

    return {
      data: {
        firstName: firstName!,
        lastName: lastName!,
        email,
        phoneNumber,
        partySize: partySize!,
        dietaryRestrictions,
        specialRequests,
      },
      errors,
      warnings,
    };
  }

  private async createGuestFromCSVRow(
    data: CSVRow,
    csvUploadId: string,
  ): Promise<void> {
    // Check for duplicate (firstName + lastName combination)
    const existingGuest = await prisma.guest.findFirst({
      where: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    if (existingGuest) {
      console.log(`Guest ${data.firstName} ${data.lastName} already exists`);
      return;
    }
    const hashCode = this.generateHashCode();

    await prisma.guest.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        partySize: data.partySize,
        dietaryRestrictions: data.dietaryRestrictions,
        specialRequests: data.specialRequests,
        hashCode,
        csvUploadId,
      },
    });
  }

  private getStringValue(row: any, ...keys: string[]): string | undefined {
    for (const key of keys) {
      const value = row[key];
      if (
        value !== undefined &&
        value !== null &&
        value.toString().trim() !== ''
      ) {
        return value.toString().trim();
      }
    }
    return undefined;
  }

  private getNumberValue(row: any, ...keys: string[]): number | null {
    for (const key of keys) {
      const value = row[key];
      if (value !== undefined && value !== null) {
        const num = parseInt(value.toString(), 10);
        if (!isNaN(num)) {
          return num;
        }
      }
    }
    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  private generateHashCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < this.HASH_CODE_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
