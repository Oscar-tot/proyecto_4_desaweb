import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MatchEvent } from './match-event.entity';
import { MatchStats } from './match-stats.entity';

export enum MatchStatus {
  PROGRAMADO = 'programado',
  EN_CURSO = 'en_curso',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'equipo_local_id' })
  equipoLocalId: number;

  @Column({ name: 'equipo_visitante_id' })
  equipoVisitanteId: number;

  @Column({ name: 'equipo_local_nombre', length: 100 })
  equipoLocalNombre: string;

  @Column({ name: 'equipo_visitante_nombre', length: 100 })
  equipoVisitanteNombre: string;

  @Column({ type: 'datetime' })
  fecha: Date;

  @Column({ length: 200 })
  lugar: string;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.PROGRAMADO,
  })
  estado: MatchStatus;

  @Column({ name: 'marcador_local', default: 0 })
  marcadorLocal: number;

  @Column({ name: 'marcador_visitante', default: 0 })
  marcadorVisitante: number;

  @Column({ name: 'cuarto_actual', default: 1 })
  cuartoActual: number;

  @Column({ name: 'tiempo_restante', length: 10, nullable: true })
  tiempoRestante: string;

  @Column({ name: 'faltas_local', default: 0 })
  faltasLocal: number;

  @Column({ name: 'faltas_visitante', default: 0 })
  faltasVisitante: number;

  @Column({ name: 'tiempos_muertos_local', default: 0 })
  tiemposMuertosLocal: number;

  @Column({ name: 'tiempos_muertos_visitante', default: 0 })
  tiemposMuertosVisitante: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => MatchEvent, (event) => event.match)
  events: MatchEvent[];

  @OneToMany(() => MatchStats, (stats) => stats.match)
  stats: MatchStats[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
