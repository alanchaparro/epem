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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrometheusInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prometheus_service_1 = require("./prometheus.service");
let PrometheusInterceptor = class PrometheusInterceptor {
    constructor(prometheus) {
        this.prometheus = prometheus;
    }
    intercept(context, next) {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const response = httpContext.getResponse();
        if (!request || !response) {
            return next.handle();
        }
        const route = request.route?.path ?? request.path ?? request.url;
        if (route.startsWith('/metrics')) {
            return next.handle();
        }
        const method = request.method ?? 'UNKNOWN';
        const timer = this.prometheus.httpRequestDurationSeconds.startTimer();
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const status = response.statusCode ?? 200;
                const labels = { method, route, status: status.toString() };
                this.prometheus.httpRequestsTotal.inc(labels);
                timer(labels);
            },
            error: (err) => {
                const status = err?.status ?? err?.statusCode ?? 500;
                const labels = { method, route, status: status.toString() };
                this.prometheus.httpRequestsTotal.inc(labels);
                timer(labels);
            },
        }));
    }
};
exports.PrometheusInterceptor = PrometheusInterceptor;
exports.PrometheusInterceptor = PrometheusInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prometheus_service_1.PrometheusService])
], PrometheusInterceptor);
