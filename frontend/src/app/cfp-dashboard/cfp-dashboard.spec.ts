import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SpeakerDTO } from '@cfp-platform/shared-types';
import { CfpDashboard } from './cfp-dashboard';

const ADA: SpeakerDTO = {
  id: 'speaker-id-ada',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  talkTitle: 'Notes on the Analytical Engine',
  isGDE: true,
};

const GRACE: SpeakerDTO = {
  id: 'speaker-id-grace',
  name: 'Grace Hopper',
  email: 'grace@example.com',
  talkTitle: 'Compilers',
  isGDE: false,
};

describe('CfpDashboard', () => {
  beforeEach(async () => {
    localStorage.clear();
    installMatchMedia(false);

    await TestBed.configureTestingModule({
      imports: [CfpDashboard],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('shows the loading copy before the talk list arrives', () => {
    const fixture = TestBed.createComponent(CfpDashboard);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne('/api/speakers');

    expect(root.querySelector('[role="status"]')?.textContent?.trim()).toBe('Loading talks.');
    expect(root.querySelector('ul')).toBeNull();

    request.flush([]);
    http.verify();
  });

  it('renders two talk cards and hides their ids', () => {
    const fixture = TestBed.createComponent(CfpDashboard);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/speakers').flush([ADA, GRACE]);
    fixture.detectChanges();

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Submitted talks');
    const cards = Array.from(root.querySelectorAll('ul li'));
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain(ADA.talkTitle);
    expect(cards[0].textContent).toContain(ADA.name);
    expect(cards[0].textContent).toContain(ADA.email);
    expect(cards[0].textContent).toContain('Google Developer Expert');
    expect(cards[0].textContent).not.toContain('Not a Google Developer Expert');
    expect(cards[1].textContent).toContain(GRACE.talkTitle);
    expect(cards[1].textContent).toContain(GRACE.name);
    expect(cards[1].textContent).toContain(GRACE.email);
    expect(cards[1].textContent).toContain('Not a Google Developer Expert');
    expect(root.textContent).not.toContain(ADA.id);
    expect(root.textContent).not.toContain(GRACE.id);
    expect(cards[0].querySelector('h2')?.textContent?.trim()).toBe(ADA.talkTitle);
    http.verify();
  });

  it('shows the empty copy when the server returns no talks', () => {
    const fixture = TestBed.createComponent(CfpDashboard);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/speakers').flush([]);
    fixture.detectChanges();

    expect(root.textContent).toContain('No talks submitted yet.');
    expect(root.querySelector('ul')).toBeNull();
    expect(root.querySelector('.cfp-dashboard__card')).toBeNull();
    http.verify();
  });

  it('shows an alert when the talk list cannot be loaded', () => {
    const fixture = TestBed.createComponent(CfpDashboard);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/speakers')
      .flush('nope', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const alert = root.querySelector('[role="alert"]');
    expect(alert?.textContent?.trim()).toBe('The submissions could not be loaded.');
    expect(alert?.classList.contains('cfp-dashboard__error')).toBe(true);
    expect(root.querySelector('ul')).toBeNull();
    expect(root.textContent).not.toContain('No talks submitted yet.');
    http.verify();
  });

  it('starts in the night theme when the system scheme is dark', () => {
    installMatchMedia(true);
    const fixture = TestBed.createComponent(CfpDashboard);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-theme')).toBe('night');
    expect(nightThemeControl(fixture.nativeElement).checked).toBe(true);

    TestBed.inject(HttpTestingController).expectOne('/api/speakers').flush([]);
  });

  it('uses the stored cfp-theme instead of the system scheme', () => {
    localStorage.setItem('cfp-theme', 'night');
    installMatchMedia(false);
    const fixture = TestBed.createComponent(CfpDashboard);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-theme')).toBe('night');
    expect(nightThemeControl(fixture.nativeElement).checked).toBe(true);

    TestBed.inject(HttpTestingController).expectOne('/api/speakers').flush([]);
  });

  it('links back to the submission form', () => {
    const fixture = TestBed.createComponent(CfpDashboard);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const link = Array.from(root.querySelectorAll('a')).find(
      (anchor) => anchor.textContent?.trim() === 'Submit a talk'
    );
    expect(link?.getAttribute('href')).toBe('/cfp');
    expect(link?.classList.contains('cfp-button')).toBe(true);

    TestBed.inject(HttpTestingController).expectOne('/api/speakers').flush([]);
  });
});

function nightThemeControl(root: HTMLElement): HTMLInputElement {
  const control = Array.from(root.querySelectorAll('input[type="checkbox"]')).find((input) =>
    (input.labels?.[0]?.textContent ?? '').includes('Night theme')
  );

  if (!(control instanceof HTMLInputElement)) {
    throw new Error('Night theme control was not found');
  }

  return control;
}

function installMatchMedia(matches: boolean): void {
  window.matchMedia = () =>
    ({
      matches,
      media: '(prefers-color-scheme: dark)',
      addEventListener() {
        return undefined;
      },
      removeEventListener() {
        return undefined;
      },
    }) as unknown as MediaQueryList;
}
