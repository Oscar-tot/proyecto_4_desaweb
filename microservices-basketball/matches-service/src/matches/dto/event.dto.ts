import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { EventType } from '../../entities/match-event.entity';

export class CreateEventDto {
  @ApiProperty({ description: 'ID del jugador', example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  jugadorId: string;

  @ApiProperty({ description: 'Nombre del jugador', example: 'LeBron James' })
  @IsNotEmpty()
  @IsString()
  jugadorNombre: string;

  @ApiProperty({ description: 'ID del equipo', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  equipoId: number;

  @ApiProperty({ description: 'Tipo de evento', enum: EventType, example: EventType.CANASTA_2 })
  @IsNotEmpty()
  @IsEnum(EventType)
  tipo: EventType;

  @ApiProperty({ description: 'Puntos anotados', example: 2, required: false })
  @IsOptional()
  @IsNumber()
  puntos?: number;

  @ApiProperty({ description: 'Cuarto del partido', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  cuarto: number;

  @ApiProperty({ description: 'Minuto del evento', example: '10:30' })
  @IsNotEmpty()
  @IsString()
  minuto: string;

  @ApiProperty({ description: 'Descripción del evento', example: 'Canasta de 2 puntos', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
