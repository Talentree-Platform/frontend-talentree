import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../core/services/supplier.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Supplier, SupplierPerformanceData, SupplierPerformanceItem } from '../../../core/Interfaces/isupplier';
import { TableComponent } from '../../../Components/table/table.component';
import { PaginationComponent } from '../../../Components/pagination/pagination.component';
import { SupplierDetailsComponent } from '../supplier-details/supplier-details.component';
import { SupplierFormComponent } from '../supplier-form/supplier-form.component';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    PaginationComponent,
    SupplierDetailsComponent,
    SupplierFormComponent,
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css',
})
export class SupplierListComponent implements OnInit, OnDestroy {

  constructor(
    private _SupplierService: SupplierService,
    private _ToastrService: ToastrService,
  ) { }

  // ── teardown ──────────────────────────────────────────────────────────────
  private destroy$ = new Subject<void>();

  // ── list ─────────────────────────────────────────────────────────────────
  suppliers: Supplier[] = [];
  isLoading = false;

  // ── selection ─────────────────────────────────────────────────────────────
  selectedSupplier: Supplier | null = null;

  // ── modals ────────────────────────────────────────────────────────────────
  isDetailsOpen = false;
  isFormOpen = false;
  isEditMode = false;

  // ── filters ───────────────────────────────────────────────────────────────
  searchTerm = '';
  selectedActive: boolean | undefined = undefined;

  // ── pagination ────────────────────────────────────────────────────────────
  pageIndex = 1;
  pageSize = 20;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;
  totalCount = 0;

  // ── list stats ────────────────────────────────────────────────────────────
  activeCount = 0;
  inactiveCount = 0;

  // ── table config ──────────────────────────────────────────────────────────
  columns = ['name', 'email', 'phone', 'city', 'country', 'contactPerson', 'materialCount', 'isActive'];
  actions = ['view', 'edit', 'delete'];

  // ── Performance Analytics ─────────────────────────────────────────────────
  performanceData: SupplierPerformanceData | null = null;
  performanceItems: SupplierPerformanceItem[] = [];
  perfLoading = false;
  perfError = '';
  showPerformance = false;

