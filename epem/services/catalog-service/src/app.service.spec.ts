import { AppService } from './app.service';

describe('AppService', () => {
  it('health returns service status', () => {
    const service = new AppService();
    const result = service.health();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('catalog-service');
    expect(typeof result.timestamp).toBe('string');
  });
});
