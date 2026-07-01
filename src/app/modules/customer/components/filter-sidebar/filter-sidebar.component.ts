import {
  Component, OnInit, inject, ChangeDetectionStrategy,
  signal, computed, output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerMarketplaceService } from '../../Core/services/customer-marketplace.service';
import { Category, Brand, SortOption } from '../../Core/models/customer,models';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.scss'],
})
export class FilterSidebarComponent implements OnInit {
  readonly filtersApplied = output<void>();
  readonly sidebarClosed  = output<void>();

  protected readonly svc = inject(CustomerMarketplaceService);

  // Local form state (committed to service only on Apply)
  localMinPrice = signal<string>('');
  localMaxPrice = signal<string>('');

  // Mock data – replace with API calls to /api/customer/categories & /api/customer/brands
  readonly categories = signal<Category[]>([
    { id: '1', name: 'Metals & Alloys',      slug: 'metals',      productCount: 142 },
    { id: '2', name: 'Polymers & Plastics',  slug: 'polymers',    productCount: 98  },
    { id: '3', name: 'Textiles & Fibres',    slug: 'textiles',    productCount: 75  },
    { id: '4', name: 'Chemicals',            slug: 'chemicals',   productCount: 210 },
    { id: '5', name: 'Wood & Composites',    slug: 'wood',        productCount: 64  },
    { id: '6', name: 'Glass & Ceramics',     slug: 'ceramics',    productCount: 53  },
    { id: '7', name: 'Adhesives & Sealants', slug: 'adhesives',   productCount: 39  },
    { id: '8', name: 'Packaging Materials',  slug: 'packaging',   productCount: 88  },
  ]);

  readonly brands = signal<Brand[]>([
    { id: 'b1', name: 'AluCraft'      },
    { id: 'b2', name: 'PolyForge'     },
    { id: 'b3', name: 'TextilePrime'  },
    { id: 'b4', name: 'ChemCore'      },
    { id: 'b5', name: 'WoodWorks Co.' },
    { id: 'b6', name: 'GlassLine'     },
  ]);

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest',     label: 'Newest First'   },
    { value: 'popularity', label: 'Most Popular'   },
    { value: 'rating',     label: 'Highest Rated'  },
    { value: 'price_asc',  label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
  ];

  readonly activeFiltersCount = computed(() => {
    const f = this.svc.filters();
    let count = 0;
    if (f.categoryId)         count++;
    if (f.brandId)            count++;
    if (f.minPrice !== null)  count++;
    if (f.maxPrice !== null)  count++;
    if (f.sortBy !== 'newest') count++;
    return count;
  });

  // Expand/collapse sections
  catExpanded   = signal(true);
  brandExpanded = signal(true);
  priceExpanded = signal(true);
  sortExpanded  = signal(true);

  ngOnInit(): void {
    const f = this.svc.filters();
    this.localMinPrice.set(f.minPrice != null ? String(f.minPrice) : '');
    this.localMaxPrice.set(f.maxPrice != null ? String(f.maxPrice) : '');
  }

  toggleCategory(id: string): void {
    const current = this.svc.filters().categoryId;
    this.svc.updateFilters({ categoryId: current === id ? null : id });
    this.filtersApplied.emit();
  }

  toggleBrand(id: string): void {
    const current = this.svc.filters().brandId;
    this.svc.updateFilters({ brandId: current === id ? null : id });
    this.filtersApplied.emit();
  }

  applyPrice(): void {
    const min = this.localMinPrice() ? Number(this.localMinPrice()) : null;
    const max = this.localMaxPrice() ? Number(this.localMaxPrice()) : null;
    this.svc.updateFilters({ minPrice: min, maxPrice: max });
    this.filtersApplied.emit();
  }

  clearPrice(): void {
    this.localMinPrice.set('');
    this.localMaxPrice.set('');
    this.svc.updateFilters({ minPrice: null, maxPrice: null });
    this.filtersApplied.emit();
  }

  setSort(value: SortOption): void {
    this.svc.updateFilters({ sortBy: value });
    this.filtersApplied.emit();
  }

  resetAll(): void {
    this.localMinPrice.set('');
    this.localMaxPrice.set('');
    this.svc.resetFilters();
    this.filtersApplied.emit();
  }

  close(): void {
    this.sidebarClosed.emit();
  }

  // ── Section expand/collapse – called from template (no arrow fns in templates) ──
  toggleSort():         void { this.sortExpanded.set(!this.sortExpanded());   }
  toggleCat():          void { this.catExpanded.set(!this.catExpanded());     }
  toggleBrandSection(): void { this.brandExpanded.set(!this.brandExpanded()); }
  togglePrice():        void { this.priceExpanded.set(!this.priceExpanded()); }

  // ── Price input two-way binding helpers (signal.set not callable in template) ──
  setLocalMinPrice(val: string): void { this.localMinPrice.set(val); }
  setLocalMaxPrice(val: string): void { this.localMaxPrice.set(val); }
}