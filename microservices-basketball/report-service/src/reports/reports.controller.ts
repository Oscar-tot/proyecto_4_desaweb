import { Controller, Get, Post, Param, Res, Logger, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import * as fs from 'fs';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'report-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('team/:id')
  @ApiOperation({ summary: 'Generar reporte PDF de un equipo' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  async generateTeamReport(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Generating team report for ID: ${id}`);
      const filePath = await this.reportsService.generateTeamReport(id);
      
      // Leer el archivo y enviarlo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="equipo_${id}_reporte.pdf"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Error generating team report:', error);
      res.status(500).json({ 
        error: 'Error generando el reporte',
        message: error.message 
      });
    }
  }

  @Post('all-teams')
  @ApiOperation({ summary: 'RF-REP-01: Generar reporte PDF de todos los equipos registrados' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  async generateAllTeamsReport(@Res() res: Response) {
    try {
      this.logger.log('Generating all teams report');
      const filePath = await this.reportsService.generateAllTeamsReport();
      
      // Leer el archivo y enviarlo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="equipos_registrados_${Date.now()}.pdf"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Error generating all teams report:', error);
      res.status(500).json({ 
        error: 'Error generando el reporte',
        message: error.message 
      });
    }
  }

  @Post('team/:id/players')
  @ApiOperation({ summary: 'RF-REP-02: Generar reporte PDF de jugadores por equipo' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  async generateTeamPlayersReport(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Generating team players report for team ID: ${id}`);
      const filePath = await this.reportsService.generateTeamPlayersReport(id);
      
      // Leer el archivo y enviarlo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="equipo_${id}_jugadores.pdf"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Error generating team players report:', error);
      res.status(500).json({ 
        error: 'Error generando el reporte',
        message: error.message 
      });
    }
  }

  @Post('player/:id')
  @ApiOperation({ summary: 'Generar reporte PDF de un jugador' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  async generatePlayerReport(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Generating player report for ID: ${id}`);
      const filePath = await this.reportsService.generatePlayerReport(id);
      
      // Leer el archivo y enviarlo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="jugador_${id}_reporte.pdf"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Error generating player report:', error);
      res.status(500).json({ 
        error: 'Error generando el reporte',
        message: error.message 
      });
    }
  }

  @Post('match/:id')
  @ApiOperation({ summary: 'Generar reporte PDF de un partido' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  async generateMatchReport(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Generating match report for ID: ${id}`);
      const filePath = await this.reportsService.generateMatchReport(id);
      
      // Leer el archivo y enviarlo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="partido_${id}_reporte.pdf"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Error generating match report:', error);
      res.status(500).json({ 
        error: 'Error generando el reporte',
        message: error.message 
      });
    }
  }

  @Post('matches/history')
  @ApiOperation({ summary: 'RF-REP-03: Generar reporte PDF de historial de partidos' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  async generateMatchHistoryReport(@Res() res: Response) {
    try {
      this.logger.log('Generating match history report');
      const filePath = await this.reportsService.generateMatchHistoryReport();
      
      // Leer el archivo y enviarlo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="historial_partidos_${Date.now()}.pdf"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Error generating match history report:', error);
      res.status(500).json({ 
        error: 'Error generando el reporte',
        message: error.message 
      });
    }
  }

  @Post('match/:id/roster')
  @ApiOperation({ summary: 'RF-REP-04: Generar reporte PDF de roster por partido' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  async generateMatchRosterReport(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Generating match roster report for match ID: ${id}`);
      const filePath = await this.reportsService.generateMatchRosterReport(id);
      
      // Leer el archivo y enviarlo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="partido_${id}_roster.pdf"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Error generating match roster report:', error);
      res.status(500).json({ 
        error: 'Error generando el reporte',
        message: error.message 
      });
    }
  }

  @Post('player/:id/stats')
  @ApiOperation({ summary: 'RF-REP-05: Generar reporte PDF de estadísticas por jugador' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  async generatePlayerStatsReport(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Generating player stats report for player ID: ${id}`);
      const filePath = await this.reportsService.generatePlayerStatsReport(id);
      
      // Leer el archivo y enviarlo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="jugador_${id}_estadisticas.pdf"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Error generating player stats report:', error);
      res.status(500).json({ 
        error: 'Error generando el reporte',
        message: error.message 
      });
    }
  }

  @Post('statistics')
  @ApiOperation({ summary: 'Generar reporte PDF de estadísticas generales' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  async generateStatisticsReport(@Res() res: Response) {
    try {
      this.logger.log('Generating statistics report');
      const filePath = await this.reportsService.generateStatisticsReport();
      
      // Leer el archivo y enviarlo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="estadisticas_${Date.now()}.pdf"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Error generating statistics report:', error);
      res.status(500).json({ 
        error: 'Error generando el reporte',
        message: error.message 
      });
    }
  }

  @Get('history')
  @ApiOperation({ summary: 'Obtener historial de reportes generados' })
  @ApiResponse({ status: 200, description: 'Historial recuperado exitosamente' })
  async getReportHistory() {
    return this.reportsService.getReportHistory();
  }

  @Get('history/:id')
  @ApiOperation({ summary: 'Obtener detalles de un reporte específico' })
  @ApiResponse({ status: 200, description: 'Reporte encontrado' })
  async getReportById(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.getReportById(id);
  }
}
