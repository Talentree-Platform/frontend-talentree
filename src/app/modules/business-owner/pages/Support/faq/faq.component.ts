
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError, of } from 'rxjs';
import { SupportService } from '../../../core/services/support.service';
import { Faq, FaqCategory } from '../../../core/interfaces/i-support';
import { NgFor, NgIf } from '@angular/common';
import { SkeletonComponent } from '../../../components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../components/statues-badge/statues-badge.component';
import { JsonSumPipe } from '../../../core/pipe/json-sum.pipe';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
        SkeletonComponent,
        ReactiveFormsModule,
        StatusBadgeComponent,
    NgIf,
      NgFor,
    JsonSumPipe],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
  private svc = inject(SupportService);

  searchCtrl = new FormControl('');
  activeCategory: string | null = null;
  expandedId: string | null = null;

  categories: FaqCategory[] = [];
  faqs: Faq[] = [];
  loading = true;
  catLoading = true;

  ngOnInit(): void {
    // Load categories
    this.svc.getCategories().pipe(catchError(() => of([]))).subscribe(c => {
      this.categories = c;
      this.catLoading = false;
    });

    // Search / category driven FAQ loading
    this.searchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        this.loading = true;
        if (q && q.trim().length > 1) {
          return this.svc.searchFaqs(q.trim()).pipe(catchError(() => of([])));
        }
        return this.svc.getFaqs(this.activeCategory ?? undefined).pipe(catchError(() => of([])));
      }),
    ).subscribe(faqs => {
      this.faqs    = faqs;
      this.loading = false;
    });
  }

  selectCategory(cat: string | null): void {
    this.activeCategory = cat;
    this.loading = true;
    const q = this.searchCtrl.value;
    const obs = q?.trim()
      ? this.svc.searchFaqs(q.trim())
      : this.svc.getFaqs(cat ?? undefined);

    obs.pipe(catchError(() => of([]))).subscribe(faqs => {
      this.faqs    = faqs;
      this.loading = false;
    });
  }

  toggle(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  skeletonRows = Array(5);
}
