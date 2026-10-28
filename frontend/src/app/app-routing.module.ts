import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingPageComponent } from './Component/landing-page/landing-page.component';
import { SelectbusPageComponent } from './Component/selectbus-page/selectbus-page.component';
import { PaymentPageComponent } from './Component/payment-page/payment-page.component';
import { CommunityComponent } from './Component/community/community.component';
import { NotificationsComponent } from './Component/notifications/notifications.component';
import { RoutePlannerComponent } from './Component/route-planner/route-planner.component';
import { RouteReviewsComponent } from './Component/route-reviews/route-reviews.component';
import { ProfilePageComponent } from './Component/profile-page/profile-page.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'select-bus', component: SelectbusPageComponent },
  { path: 'payment', component: PaymentPageComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'planner', component: RoutePlannerComponent },
  { path: 'reviews', component: RouteReviewsComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }