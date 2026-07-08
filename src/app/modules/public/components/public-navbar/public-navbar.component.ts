import { Component, HostListener, OnDestroy, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RoleSelectService } from '../../services/role-select.service';
import { BoThemeService } from '../../../../core/services/bo-theme.service';

interface NavLink {
  id: string;
  label: string;
}

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.css'
})
export class PublicNavbarComponent implements OnDestroy {
  readonly links: NavLink[] = [
    { id: 'home', label: 'Home' },
    { id: 'capabilities', label: 'Features' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'ai-insights', label: 'AI Insights' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'discovery', label: 'About' },
    { id: 'final-cta', label: 'Contact' },
  ];

  scrolled = false;
  mobileOpen = false;
  activeSection = 'home';

  private observer?: IntersectionObserver;

  constructor(private router: Router, readonly roleSelect: RoleSelectService, readonly themeSvc: BoThemeService) {
    afterNextRender(() => this.setupScrollSpy());
  }

  private setupScrollSpy(): void {
    const watchedIds = [
      'home', 'discovery', 'capabilities', 'marketplace',
      'ai-insights', 'suppliers', 'ecosystem', 'final-cta',
    ];

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    watchedIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) this.observer?.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 40;
  }

  scrollToSection(id: string): void {
    this.mobileOpen = false;
    if (this.router.url.startsWith('/public/landingpage') || this.router.url === '/public' || this.router.url === '/public/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/public/landingpage'], { fragment: id });
    }
  }

  scrollToTop(event: Event): void {
    event.preventDefault();
    this.mobileOpen = false;
    if (this.router.url.startsWith('/public')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/public/landingpage']);
    }
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  openGetStarted(): void {
    this.mobileOpen = false;
    this.roleSelect.open();
  }
}
