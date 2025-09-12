import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Accommodation } from '../entities/accommodation.entity';

export interface CreateAccommodationDto {
  name: string;
  description: string;
  address: string;
  contactInfo?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  isRecommended?: boolean;
  displayOrder: number;
  sourceUrl?: string;
  imagesUrl?: string;
}

export interface UpdateAccommodationDto {
  name?: string;
  description?: string;
  address?: string;
  contactInfo?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  isRecommended?: boolean;
  displayOrder?: number;
  sourceUrl?: string;
  imagesUrl?: string;
}

@Injectable()
export class AccommodationService {
  constructor(
    @InjectRepository(Accommodation)
    private readonly accommodationRepository: Repository<Accommodation>,
  ) {}

  async getAllAccommodations(): Promise<Accommodation[]> {
    return this.accommodationRepository.find({
      order: { displayOrder: 'ASC' },
    });
  }

  async getRecommendedAccommodations(): Promise<Accommodation[]> {
    return this.accommodationRepository.find({
      where: { isRecommended: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async getAccommodationById(id: string): Promise<Accommodation> {
    const accommodation = await this.accommodationRepository.findOne({
      where: { id },
    });

    if (!accommodation) {
      throw new NotFoundException(`Accommodation with ID ${id} not found`);
    }

    return accommodation;
  }

  async createAccommodation(
    createDto: CreateAccommodationDto,
  ): Promise<Accommodation> {
    // Get the highest display order
    const highestDisplayOrder = await this.accommodationRepository.findOne({
      where: { id: Not(IsNull()) },
      order: { displayOrder: 'DESC' },
    });
    if (highestDisplayOrder) {
      createDto.displayOrder = highestDisplayOrder.displayOrder + 1;
    } else {
      createDto.displayOrder = 0;
    }

    const accommodation = this.accommodationRepository.create({
      ...createDto,
      isRecommended: createDto.isRecommended ?? false,
    });

    return this.accommodationRepository.save(accommodation);
  }

  async updateAccommodation(
    id: string,
    updateDto: UpdateAccommodationDto,
  ): Promise<Accommodation> {
    const accommodation = await this.getAccommodationById(id);

    // Check if new display order is already taken by another record
    if (
      updateDto.displayOrder !== undefined &&
      updateDto.displayOrder !== accommodation.displayOrder
    ) {
      const existingWithOrder = await this.accommodationRepository.findOne({
        where: { displayOrder: updateDto.displayOrder },
      });

      if (existingWithOrder && existingWithOrder.id !== id) {
        throw new Error(
          `Display order ${updateDto.displayOrder} is already taken`,
        );
      }
    }

    // Validate coordinates if provided
    if (updateDto.latitude !== undefined || updateDto.longitude !== undefined) {
      this.validateCoordinates(updateDto.latitude, updateDto.longitude);
    }

    Object.assign(accommodation, updateDto);
    return this.accommodationRepository.save(accommodation);
  }

  async deleteAccommodation(id: string): Promise<void> {
    const accommodation = await this.getAccommodationById(id);
    await this.accommodationRepository.remove(accommodation);
  }

  async reorderAccommodations(accommodationIds: string[]): Promise<void> {
    for (let i = 0; i < accommodationIds.length; i++) {
      await this.accommodationRepository.update(
        { id: accommodationIds[i] },
        { displayOrder: i + 1 },
      );
    }
  }

  private validateCoordinates(latitude?: number, longitude?: number): void {
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }

    if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }
  }

  async seedDefaultAccommodations(): Promise<void> {
    const count = await this.accommodationRepository.count();
    if (count > 0) {
      return; // Already seeded
    }

    const defaultAccommodations: CreateAccommodationDto[] = [
      {
        name: 'Hotel Example',
        description:
          'A beautiful hotel near the wedding venue with excellent amenities.',
        address: '123 Main Street, Wedding City, WC 12345',
        contactInfo: '+1-555-0123 | www.hotelexample.com',
        priceRange: '€120-180/night',
        isRecommended: true,
        displayOrder: 1,
      },
      {
        name: 'Cozy B&B',
        description: 'Charming bed and breakfast with personalized service.',
        address: '456 Oak Avenue, Wedding City, WC 12345',
        contactInfo: '+1-555-0456 | info@cozybnb.com',
        priceRange: '€80-120/night',
        isRecommended: false,
        displayOrder: 2,
      },
    ];

    for (const accommodationData of defaultAccommodations) {
      await this.createAccommodation(accommodationData);
    }
  }
}
