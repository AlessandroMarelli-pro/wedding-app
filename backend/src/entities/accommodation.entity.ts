import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('accommodations')
export class Accommodation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', length: 500 })
  description!: string;

  @Column({ length: 300 })
  address!: string;

  @Column({ name: 'contact_info', length: 200, nullable: true })
  contactInfo?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ name: 'price_range', length: 50, nullable: true })
  priceRange?: string;

  @Column({ name: 'is_recommended', default: false })
  isRecommended!: boolean;

  @Column({ name: 'display_order', unique: true })
  displayOrder!: number;

  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl?: string;

  @Column({ name: 'images_url', type: 'text', nullable: true })
  imagesUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
