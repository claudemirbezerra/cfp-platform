import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventDTO } from '@cfp-platform/shared-types';
import { CreateEventDto } from './create-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(): EventDTO[] {
    return this.eventsService.findAll();
  }

  @Post()
  create(@Body() body: CreateEventDto): EventDTO {
    return this.eventsService.create(body);
  }
}
