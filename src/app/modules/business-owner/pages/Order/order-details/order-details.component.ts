import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialOrderDetails } from '../../../core/interfaces/i-material-order';
import { MaterialOrderService } from '../../../core/services/material-order.service';



@Component({
  selector: 'app-material-order-details',
  standalone: true,
  imports: [CommonModule, DatePipe , RouterLink ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class MaterialOrderDetailsComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private materialOrderService = inject(MaterialOrderService);

  orderDetails!: MaterialOrderDetails;

  ngOnInit(): void {

    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    this.getOrderDetails(id);
  }

  getOrderDetails(id: number): void {

    this.materialOrderService.getOrderById(id).subscribe({

      next: (res) => {

        console.log(res);

        this.orderDetails = res.data;
      },

      error: (err) => {
        console.log(err);
      }

    });
  }

  getStatus(status: number): string {

    switch (status) {

      case 0:
        return 'Pending';

      case 1:
        return 'Processing';

      case 2:
        return 'Delivered';

      case 3:
        return 'Cancelled';

      default:
        return 'Unknown';
    }
  }

  getPaymentStatus(status: number): string {

    switch (status) {

      case 0:
        return 'Unpaid';

      case 1:
        return 'Paid';

      default:
        return 'Unknown';
    }
  }
}