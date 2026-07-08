import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Old public routes (about/offer/testimonial/contact) now live as anchors
 * inside the single-page landing experience. This component sends visitors
 * (and any bookmarked links) to the right section instead of 404ing.
 */
@Component({
  selector: 'app-section-redirect',
  standalone: true,
  template: '',
})
export class SectionRedirectComponent {
  constructor(route: ActivatedRoute, router: Router) {
    const fragment = route.snapshot.data['fragment'] as string;
    router.navigate(['/public/landingpage'], { fragment });
  }
}
