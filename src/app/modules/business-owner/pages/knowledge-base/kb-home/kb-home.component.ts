import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { KnowledgeBaseService } from '../../../core/services/knowledge-base.service';
import { KbItem, KbPaginatedData, KbFilters } from '../../../core/services/kb.models';
import { KbRecommendationsComponent } from '../../../components/kb-recommendations/kb-recommendations.component';

@Component({
  selector: 'app-kb-home',
  standalone: true,
  imports: [CommonModule, FormsModule, KbRecommendationsComponent],
  templateUrl: './kb-home.component.html',
  styleUrls: ['./kb-home.component.css'],
})
export class KbHomeComponent implements OnInit, OnDestroy {
  items: KbItem[] = [];
  pagination: Omit<KbPaginatedData<KbItem>, 'data'> | null = null;

  loading = false;
  error: string | null = null;
  bookmarkBusy = new Set<number>();

  search = '';
  category = '';
  contentType = '';
  tag = '';
  page = 0;
  readonly pageSize = 12;

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private kbService: KnowledgeBaseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('KB Home Init');
    this.fetch();
    this.search$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 0;
        this.fetch();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void { this.search$.next(this.search); }
  onFilterChange(): void { this.page = 0; this.fetch(); }

  clearAll(): void {
    this.search = '';
    this.category = '';
    this.contentType = '';
    this.tag = '';
    this.page = 0;
    this.fetch();
  }

  fetch(): void {
     console.log('Fetching KB items...');
    this.loading = true;
    this.error = null;
    const filters: KbFilters = {
      search: this.search || undefined,
      category: this.category || undefined,
      contentType: this.contentType || undefined,
      tag: this.tag || undefined,
      pageIndex: this.page,
      pageSize: this.pageSize,
    };
    this.kbService
      .getItems(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const { data, ...paginationMeta } = res;
          this.items = data;
          this.pagination = paginationMeta;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load articles. Please try again.';
          this.loading = false;
        },
      });
  }

  goTo(id: number): void { 
  this.router.navigate(['/businessowner/knowledge-base', id]); 
}

  toggleBookmark(e: Event, item: KbItem): void {
    e.stopPropagation();
    if (this.bookmarkBusy.has(item.id)) return;
    this.bookmarkBusy.add(item.id);
    this.kbService
      .toggleBookmark(item)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          item.isBookmarked = !item.isBookmarked;
          this.bookmarkBusy.delete(item.id);
        },
        error: () => this.bookmarkBusy.delete(item.id),
      });
  }

  prev(): void { if (this.pagination?.hasPrevious) { this.page--; this.fetch(); scrollTo(0, 0); } }
  next(): void { if (this.pagination?.hasNext) { this.page++; this.fetch(); scrollTo(0, 0); } }

  get hasFilter(): boolean {
    return !!(this.search || this.category || this.contentType || this.tag);
  }
}
