
import { Component, OnInit, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError, of } from 'rxjs';
import { SupportService } from '../../../core/services/support.service';
import { Faq, FaqCategory } from '../../../core/interfaces/i-support';
import { NgFor, NgIf } from '@angular/common';
import { SkeletonComponent } from '../../../components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../components/statues-badge/statues-badge.component';
import { JsonSumPipe } from '../../../core/pipe/json-sum.pipe';
import { HelpCenterChatService } from '../../../core/services/help-center-chat.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    SkeletonComponent,
    ReactiveFormsModule,
    FormsModule,
    StatusBadgeComponent,
    NgIf,
    NgFor,
    JsonSumPipe
  ],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit, AfterViewChecked {
  private svc = inject(SupportService);
  readonly chatSvc = inject(HelpCenterChatService);

  @ViewChild('chatMessages') chatMessagesEl?: ElementRef<HTMLDivElement>;

  // ── FAQ state ─────────────────────────────────────────────────────────────
  searchCtrl = new FormControl('');
  activeCategory: string | null = null;
  expandedId: string | null = null;
  categories: FaqCategory[] = [];
  faqs: Faq[] = [];
  loading = true;
  catLoading = true;
  skeletonRows = Array(5);

  // ── Help Center chat state ────────────────────────────────────────────────
  isChatOpen = signal(false);
  chatInput = signal('');

  bubbles = this.chatSvc.bubbles;
  isSending = this.chatSvc.isSending;

  ngOnInit(): void {
    this.svc.getCategories().pipe(catchError(() => of([]))).subscribe(c => {
      this.categories = c;
      this.catLoading = false;
    });

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

  ngAfterViewChecked(): void {
    if (this.chatMessagesEl) {
      const el = this.chatMessagesEl.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
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

  // ── Chat panel methods ────────────────────────────────────────────────────

  toggleChat(): void {
    this.isChatOpen.update(v => !v);
  }

  sendChat(): void {
    const text = this.chatInput().trim();
    if (!text || this.isSending()) return;
    this.chatInput.set('');
    this.chatSvc.sendMessage(text).subscribe();
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendChat();
    }
  }

  clearChat(): void {
    this.chatSvc.clearHistory();
  }
}

