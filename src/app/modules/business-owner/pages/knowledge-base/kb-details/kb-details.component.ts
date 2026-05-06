import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { KnowledgeBaseService } from '../../../core/services/knowledge-base.service';
import { KbItem } from '../../../core/services/kb.models';

@Component({
  selector: 'app-kb-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kb-details.component.html',
  styleUrls: ['./kb-details.component.css'],
})
export class KbDetailsComponent implements OnInit, OnDestroy {
  item: KbItem | null = null;
  loading = true;
  error: string | null = null;
  bkLoading = false;
  bkFlash = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private kbService: KnowledgeBaseService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((p) => {
      const id = +p['id'];
      isNaN(id)
        ? ((this.error = 'Invalid ID.'), (this.loading = false))
        : this.load(id);
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(id: number): void {
    this.loading = true; this.error = null;
    this.kbService.getItem(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  (item) => { this.item = item; this.loading = false; },
      error: ()     => { this.error = 'Article not found.'; this.loading = false; },
    });
  }

  toggleBookmark(): void {
    if (!this.item || this.bkLoading) return;
    this.bkLoading = true;
    this.kbService.toggleBookmark(this.item).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.item!.isBookmarked = !this.item!.isBookmarked;
        this.bkLoading = false;
        this.bkFlash = true;
        setTimeout(() => (this.bkFlash = false), 2000);
      },
      error: () => (this.bkLoading = false),
    });
  }

  back(): void { this.router.navigate(['/knowledge-base']); }
}
