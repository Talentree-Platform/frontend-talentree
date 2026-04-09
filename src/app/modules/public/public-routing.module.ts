import { ContactComponent } from './pages/contact/contact.component';
import { OfferComponent } from './pages/offer/offer.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicComponent } from '../../layout/public/public.component';
import { AboutComponent } from './pages/about/about.component';
import { TestimonialComponent } from './pages/testimonial/testimonial.component';
const routes: Routes = [
  
  {path:'' , component:PublicComponent , children:[
    {path:'' , redirectTo:'landingpage' ,pathMatch:'full'},
    {path:'landingpage' , component : LandingPageComponent},
    {path:'about' , component:AboutComponent},
    {path:'offer' , component:OfferComponent},
    {path:'testimonial' , component:TestimonialComponent},
    {path:'contact' , component:ContactComponent}
  ]}
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
