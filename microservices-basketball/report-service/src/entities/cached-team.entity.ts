import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('cached_teams')
export class CachedTeam {
  @PrimaryColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  ciudad: string;

  @Column({ nullable: true })
  entrenador: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ type: 'int', default: 0 })
  partidosJugados: number;

  @Column({ type: 'int', default: 0 })
  partidosGanados: number;

  @Column({ type: 'int', default: 0 })
  partidosPerdidos: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}
