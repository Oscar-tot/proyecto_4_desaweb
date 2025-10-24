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
exports.ReportHistory = void 0;
var typeorm_1 = require("typeorm");
var ReportHistory = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('report_history')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _reportType_decorators;
    var _reportType_initializers = [];
    var _reportType_extraInitializers = [];
    var _entityId_decorators;
    var _entityId_initializers = [];
    var _entityId_extraInitializers = [];
    var _entityName_decorators;
    var _entityName_initializers = [];
    var _entityName_extraInitializers = [];
    var _fileName_decorators;
    var _fileName_initializers = [];
    var _fileName_extraInitializers = [];
    var _filePath_decorators;
    var _filePath_initializers = [];
    var _filePath_extraInitializers = [];
    var _fileSize_decorators;
    var _fileSize_initializers = [];
    var _fileSize_extraInitializers = [];
    var _generatedAt_decorators;
    var _generatedAt_initializers = [];
    var _generatedAt_extraInitializers = [];
    var _metadata_decorators;
    var _metadata_initializers = [];
    var _metadata_extraInitializers = [];
    var ReportHistory = _classThis = /** @class */ (function () {
        function ReportHistory_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.reportType = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _reportType_initializers, void 0)); // 'team', 'player', 'match', 'statistics'
            this.entityId = (__runInitializers(this, _reportType_extraInitializers), __runInitializers(this, _entityId_initializers, void 0)); // ID del equipo, jugador o partido
            this.entityName = (__runInitializers(this, _entityId_extraInitializers), __runInitializers(this, _entityName_initializers, void 0)); // Nombre del equipo, jugador, etc
            this.fileName = (__runInitializers(this, _entityName_extraInitializers), __runInitializers(this, _fileName_initializers, void 0));
            this.filePath = (__runInitializers(this, _fileName_extraInitializers), __runInitializers(this, _filePath_initializers, void 0));
            this.fileSize = (__runInitializers(this, _filePath_extraInitializers), __runInitializers(this, _fileSize_initializers, void 0)); // en bytes
            this.generatedAt = (__runInitializers(this, _fileSize_extraInitializers), __runInitializers(this, _generatedAt_initializers, void 0));
            this.metadata = (__runInitializers(this, _generatedAt_extraInitializers), __runInitializers(this, _metadata_initializers, void 0)); // JSON con información adicional
            __runInitializers(this, _metadata_extraInitializers);
        }
        return ReportHistory_1;
    }());
    __setFunctionName(_classThis, "ReportHistory");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _reportType_decorators = [(0, typeorm_1.Column)()];
        _entityId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _entityName_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _fileName_decorators = [(0, typeorm_1.Column)()];
        _filePath_decorators = [(0, typeorm_1.Column)()];
        _fileSize_decorators = [(0, typeorm_1.Column)({ type: 'int' })];
        _generatedAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _metadata_decorators = [(0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX', nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _reportType_decorators, { kind: "field", name: "reportType", static: false, private: false, access: { has: function (obj) { return "reportType" in obj; }, get: function (obj) { return obj.reportType; }, set: function (obj, value) { obj.reportType = value; } }, metadata: _metadata }, _reportType_initializers, _reportType_extraInitializers);
        __esDecorate(null, null, _entityId_decorators, { kind: "field", name: "entityId", static: false, private: false, access: { has: function (obj) { return "entityId" in obj; }, get: function (obj) { return obj.entityId; }, set: function (obj, value) { obj.entityId = value; } }, metadata: _metadata }, _entityId_initializers, _entityId_extraInitializers);
        __esDecorate(null, null, _entityName_decorators, { kind: "field", name: "entityName", static: false, private: false, access: { has: function (obj) { return "entityName" in obj; }, get: function (obj) { return obj.entityName; }, set: function (obj, value) { obj.entityName = value; } }, metadata: _metadata }, _entityName_initializers, _entityName_extraInitializers);
        __esDecorate(null, null, _fileName_decorators, { kind: "field", name: "fileName", static: false, private: false, access: { has: function (obj) { return "fileName" in obj; }, get: function (obj) { return obj.fileName; }, set: function (obj, value) { obj.fileName = value; } }, metadata: _metadata }, _fileName_initializers, _fileName_extraInitializers);
        __esDecorate(null, null, _filePath_decorators, { kind: "field", name: "filePath", static: false, private: false, access: { has: function (obj) { return "filePath" in obj; }, get: function (obj) { return obj.filePath; }, set: function (obj, value) { obj.filePath = value; } }, metadata: _metadata }, _filePath_initializers, _filePath_extraInitializers);
        __esDecorate(null, null, _fileSize_decorators, { kind: "field", name: "fileSize", static: false, private: false, access: { has: function (obj) { return "fileSize" in obj; }, get: function (obj) { return obj.fileSize; }, set: function (obj, value) { obj.fileSize = value; } }, metadata: _metadata }, _fileSize_initializers, _fileSize_extraInitializers);
        __esDecorate(null, null, _generatedAt_decorators, { kind: "field", name: "generatedAt", static: false, private: false, access: { has: function (obj) { return "generatedAt" in obj; }, get: function (obj) { return obj.generatedAt; }, set: function (obj, value) { obj.generatedAt = value; } }, metadata: _metadata }, _generatedAt_initializers, _generatedAt_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: function (obj) { return "metadata" in obj; }, get: function (obj) { return obj.metadata; }, set: function (obj, value) { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReportHistory = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReportHistory = _classThis;
}();
exports.ReportHistory = ReportHistory;
