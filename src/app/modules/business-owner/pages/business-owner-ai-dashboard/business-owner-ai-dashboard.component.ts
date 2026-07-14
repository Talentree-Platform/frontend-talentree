import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { AiDashboardService } from '../../core/services/ai-dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { BoThemeService } from '../../../../core/services/bo-theme.service';
import { AiDashboardOverview } from '../../models/dashboard.model';
import { RevenueAnalyticsResponse, ReviewTrendsResponse } from '../../models/analytics.model';

// Import child components
import { DashboardCardsComponent } from '../../components/dashboard-cards/dashboard-cards.component';
import { ChartsComponent, ChartPoint } from '../../components/charts/charts.component';
import { ReviewInsightsComponent } from '../../components/review-insights/review-insights.component';
import { AiBenchmarkPanelComponent } from '../../components/ai-benchmark-panel/ai-benchmark-panel.component';
import { AiSelfServiceToolsComponent } from '../../components/ai-self-service-tools/ai-self-service-tools.component';

@Component({
  selector: 'app-business-owner-ai-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DashboardCardsComponent,
    ChartsComponent,
    ReviewInsightsComponent,
    AiBenchmarkPanelComponent,
    AiSelfServiceToolsComponent
  ],
  templateUrl: './business-owner-ai-dashboard.component.html',
  styleUrls: ['./business-owner-ai-dashboard.component.css']
})
export class BusinessOwnerAiDashboardComponent implements OnInit, OnDestroy {
  private authSvc = inject(AuthService);
  private aiSvc = inject(AiDashboardService);
  private toastSvc = inject(ToastService);
  themeSvc = inject(BoThemeService);

  private destroy$ = new Subject<void>();

  userId = '';
  selectedPeriod = 'Monthly'; // Default selector: Daily, Weekly, Monthly, Yearly
  activeTab = 'overview'; // tabs: overview, revenue, reviews, predictions

  // Component states
  loadingOverview = true;
  loadingAnalytics = true;
  errorOverview = false;
  errorAnalytics = false;

  // Data bindings
  overviewData: AiDashboardOverview | null = null;
  revenueData: RevenueAnalyticsResponse | null = null;
  reviewTrendsData: ReviewTrendsResponse | null = null;

  // Revenue chart bindings
  revenueChartPoints: ChartPoint[] = [];
  ordersChartPoints: ChartPoint[] = [];

  ngOnInit(): void {
    // Subscribe to current user to get authenticated user ID
    this.authSvc.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user && user.id) {
            this.userId = user.id;
            this.loadDashboardData();
          } else {
            console.error('AI Insights: no authenticated business owner id available; skipping data load');
            this.loadingOverview = false;
            this.loadingAnalytics = false;
            this.errorOverview = true;
            this.errorAnalytics = true;
          }
        },
        error: (err) => {
          console.error('Failed to load user ID:', err);
          this.loadingOverview = false;
          this.loadingAnalytics = false;
          this.errorOverview = true;
          this.errorAnalytics = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loadOverview();
    this.loadAnalytics();
  }

  loadOverview(): void {
    this.loadingOverview = true;
    this.errorOverview = false;
    
    this.aiSvc.getDashboardOverview()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.overviewData = data;
          this.loadingOverview = false;
        },
        error: (err) => {
          console.error('Error fetching dashboard overview:', err);
          this.loadingOverview = false;
          this.errorOverview = true;
          this.toastSvc.show('Failed to fetch KPI dashboard overview.', 'error');
        }
      });
  }

  loadAnalytics(): void {
    this.loadingAnalytics = true;
    this.errorAnalytics = false;

    // Fetch both revenue trend and reviews trend together
    forkJoin({
      revenue: this.aiSvc.getRevenueTrend(this.selectedPeriod),
      reviews: this.aiSvc.getReviewTrends(this.selectedPeriod)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.revenueData = results.revenue;
          this.reviewTrendsData = results.reviews;

          // Map revenue trend chart points
          if (this.revenueData && this.revenueData.trend_data) {
            this.revenueChartPoints = this.revenueData.trend_data.map(p => ({
              label: p.date,
              value: p.revenue
            }));
            this.ordersChartPoints = this.revenueData.trend_data.map(p => ({
              label: p.date,
              value: p.orders
            }));
          }

          this.loadingAnalytics = false;
        },
        error: (err) => {
          console.error('Error fetching analytics details:', err);
          this.loadingAnalytics = false;
          this.errorAnalytics = true;
          this.toastSvc.show('Failed to load time-series analytics charts.', 'error');
        }
      });
  }

  onPeriodChange(): void {
    this.toastSvc.show(`Filtering records for ${this.selectedPeriod}...`, 'info');
    this.loadAnalytics();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  retryLoad(): void {
    this.toastSvc.show('Retrying connection to AI metrics server...', 'info');
    this.loadDashboardData();
  }
}
