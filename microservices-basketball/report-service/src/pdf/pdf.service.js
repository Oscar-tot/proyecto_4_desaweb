"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
var common_1 = require("@nestjs/common");
var pdfkit_1 = require("pdfkit");
var fs = require("fs");
var path = require("path");
var PdfService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PdfService = _classThis = /** @class */ (function () {
        function PdfService_1() {
            this.logger = new common_1.Logger(PdfService.name);
            this.reportsDir = './generated-reports';
            // Crear directorio si no existe
            if (!fs.existsSync(this.reportsDir)) {
                fs.mkdirSync(this.reportsDir, { recursive: true });
            }
        }
        PdfService_1.prototype.generateTeamReport = function (team) {
            return __awaiter(this, void 0, void 0, function () {
                var fileName, filePath;
                var _this = this;
                return __generator(this, function (_a) {
                    fileName = "team_".concat(team.id, "_").concat(Date.now(), ".pdf");
                    filePath = path.join(this.reportsDir, fileName);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            try {
                                var doc = new pdfkit_1.default({ margin: 50 });
                                var stream = fs.createWriteStream(filePath);
                                doc.pipe(stream);
                                // Header
                                _this.addHeader(doc, 'REPORTE DE EQUIPO');
                                // Team Info
                                doc.fontSize(16).text("Equipo: ".concat(team.nombre), { underline: true });
                                doc.moveDown();
                                doc.fontSize(12);
                                if (team.ciudad)
                                    doc.text("Ciudad: ".concat(team.ciudad));
                                if (team.entrenador)
                                    doc.text("Entrenador: ".concat(team.entrenador));
                                doc.moveDown();
                                // Statistics
                                doc.fontSize(14).text('Estadísticas', { underline: true });
                                doc.moveDown(0.5);
                                doc.fontSize(12);
                                doc.text("Partidos Jugados: ".concat(team.partidosJugados || 0));
                                doc.text("Partidos Ganados: ".concat(team.partidosGanados || 0));
                                doc.text("Partidos Perdidos: ".concat(team.partidosPerdidos || 0));
                                if (team.partidosJugados > 0) {
                                    var winRate = ((team.partidosGanados / team.partidosJugados) * 100).toFixed(1);
                                    doc.text("Porcentaje de Victoria: ".concat(winRate, "%"));
                                }
                                // Footer
                                _this.addFooter(doc);
                                doc.end();
                                stream.on('finish', function () {
                                    _this.logger.log("Team report generated: ".concat(fileName));
                                    resolve(filePath);
                                });
                                stream.on('error', reject);
                            }
                            catch (error) {
                                _this.logger.error('Error generating team report:', error);
                                reject(error);
                            }
                        })];
                });
            });
        };
        PdfService_1.prototype.generatePlayerReport = function (player) {
            return __awaiter(this, void 0, void 0, function () {
                var fileName, filePath;
                var _this = this;
                return __generator(this, function (_a) {
                    fileName = "player_".concat(player.id, "_").concat(Date.now(), ".pdf");
                    filePath = path.join(this.reportsDir, fileName);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var _a, _b, _c;
                            try {
                                var doc = new pdfkit_1.default({ margin: 50 });
                                var stream = fs.createWriteStream(filePath);
                                doc.pipe(stream);
                                // Header
                                _this.addHeader(doc, 'REPORTE DE JUGADOR');
                                // Player Info
                                doc.fontSize(16).text("".concat(player.nombre, " ").concat(player.apellidos), { underline: true });
                                doc.moveDown();
                                doc.fontSize(12);
                                if (player.numeroCamiseta)
                                    doc.text("N\u00FAmero: #".concat(player.numeroCamiseta));
                                if (player.posicion)
                                    doc.text("Posici\u00F3n: ".concat(player.posicion));
                                if (player.equipoNombre)
                                    doc.text("Equipo: ".concat(player.equipoNombre));
                                doc.moveDown();
                                // Statistics
                                doc.fontSize(14).text('Estadísticas Promedio', { underline: true });
                                doc.moveDown(0.5);
                                doc.fontSize(12);
                                doc.text("Anotaciones: ".concat(((_a = player.promedioAnotaciones) === null || _a === void 0 ? void 0 : _a.toFixed(1)) || '0.0', " pts"));
                                doc.text("Rebotes: ".concat(((_b = player.promedioRebotes) === null || _b === void 0 ? void 0 : _b.toFixed(1)) || '0.0'));
                                doc.text("Asistencias: ".concat(((_c = player.promedioAsistencias) === null || _c === void 0 ? void 0 : _c.toFixed(1)) || '0.0'));
                                // Footer
                                _this.addFooter(doc);
                                doc.end();
                                stream.on('finish', function () {
                                    _this.logger.log("Player report generated: ".concat(fileName));
                                    resolve(filePath);
                                });
                                stream.on('error', reject);
                            }
                            catch (error) {
                                _this.logger.error('Error generating player report:', error);
                                reject(error);
                            }
                        })];
                });
            });
        };
        PdfService_1.prototype.generateMatchReport = function (match) {
            return __awaiter(this, void 0, void 0, function () {
                var fileName, filePath;
                var _this = this;
                return __generator(this, function (_a) {
                    fileName = "match_".concat(match.id, "_").concat(Date.now(), ".pdf");
                    filePath = path.join(this.reportsDir, fileName);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            try {
                                var doc = new pdfkit_1.default({ margin: 50 });
                                var stream = fs.createWriteStream(filePath);
                                doc.pipe(stream);
                                // Header
                                _this.addHeader(doc, 'REPORTE DE PARTIDO');
                                // Match Info
                                doc.fontSize(16).text('Resultado del Partido', { underline: true });
                                doc.moveDown();
                                doc.fontSize(14);
                                doc.text("".concat(match.equipoLocalNombre, " vs ").concat(match.equipoVisitanteNombre), { align: 'center' });
                                doc.moveDown();
                                // Score
                                doc.fontSize(24).fillColor('#2c3e50');
                                doc.text("".concat(match.marcadorLocal, "  -  ").concat(match.marcadorVisitante), { align: 'center' });
                                doc.fillColor('#000000');
                                doc.moveDown();
                                // Details
                                doc.fontSize(12);
                                if (match.fecha)
                                    doc.text("Fecha: ".concat(new Date(match.fecha).toLocaleDateString('es-ES')));
                                if (match.ubicacion)
                                    doc.text("Ubicaci\u00F3n: ".concat(match.ubicacion));
                                if (match.estado)
                                    doc.text("Estado: ".concat(match.estado));
                                // Winner
                                doc.moveDown();
                                if (match.marcadorLocal > match.marcadorVisitante) {
                                    doc.fontSize(14).fillColor('#27ae60');
                                    doc.text("Ganador: ".concat(match.equipoLocalNombre), { align: 'center' });
                                }
                                else if (match.marcadorVisitante > match.marcadorLocal) {
                                    doc.fontSize(14).fillColor('#27ae60');
                                    doc.text("Ganador: ".concat(match.equipoVisitanteNombre), { align: 'center' });
                                }
                                else {
                                    doc.fontSize(14).fillColor('#f39c12');
                                    doc.text('Empate', { align: 'center' });
                                }
                                // Footer
                                _this.addFooter(doc);
                                doc.end();
                                stream.on('finish', function () {
                                    _this.logger.log("Match report generated: ".concat(fileName));
                                    resolve(filePath);
                                });
                                stream.on('error', reject);
                            }
                            catch (error) {
                                _this.logger.error('Error generating match report:', error);
                                reject(error);
                            }
                        })];
                });
            });
        };
        PdfService_1.prototype.generateStatisticsReport = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var fileName, filePath;
                var _this = this;
                return __generator(this, function (_a) {
                    fileName = "statistics_".concat(Date.now(), ".pdf");
                    filePath = path.join(this.reportsDir, fileName);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            try {
                                var doc_1 = new pdfkit_1.default({ margin: 50 });
                                var stream = fs.createWriteStream(filePath);
                                doc_1.pipe(stream);
                                // Header
                                _this.addHeader(doc_1, 'REPORTE DE ESTADÍSTICAS GENERALES');
                                // Summary
                                doc_1.fontSize(14).text('Resumen del Sistema', { underline: true });
                                doc_1.moveDown();
                                doc_1.fontSize(12);
                                doc_1.text("Total de Equipos: ".concat(data.totalTeams || 0));
                                doc_1.text("Total de Jugadores: ".concat(data.totalPlayers || 0));
                                doc_1.text("Total de Partidos: ".concat(data.totalMatches || 0));
                                doc_1.moveDown();
                                // Top Teams
                                if (data.topTeams && data.topTeams.length > 0) {
                                    doc_1.fontSize(14).text('Mejores Equipos', { underline: true });
                                    doc_1.moveDown(0.5);
                                    doc_1.fontSize(11);
                                    data.topTeams.slice(0, 5).forEach(function (team, index) {
                                        doc_1.text("".concat(index + 1, ". ").concat(team.nombre, " - ").concat(team.partidosGanados, " victorias"));
                                    });
                                    doc_1.moveDown();
                                }
                                // Top Players
                                if (data.topPlayers && data.topPlayers.length > 0) {
                                    doc_1.fontSize(14).text('Mejores Jugadores', { underline: true });
                                    doc_1.moveDown(0.5);
                                    doc_1.fontSize(11);
                                    data.topPlayers.slice(0, 5).forEach(function (player, index) {
                                        var _a;
                                        doc_1.text("".concat(index + 1, ". ").concat(player.nombre, " ").concat(player.apellidos, " - ").concat((_a = player.promedioAnotaciones) === null || _a === void 0 ? void 0 : _a.toFixed(1), " pts"));
                                    });
                                }
                                // Footer
                                _this.addFooter(doc_1);
                                doc_1.end();
                                stream.on('finish', function () {
                                    _this.logger.log("Statistics report generated: ".concat(fileName));
                                    resolve(filePath);
                                });
                                stream.on('error', reject);
                            }
                            catch (error) {
                                _this.logger.error('Error generating statistics report:', error);
                                reject(error);
                            }
                        })];
                });
            });
        };
        PdfService_1.prototype.addHeader = function (doc, title) {
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
        };
        PdfService_1.prototype.addFooter = function (doc) {
            var bottomY = doc.page.height - 100;
            doc.y = bottomY;
            doc.strokeColor('#95a5a6')
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke();
            doc.moveDown(0.5);
            doc.fontSize(10)
                .fillColor('#7f8c8d')
                .text("Generado el: ".concat(new Date().toLocaleString('es-ES')), { align: 'center' })
                .text('Sistema de Gestión de Baloncesto', { align: 'center' });
        };
        return PdfService_1;
    }());
    __setFunctionName(_classThis, "PdfService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PdfService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PdfService = _classThis;
}();
exports.PdfService = PdfService;
