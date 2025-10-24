"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.ReportsController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var ReportsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('reports'), (0, common_1.Controller)('reports')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _healthCheck_decorators;
    var _generateTeamReport_decorators;
    var _generatePlayerReport_decorators;
    var _generateMatchReport_decorators;
    var _generateStatisticsReport_decorators;
    var _getReportHistory_decorators;
    var _getReportById_decorators;
    var ReportsController = _classThis = /** @class */ (function () {
        function ReportsController_1(reportsService) {
            this.reportsService = (__runInitializers(this, _instanceExtraInitializers), reportsService);
            this.logger = new common_1.Logger(ReportsController.name);
        }
        ReportsController_1.prototype.healthCheck = function () {
            return {
                status: 'ok',
                service: 'report-service',
                timestamp: new Date().toISOString(),
            };
        };
        ReportsController_1.prototype.generateTeamReport = function (id, res) {
            return __awaiter(this, void 0, void 0, function () {
                var filePath, error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Generating team report for ID: ".concat(id));
                            return [4 /*yield*/, this.reportsService.generateTeamReport(id)];
                        case 1:
                            filePath = _a.sent();
                            res.download(filePath, "equipo_".concat(id, "_reporte.pdf"), function (err) {
                                if (err) {
                                    _this.logger.error('Error downloading file:', err);
                                    res.status(500).send('Error descargando el archivo');
                                }
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.error('Error generating team report:', error_1);
                            res.status(500).json({
                                error: 'Error generando el reporte',
                                message: error_1.message
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ReportsController_1.prototype.generatePlayerReport = function (id, res) {
            return __awaiter(this, void 0, void 0, function () {
                var filePath, error_2;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Generating player report for ID: ".concat(id));
                            return [4 /*yield*/, this.reportsService.generatePlayerReport(id)];
                        case 1:
                            filePath = _a.sent();
                            res.download(filePath, "jugador_".concat(id, "_reporte.pdf"), function (err) {
                                if (err) {
                                    _this.logger.error('Error downloading file:', err);
                                    res.status(500).send('Error descargando el archivo');
                                }
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            this.logger.error('Error generating player report:', error_2);
                            res.status(500).json({
                                error: 'Error generando el reporte',
                                message: error_2.message
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ReportsController_1.prototype.generateMatchReport = function (id, res) {
            return __awaiter(this, void 0, void 0, function () {
                var filePath, error_3;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Generating match report for ID: ".concat(id));
                            return [4 /*yield*/, this.reportsService.generateMatchReport(id)];
                        case 1:
                            filePath = _a.sent();
                            res.download(filePath, "partido_".concat(id, "_reporte.pdf"), function (err) {
                                if (err) {
                                    _this.logger.error('Error downloading file:', err);
                                    res.status(500).send('Error descargando el archivo');
                                }
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.error('Error generating match report:', error_3);
                            res.status(500).json({
                                error: 'Error generando el reporte',
                                message: error_3.message
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ReportsController_1.prototype.generateStatisticsReport = function (res) {
            return __awaiter(this, void 0, void 0, function () {
                var filePath, error_4;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log('Generating statistics report');
                            return [4 /*yield*/, this.reportsService.generateStatisticsReport()];
                        case 1:
                            filePath = _a.sent();
                            res.download(filePath, "estadisticas_".concat(Date.now(), ".pdf"), function (err) {
                                if (err) {
                                    _this.logger.error('Error downloading file:', err);
                                    res.status(500).send('Error descargando el archivo');
                                }
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            this.logger.error('Error generating statistics report:', error_4);
                            res.status(500).json({
                                error: 'Error generando el reporte',
                                message: error_4.message
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ReportsController_1.prototype.getReportHistory = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.reportsService.getReportHistory()];
                });
            });
        };
        ReportsController_1.prototype.getReportById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.reportsService.getReportById(id)];
                });
            });
        };
        return ReportsController_1;
    }());
    __setFunctionName(_classThis, "ReportsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _healthCheck_decorators = [(0, common_1.Get)('health'), (0, swagger_1.ApiOperation)({ summary: 'Health check' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' })];
        _generateTeamReport_decorators = [(0, common_1.Post)('team/:id'), (0, swagger_1.ApiOperation)({ summary: 'Generar reporte PDF de un equipo' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'PDF generado exitosamente' })];
        _generatePlayerReport_decorators = [(0, common_1.Post)('player/:id'), (0, swagger_1.ApiOperation)({ summary: 'Generar reporte PDF de un jugador' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'PDF generado exitosamente' })];
        _generateMatchReport_decorators = [(0, common_1.Post)('match/:id'), (0, swagger_1.ApiOperation)({ summary: 'Generar reporte PDF de un partido' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'PDF generado exitosamente' })];
        _generateStatisticsReport_decorators = [(0, common_1.Post)('statistics'), (0, swagger_1.ApiOperation)({ summary: 'Generar reporte PDF de estadísticas generales' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'PDF generado exitosamente' })];
        _getReportHistory_decorators = [(0, common_1.Get)('history'), (0, swagger_1.ApiOperation)({ summary: 'Obtener historial de reportes generados' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Historial recuperado exitosamente' })];
        _getReportById_decorators = [(0, common_1.Get)('history/:id'), (0, swagger_1.ApiOperation)({ summary: 'Obtener detalles de un reporte específico' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Reporte encontrado' })];
        __esDecorate(_classThis, null, _healthCheck_decorators, { kind: "method", name: "healthCheck", static: false, private: false, access: { has: function (obj) { return "healthCheck" in obj; }, get: function (obj) { return obj.healthCheck; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateTeamReport_decorators, { kind: "method", name: "generateTeamReport", static: false, private: false, access: { has: function (obj) { return "generateTeamReport" in obj; }, get: function (obj) { return obj.generateTeamReport; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generatePlayerReport_decorators, { kind: "method", name: "generatePlayerReport", static: false, private: false, access: { has: function (obj) { return "generatePlayerReport" in obj; }, get: function (obj) { return obj.generatePlayerReport; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateMatchReport_decorators, { kind: "method", name: "generateMatchReport", static: false, private: false, access: { has: function (obj) { return "generateMatchReport" in obj; }, get: function (obj) { return obj.generateMatchReport; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateStatisticsReport_decorators, { kind: "method", name: "generateStatisticsReport", static: false, private: false, access: { has: function (obj) { return "generateStatisticsReport" in obj; }, get: function (obj) { return obj.generateStatisticsReport; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getReportHistory_decorators, { kind: "method", name: "getReportHistory", static: false, private: false, access: { has: function (obj) { return "getReportHistory" in obj; }, get: function (obj) { return obj.getReportHistory; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getReportById_decorators, { kind: "method", name: "getReportById", static: false, private: false, access: { has: function (obj) { return "getReportById" in obj; }, get: function (obj) { return obj.getReportById; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReportsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReportsController = _classThis;
}();
exports.ReportsController = ReportsController;
