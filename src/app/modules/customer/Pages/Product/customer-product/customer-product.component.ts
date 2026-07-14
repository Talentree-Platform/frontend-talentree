import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, signal, computed, effect,
  NgModule
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CustomerMarketplaceService } from '../../../Core/services/customer-marketplace.service';
import { CustomerProductCardComponent } from '../../../components/customer-product-card/customer-product-card.component';
import { FilterSidebarComponent } from '../../../components/filter-sidebar/filter-sidebar.component';
import { ProductSearchComponent } from '../../../components/product-search/product-search.component';
import { SortOption } from '../../../Core/models/customer,models';
import { CustomerCartService } from '../../../Core/services/cart-service.service';
import { ToastService } from '../../../Core/services/toast.service';

@Component({
  selector: 'app-customer-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CustomerProductCardComponent,
    FilterSidebarComponent,
    ProductSearchComponent,
    
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-product.component.html',
  styleUrls: ['./customer-product.component.scss'],
})
export class CustomerProductsComponent implements OnInit, OnDestroy {
  protected readonly svc      = inject(CustomerMarketplaceService);
  private  readonly route     = inject(ActivatedRoute);
  private  readonly router    = inject(Router);
  private  readonly cartSvc   = inject(CustomerCartService);
  private  readonly toastSvc  = inject(ToastService);
  private  readonly destroy$ = new Subject<void>();

  readonly skeletonArray  = Array.from({ length: 12 });
  readonly sidebarOpen    = signal(false);
  readonly viewMode       = signal<'grid' | 'list'>('grid');

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest',     label: 'Newest'         },
    { value: 'popularity', label: 'Most Popular'   },
    { value: 'rating',     label: 'Top Rated'      },
    { value: 'price_asc',  label: 'Price ↑'        },
    { value: 'price_desc', label: 'Price ↓'        },
  ];

  readonly pagesArray = computed(() => {
    const total = this.svc.totalPages();
    const current = this.svc.currentPage();
    const delta = 2;
    const range: (number | '...')[] = [];

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  });

  readonly activeChips = computed(() => {
    const f = this.svc.filters();
    const chips: { key: string; label: string }[] = [];
    if (f.categoryId)   chips.push({ key: 'categoryId',  label: `Category: ${f.categoryId}` });
    if (f.brandId)      chips.push({ key: 'brandId',     label: `Brand: ${f.brandId}` });
    if (f.minPrice)     chips.push({ key: 'minPrice',    label: `Min: ${f.minPrice} EGP` });
    if (f.maxPrice)     chips.push({ key: 'maxPrice',    label: `Max: ${f.maxPrice} EGP` });
    if (f.search)       chips.push({ key: 'search',      label: `"${f.search}"` });
    return chips;
  });

  ngOnInit(): void {
    // Sync query params → service filters on first load
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.svc.updateFilters({
          search:     params['search']     || '',
          categoryId: params['categoryId'] || null,
          brandId:    params['brandId']    || null,
          minPrice:   params['minPrice']   ? +params['minPrice']  : null,
          maxPrice:   params['maxPrice']   ? +params['maxPrice']  : null,
          sortBy:    (params['sortBy'] as SortOption) || 'newest',
        });
      });

    // Personalized picks — independent of catalog filters, loaded once.
    this.svc.loadRecommendations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  onSortChange(value: SortOption): void {
    this.svc.updateFilters({ sortBy: value });
  }

  removeChip(key: string): void {
    this.svc.updateFilters({ [key]: key === 'search' ? '' : null } as any);
  }

  goToPage(page: number | '...'): void {
    if (typeof page !== 'number') return;
    this.svc.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAddedToCart(e: {
    productId: string;
    qty: number;
    productName?: string;
    imageUrl?: string | null;
  }): void {
    this.cartSvc.addItem(Number(e.productId), e.qty).subscribe({
      next: () => {
        this.toastSvc.success(
          'Added to cart',
          e.productName ?? 'Item added successfully',
          e.imageUrl ?? null
        );
      },
      error: () => {
        this.toastSvc.error(
          'Could not add item',
          this.cartSvc.addError() ?? 'Please try again.'
        );
      },
    });
  }

  isPageNum(p: number | '...'): p is number { return typeof p === 'number'; }
}
