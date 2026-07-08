import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicComponent } from '../../layout/public/public.component';
import { SectionRedirectComponent } from './pages/section-redirect/section-redirect.component';

const routes: Routes = [

  {path:'' , component:PublicComponent , children:[
    {path:'' , redirectTo:'landingpage' ,pathMatch:'full'},
    {path:'landingpage' , component : LandingPageComponent},
    {path:'about' , component: SectionRedirectComponent, data: { fragment: 'discovery' }},
    {path:'offer' , component: SectionRedirectComponent, data: { fragment: 'capabilities' }},
    {path:'testimonial' , component: SectionRedirectComponent, data: { fragment: 'ecosystem' }},
    {path:'contact' , component: SectionRedirectComponent, data: { fragment: 'final-cta' }}
  ]}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
