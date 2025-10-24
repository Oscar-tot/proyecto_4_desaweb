import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('cached_players')
export class CachedPlayer {
  @PrimaryColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellidos: string;

  @Column({ nullable: true })
  posicion: string;

  @Column({ type: 'int', nullable: true })
  numeroCamiseta: number;

  @Column({ type: 'int', nullable: true })
  equipoId: number;

  @Column({ nullable: true })
  equipoNombre: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  promedioAnotaciones: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  promedioRebotes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  promedioAsistencias: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}
