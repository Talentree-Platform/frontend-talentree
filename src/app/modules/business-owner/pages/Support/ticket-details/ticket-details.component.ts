import { SkeletonComponent } from './../../../components/skeleton/skeleton.component';
import {
  Component, OnInit, OnDestroy, inject,
  ViewChild, ElementRef, AfterViewChecked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { NgIf, NgFor } from '@angular/common';

import { SupportService }  from '../../../core/services/support.service';
import { ToastService }    from '../../../core/services/toast.service';
import { TicketDetails, TicketMessage } from '../../../core/interfaces/i-support';
import { StatusBadgeComponent } from '../../../components/statues-badge/statues-badge.component';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [
    SkeletonComponent,
    ReactiveFormsModule,
    StatusBadgeComponent,
    NgIf,
    NgFor,
  ],
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss'],
})
export class TicketDetailsComponent implements OnInit, OnDestroy, AfterViewChecked {
  private route    = inject(ActivatedRoute);
  private svc      = inject(SupportService);
  private toast    = inject(ToastService);
  private destroy$ = new Subject<void>();

  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  ticket: TicketDetails | null = null;
  loading      = true;
  error        = false;
  sending      = false;
  closing      = false;
  shouldScroll = false;

  messageCtrl = new FormControl('', Validators.required);
  attachFiles: File[] = [];

  get isClosed(): boolean { return this.ticket?.status === 3; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getTicketById(id).pipe(
      catchError(() => {
        this.error   = true;
        this.loading = false;
        return of(null);          // ← return of(null), never re-throw inside catchError
      }),
      takeUntil(this.destroy$),
    ).subscribe(t => {
      this.loading = false;
      this.ticket  = t;
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private scrollToBottom(): void {
    try { this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' }); }
    catch {}
  }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.attachFiles = [...this.attachFiles, ...Array.from(input.files)];
      input.value = '';
    }
  }

  removeAttach(i: number): void {
    this.attachFiles = this.attachFiles.filter((_, j) => j !== i);
  }

  sendMessage(): void {
    if (this.messageCtrl.invalid || !this.ticket) return;
    this.sending = true;

    // Optimistic append — use negative number so it never collides with real IDs
    const optimisticId = -Date.now();
    const optimistic: TicketMessage = {
      id:             optimisticId,
      ticketId:       this.ticket.id,
      senderId:       'me',
      senderName:     'You',
      isAdminMessage: false,
      content:        this.messageCtrl.value!,
      attachments:    [],
      createdAt:      new Date().toISOString(),
    };

    this.ticket.messages.push(optimistic);
    this.shouldScroll = true;

    const text = this.messageCtrl.value!;
    this.messageCtrl.reset();

    const fd = new FormData();
    fd.append('ticketId', String(this.ticket.id));
    fd.append('content',  text);
    this.attachFiles.forEach(f => fd.append('attachments', f, f.name));
    this.attachFiles = [];

    this.svc.sendMessage(fd).pipe(takeUntil(this.destroy$)).subscribe({
      next: (msg) => {
        const idx = this.ticket!.messages.findIndex(m => m.id === optimisticId);
        if (idx !== -1) this.ticket!.messages[idx] = msg;
        this.sending = false;
      },
      error: () => {
        this.ticket!.messages = this.ticket!.messages.filter(m => m.id !== optimisticId);
        this.messageCtrl.setValue(text);
        this.toast.show('Failed to send message', 'error');
        this.sending = false;
      },
    });
  }

  closeTicket(): void {
    if (!this.ticket || this.closing) return;
    this.closing = true;
    this.svc.closeTicket(String(this.ticket.id)).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.ticket!.status     = 3;
        this.ticket!.statusText = 'Closed';
        this.toast.show('Ticket closed', 'success');
        this.closing = false;
      },
      error: () => {
        this.toast.show('Failed to close ticket', 'error');
        this.closing = false;
      },
    });
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
           ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  skeletonRows = [0, 1, 2, 3];   // concrete values so the template can do r % 2
}