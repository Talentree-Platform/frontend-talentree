import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { KnowledgeBaseService } from '../../../core/services/knowledge-base.service';
import { KbItem } from '../../../core/services/kb.models';

@Component({
  selector: 'app-kb-bookmarks',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './kb-bookmarks.component.html',
  styleUrls: ['./kb-bookmarks.component.css'],
})
export class KbBookmarksComponent implements OnInit, OnDestroy {
  items: KbItem[] = [];
  loading = true;
  error: string | null = null;
  removingId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private kbService: KnowledgeBaseService,
    private router: Router
  ) {}

  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading = true; this.error = null;
    this.kbService.getBookmarks().pipe(takeUntil(this.destroy$)).subscribe({
      next:  (items) => { this.items = items; this.loading = false; },
      error: ()      => { this.error = 'Failed to load saved articles.'; this.loading = false; },
    });
  }

  goTo(id: number): void { this.router.navigate(['/knowledge-base', id]); }

  remove(e: Event, item: KbItem): void {
    e.stopPropagation();
    this.removingId = item.id;
    this.kbService.removeBookmark(item.id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  () => { this.items = this.items.filter((i) => i.id !== item.id); this.removingId = null; },
      error: () => (this.removingId = null),
    });
  }
}
