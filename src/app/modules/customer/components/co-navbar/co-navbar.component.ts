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
import { AuthService } from '../../../auth/services/auth.service';
import { BoThemeService } from '../../../../core/services/bo-theme.service';
import { CustomerCartService } from '../../Core/services/cart-service.service';

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
  private readonly authService = inject(AuthService);
  private readonly cartSvc = inject(CustomerCartService);
  readonly themeSvc = inject(BoThemeService);
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

  readonly cartCount = this.cartSvc.cartTotalQty;
  // TODO: wire up to a real wishlist count service once one exists.
  readonly wishlistCount = signal<number>(0);

  readonly hasCartBadge = computed(() => this.cartCount() > 0);
  readonly hasWishlistBadge = computed(() => this.wishlistCount() > 0);

  ngOnInit(): void {
    // Populate the cart badge on load, not just after an in-session add-to-cart.
    this.cartSvc.loadCart();

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

  toggleTheme(): void {
    this.themeSvc.toggle();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onLogout(): void {
    this.closeMobileMenu();
    this.authService.logout().subscribe();
  }
}