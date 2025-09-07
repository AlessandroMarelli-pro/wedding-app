import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UploadStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('csv_uploads')
export class CSVUpload {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  filename!: string;

  @Column({ name: 'total_rows', type: 'int', default: 0 })
  totalRows!: number;

  @Column({ name: 'processed_rows', type: 'int', default: 0 })
  processedRows!: number;

  @Column({ name: 'error_rows', type: 'int', default: 0 })
  errorRows!: number;

  @Column({ default: UploadStatus.PENDING })
  status!: string;

  @Column({ name: 'error_log', type: 'text', nullable: true })
  errorLog?: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne('Admin', 'csvUploads')
  @JoinColumn({ name: 'uploaded_by' })
  uploadedByAdmin!: any;

  @OneToMany('Guest', 'csvUpload')
  guests!: any[];
}
