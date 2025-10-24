import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { MatchStatus } from '../../entities/match.entity';

export class CreateMatchDto {
  @ApiProperty({ description: 'ID del equipo local', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  equipoLocalId: number;

  @ApiProperty({ description: 'ID del equipo visitante', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  equipoVisitanteId: number;

  @ApiProperty({ description: 'Nombre del equipo local', example: 'Lakers' })
  @IsOptional()
  @IsString()
  equipoLocalNombre?: string;

  @ApiProperty({ description: 'Nombre del equipo visitante', example: 'Warriors' })
  @IsOptional()
  @IsString()
  equipoVisitanteNombre?: string;

  // Aceptar tanto "fecha" como "fechaPartido" del frontend
  @ApiProperty({ description: 'Fecha del partido', example: '2025-10-16T19:00:00Z' })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiProperty({ description: 'Fecha del partido (alias)', example: '2025-10-16T19:00:00' })
  @IsOptional()
  @IsDateString()
  fechaPartido?: string;

  @ApiProperty({ description: 'Lugar del partido', example: 'Staples Center' })
  @IsOptional()
  @IsString()
  lugar?: string;

  @ApiProperty({ description: 'Estado del partido (programado, en_curso, EN_CURSO, finalizado, cancelado)', example: 'programado' })
  @IsOptional()
  @IsString()
  estado?: string;

  // Campos adicionales del frontend
  @ApiProperty({ description: 'Puntuación equipo local', example: 0 })
  @IsOptional()
  @IsNumber()
  puntuacionLocal?: number;

  @ApiProperty({ description: 'Puntuación equipo visitante', example: 0 })
  @IsOptional()
  @IsNumber()
  puntuacionVisitante?: number;

  @ApiProperty({ description: 'Período/Cuarto actual', example: 1 })
  @IsOptional()
  @IsNumber()
  periodo?: number;

  @ApiProperty({ description: 'Tiempo restante', example: '12:00' })
  @IsOptional()
  @IsString()
  tiempoRestante?: string;

  @ApiProperty({ description: 'Faltas equipo local', example: 0 })
  @IsOptional()
  @IsNumber()
  faltasLocal?: number;

  @ApiProperty({ description: 'Faltas equipo visitante', example: 0 })
  @IsOptional()
  @IsNumber()
  faltasVisitante?: number;

  @ApiProperty({ description: 'Tiempos muertos equipo local', example: 7 })
  @IsOptional()
  @IsNumber()
  tiemposMuertosLocal?: number;

  @ApiProperty({ description: 'Tiempos muertos equipo visitante', example: 7 })
  @IsOptional()
  @IsNumber()
  tiemposMuertosVisitante?: number;

  // ROSTERS - IDs de jugadores seleccionados
  @ApiProperty({ description: 'IDs de jugadores del equipo local', example: ['player1', 'player2'] })
  @IsOptional()
  @IsArray()
  jugadoresLocalIds?: string[];

  @ApiProperty({ description: 'IDs de jugadores del equipo visitante', example: ['player3', 'player4'] })
  @IsOptional()
  @IsArray()
  jugadoresVisitanteIds?: string[];

  @ApiProperty({ description: 'Descripción del partido', example: 'Partido de temporada regular', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdateMatchDto {
  @ApiProperty({ description: 'Fecha del partido', example: '2025-10-16T19:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiProperty({ description: 'Lugar del partido', example: 'Staples Center', required: false })
  @IsOptional()
  @IsString()
  lugar?: string;

  @ApiProperty({ description: 'Estado del partido', enum: MatchStatus, required: false })
  @IsOptional()
  @IsEnum(MatchStatus)
  estado?: MatchStatus;

  @ApiProperty({ description: 'Marcador local', example: 95, required: false })
  @IsOptional()
  @IsNumber()
  marcadorLocal?: number;

  @ApiProperty({ description: 'Marcador visitante', example: 88, required: false })
  @IsOptional()
  @IsNumber()
  marcadorVisitante?: number;

  @ApiProperty({ description: 'Cuarto actual', example: 4, required: false })
  @IsOptional()
  @IsNumber()
  cuartoActual?: number;

  @ApiProperty({ description: 'Tiempo restante', example: '2:35', required: false })
  @IsOptional()
  @IsString()
  tiempoRestante?: string;

  @ApiProperty({ description: 'Descripción', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdateMarcadorDto {
  @ApiProperty({ description: 'Puntuación equipo local' })
  @IsOptional()
  @IsNumber()
  puntuacionLocal?: number;

  @ApiProperty({ description: 'Puntuación equipo visitante' })
  @IsOptional()
  @IsNumber()
  puntuacionVisitante?: number;

  @ApiProperty({ description: 'Período/Cuarto actual' })
  @IsOptional()
  @IsNumber()
  periodo?: number;

  @ApiProperty({ description: 'Tiempo restante' })
  @IsOptional()
  @IsString()
  tiempoRestante?: string;

  @ApiProperty({ description: 'Faltas equipo local' })
  @IsOptional()
  @IsNumber()
  faltasLocal?: number;

  @ApiProperty({ description: 'Faltas equipo visitante' })
  @IsOptional()
  @IsNumber()
  faltasVisitante?: number;

  @ApiProperty({ description: 'Tiempos muertos equipo local' })
  @IsOptional()
  @IsNumber()
  tiemposMuertosLocal?: number;

  @ApiProperty({ description: 'Tiempos muertos equipo visitante' })
  @IsOptional()
  @IsNumber()
  tiemposMuertosVisitante?: number;

  @ApiProperty({ description: 'Estado del partido' })
  @IsOptional()
  @IsString()
  estado?: string;
}

