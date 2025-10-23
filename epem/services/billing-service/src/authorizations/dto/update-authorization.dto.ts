import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AuthorizationStatus } from '../../../generated/client';

export class UpdateAuthorizationDto {
  @IsOptional()
  @IsEnum(AuthorizationStatus)
  status?: AuthorizationStatus;

  @IsOptional()
  @IsString()
  authCode?: string;
}
