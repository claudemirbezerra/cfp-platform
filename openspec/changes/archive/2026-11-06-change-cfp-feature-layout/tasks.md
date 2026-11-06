# Tasks

## 1. Submission page replaces the Nx shell

- [x] 1.1 Remove `NxWelcome` from `frontend/src/app/app.ts` and `frontend/src/app/app.html`, delete `frontend/src/app/nx-welcome.ts`, and register `{ path: '', component: TalkSubmission }` next to the existing `cfp` route in `frontend/src/app/app.routes.ts` with no redirect. Verify `app-nx-welcome` is no longer referenced and both `''` and `cfp` render `TalkSubmission`.
- [x] 1.2 Update `frontend/src/app/app.spec.ts` to drop the `NxWelcome` import, provide `appRoutes` and `provideHttpClient()`, and assert the heading "Submit a talk" with no `app-nx-welcome`. Verify with `npx nx test frontend`.
- [x] 1.3 Update `frontend-e2e/src/example.spec.ts` so `/` expects a heading "Submit a talk" and does not expect "Welcome". Verify the spec source asserts that heading and no longer asserts "Welcome".

## 2. Hints, night theme, button, and result panels

- [x] 2.1 Add a hint `<p>` outside each label, with `aria-describedby` on the control. Use the copy and ids from design.md (name, email, talk title, GDE). Extend `frontend/src/app/talk-submission/talk-submission.spec.ts` to assert those hints and that the accessible names stay "Name", "Email", "Talk title", "Google Developer Expert", and "Submit proposal". Verify with `npx nx test-jest frontend`.
- [x] 2.2 Add a `theme` signal (`'light' | 'night'`) bound to `data-theme` on the component host, and a "Night theme" checkbox outside the form with no `name`. Persist `cfp-theme` in `localStorage`; otherwise follow `prefers-color-scheme`, including later media-query changes when nothing is stored. Treat an invalid stored value as no choice. Extend the Jest spec with stubbed `matchMedia` and `localStorage` for the dark start, the light start, and a restored night choice. Verify with `npx nx test-jest frontend`.
- [x] 2.3 Style the host, card, hints, submit button, and result panels in `talk-submission.css` with the light and night tokens from design.md, and set `body { margin: 0; }` in `frontend/src/styles.css`. Keep submit as `<button type="submit" class="talk-submission__submit">`. Render success as `role="status"` with class `talk-submission__success` and the sentence "Proposal received for {talk title}.", and failure as `role="alert"` with class `talk-submission__error` and "The proposal could not be sent.". Extend the Jest spec for the button element, both panel roles and classes, and the exact sentences, stubbing `HttpClient`. Do not assert computed colors in Jest. Verify with `npx nx test-jest frontend`.

## 3. Integration check

- [x] 3.1 Run `npx nx test frontend` and `npx nx test-jest frontend`. Verify both pass.
- [x] 3.2 Serve the frontend and, in the browser, open `/` and `/cfp`. Verify neither page shows "Welcome frontend" or a link to the Nx GitHub repository, the night-theme control switches a dark page and a light page, the submit control is a filled button that looks different when disabled, and a successful submit shows the success panel rather than a plain paragraph.
