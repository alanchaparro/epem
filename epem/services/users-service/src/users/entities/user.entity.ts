import { User } from '../../generated/client';

export type SafeUser = Omit<User, 'passwordHash'>;

export const toSafeUser = ({ passwordHash: _passwordHash, ...rest }: User): SafeUser => rest;
