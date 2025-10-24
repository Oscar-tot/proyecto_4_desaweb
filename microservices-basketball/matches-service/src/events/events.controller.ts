import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from '../matches/dto/event.dto';

@ApiTags('events')
@Controller('matches/:matchId/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener eventos de un partido' })
  @ApiParam({ name: 'matchId', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  async findByMatch(@Param('matchId', ParseIntPipe) matchId: number) {
    const events = await this.eventsService.findByMatch(matchId);
    return {
      success: true,
      matchId,
      count: events.length,
      data: events,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un evento en el partido' })
  @ApiParam({ name: 'matchId', description: 'ID del partido' })
  @ApiResponse({ status: 201, description: 'Evento registrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @Param('matchId', ParseIntPipe) matchId: number,
    @Body() createEventDto: CreateEventDto,
  ) {
    const event = await this.eventsService.create(matchId, createEventDto);
    return {
      success: true,
      message: 'Evento registrado exitosamente',
      data: event,
    };
  }

  @Get('../stats')
  @ApiOperation({ summary: 'Obtener estadísticas del partido' })
  @ApiParam({ name: 'matchId', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Estadísticas del partido' })
  async getStats(@Param('matchId', ParseIntPipe) matchId: number) {
    const stats = await this.eventsService.getMatchStats(matchId);
    return {
      success: true,
      matchId,
      count: stats.length,
      data: stats,
    };
  }
}
