import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('program_events')
export class ProgramEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'start_time', type: 'date' })
  startTime!: Date;

  @Column({ name: 'end_time', type: 'date' })
  endTime!: Date;

  @Column({ length: 200 })
  location!: string;

  @Column({ name: 'display_order', unique: true })
  displayOrder!: number;

  @Column({ name: 'include_in_calendar', default: true })
  includeInCalendar!: boolean;

  @Column({ length: 50, nullable: true })
  icon!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
