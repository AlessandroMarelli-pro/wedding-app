import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wedding_info')
export class WeddingInfo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'couple_names', length: 100 })
  coupleNames!: string;

  @Column({ name: 'presentation_message', type: 'text', length: 2000 })
  presentationMessage!: string;

  @Column({ name: 'wedding_address', length: 300 })
  weddingAddress!: string;

  @Column({ name: 'wedding_date', type: 'datetime' })
  weddingDate!: Date;

  @Column({ name: 'location_directions', type: 'text' })
  locationDirections!: string;

  @Column({ name: 'hero_image_id', nullable: true })
  heroImageId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
