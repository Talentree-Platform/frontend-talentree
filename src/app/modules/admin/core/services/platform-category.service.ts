import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseService } from './base.service';
import { environment } from '../../../../core/environment/envirinment';
import { ApiResponse } from '../Interfaces/ibusiness-owner';

/** Raw category record as returned by GET /api/admin/platform/categories */
export interface PlatformCategory {
  id: number;
  name: string;
  description: string;
  businessType: string;
  iconUrl: string;
  displayOrder: number;
  isDisabled: boolean;
  parentCategoryId: number | null;
  subCategories: string[];
}

/** Slim shape used by dropdown-style inputs (e.g. change-category-modal). */
export interface CategoryOption {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformCategoryService extends BaseService {

  private readonly base = `${environment.baseUrl}/api/admin/platform/categories`;

  constructor(http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    super(http, platformId);
  }

  /** GET /api/admin/platform/categories — full records, disabled ones included. */
  getAllCategories(): Observable<ApiResponse<PlatformCategory[]>> {
    return this.http.get<ApiResponse<PlatformCategory[]>>(
      this.base,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Convenience helper for dropdowns: returns just the enabled categories,
   * sorted by displayOrder, mapped down to { id, name }.
   */
  getCategoryOptions(): Observable<CategoryOption[]> {
    return this.getAllCategories().pipe(
      map((res) => {
        const list = res?.data ?? [];
        return list
          .filter((c) => !c.isDisabled)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((c) => ({ id: c.id, name: c.name }));
      })
    );
  }
}