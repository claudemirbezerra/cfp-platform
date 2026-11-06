import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TalkSubmission } from './talk-submission';

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

describe('TalkSubmission', () => {
  beforeEach(async () => {
    localStorage.clear();
    installMatchMedia(false);

    await TestBed.configureTestingModule({
      imports: [TalkSubmission],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('starts from the empty draft with submit disabled and accessible names', () => {
    const fixture = TestBed.createComponent(TalkSubmission);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.draft()).toEqual({
      name: '',
      email: '',
      talkTitle: '',
      isGDE: false,
    });

    const submit = root.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submit).toBeInstanceOf(HTMLButtonElement);
    expect(submit.classList.contains('cfp-button')).toBe(true);
    expect(submit.classList.contains('talk-submission__submit')).toBe(true);
    expect(submit.disabled).toBe(true);
    expect(accessibleName(submit)).toBe('Submit proposal');

    const dashboardLink = Array.from(root.querySelectorAll('a')).find(
      (anchor) => anchor.textContent?.trim() === 'View submissions'
    );
    expect(dashboardLink?.getAttribute('href')).toBe('/dashboard');
    expect(dashboardLink?.classList.contains('cfp-button')).toBe(true);

    expect(accessibleName(root.querySelector('#speaker-name') as HTMLElement)).toBe(
      'Name'
    );
    expect(accessibleName(root.querySelector('#speaker-email') as HTMLElement)).toBe(
      'Email'
    );
    expect(
      accessibleName(root.querySelector('#speaker-talk-title') as HTMLElement)
    ).toBe('Talk title');
    expect(accessibleName(root.querySelector('#speaker-gde') as HTMLElement)).toBe(
      'Google Developer Expert'
    );

    const form = root.querySelector('form') as HTMLFormElement;
    expect(form.getAttribute('aria-labelledby')).toBe('talk-submission-heading');
    expect(root.querySelector('#talk-submission-heading')?.textContent?.trim()).toBe(
      'Submit a talk'
    );

    expect(hintText(root, 'speaker-name')).toBe(
      'Use the name you want on the schedule.'
    );
    expect(hintText(root, 'speaker-email')).toBe(
      "We'll reply about this proposal at this address."
    );
    expect(hintText(root, 'speaker-talk-title')).toBe(
      'A short title attendees can recognize.'
    );
    expect(hintText(root, 'speaker-gde')).toBe(
      'Select this if you are a Google Developer Expert.'
    );
  });

  it('starts in the night theme when the system scheme is dark and nothing is stored', () => {
    installMatchMedia(true);
    const fixture = TestBed.createComponent(TalkSubmission);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-theme')).toBe('night');
    expect(nightThemeControl(fixture.nativeElement).checked).toBe(true);
    expect(localStorage.getItem('cfp-theme')).toBeNull();
  });

  it('starts in the light theme when the system scheme is light and nothing is stored', () => {
    const media = installMatchMedia(false);
    const fixture = TestBed.createComponent(TalkSubmission);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-theme')).toBe('light');
    expect(nightThemeControl(fixture.nativeElement).checked).toBe(false);

    media.dispatch(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-theme')).toBe('night');
    expect(nightThemeControl(fixture.nativeElement).checked).toBe(true);
    expect(localStorage.getItem('cfp-theme')).toBeNull();
  });

  it('restores a stored night theme instead of the system scheme', () => {
    localStorage.setItem('cfp-theme', 'night');
    const media = installMatchMedia(false);
    const fixture = TestBed.createComponent(TalkSubmission);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-theme')).toBe('night');
    expect(nightThemeControl(fixture.nativeElement).checked).toBe(true);

    media.dispatch(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-theme')).toBe('night');
  });

  it('treats an invalid stored theme as no choice', () => {
    localStorage.setItem('cfp-theme', 'blue');
    installMatchMedia(true);
    const fixture = TestBed.createComponent(TalkSubmission);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-theme')).toBe('night');
    expect(nightThemeControl(fixture.nativeElement).name).toBe('');
    expect(nightThemeControl(fixture.nativeElement).closest('form')).toBeNull();
  });

  it('shows a success panel when the proposal is accepted', () => {
    const fixture = TestBed.createComponent(TalkSubmission);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    fillValidDraft(root);
    fixture.detectChanges();
    submitForm(root);

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/speakers').flush({
      id: 'speaker-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      talkTitle: 'Signals',
      isGDE: false,
    });
    fixture.detectChanges();

    const panel = root.querySelector('.talk-submission__success');
    expect(panel?.getAttribute('role')).toBe('status');
    expect(panel?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Proposal received for Signals.'
    );
    http.verify();
  });

  it('shows an error panel when sending fails', () => {
    const fixture = TestBed.createComponent(TalkSubmission);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    fillValidDraft(root);
    fixture.detectChanges();
    submitForm(root);

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/speakers').flush('nope', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const panel = root.querySelector('.talk-submission__error');
    expect(panel?.getAttribute('role')).toBe('alert');
    expect(panel?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'The proposal could not be sent.'
    );
    http.verify();
  });
});

function fillValidDraft(root: HTMLElement): void {
  setField(root, 'speaker-name', 'Ada Lovelace');
  setField(root, 'speaker-email', 'ada@example.com');
  setField(root, 'speaker-talk-title', 'Signals');
}

function setField(root: HTMLElement, fieldId: string, value: string): void {
  const field = root.querySelector(`#${fieldId}`) as HTMLInputElement;
  field.value = value;
  field.dispatchEvent(new Event('input'));
}

function submitForm(root: HTMLElement): void {
  root.querySelector('form')?.dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true })
  );
}

function hintText(root: HTMLElement, fieldId: string): string {
  const field = root.querySelector(`#${fieldId}`) as HTMLInputElement;
  const hintId = field.getAttribute('aria-describedby');
  const hint = hintId ? root.querySelector(`#${hintId}`) : null;
  const label = field.labels?.[0];

  expect(hint).not.toBeNull();
  expect(label?.contains(hint)).toBe(false);

  return (hint?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function nightThemeControl(root: HTMLElement): HTMLInputElement {
  const control = Array.from(root.querySelectorAll('input[type="checkbox"]')).find(
    (input) => accessibleName(input as HTMLElement) === 'Night theme'
  );

  if (!(control instanceof HTMLInputElement)) {
    throw new Error('Night theme control was not found');
  }

  return control;
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
