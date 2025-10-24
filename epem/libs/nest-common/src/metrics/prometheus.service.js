"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrometheusService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
const prometheus_constants_1 = require("./prometheus.constants");
let PrometheusService = class PrometheusService {
    constructor(options) {
        this.options = options;
        this.registry = new prom_client_1.Registry();
        const serviceName = process.env.SERVICE_NAME ?? this.options?.defaultServiceName ?? 'epem-service';
        this.registry.setDefaultLabels({ service: serviceName });
        this.httpRequestsTotal = new prom_client_1.Counter({
            name: 'http_requests_total',
            help: 'Total HTTP requests processed',
            labelNames: ['method', 'route', 'status'],
            registers: [this.registry],
        });
        this.httpRequestDurationSeconds = new prom_client_1.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status'],
            buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
            registers: [this.registry],
        });
    }
    onModuleInit() {
        (0, prom_client_1.collectDefaultMetrics)({ register: this.registry });
    }
    get contentType() {
        return this.registry.contentType;
    }
    async getMetrics() {
        return this.registry.metrics();
    }
};
exports.PrometheusService = PrometheusService;
exports.PrometheusService = PrometheusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)(prometheus_constants_1.PROMETHEUS_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], PrometheusService);
