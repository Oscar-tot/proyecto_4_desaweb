import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto, UpdateMatchDto } from './dto/match.dto';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los partidos' })
  @ApiResponse({ status: 200, description: 'Lista de partidos' })
  async findAll() {
    const matches = await this.matchesService.findAll();
    return {
      success: true,
      count: matches.length,
      data: matches,
    };
  }

  @Get('historial')
  @ApiOperation({ summary: 'Obtener historial de partidos finalizados' })
  @ApiResponse({ status: 200, description: 'Lista de partidos finalizados' })
  async getHistorial() {
    const matches = await this.matchesService.findAll();
    console.log(' Total de partidos en DB:', matches.length);
    console.log(' Estados de partidos:', matches.map(m => ({ id: m.id, estado: m.estado })));
    
    // Filtrar solo los partidos finalizados
    const finalizados = matches.filter(
      (match) => match.estado?.toLowerCase() === 'finalizado',
    );
    
    console.log(' Partidos finalizados filtrados:', finalizados.length);
    console.log('Partidos finalizados:', finalizados.map(m => ({ id: m.id, local: m.equipoLocalNombre, visitante: m.equipoVisitanteNombre, estado: m.estado })));
    
    return {
      success: true,
      count: finalizados.length,
      data: finalizados,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un partido por ID' })
  @ApiParam({ name: 'id', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Partido encontrado' })
  @ApiResponse({ status: 404, description: 'Partido no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const match = await this.matchesService.findOne(id);
    return {
      success: true,
      data: match,
    };
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Obtener partidos de un equipo' })
  @ApiParam({ name: 'teamId', description: 'ID del equipo' })
  @ApiResponse({ status: 200, description: 'Partidos del equipo' })
  async findByTeam(@Param('teamId', ParseIntPipe) teamId: number) {
    const matches = await this.matchesService.findByTeam(teamId);
    return {
      success: true,
      teamId,
      count: matches.length,
      data: matches,
    };
  }

  @Get(':id/live')
  @ApiOperation({ summary: 'Obtener marcador en vivo' })
  @ApiParam({ name: 'id', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Marcador en vivo' })
  async getLiveScore(@Param('id', ParseIntPipe) id: number) {
    const match = await this.matchesService.findOne(id);
    return {
      success: true,
      matchId: id,
      live: {
        estado: match.estado,
        marcadorLocal: match.marcadorLocal,
        marcadorVisitante: match.marcadorVisitante,
        cuartoActual: match.cuartoActual,
        tiempoRestante: match.tiempoRestante,
        equipoLocal: {
          id: match.equipoLocalId,
          nombre: match.equipoLocalNombre,
          marcador: match.marcadorLocal,
        },
        equipoVisitante: {
          id: match.equipoVisitanteId,
          nombre: match.equipoVisitanteNombre,
          marcador: match.marcadorVisitante,
        },
      },
    };
  }

  @Get(':id/jugadores')
  @ApiOperation({ summary: 'Obtener roster de jugadores del partido' })
  @ApiParam({ name: 'id', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Roster de jugadores' })
  async getJugadores(@Param('id', ParseIntPipe) id: number) {
    const jugadores = await this.matchesService.getRosterPlayers(id);
    return {
      success: true,
      matchId: id,
      count: jugadores.length,
      data: jugadores,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo partido' })
  @ApiResponse({ status: 201, description: 'Partido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createMatchDto: CreateMatchDto) {
    const match = await this.matchesService.create(createMatchDto);
    return {
      success: true,
      message: 'Partido creado exitosamente',
      data: match,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un partido' })
  @ApiParam({ name: 'id', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Partido actualizado' })
  @ApiResponse({ status: 404, description: 'Partido no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    const match = await this.matchesService.update(id, updateMatchDto);
    return {
      success: true,
      message: 'Partido actualizado exitosamente',
      data: match,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un partido' })
  @ApiParam({ name: 'id', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Partido eliminado' })
  @ApiResponse({ status: 404, description: 'Partido no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.matchesService.remove(id);
    return {
      success: true,
      message: 'Partido eliminado exitosamente',
    };
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Iniciar un partido' })
  @ApiParam({ name: 'id', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Partido iniciado' })
  async startMatch(@Param('id', ParseIntPipe) id: number) {
    const match = await this.matchesService.startMatch(id);
    return {
      success: true,
      message: 'Partido iniciado exitosamente',
      data: match,
    };
  }

  @Post(':id/iniciar')
  @ApiOperation({ summary: 'Iniciar un partido (alias para frontend)' })
  @ApiParam({ name: 'id', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Partido iniciado' })
  async iniciarMatch(@Param('id', ParseIntPipe) id: number) {
    const match = await this.matchesService.startMatch(id);
    return {
      success: true,
      message: 'Partido iniciado exitosamente',
      data: match,
    };
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Finalizar un partido' })
  @ApiParam({ name: 'id', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Partido finalizado' })
  async finishMatch(@Param('id', ParseIntPipe) id: number) {
    const match = await this.matchesService.finishMatch(id);
    return {
      success: true,
      message: 'Partido finalizado exitosamente',
      data: match,
    };
  }

  @Put(':id/marcador')
  @ApiOperation({ summary: 'Actualizar marcador del partido' })
  @ApiParam({ name: 'id', description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Marcador actualizado' })
  async updateMarcador(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMarcadorDto: any,
  ) {
    // Normalizar el estado (convertir en_juego -> en_curso)
    let estadoNormalizado = updateMarcadorDto.estado;
    if (estadoNormalizado) {
      estadoNormalizado = estadoNormalizado.toLowerCase();
      // Mapear estados del frontend al backend
      if (estadoNormalizado === 'en_juego' || estadoNormalizado === 'en curso' || estadoNormalizado === 'en_curso') {
        estadoNormalizado = 'en_curso';
      } else if (estadoNormalizado === 'pausado') {
        estadoNormalizado = 'en_curso';  // Pausado también es en_curso
      } else if (estadoNormalizado === 'programado') {
        estadoNormalizado = 'programado';
      } else if (estadoNormalizado === 'finalizado') {
        estadoNormalizado = 'finalizado';
      } else if (estadoNormalizado === 'cancelado') {
        estadoNormalizado = 'cancelado';
      }
    }

    // Mapear campos del frontend al backend
    const updateData: any = {
      marcadorLocal: updateMarcadorDto.puntuacionLocal,
      marcadorVisitante: updateMarcadorDto.puntuacionVisitante,
      cuartoActual: updateMarcadorDto.periodo,
      tiempoRestante: updateMarcadorDto.tiempoRestante,
      faltasLocal: updateMarcadorDto.faltasLocal,
      faltasVisitante: updateMarcadorDto.faltasVisitante,
      tiemposMuertosLocal: updateMarcadorDto.tiemposMuertosLocal,
      tiemposMuertosVisitante: updateMarcadorDto.tiemposMuertosVisitante,
      estado: estadoNormalizado,
    };

    // Eliminar campos undefined para no sobrescribir valores existentes
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('Actualizando partido', id, 'con datos:', updateData);
    const match = await this.matchesService.update(id, updateData);
    return {
      success: true,
      message: 'Marcador actualizado exitosamente',
      data: match,
    };
  }
}
