import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('guests')
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'first_name', length: 50 })
  firstName!: string;

  @Column({ name: 'last_name', length: 50 })
  lastName!: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ name: 'hash_code', length: 8, unique: true })
  hashCode!: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ name: 'party_size', type: 'integer', default: 1 })
  partySize!: number;

  @Column({ name: 'dietary_restrictions', type: 'text', nullable: true })
  dietaryRestrictions?: string;

  @Column({ name: 'special_requests', type: 'text', nullable: true })
  specialRequests?: string;

  @Column({ name: 'csv_upload_id' })
  csvUploadId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne('CSVUpload', 'guests')
  @JoinColumn({ name: 'csv_upload_id' })
  csvUpload!: any;

  @OneToOne('RSVPConfirmation', 'guest')
  rsvpConfirmation?: any;
}
