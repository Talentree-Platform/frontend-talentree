import { Component, OnInit, inject } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService } from '../../../core/services/complaint.service';
import { ComplaintDetails, COMPLAINT_STATUS, VIOLATION_TYPES } from '../../../core/interfaces/i-complaint';

@Component({
  selector: 'app-complaint-details',
  standalone: true,
  imports: [NgClass, DatePipe],
  templateUrl: './complaint-details.component.html',
  styleUrl: './complaint-details.component.scss'
})
export class ComplaintDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ComplaintService);

  complaint: ComplaintDetails | null = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = true; this.loading = false; return; }

    this.svc.getComplaintById(id).subscribe({
      next: (res) => {
        this.complaint = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  statusMeta(status: number) {
    return COMPLAINT_STATUS[status] ?? { label: 'Unknown', className: 'status-review' };
  }

  violationLabel(type: number): string {
    return VIOLATION_TYPES.find(v => v.value === type)?.label ?? this.complaint?.violationTypeText ?? 'Other';
  }

  fileAnother(): void { this.router.navigate(['/businessowner/complaints/create']); }
  goHome(): void { this.router.navigate(['/businessowner/bohome']); }
}
