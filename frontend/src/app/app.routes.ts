import { Route } from '@angular/router';
import { CfpDashboard } from './cfp-dashboard/cfp-dashboard';
import { EventCreation } from './event-creation/event-creation';
import { TalkSubmission } from './talk-submission/talk-submission';

export const appRoutes: Route[] = [
  {
    path: '',
    component: TalkSubmission,
  },
  {
    path: 'event/new',
    component: EventCreation,
  },
  {
    path: 'talks/new',
    component: TalkSubmission,
  },
  {
    path: 'cfp',
    component: TalkSubmission,
  },
  {
    path: 'dashboard',
    component: CfpDashboard,
  },
];
