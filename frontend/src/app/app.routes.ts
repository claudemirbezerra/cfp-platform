import { Route } from '@angular/router';
import { CfpDashboard } from './cfp-dashboard/cfp-dashboard';
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
  {
    path: 'dashboard',
    component: CfpDashboard,
  },
];
