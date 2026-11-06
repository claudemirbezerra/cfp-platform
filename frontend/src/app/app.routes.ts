import { Route } from '@angular/router';
import { TalkSubmission } from './talk-submission/talk-submission';

export const appRoutes: Route[] = [
  {
    path: '',
    component: TalkSubmission,
  },
  {
    path: 'cfp',
    component: TalkSubmission,
  },
];
