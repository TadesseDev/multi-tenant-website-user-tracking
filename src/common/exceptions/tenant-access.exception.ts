import { ForbiddenException } from '@nestjs/common';

export class TenantAccessException extends ForbiddenException {
  constructor(message = 'Access denied: Tenant mismatch') {
    super(message);
  }
}
