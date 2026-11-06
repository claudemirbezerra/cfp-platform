import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpeakerDTO } from '@cfp-platform/shared-types';
import { Subscription } from 'rxjs';
import {
  CFP_THEME_STORAGE_KEY,
  CfpTheme,
  DARK_SCHEME_QUERY,
  storedTheme,
  systemPrefersNight,
} from '../cfp-theme';

@Component({
  selector: 'app-cfp-dashboard',
  imports: [RouterLink],
  templateUrl: './cfp-dashboard.html',
  styleUrls: ['../cfp-theme.css', './cfp-dashboard.css'],
  host: {
    '[attr.data-theme]': 'theme()',
  },
})
export class CfpDashboard implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private schemeQuery: MediaQueryList | null = null;
  private talksRequest: Subscription | null = null;

  readonly theme = signal<CfpTheme>(storedTheme() ?? (systemPrefersNight() ? 'night' : 'light'));
  readonly talks: WritableSignal<SpeakerDTO[]> = signal([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    if (!storedTheme()) {
      this.schemeQuery = window.matchMedia(DARK_SCHEME_QUERY);
      this.schemeQuery.addEventListener('change', this.onSchemeChange);
    }

    this.talksRequest = this.http.get<SpeakerDTO[]>('/api/speakers').subscribe({
      next: (talks) => {
        this.talks.set(talks);
        this.loadError.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('The submissions could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.schemeQuery?.removeEventListener('change', this.onSchemeChange);
    this.talksRequest?.unsubscribe();
  }

  setNightTheme(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next: CfpTheme = checked ? 'night' : 'light';
    this.theme.set(next);
    localStorage.setItem(CFP_THEME_STORAGE_KEY, next);
  }

  private readonly onSchemeChange = (event: MediaQueryListEvent): void => {
    if (storedTheme()) {
      return;
    }

    this.theme.set(event.matches ? 'night' : 'light');
  };
}
