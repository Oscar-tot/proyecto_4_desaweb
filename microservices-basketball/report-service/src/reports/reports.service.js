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
exports.ReportsService = void 0;
var common_1 = require("@nestjs/common");
var fs = require("fs");
var ReportsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ReportsService = _classThis = /** @class */ (function () {
        function ReportsService_1(reportHistoryRepo, cachedTeamRepo, cachedPlayerRepo, cachedMatchRepo, pdfService, teamsClient, playersClient, matchesClient) {
            this.reportHistoryRepo = reportHistoryRepo;
            this.cachedTeamRepo = cachedTeamRepo;
            this.cachedPlayerRepo = cachedPlayerRepo;
            this.cachedMatchRepo = cachedMatchRepo;
            this.pdfService = pdfService;
            this.teamsClient = teamsClient;
            this.playersClient = playersClient;
            this.matchesClient = matchesClient;
            this.logger = new common_1.Logger(ReportsService.name);
        }
        ReportsService_1.prototype.generateTeamReport = function (teamId) {
            return __awaiter(this, void 0, void 0, function () {
                var team, filePath;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log("Generating report for team ".concat(teamId));
                            return [4 /*yield*/, this.teamsClient.getTeamById(teamId)];
                        case 1:
                            team = _a.sent();
                            if (!team) {
                                throw new common_1.NotFoundException("Team with ID ".concat(teamId, " not found"));
                            }
                            // Cache team data
                            return [4 /*yield*/, this.cacheTeamData(team)];
                        case 2:
                            // Cache team data
                            _a.sent();
                            return [4 /*yield*/, this.pdfService.generateTeamReport(team)];
                        case 3:
                            filePath = _a.sent();
                            // Save to history
                            return [4 /*yield*/, this.saveToHistory({
                                    reportType: 'team',
                                    entityId: teamId,
                                    entityName: team.nombre,
                                    filePath: filePath,
                                })];
                        case 4:
                            // Save to history
                            _a.sent();
                            return [2 /*return*/, filePath];
                    }
                });
            });
        };
        ReportsService_1.prototype.generatePlayerReport = function (playerId) {
            return __awaiter(this, void 0, void 0, function () {
                var player, filePath;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log("Generating report for player ".concat(playerId));
                            return [4 /*yield*/, this.playersClient.getPlayerById(playerId)];
                        case 1:
                            player = _a.sent();
                            if (!player) {
                                throw new common_1.NotFoundException("Player with ID ".concat(playerId, " not found"));
                            }
                            // Cache player data
                            return [4 /*yield*/, this.cachePlayerData(player)];
                        case 2:
                            // Cache player data
                            _a.sent();
                            return [4 /*yield*/, this.pdfService.generatePlayerReport(player)];
                        case 3:
                            filePath = _a.sent();
                            // Save to history
                            return [4 /*yield*/, this.saveToHistory({
                                    reportType: 'player',
                                    entityId: playerId,
                                    entityName: "".concat(player.nombre, " ").concat(player.apellidos),
                                    filePath: filePath,
                                })];
                        case 4:
                            // Save to history
                            _a.sent();
                            return [2 /*return*/, filePath];
                    }
                });
            });
        };
        ReportsService_1.prototype.generateMatchReport = function (matchId) {
            return __awaiter(this, void 0, void 0, function () {
                var match, filePath;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log("Generating report for match ".concat(matchId));
                            return [4 /*yield*/, this.matchesClient.getMatchById(matchId)];
                        case 1:
                            match = _a.sent();
                            if (!match) {
                                throw new common_1.NotFoundException("Match with ID ".concat(matchId, " not found"));
                            }
                            // Cache match data
                            return [4 /*yield*/, this.cacheMatchData(match)];
                        case 2:
                            // Cache match data
                            _a.sent();
                            return [4 /*yield*/, this.pdfService.generateMatchReport(match)];
                        case 3:
                            filePath = _a.sent();
                            // Save to history
                            return [4 /*yield*/, this.saveToHistory({
                                    reportType: 'match',
                                    entityId: matchId,
                                    entityName: "".concat(match.equipoLocalNombre, " vs ").concat(match.equipoVisitanteNombre),
                                    filePath: filePath,
                                })];
                        case 4:
                            // Save to history
                            _a.sent();
                            return [2 /*return*/, filePath];
                    }
                });
            });
        };
        ReportsService_1.prototype.generateStatisticsReport = function () {
            return __awaiter(this, void 0, void 0, function () {
                var teams, players, matches, stats, filePath;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log('Generating statistics report');
                            return [4 /*yield*/, this.teamsClient.getAllTeams()];
                        case 1:
                            teams = _a.sent();
                            return [4 /*yield*/, this.playersClient.getAllPlayers()];
                        case 2:
                            players = _a.sent();
                            return [4 /*yield*/, this.matchesClient.getAllMatches()];
                        case 3:
                            matches = _a.sent();
                            stats = {
                                totalTeams: teams.length,
                                totalPlayers: players.length,
                                totalMatches: matches.length,
                                topTeams: teams
                                    .sort(function (a, b) { return (b.partidosGanados || 0) - (a.partidosGanados || 0); })
                                    .slice(0, 5),
                                topPlayers: players
                                    .sort(function (a, b) { return (b.promedioAnotaciones || 0) - (a.promedioAnotaciones || 0); })
                                    .slice(0, 5),
                            };
                            return [4 /*yield*/, this.pdfService.generateStatisticsReport(stats)];
                        case 4:
                            filePath = _a.sent();
                            // Save to history
                            return [4 /*yield*/, this.saveToHistory({
                                    reportType: 'statistics',
                                    entityId: null,
                                    entityName: 'Estadísticas Generales',
                                    filePath: filePath,
                                })];
                        case 5:
                            // Save to history
                            _a.sent();
                            return [2 /*return*/, filePath];
                    }
                });
            });
        };
        ReportsService_1.prototype.getReportHistory = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.reportHistoryRepo.find({
                            order: { generatedAt: 'DESC' },
                            take: 50,
                        })];
                });
            });
        };
        ReportsService_1.prototype.getReportById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var report;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.reportHistoryRepo.findOne({ where: { id: id } })];
                        case 1:
                            report = _a.sent();
                            if (!report) {
                                throw new common_1.NotFoundException("Report with ID ".concat(id, " not found"));
                            }
                            return [2 /*return*/, report];
                    }
                });
            });
        };
        ReportsService_1.prototype.saveToHistory = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var stats, fileName, history;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            stats = fs.statSync(data.filePath);
                            fileName = data.filePath.split(/[\\/]/).pop();
                            history = this.reportHistoryRepo.create({
                                reportType: data.reportType,
                                entityId: data.entityId,
                                entityName: data.entityName,
                                fileName: fileName,
                                filePath: data.filePath,
                                fileSize: stats.size,
                                metadata: JSON.stringify({ generatedBy: 'system' }),
                            });
                            return [4 /*yield*/, this.reportHistoryRepo.save(history)];
                        case 1:
                            _a.sent();
                            this.logger.log("Report saved to history: ".concat(fileName));
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReportsService_1.prototype.cacheTeamData = function (team) {
            return __awaiter(this, void 0, void 0, function () {
                var cached;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cached = this.cachedTeamRepo.create({
                                id: team.id,
                                nombre: team.nombre,
                                ciudad: team.ciudad,
                                entrenador: team.entrenador,
                                logo: team.logo,
                                partidosJugados: team.partidosJugados || 0,
                                partidosGanados: team.partidosGanados || 0,
                                partidosPerdidos: team.partidosPerdidos || 0,
                            });
                            return [4 /*yield*/, this.cachedTeamRepo.save(cached)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReportsService_1.prototype.cachePlayerData = function (player) {
            return __awaiter(this, void 0, void 0, function () {
                var cached;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cached = this.cachedPlayerRepo.create({
                                id: player.id,
                                nombre: player.nombre,
                                apellidos: player.apellidos,
                                posicion: player.posicion,
                                numeroCamiseta: player.numeroCamiseta,
                                equipoId: player.equipoId,
                                equipoNombre: player.equipoNombre,
                                promedioAnotaciones: player.promedioAnotaciones || 0,
                                promedioRebotes: player.promedioRebotes || 0,
                                promedioAsistencias: player.promedioAsistencias || 0,
                            });
                            return [4 /*yield*/, this.cachedPlayerRepo.save(cached)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReportsService_1.prototype.cacheMatchData = function (match) {
            return __awaiter(this, void 0, void 0, function () {
                var cached;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cached = this.cachedMatchRepo.create({
                                id: match.id,
                                equipoLocalId: match.equipoLocalId,
                                equipoLocalNombre: match.equipoLocalNombre,
                                equipoVisitanteId: match.equipoVisitanteId,
                                equipoVisitanteNombre: match.equipoVisitanteNombre,
                                marcadorLocal: match.marcadorLocal || 0,
                                marcadorVisitante: match.marcadorVisitante || 0,
                                fecha: match.fecha,
                                ubicacion: match.ubicacion,
                                estado: match.estado,
                            });
                            return [4 /*yield*/, this.cachedMatchRepo.save(cached)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return ReportsService_1;
    }());
    __setFunctionName(_classThis, "ReportsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReportsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReportsService = _classThis;
}();
exports.ReportsService = ReportsService;
