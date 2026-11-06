import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpeakerDTO } from '@cfp-platform/shared-types';
import {
  CFP_THEME_STORAGE_KEY,
  CfpTheme,
  DARK_SCHEME_QUERY,
  storedTheme,
  systemPrefersNight,
} from '../cfp-theme';

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
  imports: [RouterLink],
  templateUrl: './talk-submission.html',
  styleUrls: ['../cfp-theme.css', './talk-submission.css'],
  host: {
    '[attr.data-theme]': 'theme()',
  },
})
export class TalkSubmission implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private schemeQuery: MediaQueryList | null = null;

  readonly theme = signal<CfpTheme>(storedTheme() ?? (systemPrefersNight() ? 'night' : 'light'));
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

  ngOnInit(): void {
    if (storedTheme()) {
      return;
    }

    this.schemeQuery = window.matchMedia(DARK_SCHEME_QUERY);
    this.schemeQuery.addEventListener('change', this.onSchemeChange);
  }

  ngOnDestroy(): void {
    this.schemeQuery?.removeEventListener('change', this.onSchemeChange);
  }

  setNightTheme(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next: CfpTheme = checked ? 'night' : 'light';
    this.theme.set(next);
    localStorage.setItem(CFP_THEME_STORAGE_KEY, next);
  }

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

  private readonly onSchemeChange = (event: MediaQueryListEvent): void => {
    if (storedTheme()) {
      return;
    }

    this.theme.set(event.matches ? 'night' : 'light');
  };
}
