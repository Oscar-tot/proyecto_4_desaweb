import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('report_history')
export class ReportHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reportType: string; // 'team', 'player', 'match', 'statistics'

  @Column({ nullable: true })
  entityId: number; // ID del equipo, jugador o partido

  @Column({ nullable: true })
  entityName: string; // Nombre del equipo, jugador, etc

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({ type: 'int' })
  fileSize: number; // en bytes

  @CreateDateColumn()
  generatedAt: Date;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  metadata: string; // JSON con información adicional
}
