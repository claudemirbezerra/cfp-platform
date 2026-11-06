import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { appRoutes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    localStorage.removeItem('cfp-theme');
    window.matchMedia = () =>
      ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener() {
          return undefined;
        },
        removeEventListener() {
          return undefined;
        },
      }) as unknown as MediaQueryList;

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes), provideHttpClient()],
    }).compileComponents();
  });

  it('should render the talk submission form', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    const navigated = await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(navigated).toBe(true);
    expect(compiled.querySelector('h1')?.textContent).toContain('Submit a talk');
    expect(compiled.querySelector('app-nx-welcome')).toBeNull();
  });
});
