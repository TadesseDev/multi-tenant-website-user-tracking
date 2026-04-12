import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  @ApiOperation({
    summary: 'Health check endpoint.',
    description: 'Returns a simple message to confirm the API is running',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
