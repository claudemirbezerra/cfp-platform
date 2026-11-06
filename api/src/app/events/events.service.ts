import { Injectable } from '@nestjs/common';
import { EventDTO } from '@cfp-platform/shared-types';
import { CreateEventDto } from './create-event.dto';

@Injectable()
export class EventsService {
  private readonly events: EventDTO[] = [];

  create(body: CreateEventDto): EventDTO {
    const event: EventDTO = {
      id: crypto.randomUUID(),
      nome: body.nome,
      endereco: body.endereco,
      capacidade: body.capacidade,
      data: body.data,
    };
    this.events.push(event);
    return event;
  }

  findAll(): EventDTO[] {
    return [...this.events];
  }
}
