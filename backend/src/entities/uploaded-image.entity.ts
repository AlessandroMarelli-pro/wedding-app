import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('uploaded_images')
export class UploadedImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'original_name', length: 200 })
  originalName!: string;

  @Column({ length: 200, unique: true })
  filename!: string;

  @Column({ name: 'mime_type', length: 50 })
  mimeType!: string;

  @Column({ type: 'int' })
  size!: number;

  @Column({ type: 'int' })
  width!: number;

  @Column({ type: 'int' })
  height!: number;

  @Column({ name: 'alt_text', length: 200, nullable: true })
  altText?: string;

  @Column({ name: 'usage_location', length: 100 })
  usageLocation!: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne('Admin', 'uploadedImages')
  @JoinColumn({ name: 'uploaded_by' })
  uploadedByAdmin!: any;
}
