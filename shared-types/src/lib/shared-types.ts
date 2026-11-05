export interface SpeakerDTO {
  id: string;
  name: string;
  email: string;
  talkTitle: string;
  isGDE: boolean;
}

export function sharedTypes(): string {
  return 'shared-types';
}
