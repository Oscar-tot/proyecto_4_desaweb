import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Match } from './match.entity';

@Entity('match_stats')
@Unique(['matchId', 'jugadorId'])
export class MatchStats {
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

  @Column({ default: 0 })
  minutos: number;

  @Column({ default: 0 })
  puntos: number;

  @Column({ default: 0 })
  rebotes: number;

  @Column({ default: 0 })
  asistencias: number;

  @Column({ default: 0 })
  robos: number;

  @Column({ default: 0 })
  bloqueos: number;

  @Column({ default: 0 })
  faltas: number;

  @Column({ name: 'tiros_campo_anotados', default: 0 })
  tirosCampoAnotados: number;

  @Column({ name: 'tiros_campo_intentados', default: 0 })
  tirosCampoIntentados: number;

  @Column({ name: 'tiros_3_anotados', default: 0 })
  tiros3Anotados: number;

  @Column({ name: 'tiros_3_intentados', default: 0 })
  tiros3Intentados: number;

  @Column({ name: 'tiros_libres_anotados', default: 0 })
  tirosLibresAnotados: number;

  @Column({ name: 'tiros_libres_intentados', default: 0 })
  tirosLibresIntentados: number;

  @ManyToOne(() => Match, (match) => match.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
