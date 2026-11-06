# Tasks

## 1. List endpoint

- [ ] 1.1 Add `@Get() findAll()` on `SpeakersController` that returns `this.speakersService.findAll()` as `SpeakerDTO[]`. Do not add a DTO or a second controller. Verify `npx nx build api` compiles and the handler is on the existing `speakers` controller.
- [ ] 1.2 Extend `api/src/app/speakers/speakers.controller.spec.ts` for `GET /api/speakers`: a fresh app returns 200 and `[]`; after one valid `POST /api/speakers`, GET returns 200 and that speaker (`id`, `name`, `email`, `talkTitle`, `isGDE`) in stored order; a second GET returns the same body. Verify with `npx nx test api`.

## 2. Shared theme

- [ ] 2.1 Add `frontend/src/app/cfp-theme.css` with the current `:host` tokens for light and `[data-theme='night']` (page, card, text, hint, border, button, success, error — same values as `talk-submission.css` today) and a `.cfp-button` rule that sets fill, label color, padding, radius, and focus outline from those variables. Add `frontend/src/app/cfp-theme.ts` with the `cfp-theme` key, the `'light' | 'night'` type, and the stored-theme / system-preference helpers. Point `TalkSubmission` at both files, keep its submit `<button>` on `.cfp-button` plus the local disabled opacity, and remove the duplicated token block from `talk-submission.css`. Verify `npx nx test-jest frontend` still passes the existing form specs, including theme and submit-button cases.

## 3. Dashboard

- [ ] 3.1 Add standalone `CfpDashboard` (`selector: app-cfp-dashboard`) under `frontend/src/app/cfp-dashboard/`. Inject `HttpClient`, call `GET /api/speakers` from `ngOnInit`, and unsubscribe in `ngOnDestroy`. Hold the array in `talks: WritableSignal<SpeakerDTO[]> = signal([])`, plus `loading` and `loadError` signals as in design.md. Template: `h1` "Submitted talks"; while loading, `role="status"` with "Loading talks." and no list; on failure, `role="alert"` with "The submissions could not be loaded." and no list; on an empty array, "No talks submitted yet." and no cards; otherwise one `ul` of `li` cards showing `talkTitle` as `h2`, `name`, `email`, and "Google Developer Expert" or "Not a Google Developer Expert", never `id`. Include the "Night theme" control and `<a routerLink="/cfp" class="cfp-button">Submit a talk</a>`. Import the shared theme stylesheet and use the shared theme helpers with `data-theme` on the host. Register `{ path: 'dashboard', component: CfpDashboard }` in `app.routes.ts`. Verify `npx nx build frontend` succeeds.
- [ ] 3.2 Add `cfp-dashboard.spec.ts` on the existing Jest preset. Include it from `frontend/jest.talk-submission.config.cts` and `frontend/tsconfig.talk-submission.json`, and exclude `app/cfp-dashboard/**/*.spec.ts` from the `frontend:test` target. Assert loading copy before flush, two cards without their ids, the empty copy, the alert copy, `data-theme` from stubbed `matchMedia` and from `localStorage` key `cfp-theme`, and a link named "Submit a talk" to `/cfp`. Provide `provideRouter` and `provideHttpClientTesting`. Verify with `npx nx test-jest frontend`.

## 4. Form navigation

- [ ] 4.1 In `TalkSubmission`, import `RouterLink` and add `<a routerLink="/dashboard" class="cfp-button">View submissions</a>` inside the form card, after the `h1` and before the fields. Leave "Submit proposal" as `<button type="submit">`. Provide `provideRouter` in `talk-submission.spec.ts` and assert that link plus the submit button. In `app.spec.ts`, navigate to `/` and to `/cfp` and assert the same link and button on both. Verify with `npx nx test-jest frontend` and `npx nx test frontend`.

## 5. Integration

- [ ] 5.1 Run `npx nx test api`, `npx nx test-jest frontend`, and `npx nx test frontend`. Verify the new GET cases, the dashboard spec, the form link, and the existing Vitest `App` spec all pass.
- [ ] 5.2 With the API and frontend running, open `/dashboard` and the form in the browser. In light and night themes, confirm the dashboard page background, a talk card's background, text, and border match the form card, the error panel matches the form error panel, and "View submissions" / "Submit a talk" match the "Submit proposal" fill and label. Confirm a submitted talk shows on a fresh visit to `/dashboard` and an empty store shows "No talks submitted yet."
