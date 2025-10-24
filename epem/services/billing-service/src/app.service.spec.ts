import { AppService } from './app.service';

describe('AppService', () => {
  it('health reports ok', () => {
    const service = new AppService();
    const result = service.health();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('billing-service');
    expect(typeof result.timestamp).toBe('string');
  });
});
