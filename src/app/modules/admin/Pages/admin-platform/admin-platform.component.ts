import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import {
  AdminPlatformService,
  BannerDto, CreateBannerDto, UpdateBannerDto,
  CategoryDto, CreateCategoryDto,
  CommissionDto, UpdateCommissionDto,
  PolicyDto, UpdatePolicyDto,
  ShippingSettingsDto, UpdateShippingDto,
  TaxSettingsDto, UpdateTaxDto,
  AnnouncementDto, FeaturedProductDto, FeaturedBrandDto
} from '../../core/services/admin-platform.service';
import { AdminProductService } from '../../core/services/admin-products.service';
import { AdminUserManagementService } from '../../core/services/admi-user-management.service';

@Component({
  selector: 'app-admin-platform',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-platform.component.html',
  styleUrls: ['./admin-platform.component.css']
})
export class AdminPlatformComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab: 'homepage' | 'categories' | 'commission' | 'policies' | 'shipping' = 'homepage';

  // Homepage
  banners: BannerDto[] = [];
  announcement: AnnouncementDto | null = null;
  featuredProducts: FeaturedProductDto[] = [];
  featuredBrands: FeaturedBrandDto[] = [];
  homepageLoading = false;
  showBannerModal = false;
  editingBanner: BannerDto | null = null;
  bannerForm: any = { title: '', subtitle: '', imageUrl: '', linkUrl: '', isActive: true, orderIndex: 0 };
  announcementEdit = false;
  announcementForm: Partial<AnnouncementDto> = {};

  // Featured Brands & Products selectors
  allBrands: any[] = [];
  allProducts: any[] = [];
  showFeaturedBrandModal = false;
  showFeaturedProductModal = false;
  selectedBrandIds: { [id: string]: boolean } = {};
  selectedProductIds: { [id: number]: boolean } = {};
  savingBrands = false;
  savingProducts = false;

  // Categories
  categories: CategoryDto[] = [];
  categoriesLoading = false;
  showCatModal = false;
  editingCat: CategoryDto | null = null;
  catForm: Partial<CreateCategoryDto> = { name: '', description: '', imageUrl: '', orderIndex: 0 };

  // Commission
  commission: CommissionDto | null = null;
  commissionLoading = false;
  commissionForm: Partial<UpdateCommissionDto> = { defaultRate: 10, categoryRates: [], minimumOrderAmount: 0 };
  commissionEditing = false;

  // Policies
  policyTypes = ['PrivacyPolicy', 'TermsOfService', 'RefundPolicy', 'ShippingPolicy'];
  selectedPolicyType = 'PrivacyPolicy';
  policy: PolicyDto | null = null;
  policyHistory: PolicyDto[] = [];
  policyLoading = false;
  policyEditing = false;
  policyForm: Partial<UpdatePolicyDto> = { title: '', content: '' };
  showPolicyHistory = false;

  // Shipping & Tax
  shipping: ShippingSettingsDto | null = null;
  tax: TaxSettingsDto | null = null;
  shippingLoading = false;
  taxLoading = false;
  shippingEditing = false;
  taxEditing = false;
  shippingForm: Partial<UpdateShippingDto> = {};
  taxForm: Partial<UpdateTaxDto> = {};

  constructor(
    private svc: AdminPlatformService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private productSvc: AdminProductService,
    private userMgmtSvc: AdminUserManagementService
  ) { }

  ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateTabFromUrl();
      }
    });
    this.updateTabFromUrl();
  }

  updateTabFromUrl(): void {
    const url = this.router.url;
    let nextTab: typeof this.activeTab = 'homepage';
    if (url.includes('/categories')) {
      nextTab = 'categories';
    } else if (url.includes('/commission')) {
      nextTab = 'commission';
    } else if (url.includes('/policies')) {
      nextTab = 'policies';
    } else if (url.includes('/shipping-tax')) {
      nextTab = 'shipping';
    }
    
    if (this.activeTab !== nextTab) {
      this.activeTab = nextTab;
      this.loadTab();
    } else if (nextTab === 'homepage' && !this.announcement) {
      this.loadTab();
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  setTab(tab: typeof this.activeTab): void {
    let routePath = 'homepage';
    if (tab === 'categories') routePath = 'categories';
    else if (tab === 'commission') routePath = 'commission';
    else if (tab === 'policies') routePath = 'policies';
    else if (tab === 'shipping') routePath = 'shipping-tax';
    
    this.router.navigate([`/admin/platform/${routePath}`]);
  }

  loadTab(): void {
    switch (this.activeTab) {
      case 'homepage': this.loadHomepage(); break;
      case 'categories': this.loadCategories(); break;
      case 'commission': this.loadCommission(); break;
      case 'policies': this.loadPolicy(); break;
      case 'shipping': this.loadShipping(); this.loadTax(); break;
    }
  }

  // ── Homepage ─────────────────────────────────────────────────────────────────

  loadHomepage(): void {
    this.homepageLoading = true;
    this.svc.getBanners().pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) this.banners = r.data; this.homepageLoading = false; }, error: () => this.homepageLoading = false });
    this.svc.getAnnouncement().pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) this.announcement = r.data; } });
    this.svc.getFeaturedProducts().pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) this.featuredProducts = r.data; } });
    this.svc.getFeaturedBrands().pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) this.featuredBrands = r.data; } });
  }

  openCreateBanner(): void { this.editingBanner = null; this.bannerForm = { title: '', subtitle: '', imageUrl: '', linkUrl: '', isActive: true, orderIndex: this.banners.length }; this.showBannerModal = true; }
  openEditBanner(b: BannerDto): void { this.editingBanner = b; this.bannerForm = { ...b }; this.showBannerModal = true; }
  closeBannerModal(): void { this.showBannerModal = false; this.editingBanner = null; }

  submitBanner(): void {
    if (this.editingBanner) {
      this.svc.updateBanner(this.editingBanner.id, this.bannerForm as UpdateBannerDto).pipe(takeUntil(this.destroy$)).subscribe({
        next: r => { if (r.success) { this.toastr.success('Banner updated!', 'Talentree', { timeOut: 2000 }); this.closeBannerModal(); this.loadHomepage(); } }
      });
    } else {
      this.svc.createBanner(this.bannerForm as CreateBannerDto).pipe(takeUntil(this.destroy$)).subscribe({
        next: r => { if (r.success) { this.toastr.success('Banner created!', 'Talentree', { timeOut: 2000 }); this.closeBannerModal(); this.loadHomepage(); } }
      });
    }
  }

  deleteBanner(b: BannerDto): void {
    if (!confirm(`Delete banner "${b.title}"?`)) return;
    this.svc.deleteBanner(b.id).pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) { this.toastr.success('Deleted.', 'Talentree', { timeOut: 2000 }); this.loadHomepage(); } } });
  }

  startEditAnnouncement(): void { this.announcementForm = { ...this.announcement }; this.announcementEdit = true; }
  cancelEditAnnouncement(): void { this.announcementEdit = false; }
  saveAnnouncement(): void {
    this.svc.updateAnnouncement(this.announcementForm).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => { if (r.success) { this.toastr.success('Announcement updated!', 'Talentree', { timeOut: 2000 }); this.announcement = r.data; this.announcementEdit = false; } }
    });
  }

  // ── Featured Selector Methods ────────────────────────────────────────────────
  openBrandSelector(): void {
    this.showFeaturedBrandModal = true;
    this.selectedBrandIds = {};
    this.featuredBrands.forEach(b => {
      this.selectedBrandIds[b.businessOwnerId] = true;
    });
    this.loadAvailableBrands();
  }

  loadAvailableBrands(): void {
    this.userMgmtSvc.getBusinessOwners({ pageIndex: 1, pageSize: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          if (r.success) {
            this.allBrands = r.data.data;
          }
        }
      });
  }

  saveFeaturedBrands(): void {
    const brandIds = Object.keys(this.selectedBrandIds).filter(id => this.selectedBrandIds[id]);
    this.savingBrands = true;
    this.svc.setFeaturedBrands({ brandIds })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          this.savingBrands = false;
          if (r.success) {
            this.toastr.success('Featured brands updated!', 'Talentree');
            this.featuredBrands = r.data;
            this.showFeaturedBrandModal = false;
          }
        },
        error: () => this.savingBrands = false
      });
  }

  openProductSelector(): void {
    this.showFeaturedProductModal = true;
    this.selectedProductIds = {};
    this.featuredProducts.forEach(p => {
      this.selectedProductIds[p.productId] = true;
    });
    this.loadAvailableProducts();
  }

  loadAvailableProducts(): void {
    this.productSvc.getAllProducts(1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (r: any) => {
          if (r.success) {
            this.allProducts = r.data.data;
          }
        }
      });
  }

  saveFeaturedProducts(): void {
    const productIds = Object.keys(this.selectedProductIds)
      .map(id => Number(id))
      .filter(id => this.selectedProductIds[id]);
    this.savingProducts = true;
    this.svc.setFeaturedProducts({ productIds })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          this.savingProducts = false;
          if (r.success) {
            this.toastr.success('Featured products updated!', 'Talentree');
            this.featuredProducts = r.data;
            this.showFeaturedProductModal = false;
          }
        },
        error: () => this.savingProducts = false
      });
  }

  // ── Categories ───────────────────────────────────────────────────────────────

  loadCategories(): void {
    this.categoriesLoading = true;
    this.svc.getCategories().pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) this.categories = r.data; this.categoriesLoading = false; }, error: () => this.categoriesLoading = false });
  }

  openCreateCat(): void { this.editingCat = null; this.catForm = { name: '', description: '', imageUrl: '', orderIndex: this.categories.length }; this.showCatModal = true; }
  openEditCat(c: CategoryDto): void { this.editingCat = c; this.catForm = { name: c.name, description: c.description, imageUrl: c.imageUrl, orderIndex: c.orderIndex }; this.showCatModal = true; }
  closeCatModal(): void { this.showCatModal = false; this.editingCat = null; }

  submitCategory(): void {
    if (this.editingCat) {
      this.svc.updateCategory(this.editingCat.id, this.catForm as CreateCategoryDto).pipe(takeUntil(this.destroy$)).subscribe({
        next: r => { if (r.success) { this.toastr.success('Category updated!', 'Talentree', { timeOut: 2000 }); this.closeCatModal(); this.loadCategories(); } }
      });
    } else {
      this.svc.createCategory(this.catForm as CreateCategoryDto).pipe(takeUntil(this.destroy$)).subscribe({
        next: r => { if (r.success) { this.toastr.success('Category created!', 'Talentree', { timeOut: 2000 }); this.closeCatModal(); this.loadCategories(); } }
      });
    }
  }

  deleteCategory(c: CategoryDto): void {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.svc.deleteCategory(c.id).pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) { this.toastr.success('Deleted.', 'Talentree', { timeOut: 2000 }); this.loadCategories(); } } });
  }

  toggleCategory(c: CategoryDto): void {
    this.svc.toggleCategoryDisabled(c.id).pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) { this.toastr.success('Updated.', 'Talentree', { timeOut: 2000 }); this.loadCategories(); } } });
  }

  // ── Commission ───────────────────────────────────────────────────────────────

  loadCommission(): void {
    this.commissionLoading = true;
    this.svc.getCommission().pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) { this.commission = r.data; this.commissionForm = { defaultRate: r.data.defaultRate, categoryRates: r.data.categoryRates, minimumOrderAmount: r.data.minimumOrderAmount }; } this.commissionLoading = false; }, error: () => this.commissionLoading = false });
  }

  saveCommission(): void {
    this.svc.updateCommission(this.commissionForm as UpdateCommissionDto).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => { if (r.success) { this.toastr.success('Commission settings saved!', 'Talentree', { timeOut: 2000 }); this.commission = r.data; this.commissionEditing = false; } }
    });
  }

  // ── Policies ─────────────────────────────────────────────────────────────────

  loadPolicy(): void {
    this.policyLoading = true;
    this.policy = null;
    this.policyEditing = false;
    this.policyForm = { title: '', content: '' };
    this.svc.getPolicy(this.selectedPolicyType).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => {
        if (r.success && r.data) {
          this.policy = r.data;
          this.policyForm = { title: r.data.title, content: r.data.content };
        }
        this.policyLoading = false;
      },
      error: () => {
        // Backend returns 500 when no document exists yet for this policy type — treat it as empty
        this.policy = null;
        this.policyLoading = false;
      }
    });
  }

  loadPolicyHistory(): void {
    this.svc.getPolicyHistory(this.selectedPolicyType).pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) this.policyHistory = r.data; this.showPolicyHistory = true; } });
  }

  savePolicy(publish: boolean): void {
    if (publish) {
      this.svc.savePolicyDraft(this.selectedPolicyType, this.policyForm as UpdatePolicyDto).pipe(takeUntil(this.destroy$)).subscribe({
        next: r => {
          if (r.success) {
            this.svc.publishPolicy(this.selectedPolicyType).pipe(takeUntil(this.destroy$)).subscribe({ next: rr => { if (rr.success) { this.toastr.success('Policy published!', 'Talentree', { timeOut: 2000 }); this.loadPolicy(); this.policyEditing = false; } } });
          }
        }
      });
    } else {
      this.svc.savePolicyDraft(this.selectedPolicyType, this.policyForm as UpdatePolicyDto).pipe(takeUntil(this.destroy$)).subscribe({
        next: r => { if (r.success) { this.toastr.success('Draft saved.', 'Talentree', { timeOut: 2000 }); this.loadPolicy(); this.policyEditing = false; } }
      });
    }
  }

  // ── Shipping & Tax ────────────────────────────────────────────────────────────

  loadShipping(): void {
    this.shippingLoading = true;
    this.svc.getShipping().pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) { this.shipping = r.data; this.shippingForm = { freeShippingThreshold: r.data.freeShippingThreshold, standardShippingRate: r.data.standardShippingRate, expressShippingRate: r.data.expressShippingRate, estimatedDeliveryDays: r.data.estimatedDeliveryDays }; } this.shippingLoading = false; }, error: () => this.shippingLoading = false });
  }

  loadTax(): void {
    this.taxLoading = true;
    this.svc.getTax().pipe(takeUntil(this.destroy$)).subscribe({ next: r => { if (r.success) { this.tax = r.data; this.taxForm = { defaultTaxRate: r.data.defaultTaxRate, categoryTaxRates: r.data.categoryTaxRates, taxIncludedInPrice: r.data.taxIncludedInPrice }; } this.taxLoading = false; }, error: () => this.taxLoading = false });
  }

  saveShipping(): void {
    this.svc.updateShipping(this.shippingForm as UpdateShippingDto).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => { if (r.success) { this.toastr.success('Shipping settings saved!', 'Talentree', { timeOut: 2000 }); this.shipping = r.data; this.shippingEditing = false; } }
    });
  }

  saveTax(): void {
    this.svc.updateTax(this.taxForm as UpdateTaxDto).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => { if (r.success) { this.toastr.success('Tax settings saved!', 'Talentree', { timeOut: 2000 }); this.tax = r.data; this.taxEditing = false; } }
    });
  }
}
