import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { SpeakerDTO } from '@cfp-platform/shared-types';

type TalkDraft = Omit<SpeakerDTO, 'id'>;

const EMPTY_DRAFT: TalkDraft = {
  name: '',
  email: '',
  talkTitle: '',
  isGDE: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-talk-submission',
  imports: [],
  templateUrl: './talk-submission.html',
  styleUrl: './talk-submission.css',
})
export class TalkSubmission {
  private readonly http = inject(HttpClient);

  readonly draft = signal<TalkDraft>({ ...EMPTY_DRAFT });
  readonly created = signal<SpeakerDTO | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly canSubmit = computed(() => {
    const draft = this.draft();
    return (
      draft.name.trim().length > 0 &&
      draft.talkTitle.trim().length > 0 &&
      EMAIL_PATTERN.test(draft.email.trim())
    );
  });

  patchText(field: 'name' | 'email' | 'talkTitle', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.draft.update((current) => ({ ...current, [field]: value }));
  }

  patchGde(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.draft.update((current) => ({ ...current, isGDE: checked }));
  }

  submit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) {
      return;
    }

    this.submitError.set(null);
    this.http.post<SpeakerDTO>('/api/speakers', this.draft()).subscribe({
      next: (speaker) => this.created.set(speaker),
      error: () => this.submitError.set('The proposal could not be sent.'),
    });
  }
}
