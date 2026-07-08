import { PublicComponent } from './../../layout/public/public.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SectionRedirectComponent } from './pages/section-redirect/section-redirect.component';



@NgModule({
  declarations: [ ],
  imports: [
    PublicComponent,
    SectionRedirectComponent,
    RouterModule,
    LandingPageComponent,
    CommonModule,
    PublicRoutingModule,
  ]
})
export class PublicModule { }
