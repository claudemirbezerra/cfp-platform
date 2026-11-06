import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EventCreation } from './event-creation';

function accessibleName(element: HTMLElement): string {
  if (element instanceof HTMLButtonElement) {
    return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  if (
    (element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement) &&
    element.labels &&
    element.labels.length > 0
  ) {
    return (element.labels[0].textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  return (element.getAttribute('aria-label') ?? '').trim();
}

describe('EventCreation', () => {
  beforeEach(async () => {
    localStorage.clear();
    installMatchMedia(false);

    await TestBed.configureTestingModule({
      imports: [EventCreation],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('starts with an invalid reactive form and submit enabled for native validation', () => {
    const fixture = TestBed.createComponent(EventCreation);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const form = root.querySelector('form.event-creation') as HTMLFormElement;

    expect(fixture.componentInstance.form.valid).toBe(false);
    expect(fixture.componentInstance.canSubmit()).toBe(false);
    expect(form.hasAttribute('novalidate')).toBe(false);

    const submit = root.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submit).toBeInstanceOf(HTMLButtonElement);
    expect(submit.classList.contains('cfp-button')).toBe(true);
    expect(submit.disabled).toBe(false);
    expect(accessibleName(submit)).toBe('Salvar evento');

    const nome = root.querySelector('#event-nome') as HTMLInputElement;
    const endereco = root.querySelector('#event-endereco') as HTMLInputElement;
    const capacidade = root.querySelector('#event-capacidade') as HTMLInputElement;
    const data = root.querySelector('#event-data') as HTMLInputElement;

    expect(accessibleName(nome)).toBe('Nome');
    expect(accessibleName(endereco)).toBe('Endereço');
    expect(accessibleName(capacidade)).toBe('Capacidade');
    expect(accessibleName(data)).toBe('Data');
    expect(nome.required).toBe(true);
    expect(endereco.required).toBe(true);
    expect(capacidade.required).toBe(true);
    expect(data.required).toBe(true);

    expect(hintText(root, 'event-nome')).toBe('Nome do evento ou local.');
    expect(hintText(root, 'event-endereco')).toBe('Endereço completo onde o evento será realizado.');
    expect(hintText(root, 'event-capacidade')).toBe('Número máximo de participantes permitidos.');
    expect(hintText(root, 'event-data')).toBe('Data de realização do evento (ex: 2026-11-20).');
  });

  it('keeps the submit button enabled when form is valid and idle', () => {
    const fixture = TestBed.createComponent(EventCreation);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      nome: 'DevFest 2026',
      endereco: 'Rua das Flores, 123',
      capacidade: 250,
      data: '2026-10-15',
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.form.valid).toBe(true);
    expect(fixture.componentInstance.canSubmit()).toBe(true);

    const submit = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submit.disabled).toBe(false);
  });

  it('shows success message when event is created', () => {
    const fixture = TestBed.createComponent(EventCreation);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.form.setValue({
      nome: 'DevFest 2026',
      endereco: 'Rua das Flores, 123',
      capacidade: 250,
      data: '2026-10-15',
    });
    fixture.detectChanges();

    fixture.componentInstance.submit();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/events');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nome: 'DevFest 2026',
      endereco: 'Rua das Flores, 123',
      capacidade: 250,
      data: '2026-10-15',
    });

    req.flush({
      id: 'event-uuid-1',
      nome: 'DevFest 2026',
      endereco: 'Rua das Flores, 123',
      capacidade: 250,
      data: '2026-10-15',
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.created()?.id).toBe('event-uuid-1');
    const successMsg = root.querySelector('.event-creation__success');
    expect(successMsg?.textContent).toContain('Evento "DevFest 2026" cadastrado com sucesso.');
    http.verify();
  });

  it('shows error message when request fails', () => {
    const fixture = TestBed.createComponent(EventCreation);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.form.setValue({
      nome: 'DevFest 2026',
      endereco: 'Rua das Flores, 123',
      capacidade: 250,
      data: '2026-10-15',
    });
    fixture.detectChanges();

    fixture.componentInstance.submit();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/events');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.submitError()).toBe(
      'Não foi possível cadastrar o local do evento.'
    );
    const errorMsg = root.querySelector('.event-creation__error');
    expect(errorMsg?.textContent).toContain('Não foi possível cadastrar o local do evento.');
    http.verify();
  });

  it('toggles night theme and stores preference', () => {
    const fixture = TestBed.createComponent(EventCreation);
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector('.event-creation__theme input') as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.theme()).toBe('night');
    expect(localStorage.getItem('cfp-theme')).toBe('night');
  });
});

function hintText(root: HTMLElement, fieldId: string): string {
  const field = root.querySelector(`#${fieldId}`) as HTMLInputElement;
  const hintId = field.getAttribute('aria-describedby');
  const hint = hintId ? root.querySelector(`#${hintId}`) : null;
  const label = field.labels?.[0];

  expect(hint).not.toBeNull();
  expect(label?.contains(hint)).toBe(false);

  return (hint?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function installMatchMedia(matches: boolean): { dispatch(matches: boolean): void } {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener(_type: string, listener: (event: MediaQueryListEvent) => void) {
      listeners.add(listener);
    },
    removeEventListener(_type: string, listener: (event: MediaQueryListEvent) => void) {
      listeners.delete(listener);
    },
    dispatch(next: boolean) {
      query.matches = next;
      const event = { matches: next } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };

  window.matchMedia = () => query as unknown as MediaQueryList;
  return query;
}
