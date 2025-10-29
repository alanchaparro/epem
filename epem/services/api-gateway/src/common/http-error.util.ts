import { HttpException, HttpStatus } from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import type { OperatorFunction } from 'rxjs';

export function mapAxiosError<T = any>(serviceLabel: string): OperatorFunction<T, T> {
  return catchError((error: any) => {
    const status: number = error?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error?.response?.data ?? `Error al comunicarse con ${serviceLabel}`;
    throw new HttpException(message, status);
  });
}
