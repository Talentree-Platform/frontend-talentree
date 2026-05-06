import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { KbRecommendationsComponent } from '../../components/kb-recommendations/kb-recommendations.component';
import { FinancialService } from '../../core/services/financial.service';
import { FinancialSummary } from '../../core/services/financial.models';

@Component({
  selector: 'app-business-owner-home',
  standalone: true,
  imports: [CommonModule, KbRecommendationsComponent],
  templateUrl: './business-owner-home.component.html',
  styleUrls: ['./business-owner-home.component.css'],
})
export class BusinessOwnerHomeComponent implements OnInit, OnDestroy {
  summary: FinancialSummary | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private financialService: FinancialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.financialService
      .getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (data) => { this.summary = data; this.loading = false; },
        error: ()     => { this.loading = false; },
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  goToFinancial(): void { this.router.navigate(['/businessowner/financial']); }
}