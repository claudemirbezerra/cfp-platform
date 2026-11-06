import { SpeakerDTO } from '@cfp-platform/shared-types';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSpeakerDto implements Omit<SpeakerDTO, 'id'> {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  talkTitle: string;

  @IsBoolean()
  isGDE: boolean;
}
