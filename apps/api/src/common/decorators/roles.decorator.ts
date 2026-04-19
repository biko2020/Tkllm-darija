/**
 * roles.decorator.ts
 *
 * Custom decorator for Role-Based Access Control (RBAC).
 *
 * Usage:
 *   @Roles(UserRole.ADMIN, UserRole.REVIEWER)
 *   @Get('admin-only')
 *   async adminOnly() { ... }
 *
 * Works together with RolesGuard to protect routes based on user.role.
 * Multiple roles can be specified (OR logic).
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);