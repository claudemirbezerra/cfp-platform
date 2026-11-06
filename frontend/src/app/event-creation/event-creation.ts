import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventDTO } from '@cfp-platform/shared-types';
import {
  CFP_THEME_STORAGE_KEY,
  CfpTheme,
  DARK_SCHEME_QUERY,
  storedTheme,
  systemPrefersNight,
} from '../cfp-theme';

@Component({
  selector: 'app-event-creation',
  imports: [ReactiveFormsModule],
  templateUrl: './event-creation.html',
  styleUrls: ['../cfp-theme.css', './event-creation.css'],
  host: {
    '[attr.data-theme]': 'theme()',
  },
})
export class EventCreation implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private schemeQuery: MediaQueryList | null = null;

  readonly theme = signal<CfpTheme>(storedTheme() ?? (systemPrefersNight() ? 'night' : 'light'));
  readonly created = signal<EventDTO | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  readonly form: FormGroup<{
    nome: FormControl<string>;
    endereco: FormControl<string>;
    capacidade: FormControl<number | null>;
    data: FormControl<string>;
  }> = this.fb.group({
    nome: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    endereco: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    capacidade: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    data: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
  });

  // Signal holding the validity state updated on value/status changes
  private readonly formValid = signal(this.form.valid);

  readonly canSubmit = computed(() => {
    return this.formValid() && !this.isSubmitting();
  });

  ngOnInit(): void {
    if (!storedTheme()) {
      this.schemeQuery = window.matchMedia(DARK_SCHEME_QUERY);
      this.schemeQuery.addEventListener('change', this.onSchemeChange);
    }

    this.form.statusChanges.subscribe(() => {
      this.formValid.set(this.form.valid);
    });
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

  submit(): void {
    this.formValid.set(this.form.valid);
    if (!this.canSubmit()) {
      return;
    }

    const value = this.form.getRawValue();
    const payload: Omit<EventDTO, 'id'> = {
      nome: value.nome.trim(),
      endereco: value.endereco.trim(),
      capacidade: Number(value.capacidade),
      data: value.data.trim(),
    };

    this.submitError.set(null);
    this.isSubmitting.set(true);

    this.http.post<EventDTO>('/api/events', payload).subscribe({
      next: (event) => {
        this.created.set(event);
        this.isSubmitting.set(false);
        this.form.reset();
        this.formValid.set(this.form.valid);
      },
      error: () => {
        this.submitError.set('Não foi possível cadastrar o local do evento.');
        this.isSubmitting.set(false);
      },
    });
  }

  private readonly onSchemeChange = (event: MediaQueryListEvent): void => {
    if (storedTheme()) {
      return;
    }

    this.theme.set(event.matches ? 'night' : 'light');
  };
}
