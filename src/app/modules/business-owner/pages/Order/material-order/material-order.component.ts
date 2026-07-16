import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialOrderService } from '../../../core/services/material-order.service';
import { MaterialOrder } from '../../../core/interfaces/i-checkout';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-material-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './material-order.component.html',
  styleUrl: './material-order.component.css'
})
export class MaterialOrderComponent {
  private materialOrderService = inject(MaterialOrderService);

  orders: any[] = [];

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders(): void {
    this.materialOrderService.getOrders().subscribe({
      next: (res) => {
        console.log(res);

        this.orders = res.data.data;
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
