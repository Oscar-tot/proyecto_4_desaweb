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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedPlayer = void 0;
var typeorm_1 = require("typeorm");
var CachedPlayer = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('cached_players')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _apellidos_decorators;
    var _apellidos_initializers = [];
    var _apellidos_extraInitializers = [];
    var _posicion_decorators;
    var _posicion_initializers = [];
    var _posicion_extraInitializers = [];
    var _numeroCamiseta_decorators;
    var _numeroCamiseta_initializers = [];
    var _numeroCamiseta_extraInitializers = [];
    var _equipoId_decorators;
    var _equipoId_initializers = [];
    var _equipoId_extraInitializers = [];
    var _equipoNombre_decorators;
    var _equipoNombre_initializers = [];
    var _equipoNombre_extraInitializers = [];
    var _promedioAnotaciones_decorators;
    var _promedioAnotaciones_initializers = [];
    var _promedioAnotaciones_extraInitializers = [];
    var _promedioRebotes_decorators;
    var _promedioRebotes_initializers = [];
    var _promedioRebotes_extraInitializers = [];
    var _promedioAsistencias_decorators;
    var _promedioAsistencias_initializers = [];
    var _promedioAsistencias_extraInitializers = [];
    var _lastUpdated_decorators;
    var _lastUpdated_initializers = [];
    var _lastUpdated_extraInitializers = [];
    var CachedPlayer = _classThis = /** @class */ (function () {
        function CachedPlayer_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.nombre = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.apellidos = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _apellidos_initializers, void 0));
            this.posicion = (__runInitializers(this, _apellidos_extraInitializers), __runInitializers(this, _posicion_initializers, void 0));
            this.numeroCamiseta = (__runInitializers(this, _posicion_extraInitializers), __runInitializers(this, _numeroCamiseta_initializers, void 0));
            this.equipoId = (__runInitializers(this, _numeroCamiseta_extraInitializers), __runInitializers(this, _equipoId_initializers, void 0));
            this.equipoNombre = (__runInitializers(this, _equipoId_extraInitializers), __runInitializers(this, _equipoNombre_initializers, void 0));
            this.promedioAnotaciones = (__runInitializers(this, _equipoNombre_extraInitializers), __runInitializers(this, _promedioAnotaciones_initializers, void 0));
            this.promedioRebotes = (__runInitializers(this, _promedioAnotaciones_extraInitializers), __runInitializers(this, _promedioRebotes_initializers, void 0));
            this.promedioAsistencias = (__runInitializers(this, _promedioRebotes_extraInitializers), __runInitializers(this, _promedioAsistencias_initializers, void 0));
            this.lastUpdated = (__runInitializers(this, _promedioAsistencias_extraInitializers), __runInitializers(this, _lastUpdated_initializers, void 0));
            __runInitializers(this, _lastUpdated_extraInitializers);
        }
        return CachedPlayer_1;
    }());
    __setFunctionName(_classThis, "CachedPlayer");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryColumn)()];
        _nombre_decorators = [(0, typeorm_1.Column)()];
        _apellidos_decorators = [(0, typeorm_1.Column)()];
        _posicion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _numeroCamiseta_decorators = [(0, typeorm_1.Column)({ type: 'int', nullable: true })];
        _equipoId_decorators = [(0, typeorm_1.Column)({ type: 'int', nullable: true })];
        _equipoNombre_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _promedioAnotaciones_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 })];
        _promedioRebotes_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 })];
        _promedioAsistencias_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 })];
        _lastUpdated_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _apellidos_decorators, { kind: "field", name: "apellidos", static: false, private: false, access: { has: function (obj) { return "apellidos" in obj; }, get: function (obj) { return obj.apellidos; }, set: function (obj, value) { obj.apellidos = value; } }, metadata: _metadata }, _apellidos_initializers, _apellidos_extraInitializers);
        __esDecorate(null, null, _posicion_decorators, { kind: "field", name: "posicion", static: false, private: false, access: { has: function (obj) { return "posicion" in obj; }, get: function (obj) { return obj.posicion; }, set: function (obj, value) { obj.posicion = value; } }, metadata: _metadata }, _posicion_initializers, _posicion_extraInitializers);
        __esDecorate(null, null, _numeroCamiseta_decorators, { kind: "field", name: "numeroCamiseta", static: false, private: false, access: { has: function (obj) { return "numeroCamiseta" in obj; }, get: function (obj) { return obj.numeroCamiseta; }, set: function (obj, value) { obj.numeroCamiseta = value; } }, metadata: _metadata }, _numeroCamiseta_initializers, _numeroCamiseta_extraInitializers);
        __esDecorate(null, null, _equipoId_decorators, { kind: "field", name: "equipoId", static: false, private: false, access: { has: function (obj) { return "equipoId" in obj; }, get: function (obj) { return obj.equipoId; }, set: function (obj, value) { obj.equipoId = value; } }, metadata: _metadata }, _equipoId_initializers, _equipoId_extraInitializers);
        __esDecorate(null, null, _equipoNombre_decorators, { kind: "field", name: "equipoNombre", static: false, private: false, access: { has: function (obj) { return "equipoNombre" in obj; }, get: function (obj) { return obj.equipoNombre; }, set: function (obj, value) { obj.equipoNombre = value; } }, metadata: _metadata }, _equipoNombre_initializers, _equipoNombre_extraInitializers);
        __esDecorate(null, null, _promedioAnotaciones_decorators, { kind: "field", name: "promedioAnotaciones", static: false, private: false, access: { has: function (obj) { return "promedioAnotaciones" in obj; }, get: function (obj) { return obj.promedioAnotaciones; }, set: function (obj, value) { obj.promedioAnotaciones = value; } }, metadata: _metadata }, _promedioAnotaciones_initializers, _promedioAnotaciones_extraInitializers);
        __esDecorate(null, null, _promedioRebotes_decorators, { kind: "field", name: "promedioRebotes", static: false, private: false, access: { has: function (obj) { return "promedioRebotes" in obj; }, get: function (obj) { return obj.promedioRebotes; }, set: function (obj, value) { obj.promedioRebotes = value; } }, metadata: _metadata }, _promedioRebotes_initializers, _promedioRebotes_extraInitializers);
        __esDecorate(null, null, _promedioAsistencias_decorators, { kind: "field", name: "promedioAsistencias", static: false, private: false, access: { has: function (obj) { return "promedioAsistencias" in obj; }, get: function (obj) { return obj.promedioAsistencias; }, set: function (obj, value) { obj.promedioAsistencias = value; } }, metadata: _metadata }, _promedioAsistencias_initializers, _promedioAsistencias_extraInitializers);
        __esDecorate(null, null, _lastUpdated_decorators, { kind: "field", name: "lastUpdated", static: false, private: false, access: { has: function (obj) { return "lastUpdated" in obj; }, get: function (obj) { return obj.lastUpdated; }, set: function (obj, value) { obj.lastUpdated = value; } }, metadata: _metadata }, _lastUpdated_initializers, _lastUpdated_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CachedPlayer = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CachedPlayer = _classThis;
}();
exports.CachedPlayer = CachedPlayer;
