import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../Interfaces/ibusiness-owner';
import { environment } from '../../../../core/environment/envirinment';

// ── Auto-Blocks ───────────────────────────────────────────────────────────────

export interface AutoBlockLog {
  id: number;
  userId: string;
  userEmail: string;
  reason: string;
  blockedAt: string;
  reviewStatus: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
}

export interface AutoBlockReviewDto {
  autoBlockLogId: number;
  decision: 'approve' | 'reject';
  adminNotes?: string | null;
}

// ── Platform Service ───────────────────────────────────────────────────────────

export interface BannerDto {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  orderIndex: number;
  startDate: string | null;
  endDate: string | null;
}

export interface CreateBannerDto {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  orderIndex: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBannerDto extends CreateBannerDto { }

export interface ReorderBannersDto {
  orderedIds: number[];
}

export interface FeaturedBrandDto {
  businessOwnerId: string;
  displayName: string;
  logoUrl: string;
  orderIndex: number;
}

export interface SetFeaturedBrandsDto {
  brandIds: string[];
}

export interface FeaturedProductDto {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  orderIndex: number;
}

export interface SetFeaturedProductsDto {
  productIds: number[];
}

export interface AnnouncementDto {
  id: number;
  message: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  bgColor: string;
  textColor: string;
}

export interface HomepagePreviewDto {
  banners: BannerDto[];
  featuredBrands: FeaturedBrandDto[];
  featuredProducts: FeaturedProductDto[];
  announcement: AnnouncementDto | null;
}

export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  orderIndex: number;
  isDisabled: boolean;
  parentCategoryId: number | null;
  subcategories: CategoryDto[];
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  imageUrl?: string;
  orderIndex?: number;
  parentCategoryId?: number;
}

export interface UpdateCategoryDto extends CreateCategoryDto { }

export interface ReorderCategoriesDto {
  orderedIds: number[];
}

export interface CommissionDto {
  id: number;
  defaultRate: number;
  categoryRates: { category: string; rate: number }[];
  minimumOrderAmount: number;
  updatedAt: string;
}

export interface UpdateCommissionDto {
  defaultRate: number;
  categoryRates: { category: string; rate: number }[];
  minimumOrderAmount: number;
}

export interface PolicyDto {
  id: number;
  type: string;
  title: string;
  content: string;
  version: string;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface UpdatePolicyDto {
  title: string;
  content: string;
}

export interface ShippingSettingsDto {
  id: number;
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  estimatedDeliveryDays: number;
  updatedAt: string;
}

export interface UpdateShippingDto {
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  estimatedDeliveryDays: number;
}

export interface TaxSettingsDto {
  id: number;
  defaultTaxRate: number;
  categoryTaxRates: { category: string; rate: number }[];
  taxIncludedInPrice: boolean;
  updatedAt: string;
}

export interface UpdateTaxDto {
  defaultTaxRate: number;
  categoryTaxRates: { category: string; rate: number }[];
  taxIncludedInPrice: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminAutoBlocksService {
  private readonly base = `${environment.baseUrl}/api/admin/auto-blocks`;
  constructor(private http: HttpClient) { }

  getPending(): Observable<ApiResponse<AutoBlockLog[]>> {
    return this.http.get<ApiResponse<AutoBlockLog[]>>(`${this.base}/pending`);
  }

  getAllBlocks(status?: string, pageIndex = 1, pageSize = 20): Observable<ApiResponse<AutoBlockLog[]>> {
    let params: any = { pageIndex, pageSize };
    if (status) params['status'] = status;
    return this.http.get<ApiResponse<AutoBlockLog[]>>(`${this.base}`, { params });
  }

  reviewBlock(dto: AutoBlockReviewDto): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/review`, dto);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminPlatformService {
  private readonly homepageBase = `${environment.baseUrl}/api/admin/platform/homepage`;
  private readonly categoriesBase = `${environment.baseUrl}/api/admin/platform/categories`;
  private readonly commissionBase = `${environment.baseUrl}/api/admin/platform/commission`;
  private readonly policiesBase = `${environment.baseUrl}/api/admin/platform/policies`;
  private readonly shippingBase = `${environment.baseUrl}/api/admin/platform/shipping`;
  private readonly taxBase = `${environment.baseUrl}/api/admin/platform/tax`;

  constructor(private http: HttpClient) { }

  // ── Homepage ─────────────────────────────────────────────────────────────────

  getHomepagePreview(): Observable<ApiResponse<HomepagePreviewDto>> {
    return this.http.get<ApiResponse<HomepagePreviewDto>>(`${this.homepageBase}/preview`);
  }

  getBanners(): Observable<ApiResponse<BannerDto[]>> {
    return this.http.get<ApiResponse<BannerDto[]>>(`${this.homepageBase}/banners`);
  }

  getBannerById(id: number): Observable<ApiResponse<BannerDto>> {
    return this.http.get<ApiResponse<BannerDto>>(`${this.homepageBase}/banners/${id}`);
  }

  createBanner(dto: CreateBannerDto): Observable<ApiResponse<BannerDto>> {
    return this.http.post<ApiResponse<BannerDto>>(`${this.homepageBase}/banners`, dto);
  }

  updateBanner(id: number, dto: UpdateBannerDto): Observable<ApiResponse<BannerDto>> {
    return this.http.put<ApiResponse<BannerDto>>(`${this.homepageBase}/banners/${id}`, dto);
  }

  deleteBanner(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.homepageBase}/banners/${id}`);
  }

  reorderBanners(dto: ReorderBannersDto): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.homepageBase}/banners/reorder`, dto);
  }

  getFeaturedBrands(): Observable<ApiResponse<FeaturedBrandDto[]>> {
    return this.http.get<ApiResponse<FeaturedBrandDto[]>>(`${this.homepageBase}/featured-brands`);
  }

  setFeaturedBrands(dto: SetFeaturedBrandsDto): Observable<ApiResponse<FeaturedBrandDto[]>> {
    return this.http.put<ApiResponse<FeaturedBrandDto[]>>(`${this.homepageBase}/featured-brands`, dto);
  }

  getFeaturedProducts(): Observable<ApiResponse<FeaturedProductDto[]>> {
    return this.http.get<ApiResponse<FeaturedProductDto[]>>(`${this.homepageBase}/featured-products`);
  }

  setFeaturedProducts(dto: SetFeaturedProductsDto): Observable<ApiResponse<FeaturedProductDto[]>> {
    return this.http.put<ApiResponse<FeaturedProductDto[]>>(`${this.homepageBase}/featured-products`, dto);
  }

  getAnnouncement(): Observable<ApiResponse<AnnouncementDto>> {
    return this.http.get<ApiResponse<AnnouncementDto>>(`${this.homepageBase}/announcement`);
  }

  updateAnnouncement(dto: Partial<AnnouncementDto>): Observable<ApiResponse<AnnouncementDto>> {
    return this.http.put<ApiResponse<AnnouncementDto>>(`${this.homepageBase}/announcement`, dto);
  }

  // ── Categories ───────────────────────────────────────────────────────────────

  getCategories(): Observable<ApiResponse<CategoryDto[]>> {
    return this.http.get<ApiResponse<CategoryDto[]>>(this.categoriesBase);
  }

  getCategoryById(id: number): Observable<ApiResponse<CategoryDto>> {
    return this.http.get<ApiResponse<CategoryDto>>(`${this.categoriesBase}/${id}`);
  }

  createCategory(dto: CreateCategoryDto): Observable<ApiResponse<CategoryDto>> {
    return this.http.post<ApiResponse<CategoryDto>>(this.categoriesBase, dto);
  }

  updateCategory(id: number, dto: UpdateCategoryDto): Observable<ApiResponse<CategoryDto>> {
    return this.http.put<ApiResponse<CategoryDto>>(`${this.categoriesBase}/${id}`, dto);
  }

  deleteCategory(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.categoriesBase}/${id}`);
  }

  getSubcategories(parentId: number): Observable<ApiResponse<CategoryDto[]>> {
    let params = new HttpParams().set('parentId', String(parentId));
    return this.http.get<ApiResponse<CategoryDto[]>>(`${this.categoriesBase}/subcategories`, { params });
  }

  reorderCategories(dto: ReorderCategoriesDto): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.categoriesBase}/reorder`, dto);
  }

  toggleCategoryDisabled(id: number): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${this.categoriesBase}/${id}/toggle-disabled`, {});
  }

  // ── Commission ───────────────────────────────────────────────────────────────

  getCommission(): Observable<ApiResponse<CommissionDto>> {
    return this.http.get<ApiResponse<CommissionDto>>(this.commissionBase);
  }

  updateCommission(dto: UpdateCommissionDto): Observable<ApiResponse<CommissionDto>> {
    return this.http.put<ApiResponse<CommissionDto>>(this.commissionBase, dto);
  }

  // ── Policies ─────────────────────────────────────────────────────────────────

  private getPolicyEnum(type: string | number): number {
    if (typeof type === 'number') return type;
    switch (type) {
      case 'PrivacyPolicy': return 0;
      case 'TermsOfService': return 1;
      case 'RefundPolicy': return 2;
      case 'ShippingPolicy': return 3;
      default: return 0;
    }
  }

  private mapPolicy(data: any): PolicyDto {
    return {
      id: data?.id ?? 0,
      type: String(data?.documentType ?? ''),
      title: data?.documentTypeName ?? '',
      content: data?.content ?? '',
      version: data?.versionNumber != null ? String(data.versionNumber) : '1.0',
      isPublished: !!data?.isPublished,
      publishedAt: data?.publishedAt ?? null,
      updatedAt: data?.createdAt ?? ''
    };
  }

  getPolicy(type: string): Observable<ApiResponse<PolicyDto>> {
    return this.http.get<ApiResponse<any>>(`${this.policiesBase}/${this.getPolicyEnum(type)}`).pipe(
      map(res => {
        if (res.success && res.data) {
          return { ...res, data: this.mapPolicy(res.data) };
        }
        return res as ApiResponse<PolicyDto>;
      })
    );
  }

  updatePolicy(type: string, dto: UpdatePolicyDto): Observable<ApiResponse<PolicyDto>> {
    const payload = {
      content: dto.content,
      requireUserAcceptance: true
    };
    return this.http.put<ApiResponse<any>>(`${this.policiesBase}/${this.getPolicyEnum(type)}`, payload).pipe(
      map(res => {
        if (res.success && res.data) {
          return { ...res, data: this.mapPolicy(res.data) };
        }
        return res as ApiResponse<PolicyDto>;
      })
    );
  }

  getPolicyHistory(type: string): Observable<ApiResponse<PolicyDto[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.policiesBase}/${this.getPolicyEnum(type)}/history`).pipe(
      map(res => {
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map(item => ({
            id: item.id ?? 0,
            type: '',
            title: '',
            content: '',
            version: item.versionNumber != null ? String(item.versionNumber) : '1.0',
            isPublished: !!item.isPublished,
            publishedAt: item.publishedAt ?? null,
            updatedAt: item.createdAt ?? ''
          }));
          return { ...res, data: mapped };
        }
        return res as ApiResponse<PolicyDto[]>;
      })
    );
  }

  publishPolicy(type: string): Observable<ApiResponse<PolicyDto>> {
    return this.http.put<ApiResponse<any>>(`${this.policiesBase}/${this.getPolicyEnum(type)}/publish`, {}).pipe(
      map(res => {
        if (res.success && res.data) {
          return { ...res, data: this.mapPolicy(res.data) };
        }
        return res as ApiResponse<PolicyDto>;
      })
    );
  }

  savePolicyDraft(type: string, dto: UpdatePolicyDto): Observable<ApiResponse<PolicyDto>> {
    const payload = {
      content: dto.content,
      requireUserAcceptance: true
    };
    return this.http.put<ApiResponse<any>>(`${this.policiesBase}/${this.getPolicyEnum(type)}/draft`, payload).pipe(
      map(res => {
        if (res.success && res.data) {
          return { ...res, data: this.mapPolicy(res.data) };
        }
        return res as ApiResponse<PolicyDto>;
      })
    );
  }

  // ── Shipping ──────────────────────────────────────────────────────────────────

  getShipping(): Observable<ApiResponse<ShippingSettingsDto>> {
    return this.http.get<ApiResponse<ShippingSettingsDto>>(this.shippingBase);
  }

  updateShipping(dto: UpdateShippingDto): Observable<ApiResponse<ShippingSettingsDto>> {
    return this.http.put<ApiResponse<ShippingSettingsDto>>(this.shippingBase, dto);
  }

  // ── Tax ───────────────────────────────────────────────────────────────────────

  getTax(): Observable<ApiResponse<TaxSettingsDto>> {
    return this.http.get<ApiResponse<TaxSettingsDto>>(this.taxBase);
  }

  updateTax(dto: UpdateTaxDto): Observable<ApiResponse<TaxSettingsDto>> {
    return this.http.put<ApiResponse<TaxSettingsDto>>(this.taxBase, dto);
  }
}