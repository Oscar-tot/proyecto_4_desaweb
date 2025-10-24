import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly reportsDir = './generated-reports';

  constructor() {
    // Crear directorio si no existe
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateTeamReport(team: any): Promise<string> {
    const fileName = `team_${team.id}_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'REPORTE DE EQUIPO');

        // Team Info
        doc.fontSize(16).text(`Equipo: ${team.nombre}`, { underline: true });
        doc.moveDown();
        
        doc.fontSize(12);
        if (team.ciudad) doc.text(`Ciudad: ${team.ciudad}`);
        if (team.entrenador) doc.text(`Entrenador: ${team.entrenador}`);
        doc.moveDown();

        // Statistics
        doc.fontSize(14).text('Estadísticas', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Partidos Jugados: ${team.partidosJugados || 0}`);
        doc.text(`Partidos Ganados: ${team.partidosGanados || 0}`);
        doc.text(`Partidos Perdidos: ${team.partidosPerdidos || 0}`);
        
        if (team.partidosJugados > 0) {
          const winRate = ((team.partidosGanados / team.partidosJugados) * 100).toFixed(1);
          doc.text(`Porcentaje de Victoria: ${winRate}%`);
        }

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Team report generated: ${fileName}`);
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        this.logger.error('Error generating team report:', error);
        reject(error);
      }
    });
  }

  async generatePlayerReport(player: any): Promise<string> {
    const fileName = `player_${player.id}_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'REPORTE DE JUGADOR');

        // Player Info
        doc.fontSize(16).text(`${player.nombre} ${player.apellidos}`, { underline: true });
        doc.moveDown();
        
        doc.fontSize(12);
        if (player.numeroCamiseta) doc.text(`Número: #${player.numeroCamiseta}`);
        if (player.posicion) doc.text(`Posición: ${player.posicion}`);
        if (player.equipoNombre) doc.text(`Equipo: ${player.equipoNombre}`);
        doc.moveDown();

        // Statistics
        doc.fontSize(14).text('Estadísticas Promedio', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Anotaciones: ${player.promedioAnotaciones?.toFixed(1) || '0.0'} pts`);
        doc.text(`Rebotes: ${player.promedioRebotes?.toFixed(1) || '0.0'}`);
        doc.text(`Asistencias: ${player.promedioAsistencias?.toFixed(1) || '0.0'}`);

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Player report generated: ${fileName}`);
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        this.logger.error('Error generating player report:', error);
        reject(error);
      }
    });
  }

  async generateMatchReport(match: any): Promise<string> {
    const fileName = `match_${match.id}_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'REPORTE DE PARTIDO');

        // Match Info
        doc.fontSize(16).text('Resultado del Partido', { underline: true });
        doc.moveDown();
        
        doc.fontSize(14);
        doc.text(`${match.equipoLocalNombre} vs ${match.equipoVisitanteNombre}`, { align: 'center' });
        doc.moveDown();

        // Score
        doc.fontSize(24).fillColor('#2c3e50');
        doc.text(`${match.marcadorLocal}  -  ${match.marcadorVisitante}`, { align: 'center' });
        doc.fillColor('#000000');
        doc.moveDown();

        // Details
        doc.fontSize(12);
        if (match.fecha) doc.text(`Fecha: ${new Date(match.fecha).toLocaleDateString('es-ES')}`);
        if (match.ubicacion) doc.text(`Ubicación: ${match.ubicacion}`);
        if (match.estado) doc.text(`Estado: ${match.estado}`);

        // Winner
        doc.moveDown();
        if (match.marcadorLocal > match.marcadorVisitante) {
          doc.fontSize(14).fillColor('#27ae60');
          doc.text(`Ganador: ${match.equipoLocalNombre}`, { align: 'center' });
        } else if (match.marcadorVisitante > match.marcadorLocal) {
          doc.fontSize(14).fillColor('#27ae60');
          doc.text(`Ganador: ${match.equipoVisitanteNombre}`, { align: 'center' });
        } else {
          doc.fontSize(14).fillColor('#f39c12');
          doc.text('Empate', { align: 'center' });
        }

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Match report generated: ${fileName}`);
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        this.logger.error('Error generating match report:', error);
        reject(error);
      }
    });
  }

  async generateStatisticsReport(data: any): Promise<string> {
    const fileName = `statistics_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'REPORTE DE ESTADÍSTICAS GENERALES');

        // Summary
        doc.fontSize(14).text('Resumen del Sistema', { underline: true });
        doc.moveDown();
        
        doc.fontSize(12);
        doc.text(`Total de Equipos: ${data.totalTeams || 0}`);
        doc.text(`Total de Jugadores: ${data.totalPlayers || 0}`);
        doc.text(`Total de Partidos: ${data.totalMatches || 0}`);
        doc.moveDown();

        // Top Teams
        if (data.topTeams && data.topTeams.length > 0) {
          doc.fontSize(14).text('Mejores Equipos', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11);
          
          data.topTeams.slice(0, 5).forEach((team: any, index: number) => {
            doc.text(`${index + 1}. ${team.nombre} - ${team.partidosGanados} victorias`);
          });
          doc.moveDown();
        }

        // Top Players
        if (data.topPlayers && data.topPlayers.length > 0) {
          doc.fontSize(14).text('Mejores Jugadores', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11);
          
          data.topPlayers.slice(0, 5).forEach((player: any, index: number) => {
            doc.text(`${index + 1}. ${player.nombre} ${player.apellidos} - ${player.promedioAnotaciones?.toFixed(1)} pts`);
          });
        }

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Statistics report generated: ${fileName}`);
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        this.logger.error('Error generating statistics report:', error);
        reject(error);
      }
    });
  }

  // Helper method to download and process images from URLs
  private async downloadImage(url: string): Promise<Buffer | null> {
    try {
      if (!url || !url.startsWith('http')) {
        return null;
      }

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 5000, // 5 segundos timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      return Buffer.from(response.data, 'binary');
    } catch (error) {
      this.logger.warn(`Failed to download image from ${url}:`, error.message);
      return null;
    }
  }

  // RF-REP-01: Reporte de todos los equipos registrados
  async generateAllTeamsReport(teams: any[]): Promise<string> {
    const fileName = `all_teams_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'REPORTE DE EQUIPOS REGISTRADOS');

        doc.fontSize(12).fillColor('#000000').text(`Total de Equipos: ${teams.length}`);
        doc.moveDown(1);

        // List all teams with logos
        for (let index = 0; index < teams.length; index++) {
          const team = teams[index];
          const startY = doc.y;

          // Try to download and add logo
          if (team.logo) {
            try {
              const logoBuffer = await this.downloadImage(team.logo);
              if (logoBuffer) {
                // Add logo on the left
                doc.image(logoBuffer, 50, startY, { 
                  width: 60, 
                  height: 60,
                  fit: [60, 60],
                  align: 'center',
                  valign: 'center'
                });
              }
            } catch (error) {
              this.logger.warn(`Could not add logo for team ${team.nombre}:`, error.message);
            }
          }

          // Add text next to the logo (or where logo would be)
          doc.fontSize(14).fillColor('#000000').text(`${index + 1}. ${team.nombre}`, 120, startY, { underline: true });
          doc.fontSize(11);
          if (team.ciudad) doc.text(`   Ciudad: ${team.ciudad}`, 120);
          if (team.entrenador) doc.text(`   Entrenador: ${team.entrenador}`, 120);
          
          // Statistics
          const pj = team.partidosJugados || 0;
          const pg = team.partidosGanados || 0;
          const pp = team.partidosPerdidos || 0;
          const pe = team.partidosEmpatados || 0;
          
          doc.text(`   Estadísticas:`, 120);
          doc.text(`     • Partidos Jugados: ${pj}`, 120);
          doc.text(`     • Partidos Ganados: ${pg}`, 120);
          doc.text(`     • Partidos Perdidos: ${pp}`, 120);
          if (pe > 0) doc.text(`     • Partidos Empatados: ${pe}`, 120);
          
          // Win percentage
          if (pj > 0) {
            const winRate = ((pg / pj) * 100).toFixed(1);
            doc.text(`     • Porcentaje de Victoria: ${winRate}%`, 120);
          }
          
          // Move down to next team (ensure space for logo)
          doc.moveDown(1.5);
          
          // Check if we need a new page
          if (doc.y > 700) {
            doc.addPage();
          }
        }

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`All teams report generated: ${fileName}`);
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        this.logger.error('Error generating all teams report:', error);
        reject(error);
      }
    });
  }

  // RF-REP-02: Reporte de jugadores por equipo
  async generateTeamPlayersReport(team: any, players: any[]): Promise<string> {
    const fileName = `team_${team.id}_players_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, `JUGADORES DE ${team.nombre.toUpperCase()}`);

        doc.fontSize(12).fillColor('#000000').text(`Total de Jugadores: ${players.length}`);
        doc.moveDown();

        // List all players
        players.forEach((player, index) => {
          const nombre = player.nombreCompleto || `${player.nombre} ${player.apellidos}`;
          doc.fontSize(12).text(`${index + 1}. ${nombre}`, { underline: true });
          doc.fontSize(10);
          if (player.numero || player.numeroCamiseta) 
            doc.text(`   Número: #${player.numero || player.numeroCamiseta}`);
          if (player.posicion) doc.text(`   Posición: ${player.posicion}`);
          if (player.edad) doc.text(`   Edad: ${player.edad} años`);
          if (player.estatura || player.altura) 
            doc.text(`   Estatura: ${player.estatura || player.altura} cm`);
          if (player.nacionalidad) doc.text(`   Nacionalidad: ${player.nacionalidad}`);
          doc.moveDown(0.5);
        });

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Team players report generated: ${fileName}`);
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        this.logger.error('Error generating team players report:', error);
        reject(error);
      }
    });
  }

  // RF-REP-03: Historial de partidos
  async generateMatchHistoryReport(matches: any[]): Promise<string> {
    const fileName = `match_history_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'HISTORIAL DE PARTIDOS');

        doc.fontSize(12).fillColor('#000000').text(`Total de Partidos Finalizados: ${matches.length}`);
        doc.moveDown();

        // List all matches
        matches.forEach((match, index) => {
          doc.fontSize(11).text(`${index + 1}. ${match.equipoLocalNombre} vs ${match.equipoVisitanteNombre}`, { underline: true });
          doc.fontSize(10);
          doc.text(`   Marcador: ${match.marcadorLocal || 0} - ${match.marcadorVisitante || 0}`);
          const fecha = new Date(match.fecha).toLocaleString('es-ES');
          doc.text(`   Fecha: ${fecha}`);
          if (match.lugar || match.ubicacion) 
            doc.text(`   Lugar: ${match.lugar || match.ubicacion}`);
          doc.moveDown(0.5);
        });

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Match history report generated: ${fileName}`);
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        this.logger.error('Error generating match history report:', error);
        reject(error);
      }
    });
  }

  // RF-REP-04: Reporte de roster por partido
  async generateMatchRosterReport(match: any, roster: any[]): Promise<string> {
    const fileName = `match_${match.id}_roster_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'ROSTER DEL PARTIDO');

        doc.fontSize(14).text(`${match.equipoLocalNombre || 'Equipo Local'} vs ${match.equipoVisitanteNombre || 'Equipo Visitante'}`, { align: 'center' });
        const fecha = match.fecha ? new Date(match.fecha).toLocaleString('es-ES') : 'Fecha no disponible';
        doc.fontSize(10).text(`Fecha: ${fecha}`, { align: 'center' });
        doc.moveDown();

        // Separate players by team
        const localPlayers = roster.filter(p => p.equipoId === match.equipoLocalId);
        const visitantePlayers = roster.filter(p => p.equipoId === match.equipoVisitanteId);

        // Local Team
        doc.fontSize(13).text(`${match.equipoLocalNombre || 'Equipo Local'} (${localPlayers.length} jugadores)`, { underline: true });
        doc.moveDown(0.3);
        
        if (localPlayers.length === 0) {
          doc.fontSize(10).text('No hay jugadores registrados');
        } else {
          localPlayers.forEach((player, index) => {
            const nombre = player.jugadorNombre || player.nombreCompleto || 'Nombre no disponible';
            doc.fontSize(10).text(`${index + 1}. ${nombre}`);
            doc.fontSize(9).text(`   Puntos: ${player.puntos || 0} | Rebotes: ${player.rebotes || 0} | Asistencias: ${player.asistencias || 0}`);
          });
        }

        doc.moveDown();

        // Visiting Team
        doc.fontSize(13).text(`${match.equipoVisitanteNombre || 'Equipo Visitante'} (${visitantePlayers.length} jugadores)`, { underline: true });
        doc.moveDown(0.3);
        
        if (visitantePlayers.length === 0) {
          doc.fontSize(10).text('No hay jugadores registrados');
        } else {
          visitantePlayers.forEach((player, index) => {
            const nombre = player.jugadorNombre || player.nombreCompleto || 'Nombre no disponible';
            doc.fontSize(10).text(`${index + 1}. ${nombre}`);
            doc.fontSize(9).text(`   Puntos: ${player.puntos || 0} | Rebotes: ${player.rebotes || 0} | Asistencias: ${player.asistencias || 0}`);
          });
        }

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Match roster report generated: ${fileName}`);
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        this.logger.error('Error generating match roster report:', error);
        reject(error);
      }
    });
  }

  // RF-REP-05: Reporte de estadísticas por jugador
  async generatePlayerStatsReport(player: any, stats: any): Promise<string> {
    const fileName = `player_${player._id || player.id}_stats_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'ESTADÍSTICAS DEL JUGADOR');

        const nombre = player.nombreCompleto || `${player.nombre} ${player.apellidos}`;
        doc.fontSize(16).text(nombre, { align: 'center' });
        doc.fontSize(11);
        if (player.numero || player.numeroCamiseta) 
          doc.text(`Número: #${player.numero || player.numeroCamiseta}`, { align: 'center' });
        if (player.posicion) doc.text(`Posición: ${player.posicion}`, { align: 'center' });
        doc.moveDown();

        // Stats
        doc.fontSize(13).text('Estadísticas Generales', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Partidos Jugados: ${stats.partidosJugados || 0}`);
        doc.text(`Total Puntos: ${stats.totalPuntos || 0}`);
        doc.text(`Total Rebotes: ${stats.totalRebotes || 0}`);
        doc.text(`Total Asistencias: ${stats.totalAsistencias || 0}`);
        doc.text(`Total Faltas: ${stats.totalFaltas || 0}`);
        doc.moveDown();

        doc.fontSize(13).text('Promedios por Partido', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Puntos: ${stats.promedioPuntos?.toFixed(1) || '0.0'} pts`);
        doc.text(`Rebotes: ${stats.promedioRebotes?.toFixed(1) || '0.0'}`);
        doc.text(`Asistencias: ${stats.promedioAsistencias?.toFixed(1) || '0.0'}`);

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Player stats report generated: ${fileName}`);
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        this.logger.error('Error generating player stats report:', error);
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, title: string) {
    doc
      .fontSize(20)
      .fillColor('#2c3e50')
      .text(title, { align: 'center' })
      .fillColor('#000000');
    
    doc.moveDown();
    doc.strokeColor('#3498db')
       .lineWidth(2)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown(2);
  }

  private addFooter(doc: PDFKit.PDFDocument) {
    const bottomY = doc.page.height - 100;
    
    doc.y = bottomY;
    doc.strokeColor('#95a5a6')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    
    doc.moveDown(0.5);
    doc.fontSize(10)
       .fillColor('#7f8c8d')
       .text(`Generado el: ${new Date().toLocaleString('es-ES')}`, { align: 'center' })
       .text('Sistema de Gestión de Baloncesto', { align: 'center' });
  }
}
