import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Direction, WeddingInfo } from '../entities/wedding-info.entity';
import { ImageService } from './image.service';

export interface CreateWeddingInfoDto {
  coupleNames: string;
  presentationMessage: string;
  weddingAddress: string;
  weddingDate: Date;
  locationDirections: Direction[];
  heroImageId?: string;
}

export interface UpdateWeddingInfoDto {
  coupleNames?: string;
  presentationMessage?: string;
  weddingAddress?: string;
  weddingDate?: Date;
  locationDirections?: Direction[];
  heroImageId?: string;
}

@Injectable()
export class WeddingService {
  constructor(
    @InjectRepository(WeddingInfo)
    private readonly weddingInfoRepository: Repository<WeddingInfo>,
    private readonly imageService: ImageService,
  ) {}

  async getWeddingInfo(): Promise<WeddingInfo> {
    const weddingInfo = await this.weddingInfoRepository.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });

    if (!weddingInfo) {
      throw new NotFoundException('Wedding information not found');
    }
    const heroImage = await this.imageService.getImageByUsageLocation('hero');
    if (heroImage) {
      weddingInfo.heroImageId = heroImage.id;
    }
    return weddingInfo;
  }

  async createWeddingInfo(
    createDto: CreateWeddingInfoDto,
  ): Promise<WeddingInfo> {
    // Ensure only one wedding info record exists
    const existingCount = await this.weddingInfoRepository.count();
    if (existingCount > 0) {
      throw new Error(
        'Wedding information already exists. Use update instead.',
      );
    }

    // Validate wedding date is in the future
    if (createDto.weddingDate <= new Date()) {
      throw new Error('Wedding date must be in the future');
    }

    const weddingInfo = this.weddingInfoRepository.create(createDto);
    return this.weddingInfoRepository.save(weddingInfo);
  }

  async updateWeddingInfo(
    updateDto: UpdateWeddingInfoDto,
  ): Promise<WeddingInfo> {
    const weddingInfo = await this.getWeddingInfo();

    // Validate wedding date if provided
    if (updateDto.weddingDate && updateDto.weddingDate <= new Date()) {
      throw new Error('Wedding date must be in the future');
    }

    // Update fields
    Object.assign(weddingInfo, updateDto);

    return this.weddingInfoRepository.save(weddingInfo);
  }

  async deleteWeddingInfo(): Promise<void> {
    const weddingInfo = await this.getWeddingInfo();
    await this.weddingInfoRepository.remove(weddingInfo);
  }

  async initializeWeddingInfo(
    data: CreateWeddingInfoDto,
  ): Promise<WeddingInfo> {
    try {
      return await this.getWeddingInfo();
    } catch (error) {
      // If no wedding info exists, create it
      return this.createWeddingInfo(data);
    }
  }
}
