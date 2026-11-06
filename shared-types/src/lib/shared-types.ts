export interface SpeakerDTO {
  id: string;
  name: string;
  email: string;
  talkTitle: string;
  isGDE: boolean;
}

export interface EventDTO {
  id: string;
  nome: string;
  endereco: string;
  capacidade: number;
  data: string;
}

export function sharedTypes(): string {
  return 'shared-types';
}