  // ─────────────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.load();
    this.loadPerformance();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── list load ─────────────────────────────────────────────────────────────
  load(): void {
    this.isLoading = true;
    this._SupplierService
      .getSuppliers({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        search: this.searchTerm || undefined,
        isActive: this.selectedActive,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.suppliers = res.data.data;
          this.totalPages = res.data.totalPages;
          this.hasNext = res.data.hasNext;
          this.hasPrevious = res.data.hasPrevious;
          this.pageIndex = res.data.pageIndex;
          this.totalCount = res.data.count;
          this.activeCount = res.data.data.filter(s => s.isActive).length;
          this.inactiveCount = res.data.data.filter(s => !s.isActive).length;
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this._ToastrService.error(
            'Failed to load suppliers', 'Talentree',
            { timeOut: 2000, closeButton: true },
          );
        },
      });
  }

  // ── performance load ──────────────────────────────────────────────────────
  loadPerformance(): void {
    this.perfLoading = true;
    this.perfError = '';

    this._SupplierService
      .getPerformance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.perfLoading = false;
          this.performanceData = null;
          this.performanceItems = res?.data?.data ?? [];
        },
        error: (err) => {
          this.perfLoading = false;
          this.perfError = err?.error?.message ?? 'Failed to load performance data.';
        },
      });
  }

  // ── performance UI helpers ────────────────────────────────────────────────

  togglePerformance(): void {
    this.showPerformance = !this.showPerformance;
  }

  /** Clamp a percentage value to [0, 100] */
  pct(val: number | null | undefined): number {
    if (val == null) return 0;
    return Math.min(100, Math.max(0, val));
  }

  /** CSS class based on 0–100 score */
  scoreClass(val: number | null | undefined): string {
    if (val == null) return 'score-neutral';
    if (val >= 80) return 'score-high';
    if (val >= 50) return 'score-mid';
    return 'score-low';
  }

  /** 5-element array: 1 = filled star, 0 = empty */
  starsArray(rating: number | null | undefined): number[] {
    const r = Math.round(rating ?? 0);
    return Array.from({ length: 5 }, (_, i) => (i < r ? 1 : 0));
  }

  // ── Performance computed helpers ──────────────────────────────────────────

  getTotalOrders(): number {
    return this.performanceItems.reduce((sum, i) => sum + (i.totalOrders ?? 0), 0);
  }

  getTotalRevenue(): number {
    return this.performanceItems.reduce((sum, i) => sum + (i.totalRevenue ?? 0), 0);
  }

  getAvgOrderValue(): number {
    const items = this.performanceItems.filter(i => i.averageOrderValue != null);
    if (!items.length) return 0;
    return items.reduce((sum, i) => sum + (i.averageOrderValue ?? 0), 0) / items.length;
  }

  getAvgRating(): number {
    const items = this.performanceItems.filter(i => i.averageRating != null);
    if (!items.length) return 0;
    return items.reduce((sum, i) => sum + (i.averageRating ?? 0), 0) / items.length;
  }

  getAvgIssueRate(): number {
    const items = this.performanceItems.filter(i => i.issueRatePercentage != null);
    if (!items.length) return 0;
    return items.reduce((sum, i) => sum + (i.issueRatePercentage ?? 0), 0) / items.length;
  }

  getTopPerformer(): string {
    if (!this.performanceItems.length) return '—';
    const top = this.performanceItems.reduce((best, i) =>
      (i.totalRevenue ?? 0) > (best.totalRevenue ?? 0) ? i : best
    );
    return top.supplierName ?? '—';
  }

  // ── filters ───────────────────────────────────────────────────────────────

  onSearch(): void {
    this.pageIndex = 1;
    this.load();
  }

  onActiveChange(val: string): void {
    if (val === 'true') this.selectedActive = true;
    else if (val === 'false') this.selectedActive = false;
    else this.selectedActive = undefined;
    this.pageIndex = 1;
    this.load();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedActive = undefined;
    this.pageIndex = 1;
    this.load();
  }

  // ── table actions ─────────────────────────────────────────────────────────

  handleEvent(event: { action: string; row: Supplier }): void {
    this.selectedSupplier = event.row;
    if (event.action === 'view') this.isDetailsOpen = true;
    if (event.action === 'edit') { this.isEditMode = true; this.isFormOpen = true; }
    if (event.action === 'delete') this.deleteSupplier(event.row);
  }

  deleteSupplier(supplier: Supplier): void {
    if (!confirm(`Delete supplier "${supplier.name}"?`)) return;
    this._SupplierService
      .deleteSupplier(supplier.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this._ToastrService.warning(
            res.message ?? 'Supplier deleted', 'Talentree',
            { timeOut: 2000, closeButton: true },
          );
          this.load();
        },
        error: (err) => {
          this._ToastrService.error(
            err.error?.message ?? 'Failed to delete', 'Talentree',
            { timeOut: 2000, closeButton: true },
          );
        },
      });
  }

  // ── modal actions ─────────────────────────────────────────────────────────

  openCreateForm(): void {
    this.selectedSupplier = null;
    this.isEditMode = false;
    this.isFormOpen = true;
  }

  closeModals(): void {
    this.isDetailsOpen = false;
    this.isFormOpen = false;
    this.selectedSupplier = null;
    this.isEditMode = false;
  }

  onFormSaved(): void {
    const msg = this.isEditMode ? 'Supplier updated!' : 'Supplier created!';
    this.closeModals();
    this.load();
    this._ToastrService.success(msg, 'Talentree', { timeOut: 2000, closeButton: true });
  }

  // ── pagination ────────────────────────────────────────────────────────────

  pageChangeEvent(page: number): void {
    this.pageIndex = page;
    this.load();
  }
}