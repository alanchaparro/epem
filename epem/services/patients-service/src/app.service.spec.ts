import { AppService } from './app.service';

describe('AppService', () => {
  it('health exposes service metadata', () => {
    const service = new AppService();
    const result = service.health();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('patients-service');
    expect(typeof result.timestamp).toBe('string');
  });
});
