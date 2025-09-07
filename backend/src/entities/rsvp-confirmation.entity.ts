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

  @Column({ name: 'hash_code', length: 8, unique: true })
  hashCode!: string;

  @Column({ name: 'guest_id' })
  guestId!: string;

  @Column({ name: 'confirmed_at', type: 'datetime' })
  confirmedAt!: Date;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  // Relationships
  @OneToOne('Guest', 'rsvpConfirmation')
  @JoinColumn({ name: 'guest_id' })
  guest!: any;
}
