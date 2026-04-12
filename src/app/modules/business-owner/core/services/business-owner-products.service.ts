import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/material';
import {
  OwnerProduct,
  OwnerProductDetail,
  OwnerProductImageRef,
  OwnerProductStatus
} from '../interfaces/owner-product';

type ApiOwnerProduct = Record<string, unknown>;

/** Host for relative media paths returned by the API (same origin as Auth). */
const API_MEDIA_ORIGIN = 'https://talentreeplateform.runasp.net';

@Injectable({
  providedIn: 'root'
})
export class BusinessOwnerProductsService {
  private readonly baseUrl = '/api/BusinessOwnerProducts';

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<OwnerProduct[]> {
    return this.http.get<ApiResponse<any>>(this.baseUrl).pipe(
      map((res) => {
        const raw = res?.data?.data;

        if (!Array.isArray(raw)) return [];

        return raw.map((item) => this.normalizeProduct(item as ApiOwnerProduct));
      })
    );
  }

  /**
   * GET /api/BusinessOwnerProducts/{id}
   * Authorization is applied globally via authInterceptor.
   */
  getProductById(id: number): Observable<OwnerProductDetail> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      map((res) => {
        if (!res?.success || res.data == null) {
          throw new Error('Product not found');
        }
        return this.normalizeProductDetail(res.data as ApiOwnerProduct);
      })
    );
  }

  /** DELETE /api/BusinessOwnerProducts/{id} — Authorization via authInterceptor. */
  deleteProduct(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/${id}`);
  }

  /** POST /api/BusinessOwnerProducts — multipart/form-data; Authorization via authInterceptor. */
  createProduct(formData: FormData): Observable<unknown> {
    return this.http.post<unknown>(this.baseUrl, formData);
  }

  /** PUT /api/BusinessOwnerProducts/{id} — multipart/form-data. */
  updateProduct(id: number, formData: FormData): Observable<unknown> {
    return this.http.put<unknown>(`${this.baseUrl}/${id}`, formData);
  }

  private pickStr(obj: ApiOwnerProduct, ...keys: string[]): string {
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        return String(v);
      }
    }
    return '';
  }

  private pickNum(obj: ApiOwnerProduct, ...keys: string[]): number {
    for (const k of keys) {
      const v = obj[k];

      if (typeof v === 'number' && !Number.isNaN(v)) return v;

      if (typeof v === 'string' && v.trim() !== '') {
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
      }
    }
    return 0;
  }

  private normalizeStatus(raw: unknown): OwnerProductStatus {
    const s = String(raw ?? '')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/-/g, '_');

    const map: Record<string, OwnerProductStatus> = {
      active: 'active',
      draft: 'draft',
      under_review: 'under_review',
      underreview: 'under_review',
      pending_review: 'under_review',
      pendingapproval: 'under_review',
      rejected: 'rejected',
      out_of_stock: 'out_of_stock',
      outofstock: 'out_of_stock',
      inactive: 'draft'
    };

    return map[s] ?? 'draft';
  }

  private parseTagList(tagsRaw: string): string[] {
    if (!tagsRaw.trim()) return [];
    return [
      ...new Set(
        tagsRaw
          .split(/[\s,]+/)
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => (t.startsWith('#') ? t : `#${t}`))
      )
    ];
  }

  private normalizeImageList(raw: unknown, mainPath: string): string[] {
    return this.normalizeProductImageRefs(raw, mainPath).map((x) => x.url);
  }

  private normalizeProductImageRefs(raw: unknown, mainPath: string): OwnerProductImageRef[] {
    const out: OwnerProductImageRef[] = [];
    const seen = new Set<string>();

    const pushUrl = (url: string, id: number) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      out.push({ id, url });
    };

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (typeof item === 'string' && item) {
          pushUrl(this.getFullImageUrl(item), 0);
        } else if (item && typeof item === 'object') {
          const o = item as ApiOwnerProduct;
          const id = this.pickNum(o, 'id', 'Id', 'imageId', 'ImageId', 'productImageId', 'ProductImageId');
          const u =
            this.pickStr(o, 'url', 'Url', 'imageUrl', 'ImageUrl') ||
            this.pickStr(o, 'path', 'Path');
          if (u) pushUrl(this.getFullImageUrl(u), id || 0);
        }
      }
    }

    if (mainPath) {
      const full = this.getFullImageUrl(mainPath);
      if (!seen.has(full)) {
        seen.add(full);
        out.unshift({ id: 0, url: full });
      }
    }

    return out;
  }

  private normalizeProductDetail(raw: ApiOwnerProduct): OwnerProductDetail {
    const id = this.pickNum(raw, 'id', 'Id', 'productId', 'ProductId');
    const tagsRaw = this.pickStr(raw, 'tags', 'Tags');
    const mainImagePath = this.pickStr(raw, 'mainImageUrl', 'MainImageUrl', 'imageUrl', 'ImageUrl');

    const productImages = this.normalizeProductImageRefs(raw['images'] ?? raw['Images'], mainImagePath);
    const images = productImages.map((x) => x.url);

    const catIdRaw = raw['categoryId'] ?? raw['CategoryId'];
    const categoryId =
      catIdRaw !== undefined && catIdRaw !== null && String(catIdRaw).trim() !== ''
        ? this.pickNum(raw as ApiOwnerProduct, 'categoryId', 'CategoryId')
        : null;

    const statusText = this.pickStr(raw, 'statusText', 'StatusText');
    const createdAt = this.pickStr(raw, 'createdAt', 'CreatedAt') || null;
    const updatedRaw = raw['updatedAt'] ?? raw['UpdatedAt'];
    const updatedAt =
      updatedRaw === null || updatedRaw === undefined
        ? null
        : String(updatedRaw).trim() === ''
          ? null
          : String(updatedRaw);

    const mainImageUrl = mainImagePath
      ? this.getFullImageUrl(mainImagePath)
      : images[0] || '/assets/images/placeholder-product.svg';

    return {
      id,
      name: this.pickStr(raw, 'name', 'Name', 'productName', 'ProductName') || 'Untitled',
      description: this.pickStr(raw, 'description', 'Description') || '—',
      price: this.pickNum(raw, 'price', 'Price'),
      stockQuantity: Math.round(this.pickNum(raw, 'stockQuantity', 'StockQuantity', 'stock', 'Stock')),
      tagsRaw,
      tagList: this.parseTagList(tagsRaw),
      status: this.pickNum(raw, 'status', 'Status'),
      statusText: statusText || 'Unknown',
      statusNormalized: this.normalizeStatus(statusText || raw['status']),
      categoryName: this.pickStr(raw, 'categoryName', 'CategoryName', 'category', 'Category') || '—',
      categoryId,
      mainImageUrl,
      images: images.length ? images : [mainImageUrl],
      productImages: productImages.length ? productImages : [{ id: 0, url: mainImageUrl }],
      createdAt,
      updatedAt
    };
  }

  private normalizeProduct(raw: ApiOwnerProduct): OwnerProduct {
    const id =
      this.pickStr(raw, 'id', 'Id', 'productId', 'ProductId') ||
      `p-${Math.random().toString(36).slice(2, 11)}`;

    const name =
      this.pickStr(raw, 'name', 'Name', 'productName', 'ProductName') ||
      'Untitled';

    const category =
      this.pickStr(raw, 'categoryName', 'CategoryName', 'category', 'Category') ||
      'General';

    const imagePath = this.pickStr(
      raw,
      'mainImageUrl',
      'imageUrl',
      'ImageUrl'
    );

    const dateRaw = this.pickStr(raw, 'createdAt', 'CreatedAt', 'dateAdded');
    const dateAdded = dateRaw || new Date().toISOString().slice(0, 10);

    return {
      id,

      sku: this.pickStr(raw, 'sku', 'Sku') || `SKU-${id}`,

      name,

      category,

      price: this.pickNum(raw, 'price', 'Price'),

      stock: Math.round(
        this.pickNum(raw, 'stockQuantity', 'StockQuantity', 'stock')
      ),

      status: this.normalizeStatus(
        raw['statusText'] ?? raw['StatusText'] ?? raw['status']
      ),

      sales: 0,

      rating: 0,

      imageUrl: imagePath
        ? this.getFullImageUrl(imagePath)
        : '/assets/images/placeholder-product.svg',

      dateAdded,

      views: 0
    };
  }

  private getFullImageUrl(path: string): string {
    if (!path) return '';
    const p = path.trim();
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    if (p.startsWith('//')) return `https:${p}`;
    const base = p.startsWith('/') ? API_MEDIA_ORIGIN : `${API_MEDIA_ORIGIN}/`;
    return `${base}${p.startsWith('/') ? p : p}`;
  }
}
