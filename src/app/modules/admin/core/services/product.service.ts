/**
 * product.service.ts
 * Re-exports AdminProductService under a legacy alias so any existing
 * components that import ProductService continue to compile.
 * All real logic lives in admin-products.service.ts.
 */
export { AdminProductService as ProductService } from './admin-products.service';
