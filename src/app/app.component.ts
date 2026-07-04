import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'talentree';

  // Angular's own `withInMemoryScrolling` restoration doesn't reliably fire
  // together with `withViewTransitions()`, so every route change still opens
  // wherever the previous page was scrolled to. This scrolls to the top of
  // the window on every navigation except browser Back/Forward (popstate),
  // for which the browser's native scroll restoration is left in charge.
  private lastNavigationTrigger: NavigationStart['navigationTrigger'] | null = null;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe(event => {
        this.lastNavigationTrigger = event.navigationTrigger;
      });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.lastNavigationTrigger !== 'popstate') {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
      });
  }
}
