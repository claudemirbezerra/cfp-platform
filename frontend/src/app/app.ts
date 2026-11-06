import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import {
  CFP_THEME_STORAGE_KEY,
  CfpTheme,
  DARK_SCHEME_QUERY,
  storedTheme,
  systemPrefersNight,
} from './cfp-theme';

@Component({
  imports: [RouterModule, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./cfp-theme.css', './app.css'],
  host: {
    '[attr.data-theme]': 'theme()',
  },
})
export class App implements OnInit, OnDestroy {
  protected title = 'frontend';
  private schemeQuery: MediaQueryList | null = null;
  readonly theme = signal<CfpTheme>(storedTheme() ?? (systemPrefersNight() ? 'night' : 'light'));

  ngOnInit(): void {
    if (!storedTheme()) {
      this.schemeQuery = window.matchMedia(DARK_SCHEME_QUERY);
      this.schemeQuery?.addEventListener('change', this.onSchemeChange);
    }
    window.addEventListener('storage', this.onStorageChange);
  }

  ngOnDestroy(): void {
    this.schemeQuery?.removeEventListener('change', this.onSchemeChange);
    window.removeEventListener('storage', this.onStorageChange);
  }

  private readonly onSchemeChange = (event: MediaQueryListEvent): void => {
    if (!storedTheme()) {
      this.theme.set(event.matches ? 'night' : 'light');
    }
  };

  private readonly onStorageChange = (event: StorageEvent): void => {
    if (event.key === CFP_THEME_STORAGE_KEY) {
      this.theme.set(storedTheme() ?? (systemPrefersNight() ? 'night' : 'light'));
    }
  };
}
