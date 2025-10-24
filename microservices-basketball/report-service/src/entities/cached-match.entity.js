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
exports.CachedMatch = void 0;
var typeorm_1 = require("typeorm");
var CachedMatch = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('cached_matches')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _equipoLocalId_decorators;
    var _equipoLocalId_initializers = [];
    var _equipoLocalId_extraInitializers = [];
    var _equipoLocalNombre_decorators;
    var _equipoLocalNombre_initializers = [];
    var _equipoLocalNombre_extraInitializers = [];
    var _equipoVisitanteId_decorators;
    var _equipoVisitanteId_initializers = [];
    var _equipoVisitanteId_extraInitializers = [];
    var _equipoVisitanteNombre_decorators;
    var _equipoVisitanteNombre_initializers = [];
    var _equipoVisitanteNombre_extraInitializers = [];
    var _marcadorLocal_decorators;
    var _marcadorLocal_initializers = [];
    var _marcadorLocal_extraInitializers = [];
    var _marcadorVisitante_decorators;
    var _marcadorVisitante_initializers = [];
    var _marcadorVisitante_extraInitializers = [];
    var _fecha_decorators;
    var _fecha_initializers = [];
    var _fecha_extraInitializers = [];
    var _ubicacion_decorators;
    var _ubicacion_initializers = [];
    var _ubicacion_extraInitializers = [];
    var _estado_decorators;
    var _estado_initializers = [];
    var _estado_extraInitializers = [];
    var _lastUpdated_decorators;
    var _lastUpdated_initializers = [];
    var _lastUpdated_extraInitializers = [];
    var CachedMatch = _classThis = /** @class */ (function () {
        function CachedMatch_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.equipoLocalId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _equipoLocalId_initializers, void 0));
            this.equipoLocalNombre = (__runInitializers(this, _equipoLocalId_extraInitializers), __runInitializers(this, _equipoLocalNombre_initializers, void 0));
            this.equipoVisitanteId = (__runInitializers(this, _equipoLocalNombre_extraInitializers), __runInitializers(this, _equipoVisitanteId_initializers, void 0));
            this.equipoVisitanteNombre = (__runInitializers(this, _equipoVisitanteId_extraInitializers), __runInitializers(this, _equipoVisitanteNombre_initializers, void 0));
            this.marcadorLocal = (__runInitializers(this, _equipoVisitanteNombre_extraInitializers), __runInitializers(this, _marcadorLocal_initializers, void 0));
            this.marcadorVisitante = (__runInitializers(this, _marcadorLocal_extraInitializers), __runInitializers(this, _marcadorVisitante_initializers, void 0));
            this.fecha = (__runInitializers(this, _marcadorVisitante_extraInitializers), __runInitializers(this, _fecha_initializers, void 0));
            this.ubicacion = (__runInitializers(this, _fecha_extraInitializers), __runInitializers(this, _ubicacion_initializers, void 0));
            this.estado = (__runInitializers(this, _ubicacion_extraInitializers), __runInitializers(this, _estado_initializers, void 0)); // 'programado', 'en_progreso', 'finalizado'
            this.lastUpdated = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _lastUpdated_initializers, void 0));
            __runInitializers(this, _lastUpdated_extraInitializers);
        }
        return CachedMatch_1;
    }());
    __setFunctionName(_classThis, "CachedMatch");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryColumn)()];
        _equipoLocalId_decorators = [(0, typeorm_1.Column)()];
        _equipoLocalNombre_decorators = [(0, typeorm_1.Column)()];
        _equipoVisitanteId_decorators = [(0, typeorm_1.Column)()];
        _equipoVisitanteNombre_decorators = [(0, typeorm_1.Column)()];
        _marcadorLocal_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
        _marcadorVisitante_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
        _fecha_decorators = [(0, typeorm_1.Column)({ type: 'datetime' })];
        _ubicacion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _estado_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _lastUpdated_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _equipoLocalId_decorators, { kind: "field", name: "equipoLocalId", static: false, private: false, access: { has: function (obj) { return "equipoLocalId" in obj; }, get: function (obj) { return obj.equipoLocalId; }, set: function (obj, value) { obj.equipoLocalId = value; } }, metadata: _metadata }, _equipoLocalId_initializers, _equipoLocalId_extraInitializers);
        __esDecorate(null, null, _equipoLocalNombre_decorators, { kind: "field", name: "equipoLocalNombre", static: false, private: false, access: { has: function (obj) { return "equipoLocalNombre" in obj; }, get: function (obj) { return obj.equipoLocalNombre; }, set: function (obj, value) { obj.equipoLocalNombre = value; } }, metadata: _metadata }, _equipoLocalNombre_initializers, _equipoLocalNombre_extraInitializers);
        __esDecorate(null, null, _equipoVisitanteId_decorators, { kind: "field", name: "equipoVisitanteId", static: false, private: false, access: { has: function (obj) { return "equipoVisitanteId" in obj; }, get: function (obj) { return obj.equipoVisitanteId; }, set: function (obj, value) { obj.equipoVisitanteId = value; } }, metadata: _metadata }, _equipoVisitanteId_initializers, _equipoVisitanteId_extraInitializers);
        __esDecorate(null, null, _equipoVisitanteNombre_decorators, { kind: "field", name: "equipoVisitanteNombre", static: false, private: false, access: { has: function (obj) { return "equipoVisitanteNombre" in obj; }, get: function (obj) { return obj.equipoVisitanteNombre; }, set: function (obj, value) { obj.equipoVisitanteNombre = value; } }, metadata: _metadata }, _equipoVisitanteNombre_initializers, _equipoVisitanteNombre_extraInitializers);
        __esDecorate(null, null, _marcadorLocal_decorators, { kind: "field", name: "marcadorLocal", static: false, private: false, access: { has: function (obj) { return "marcadorLocal" in obj; }, get: function (obj) { return obj.marcadorLocal; }, set: function (obj, value) { obj.marcadorLocal = value; } }, metadata: _metadata }, _marcadorLocal_initializers, _marcadorLocal_extraInitializers);
        __esDecorate(null, null, _marcadorVisitante_decorators, { kind: "field", name: "marcadorVisitante", static: false, private: false, access: { has: function (obj) { return "marcadorVisitante" in obj; }, get: function (obj) { return obj.marcadorVisitante; }, set: function (obj, value) { obj.marcadorVisitante = value; } }, metadata: _metadata }, _marcadorVisitante_initializers, _marcadorVisitante_extraInitializers);
        __esDecorate(null, null, _fecha_decorators, { kind: "field", name: "fecha", static: false, private: false, access: { has: function (obj) { return "fecha" in obj; }, get: function (obj) { return obj.fecha; }, set: function (obj, value) { obj.fecha = value; } }, metadata: _metadata }, _fecha_initializers, _fecha_extraInitializers);
        __esDecorate(null, null, _ubicacion_decorators, { kind: "field", name: "ubicacion", static: false, private: false, access: { has: function (obj) { return "ubicacion" in obj; }, get: function (obj) { return obj.ubicacion; }, set: function (obj, value) { obj.ubicacion = value; } }, metadata: _metadata }, _ubicacion_initializers, _ubicacion_extraInitializers);
        __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
        __esDecorate(null, null, _lastUpdated_decorators, { kind: "field", name: "lastUpdated", static: false, private: false, access: { has: function (obj) { return "lastUpdated" in obj; }, get: function (obj) { return obj.lastUpdated; }, set: function (obj, value) { obj.lastUpdated = value; } }, metadata: _metadata }, _lastUpdated_initializers, _lastUpdated_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CachedMatch = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CachedMatch = _classThis;
}();
exports.CachedMatch = CachedMatch;
