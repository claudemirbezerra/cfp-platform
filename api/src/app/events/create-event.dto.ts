import { EventDTO } from '@cfp-platform/shared-types';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateEventDto implements Omit<EventDTO, 'id'> {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  capacidade: number;

  @IsString()
  @IsNotEmpty()
  data: string;
}
