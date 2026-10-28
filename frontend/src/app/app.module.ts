import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslatePipe } from './translate.pipe';

import { NavbarComponent } from './Component/navbar/navbar.component';
import { FooterComponent } from './Component/footer/footer.component';
import { LandingPageComponent } from './Component/landing-page/landing-page.component';
import { DialogComponent } from './Component/landing-page/dialog/dialog.component';
import { SelectbusPageComponent } from './Component/selectbus-page/selectbus-page.component';
import { PaymentPageComponent } from './Component/payment-page/payment-page.component';

import { CommunityComponent } from './Component/community/community.component';
import { NotificationsComponent } from './Component/notifications/notifications.component';
import { RoutePlannerComponent } from './Component/route-planner/route-planner.component';
import { RouteReviewsComponent } from './Component/route-reviews/route-reviews.component';
import { ProfilePageComponent } from './Component/profile-page/profile-page.component';

import { LeftComponent } from './Component/selectbus-page/left/left.component';
import { RightComponent } from './Component/selectbus-page/right/right.component';
import { BusBoxComponent } from './Component/selectbus-page/right/bus-box/bus-box.component';
import { BusBookingFormComponent } from './Component/selectbus-page/right/bus-booking-form/bus-booking-form.component';
import { FormDrawerComponent } from './Component/selectbus-page/right/form-drawer/form-drawer.component';
import { SortingBarComponent } from './Component/selectbus-page/right/sorting-bar/sorting-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    TranslatePipe,
    NavbarComponent,
    FooterComponent,
    LandingPageComponent,
    DialogComponent,
    SelectbusPageComponent,
    PaymentPageComponent,
    CommunityComponent,
    NotificationsComponent,
    RoutePlannerComponent,
    RouteReviewsComponent,
    ProfilePageComponent,
    LeftComponent,
    RightComponent,
    BusBoxComponent,
    BusBookingFormComponent,
    FormDrawerComponent,
    SortingBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule { }
