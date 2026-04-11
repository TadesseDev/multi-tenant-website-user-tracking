import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.TENANT_USER },
        }),
      }),
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(undefined);

    const result = guard.canActivate(context as any);

    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.TENANT_ADMIN },
        }),
      }),
    };

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce([Role.TENANT_ADMIN]);

    const result = guard.canActivate(context as any);

    expect(result).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.TENANT_USER },
        }),
      }),
    };

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce([Role.TENANT_ADMIN]);

    expect(() => guard.canActivate(context as any)).toThrow(ForbiddenException);
  });

  it('should deny access when user is not in request', () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
    };

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce([Role.TENANT_ADMIN]);

    expect(() => guard.canActivate(context as any)).toThrow(ForbiddenException);
  });
});
