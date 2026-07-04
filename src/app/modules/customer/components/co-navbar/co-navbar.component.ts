import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './co-navbar.component.html',
  styleUrls: ['./co-navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private routerSub?: Subscription;

  /** Center navigation links */
  readonly navLinks: NavLink[] = [
    { label: 'Products', path: '/customer/customerProduct' },
    { label: 'Orders', path: '/customer/order' }
  ];

  /** Navbar shrinks + becomes more opaque after this scroll threshold (px) */
  private readonly scrollThreshold = 12;

  readonly isScrolled = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly scrollProgress = signal(0);

  // Wire these up to real cart/wishlist state services later.
  readonly cartCount = signal<number>(0);
  readonly wishlistCount = signal<number>(0);

  readonly hasCartBadge = computed(() => this.cartCount() > 0);
  readonly hasWishlistBadge = computed(() => this.wishlistCount() > 0);

  ngOnInit(): void {
    // Close the mobile drawer automatically on every navigation.
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.closeMobileMenu());

    // Set initial scroll state (e.g. on page refresh mid-scroll).
    this.onWindowScroll();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.isScrolled.set(scrollY > this.scrollThreshold);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    this.scrollProgress.set(Math.min(100, Math.max(0, progress)));
  }

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onLogout(): void {
    // TODO: replace with real AuthService.logout() call.
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }
}