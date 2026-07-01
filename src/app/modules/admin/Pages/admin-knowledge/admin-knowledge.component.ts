import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import {
  AdminKnowledgeService,
  AdminArticleDto,
  KnowledgeQuery,
  KnowledgeAnalytics,
  ArticleAnalytics
} from '../../core/services/admin-knowledge.service';
import { ApiResponse, PaginatedResponse } from '../../core/Interfaces/ibusiness-owner';

@Component({
  selector: 'app-admin-knowledge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-knowledge.component.html',
  styleUrls: ['./admin-knowledge.component.css']
})
export class AdminKnowledgeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  // State
  articles: AdminArticleDto[] = [];
  analytics: KnowledgeAnalytics | null = null;
  topArticles: ArticleAnalytics[] = [];

  // Pagination
  pageIndex = 1;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  // Filters
  searchTerm = '';
  selectedCategory = '';
  selectedContentType = '';
  selectedStatus = '';

  // Loading states
  isLoading = false;
  isSubmitting = false;
  analyticsLoading = false;
  error: string | null = null;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDetailModal = false;
  selectedArticle: AdminArticleDto | null = null;

  // Form model
  form: any = {
    Title: '', Summary: '', ContentType: 'Article', Category: '',
    Tags: '', OrderIndex: 0, IsPublished: false, Content: '', ExternalUrl: ''
  };

  contentTypes = ['Article', 'Video', 'PDF', 'ExternalLink'];
  categories = ['General', 'Orders', 'Payments', 'Products', 'Account', 'Shipping', 'Returns'];

  constructor(
    private svc: AdminKnowledgeService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(term => { this.searchTerm = term; this.pageIndex = 1; this.loadArticles(); });
    this.loadArticles();
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;
    const query: KnowledgeQuery = {
      PageIndex: this.pageIndex, PageSize: this.pageSize,
      Search: this.searchTerm || undefined,
      Category: this.selectedCategory || undefined,
      ContentType: this.selectedContentType || undefined,
      Status: this.selectedStatus || undefined,
    };
    this.svc.getArticles(query).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: ApiResponse<PaginatedResponse<AdminArticleDto>>) => {
        if (res.success) {
          this.articles = res.data.data;
          this.totalCount = res.data.count;
          this.totalPages = res.data.totalPages;
        } else {
          this.error = res.message ?? 'Failed to load articles.';
        }
        this.isLoading = false;
      },
      error: () => { this.error = 'Network error. Please try again.'; this.isLoading = false; }
    });
  }

  loadAnalytics(): void {
    this.analyticsLoading = true;
    this.svc.getAnalytics().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.success) this.analytics = res.data;
        this.analyticsLoading = false;
      },
      error: () => { this.analyticsLoading = false; }
    });
    this.svc.getAnalyticsArticles().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { if (res.success && res.data) this.topArticles = (res.data.data || []).slice(0, 5); }
    });
  }

  onSearchInput(value: string): void { this.search$.next(value); }
  onFilterChange(): void { this.pageIndex = 1; this.loadArticles(); }
  clearFilters(): void { this.searchTerm = ''; this.selectedCategory = ''; this.selectedContentType = ''; this.selectedStatus = ''; this.pageIndex = 1; this.loadArticles(); }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) { this.pageIndex = p; this.loadArticles(); } }
  get pages(): number[] { return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i + 1); }
  get startItem(): number { return (this.pageIndex - 1) * this.pageSize + 1; }
  get endItem(): number { return Math.min(this.pageIndex * this.pageSize, this.totalCount); }

  openCreate(): void {
    this.form = { Title: '', Summary: '', ContentType: 'Article', Category: '', Tags: '', OrderIndex: 0, IsPublished: false, Content: '', ExternalUrl: '' };
    this.showCreateModal = true;
  }

  openEdit(a: AdminArticleDto): void {
    this.selectedArticle = a;
    this.form = { Title: a.title, Summary: a.summary, ContentType: a.contentType, Category: a.category, Tags: a.tags, OrderIndex: a.orderIndex, IsPublished: a.isPublished, Content: a.content, ExternalUrl: a.externalUrl ?? '' };
    this.showEditModal = true;
  }

  openDetail(a: AdminArticleDto): void { this.selectedArticle = a; this.showDetailModal = true; }
  closeModals(): void { this.showCreateModal = false; this.showEditModal = false; this.showDetailModal = false; this.selectedArticle = null; }

  buildFormData(): FormData {
    const fd = new FormData();
    Object.entries(this.form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
    return fd;
  }

  submitCreate(): void {
    this.isSubmitting = true;
    this.svc.createArticle(this.buildFormData()).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) { this.toastr.success('Article created!', 'Talentree', { timeOut: 2000, closeButton: true }); this.closeModals(); this.loadArticles(); this.loadAnalytics(); }
        else { this.toastr.error(res.message ?? 'Failed.', 'Talentree', { timeOut: 2000, closeButton: true }); }
      },
      error: (e) => { this.isSubmitting = false; this.toastr.error(e.error?.message ?? 'Error.', 'Talentree', { timeOut: 2000, closeButton: true }); }
    });
  }

  submitEdit(): void {
    if (!this.selectedArticle) return;
    this.isSubmitting = true;
    this.svc.updateArticle(this.selectedArticle.id, this.buildFormData()).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) { this.toastr.success('Article updated!', 'Talentree', { timeOut: 2000, closeButton: true }); this.closeModals(); this.loadArticles(); }
        else { this.toastr.error(res.message ?? 'Failed.', 'Talentree', { timeOut: 2000, closeButton: true }); }
      },
      error: (e) => { this.isSubmitting = false; this.toastr.error(e.error?.message ?? 'Error.', 'Talentree', { timeOut: 2000, closeButton: true }); }
    });
  }

  deleteArticle(a: AdminArticleDto): void {
    if (!confirm(`Delete "${a.title}"?`)) return;
    this.svc.deleteArticle(a.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.success) { this.toastr.success('Deleted.', 'Talentree', { timeOut: 2000, closeButton: true }); this.loadArticles(); this.loadAnalytics(); }
        else { this.toastr.error(res.message ?? 'Failed.', 'Talentree', { timeOut: 2000, closeButton: true }); }
      },
      error: (e) => { this.toastr.error(e.error?.message ?? 'Error.', 'Talentree', { timeOut: 2000, closeButton: true }); }
    });
  }

  togglePublish(a: AdminArticleDto): void {
    const obs = a.isPublished ? this.svc.unpublishArticle(a.id) : this.svc.publishArticle(a.id);
    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.success) { this.toastr.success(a.isPublished ? 'Unpublished.' : 'Published!', 'Talentree', { timeOut: 2000, closeButton: true }); this.loadArticles(); }
        else { this.toastr.error(res.message ?? 'Failed.', 'Talentree', { timeOut: 2000, closeButton: true }); }
      },
      error: (e) => { this.toastr.error(e.error?.message ?? 'Error.', 'Talentree', { timeOut: 2000, closeButton: true }); }
    });
  }
}
