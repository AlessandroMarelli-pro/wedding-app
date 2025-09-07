import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import * as Papa from 'papaparse';
import { Repository } from 'typeorm';
import { CSVUpload, UploadStatus } from '../entities/csv-upload.entity';
import { Guest } from '../entities/guest.entity';

export interface CSVRow {
  firstname: string;
  lastname: string;
  email?: string;
}

export interface ProcessedCSVResult {
  totalRows: number;
  processedRows: number;
  errorRows: number;
  errors: string[];
  guests: Guest[];
}

export interface CSVValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
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

  async getAllGuests(): Promise<Guest[]> {
    return this.guestRepository.find({
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
      savedUpload.errorLog = JSON.stringify(result.errors);

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
    return new Promise((resolve, reject) => {
      const errors: string[] = [];
      const guests: Guest[] = [];
      let rowNumber = 0;

      Papa.parse<CSVRow>(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.toLowerCase().trim(),
        step: async (row) => {
          rowNumber++;

          try {
            const validatedRow = this.validateCSVRow(row.data, rowNumber);
            const guest = await this.createGuestFromCSVRow(
              validatedRow,
              csvUploadId,
            );
            guests.push(guest);
          } catch (error: any) {
            errors.push(`Row ${rowNumber}: ${error.message}`);
          }
        },
        complete: () => {
          resolve({
            totalRows: rowNumber,
            processedRows: guests.length,
            errorRows: errors.length,
            errors,
            guests,
          });
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  }

  private validateCSVRow(row: CSVRow, rowNumber: number): CSVRow {
    const errors: string[] = [];

    // Validate firstname
    if (!row.firstname || typeof row.firstname !== 'string') {
      errors.push('firstname is required');
    } else {
      row.firstname = row.firstname.trim();
      if (row.firstname.length === 0) {
        errors.push('firstname cannot be empty');
      } else if (row.firstname.length > 50) {
        errors.push('firstname must be 50 characters or less');
      }
    }

    // Validate lastname
    if (!row.lastname || typeof row.lastname !== 'string') {
      errors.push('lastname is required');
    } else {
      row.lastname = row.lastname.trim();
      if (row.lastname.length === 0) {
        errors.push('lastname cannot be empty');
      } else if (row.lastname.length > 50) {
        errors.push('lastname must be 50 characters or less');
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

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return row;
  }

  private async createGuestFromCSVRow(
    row: CSVRow,
    csvUploadId: string,
  ): Promise<Guest> {
    // Check for duplicate (firstname + lastname combination)
    const existingGuest = await this.guestRepository.findOne({
      where: {
        firstName: row.firstname,
        lastName: row.lastname,
      },
    });

    if (existingGuest) {
      throw new Error(`Guest ${row.firstname} ${row.lastname} already exists`);
    }

    // Generate unique hash code
    const hashCode = await this.generateUniqueHashCode();

    const guest = this.guestRepository.create({
      firstName: row.firstname,
      lastName: row.lastname,
      email: row.email,
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
    return this.csvUploadRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getCSVUpload(id: string): Promise<CSVUpload | null> {
    return this.csvUploadRepository.findOne({ where: { id } });
  }
}
