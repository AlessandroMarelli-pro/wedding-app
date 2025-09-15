import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface Direction {
  type: 'car' | 'train' | 'car rental';
  information: string; // markdown text
  location: {
    address: string;
    link?: string;
  };
}

@Entity('wedding_info')
export class WeddingInfo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'couple_names', length: 100 })
  coupleNames!: string;

  @Column({ name: 'presentation_message', type: 'text', nullable: true })
  presentationMessage?: string;

  @Column({ name: 'wedding_address', length: 300, nullable: true })
  weddingAddress?: string;

  @Column({ name: 'wedding_date', type: 'date' })
  weddingDate!: Date;

  @Column({ name: 'location_directions', type: 'json', nullable: true })
  locationDirections?: Direction[];

  @Column({ name: 'hero_image_id', nullable: true })
  heroImageId?: string;

  @Column({ name: 'hero_message', type: 'text', nullable: true })
  heroMessage?: string;

  @Column({ name: 'hero_address', length: 200, nullable: true })
  heroAddress?: string;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
