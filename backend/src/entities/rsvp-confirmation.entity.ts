import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('rsvp_confirmations')
export class RSVPConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'guest_id', unique: true })
  guestId!: string;

  @Column({ name: 'confirmed_at', type: 'datetime' })
  confirmedAt!: Date;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'is_attending', type: 'boolean' })
  isAttending!: boolean;

  @Column({ name: 'confirmed_party_size', type: 'integer' })
  confirmedPartySize!: number;

  @Column({ name: 'message', type: 'text', nullable: true })
  message?: string;

  // Relationships
  @OneToOne('Guest', 'rsvpConfirmation')
  @JoinColumn({ name: 'guest_id' })
  guest!: any;
}
