import { ConflictException } from '@nestjs/common';

export class IdempotencyException extends ConflictException {
  constructor(message = 'Event with this ID already processed') {
    super(message);
  }
}
