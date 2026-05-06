import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { KnowledgeBaseService } from '../../core/services/knowledge-base.service';
import { KbRecommendation } from '../../core/services/kb.models';

@Component({
  selector: 'app-kb-recommendations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kb-recommendations.component.html',
  styleUrls: ['./kb-recommendations.component.css'],
})
export class KbRecommendationsComponent implements OnInit, OnDestroy {
  items: KbRecommendation[] = [];
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private kbService: KnowledgeBaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.kbService
      .getRecommendations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (items) => { this.items = items; this.loading = false; },
        error: ()      => (this.loading = false),
      });
      
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

 goTo(id: number): void { 
  this.router.navigate(['/businessowner/knowledge-base', id]); 
}
}