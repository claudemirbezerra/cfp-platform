import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
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
    await TestBed.configureTestingModule({
      imports: [TalkSubmission],
      providers: [provideHttpClient()],
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
    expect(submit.disabled).toBe(true);
    expect(accessibleName(submit)).toBe('Submit proposal');

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
  });
});
