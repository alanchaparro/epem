import { AppService } from './app.service';

describe('AppService', () => {
  it('health returns ok payload', () => {
    const service = new AppService();
    const result = service.health();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('api-gateway');
    expect(Array.isArray(result.dependencies)).toBe(true);
  });
});
