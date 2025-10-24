import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Match } from './match.entity';

export enum EventType {
  CANASTA_2 = 'canasta2',
  CANASTA_3 = 'canasta3',
  TIRO_LIBRE = 'tiro_libre',
  FALTA = 'falta',
  ASISTENCIA = 'asistencia',
  ROBO = 'robo',
  BLOQUEO = 'bloqueo',
  REBOTE = 'rebote',
  PERDIDA = 'perdida',
}

@Entity('match_events')
export class MatchEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'match_id' })
  matchId: number;

  @Column({ name: 'jugador_id', length: 50 })
  jugadorId: string;

  @Column({ name: 'jugador_nombre', length: 200 })
  jugadorNombre: string;

  @Column({ name: 'equipo_id' })
  equipoId: number;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  tipo: EventType;

  @Column({ default: 0 })
  puntos: number;

  @Column()
  cuarto: number;

  @Column({ length: 10 })
  minuto: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ManyToOne(() => Match, (match) => match.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
