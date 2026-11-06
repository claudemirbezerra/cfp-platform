import { Body, Controller, Post } from '@nestjs/common';
import { SpeakerDTO } from '@cfp-platform/shared-types';
import { CreateSpeakerDto } from './create-speaker.dto';
import { SpeakersService } from './speakers.service';

@Controller('speakers')
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Post()
  create(@Body() body: CreateSpeakerDto): SpeakerDTO {
    return this.speakersService.create(body);
  }
}
