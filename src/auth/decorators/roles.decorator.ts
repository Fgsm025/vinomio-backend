import { SetMetadata } from '@nestjs/common';

export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  AGRONOMIST = 'AGRONOMIST',
  OPERATOR = 'OPERATOR',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
