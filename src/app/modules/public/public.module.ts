import { PublicComponent } from './../../layout/public/public.component';
import { TestimonialComponent } from './pages/testimonial/testimonial.component';
import { ContactComponent } from './pages/contact/contact.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { AboutComponent } from './pages/about/about.component';
import { OfferComponent } from './pages/offer/offer.component';



@NgModule({
  declarations: [ ],
  imports: [
    PublicComponent,
    AboutComponent,
    OfferComponent,
    ContactComponent,
    TestimonialComponent,
    RouterModule,
    LandingPageComponent,
    CommonModule,
    PublicRoutingModule,
    
  ]
})
export class PublicModule { }
