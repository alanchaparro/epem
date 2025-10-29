import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import axiosRetry from 'axios-retry';

@Injectable()
export class HttpConfigurer implements OnModuleInit {
  constructor(private readonly http: HttpService) {}

  onModuleInit() {
    const axios = this.http.axiosRef;
    axios.defaults.timeout = parseInt(process.env.HTTP_TIMEOUT_MS ?? '5000', 10);
    axios.defaults.maxRedirects = 0;
    axiosRetry(axios, {
      retries: parseInt(process.env.HTTP_RETRY_MAX ?? '2', 10),
      retryDelay: axiosRetry.exponentialDelay,
      shouldResetTimeout: true,
      retryCondition: (error) => {
        const status = error?.response?.status;
        // Retry on network errors, timeouts, and 5xx except 501/505.
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.code === 'ECONNABORTED' ||
          (typeof status === 'number' && status >= 500 && status !== 501 && status !== 505)
        );
      },
    });
  }
}

