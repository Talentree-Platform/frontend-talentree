import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BoThemeService } from './core/services/bo-theme.service';



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

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Injected purely so the light/dark theme (data-bo-theme) is applied to
    // <html> as soon as the app boots, regardless of which route loads first.
    private boThemeService: BoThemeService
  ) {
    this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe(event => {
        this.lastNavigationTrigger = event.navigationTrigger;
      });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.lastNavigationTrigger !== 'popstate' && isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
      });
  }
}
