import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('cached_matches')
export class CachedMatch {
  @PrimaryColumn()
  id: number;

  @Column()
  equipoLocalId: number;

  @Column()
  equipoLocalNombre: string;

  @Column()
  equipoVisitanteId: number;

  @Column()
  equipoVisitanteNombre: string;

  @Column({ type: 'int', default: 0 })
  marcadorLocal: number;

  @Column({ type: 'int', default: 0 })
  marcadorVisitante: number;

  @Column({ type: 'datetime' })
  fecha: Date;

  @Column({ nullable: true })
  ubicacion: string;

  @Column({ nullable: true })
  estado: string; // 'programado', 'en_progreso', 'finalizado'

  @UpdateDateColumn()
  lastUpdated: Date;
}
