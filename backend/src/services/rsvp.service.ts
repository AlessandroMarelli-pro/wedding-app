import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from '../entities/guest.entity';
import { RSVPConfirmation } from '../entities/rsvp-confirmation.entity';

export interface RSVPRequest {
  hashCode: string;
}

export interface RSVPResponse {
  success: boolean;
  guestName: string;
  message: string;
  confirmedAt: Date;
}

export interface RSVPStats {
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  confirmationRate: number;
}

@Injectable()
export class RSVPService {
  constructor(
    @InjectRepository(RSVPConfirmation)
    private readonly rsvpRepository: Repository<RSVPConfirmation>,
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
  ) {}

  async confirmRSVP(
    request: RSVPRequest,
    ipAddress: string,
    userAgent?: string,
  ): Promise<RSVPResponse> {
    const { hashCode } = request;

    // Validate hash code format
    if (!this.isValidHashCodeFormat(hashCode)) {
      throw new BadRequestException(
        'Invalid hash code format. Must be 8 alphanumeric characters.',
      );
    }

    // Find guest by hash code
    const guest = await this.guestRepository.findOne({
      where: { hashCode: hashCode.toUpperCase() },
    });

    if (!guest) {
      throw new NotFoundException('Invalid hash code. Guest not found.');
    }

    // Check if already confirmed
    const existingConfirmation = await this.rsvpRepository.findOne({
      where: { hashCode: hashCode.toUpperCase() },
    });

    if (existingConfirmation) {
      throw new BadRequestException('RSVP already confirmed for this guest.');
    }

    // Create RSVP confirmation
    const confirmation = this.rsvpRepository.create({
      hashCode: hashCode.toUpperCase(),
      guestId: guest.id,
      confirmedAt: new Date(),
      ipAddress,
      userAgent,
    });

    const savedConfirmation = await this.rsvpRepository.save(confirmation);

    return {
      success: true,
      guestName: `${guest.firstName} ${guest.lastName}`,
      message: 'Thank you for confirming your attendance!',
      confirmedAt: savedConfirmation.confirmedAt,
    };
  }

  async getAllConfirmations(): Promise<RSVPConfirmation[]> {
    return this.rsvpRepository.find({
      relations: ['guest'],
      order: { confirmedAt: 'DESC' },
    });
  }

  async getConfirmationByHashCode(
    hashCode: string,
  ): Promise<RSVPConfirmation | null> {
    return this.rsvpRepository.findOne({
      where: { hashCode: hashCode.toUpperCase() },
      relations: ['guest'],
    });
  }

  async getRSVPStats(): Promise<RSVPStats> {
    const totalGuests = await this.guestRepository.count();
    const confirmedGuests = await this.rsvpRepository.count();
    const pendingGuests = totalGuests - confirmedGuests;
    const confirmationRate =
      totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0;

    return {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      confirmationRate: Math.round(confirmationRate * 100) / 100, // Round to 2 decimal places
    };
  }

  async getConfirmedGuestsList(): Promise<
    Array<{ guestName: string; confirmedAt: Date; email?: string }>
  > {
    const confirmations = await this.rsvpRepository.find({
      relations: ['guest'],
      order: { confirmedAt: 'DESC' },
    });

    return confirmations.map((confirmation) => ({
      guestName: `${confirmation.guest.firstName} ${confirmation.guest.lastName}`,
      confirmedAt: confirmation.confirmedAt,
      email: confirmation.guest.email,
    }));
  }

  async getPendingGuestsList(): Promise<
    Array<{ guestName: string; hashCode: string; email?: string }>
  > {
    // Get all guests
    const allGuests = await this.guestRepository.find();

    // Get all confirmed hash codes
    const confirmedHashCodes = await this.rsvpRepository.find({
      select: ['hashCode'],
    });

    const confirmedHashCodeSet = new Set(
      confirmedHashCodes.map((c) => c.hashCode),
    );

    // Filter out confirmed guests
    const pendingGuests = allGuests.filter(
      (guest) => !confirmedHashCodeSet.has(guest.hashCode),
    );

    return pendingGuests.map((guest) => ({
      guestName: `${guest.firstName} ${guest.lastName}`,
      hashCode: guest.hashCode,
      email: guest.email,
    }));
  }

  async deleteConfirmation(id: string): Promise<void> {
    const confirmation = await this.rsvpRepository.findOne({ where: { id } });

    if (!confirmation) {
      throw new NotFoundException(`RSVP confirmation with ID ${id} not found`);
    }

    await this.rsvpRepository.remove(confirmation);
  }

  async isGuestConfirmed(hashCode: string): Promise<boolean> {
    const confirmation = await this.rsvpRepository.findOne({
      where: { hashCode: hashCode.toUpperCase() },
    });

    return !!confirmation;
  }

  private isValidHashCodeFormat(hashCode: string): boolean {
    // Must be exactly 8 characters, alphanumeric (A-Z, 0-9)
    const hashCodeRegex = /^[A-Z0-9]{8}$/;
    return hashCodeRegex.test(hashCode.toUpperCase());
  }

  async getRecentConfirmations(
    limit: number = 10,
  ): Promise<RSVPConfirmation[]> {
    return this.rsvpRepository.find({
      relations: ['guest'],
      order: { confirmedAt: 'DESC' },
      take: limit,
    });
  }

  async getConfirmationsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<RSVPConfirmation[]> {
    return this.rsvpRepository
      .createQueryBuilder('rsvp')
      .leftJoinAndSelect('rsvp.guest', 'guest')
      .where('rsvp.confirmedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('rsvp.confirmedAt', 'DESC')
      .getMany();
  }
}
