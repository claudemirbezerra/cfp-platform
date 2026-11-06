import { Injectable } from '@nestjs/common';
import { SpeakerDTO } from '@cfp-platform/shared-types';
import { CreateSpeakerDto } from './create-speaker.dto';

@Injectable()
export class SpeakersService {
  private readonly speakers: SpeakerDTO[] = [];

  create(body: CreateSpeakerDto): SpeakerDTO {
    const speaker: SpeakerDTO = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      talkTitle: body.talkTitle,
      isGDE: body.isGDE,
    };
    this.speakers.push(speaker);
    return speaker;
  }

  findAll(): SpeakerDTO[] {
    return [...this.speakers];
  }
}
