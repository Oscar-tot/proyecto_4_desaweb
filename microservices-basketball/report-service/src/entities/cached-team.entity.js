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
exports.CachedTeam = void 0;
var typeorm_1 = require("typeorm");
var CachedTeam = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('cached_teams')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _ciudad_decorators;
    var _ciudad_initializers = [];
    var _ciudad_extraInitializers = [];
    var _entrenador_decorators;
    var _entrenador_initializers = [];
    var _entrenador_extraInitializers = [];
    var _logo_decorators;
    var _logo_initializers = [];
    var _logo_extraInitializers = [];
    var _partidosJugados_decorators;
    var _partidosJugados_initializers = [];
    var _partidosJugados_extraInitializers = [];
    var _partidosGanados_decorators;
    var _partidosGanados_initializers = [];
    var _partidosGanados_extraInitializers = [];
    var _partidosPerdidos_decorators;
    var _partidosPerdidos_initializers = [];
    var _partidosPerdidos_extraInitializers = [];
    var _lastUpdated_decorators;
    var _lastUpdated_initializers = [];
    var _lastUpdated_extraInitializers = [];
    var CachedTeam = _classThis = /** @class */ (function () {
        function CachedTeam_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.nombre = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.ciudad = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _ciudad_initializers, void 0));
            this.entrenador = (__runInitializers(this, _ciudad_extraInitializers), __runInitializers(this, _entrenador_initializers, void 0));
            this.logo = (__runInitializers(this, _entrenador_extraInitializers), __runInitializers(this, _logo_initializers, void 0));
            this.partidosJugados = (__runInitializers(this, _logo_extraInitializers), __runInitializers(this, _partidosJugados_initializers, void 0));
            this.partidosGanados = (__runInitializers(this, _partidosJugados_extraInitializers), __runInitializers(this, _partidosGanados_initializers, void 0));
            this.partidosPerdidos = (__runInitializers(this, _partidosGanados_extraInitializers), __runInitializers(this, _partidosPerdidos_initializers, void 0));
            this.lastUpdated = (__runInitializers(this, _partidosPerdidos_extraInitializers), __runInitializers(this, _lastUpdated_initializers, void 0));
            __runInitializers(this, _lastUpdated_extraInitializers);
        }
        return CachedTeam_1;
    }());
    __setFunctionName(_classThis, "CachedTeam");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryColumn)()];
        _nombre_decorators = [(0, typeorm_1.Column)()];
        _ciudad_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _entrenador_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _logo_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _partidosJugados_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
        _partidosGanados_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
        _partidosPerdidos_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
        _lastUpdated_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _ciudad_decorators, { kind: "field", name: "ciudad", static: false, private: false, access: { has: function (obj) { return "ciudad" in obj; }, get: function (obj) { return obj.ciudad; }, set: function (obj, value) { obj.ciudad = value; } }, metadata: _metadata }, _ciudad_initializers, _ciudad_extraInitializers);
        __esDecorate(null, null, _entrenador_decorators, { kind: "field", name: "entrenador", static: false, private: false, access: { has: function (obj) { return "entrenador" in obj; }, get: function (obj) { return obj.entrenador; }, set: function (obj, value) { obj.entrenador = value; } }, metadata: _metadata }, _entrenador_initializers, _entrenador_extraInitializers);
        __esDecorate(null, null, _logo_decorators, { kind: "field", name: "logo", static: false, private: false, access: { has: function (obj) { return "logo" in obj; }, get: function (obj) { return obj.logo; }, set: function (obj, value) { obj.logo = value; } }, metadata: _metadata }, _logo_initializers, _logo_extraInitializers);
        __esDecorate(null, null, _partidosJugados_decorators, { kind: "field", name: "partidosJugados", static: false, private: false, access: { has: function (obj) { return "partidosJugados" in obj; }, get: function (obj) { return obj.partidosJugados; }, set: function (obj, value) { obj.partidosJugados = value; } }, metadata: _metadata }, _partidosJugados_initializers, _partidosJugados_extraInitializers);
        __esDecorate(null, null, _partidosGanados_decorators, { kind: "field", name: "partidosGanados", static: false, private: false, access: { has: function (obj) { return "partidosGanados" in obj; }, get: function (obj) { return obj.partidosGanados; }, set: function (obj, value) { obj.partidosGanados = value; } }, metadata: _metadata }, _partidosGanados_initializers, _partidosGanados_extraInitializers);
        __esDecorate(null, null, _partidosPerdidos_decorators, { kind: "field", name: "partidosPerdidos", static: false, private: false, access: { has: function (obj) { return "partidosPerdidos" in obj; }, get: function (obj) { return obj.partidosPerdidos; }, set: function (obj, value) { obj.partidosPerdidos = value; } }, metadata: _metadata }, _partidosPerdidos_initializers, _partidosPerdidos_extraInitializers);
        __esDecorate(null, null, _lastUpdated_decorators, { kind: "field", name: "lastUpdated", static: false, private: false, access: { has: function (obj) { return "lastUpdated" in obj; }, get: function (obj) { return obj.lastUpdated; }, set: function (obj, value) { obj.lastUpdated = value; } }, metadata: _metadata }, _lastUpdated_initializers, _lastUpdated_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CachedTeam = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CachedTeam = _classThis;
}();
exports.CachedTeam = CachedTeam;
