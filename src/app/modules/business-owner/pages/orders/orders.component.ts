import { Component, OnInit } from '@angular/core';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: Date;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  shippingAddress: string;
  trackingNumber?: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  // Data
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  editOrder: Order | null = null;

  // Modal states
  showOrderModal: boolean = false;
  showEditModal: boolean = false;

  // Filters
  selectedStatus: string = 'all';
  selectedDateRange: string = 'today';
  searchQuery: string = '';

  // Dropdown
  openDropdownId: string | null = null;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor() { }

  ngOnInit(): void {
    this.loadMockData();
  }

  // Load mock data
  loadMockData(): void {
    this.orders = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        customerName: 'Ahmed Al-Mansoori',
        customerEmail: 'ahmed@example.com',
        date: new Date(2024, 2, 15),
        items: [
          { productId: 'p1', productName: 'Cotton Fabric', quantity: 10, price: 25, total: 250 },
          { productId: 'p2', productName: 'Silk Threads', quantity: 5, price: 15, total: 75 }
        ],
        total: 325,
        status: 'processing',
        paymentStatus: 'paid',
        shippingAddress: 'Dubai, UAE',
        trackingNumber: 'TRK123456'
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        customerName: 'Fatima Al-Hashemi',
        customerEmail: 'fatima@example.com',
        date: new Date(2024, 2, 16),
        items: [
          { productId: 'p3', productName: 'Wool Yarn', quantity: 20, price: 8, total: 160 }
        ],
        total: 160,
        status: 'pending',
        paymentStatus: 'unpaid',
        shippingAddress: 'Abu Dhabi, UAE'
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        customerName: 'Mohammed Al-Rashid',
        customerEmail: 'mohammed@example.com',
        date: new Date(2024, 2, 14),
        items: [
          { productId: 'p4', productName: 'Leather Sheets', quantity: 3, price: 120, total: 360 },
          { productId: 'p5', productName: 'Brass Buckles', quantity: 12, price: 5, total: 60 }
        ],
        total: 420,
        status: 'shipped',
        paymentStatus: 'paid',
        shippingAddress: 'Sharjah, UAE',
        trackingNumber: 'TRK789012'
      },
      {
        id: '4',
        orderNumber: 'ORD-2024-004',
        customerName: 'Aisha Al-Nuaimi',
        customerEmail: 'aisha@example.com',
        date: new Date(2024, 2, 13),
        items: [
          { productId: 'p6', productName: 'Beads Set', quantity: 5, price: 45, total: 225 }
        ],
        total: 225,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: 'Ajman, UAE'
      },
      {
        id: '5',
        orderNumber: 'ORD-2024-005',
        customerName: 'Omar Al-Farsi',
        customerEmail: 'omar@example.com',
        date: new Date(2024, 2, 12),
        items: [
          { productId: 'p7', productName: 'Dye Set', quantity: 2, price: 85, total: 170 },
          { productId: 'p8', productName: 'Brushes', quantity: 8, price: 12, total: 96 }
        ],
        total: 266,
        status: 'cancelled',
        paymentStatus: 'refunded',
        shippingAddress: 'Ras Al Khaimah, UAE'
      },
      {
        id: '6',
        orderNumber: 'ORD-2024-006',
        customerName: 'Noura Al-Ketbi',
        customerEmail: 'noura@example.com',
        date: new Date(2024, 2, 11),
        items: [
          { productId: 'p9', productName: 'Gemstones', quantity: 3, price: 200, total: 600 },
          { productId: 'p10', productName: 'Silver Chains', quantity: 5, price: 50, total: 250 }
        ],
        total: 850,
        status: 'processing',
        paymentStatus: 'paid',
        shippingAddress: 'Dubai, UAE'
      },
      {
        id: '7',
        orderNumber: 'ORD-2024-007',
        customerName: 'Khalid Al-Hosani',
        customerEmail: 'khalid@example.com',
        date: new Date(2024, 2, 10),
        items: [
          { productId: 'p11', productName: 'Oud Wood', quantity: 2, price: 150, total: 300 }
        ],
        total: 300,
        status: 'pending',
        paymentStatus: 'unpaid',
        shippingAddress: 'Abu Dhabi, UAE'
      },
      {
        id: '8',
        orderNumber: 'ORD-2024-008',
        customerName: 'Mariam Al-Mazroui',
        customerEmail: 'mariam@example.com',
        date: new Date(2024, 2, 9),
        items: [
          { productId: 'p12', productName: 'Embroidery Threads', quantity: 30, price: 4, total: 120 },
          { productId: 'p13', productName: 'Embroidery Needles', quantity: 10, price: 3, total: 30 }
        ],
        total: 150,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: 'Sharjah, UAE'
      },
      {
        id: '9',
        orderNumber: 'ORD-2024-009',
        customerName: 'Saeed Al-Nuaimi',
        customerEmail: 'saeed@example.com',
        date: new Date(2024, 2, 8),
        items: [
          { productId: 'p14', productName: 'Oil Paints', quantity: 4, price: 65, total: 260 }
        ],
        total: 260,
        status: 'shipped',
        paymentStatus: 'paid',
        shippingAddress: 'Ajman, UAE',
        trackingNumber: 'TRK345678'
      },
      {
        id: '10',
        orderNumber: 'ORD-2024-010',
        customerName: 'Sheikha Al-Dhaheri',
        customerEmail: 'sheikha@example.com',
        date: new Date(2024, 2, 7),
        items: [
          { productId: 'p15', productName: 'Drawing Paper', quantity: 50, price: 2, total: 100 },
          { productId: 'p16', productName: 'Charcoal Pencils', quantity: 12, price: 8, total: 96 }
        ],
        total: 196,
        status: 'processing',
        paymentStatus: 'unpaid',
        shippingAddress: 'Umm Al Quwain, UAE'
      }
    ];

    this.filteredOrders = [...this.orders];
    this.calculateTotalPages();
  }

  // Statistics
  getTotalOrdersCount(): number {
    return this.orders.length;
  }

  getPendingOrdersCount(): number {
    return this.orders.filter(o => o.status === 'pending').length;
  }

  getProcessingOrdersCount(): number {
    return this.orders.filter(o => o.status === 'processing').length;
  }

  getDeliveredOrdersCount(): number {
    return this.orders.filter(o => o.status === 'delivered').length;
  }

  getTotalRevenue(): number {
    return this.orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
  }

  // Search and Filter
  applyFilter(event: any): void {
    const query = event.target.value.toLowerCase();
    this.searchQuery = query;
    this.filterOrders();
  }

  filterByStatus(): void {
    this.filterOrders();
  }

  filterOrders(): void {
    let filtered = [...this.orders];

    // Search filter
    if (this.searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(this.searchQuery) ||
        order.customerName.toLowerCase().includes(this.searchQuery) ||
        order.customerEmail.toLowerCase().includes(this.searchQuery)
      );
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    // Date filter
    const today = new Date();
    if (this.selectedDateRange === 'today') {
      filtered = filtered.filter(order =>
        order.date.toDateString() === today.toDateString()
      );
    } else if (this.selectedDateRange === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter(order =>
        order.date.toDateString() === yesterday.toDateString()
      );
    } else if (this.selectedDateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(order => order.date >= weekAgo);
    } else if (this.selectedDateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(order => order.date >= monthAgo);
    }

    this.filteredOrders = filtered;
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  // Dropdown
  toggleDropdown(orderId: string): void {
    this.openDropdownId = this.openDropdownId === orderId ? null : orderId;
  }

  // Update order status
  updateOrderStatus(order: Order, status: string): void {
    order.status = status as Order['status'];
    this.openDropdownId = null;
    this.filterOrders();
  }

  // View order details
  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showOrderModal = true;
    this.openDropdownId = null;
  }

  // Open edit modal
  openEditOrder(order: Order): void {
    this.editOrder = JSON.parse(JSON.stringify(order)); // Deep copy
    this.showEditModal = true;
    this.openDropdownId = null;
  }

  // Close modals
  closeModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editOrder = null;
  }

  closeModalOnOutside(event: any): void {
    if (event.target.classList.contains('modal')) {
      this.closeModal();
    }
  }

  closeEditModalOnOutside(event: any): void {
    if (event.target.classList.contains('modal')) {
      this.closeEditModal();
    }
  }

  // Check step completion
  isStepCompleted(step: string): boolean {
    if (!this.selectedOrder) return false;

    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(this.selectedOrder.status);
    const stepIndex = steps.indexOf(step);

    return stepIndex <= currentIndex;
  }

  // Product management in edit mode
  addItem(): void {
    if (!this.editOrder) return;

    const newItem: OrderItem = {
      productId: 'new-' + Date.now(),
      productName: '',
      quantity: 1,
      price: 0,
      total: 0
    };

    this.editOrder.items.push(newItem);
  }

  removeItem(index: number): void {
    if (!this.editOrder) return;
    this.editOrder.items.splice(index, 1);
    this.calculateOrderTotal();
  }

  calculateOrderTotal(): void {
    if (!this.editOrder) return;

    this.editOrder.total = this.editOrder.items.reduce((sum, item) => {
      item.total = item.quantity * item.price;
      return sum + item.total;
    }, 0);
  }

  // Save changes
  saveOrderChanges(): void {
    if (!this.editOrder) return;

    // Calculate total
    this.calculateOrderTotal();

    // Find and update order in original list
    const index = this.orders.findIndex(o => o.id === this.editOrder!.id);
    if (index !== -1) {
      this.orders[index] = { ...this.editOrder };
    }

    // Update filtered list
    this.filterOrders();
    this.closeEditModal();
  }

  // Pagination
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  getPaginatedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredOrders.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Other actions
  exportOrders(): void {
    alert('Exporting orders to Excel...');
  }

  refreshOrders(): void {
    this.loadMockData();
    this.selectedStatus = 'all';
    this.selectedDateRange = 'today';
    this.searchQuery = '';
    this.filterOrders();
  }

  printInvoice(order: Order | null): void {
    if (!order) return;
    alert(`Printing invoice for order: ${order.orderNumber}`);
  }

  contactCustomer(order: Order): void {
    alert(`Contacting customer at: ${order.customerEmail}`);
  }

  formatCurrency(amount: number): string {
    return amount.toFixed(2) + ' AED';
  }

  
  formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

 formatFullDate(date: Date | undefined | null): string {
  if (!date) return 'Date not available';
  
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

  
  capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  
  safeGet(order: any, property: string): any {
    if (!order) return '';
    return order[property] || '';
  }

  
  isOrderSelected(): boolean {
    return this.selectedOrder !== null;
  }

  isEditOrder(): boolean {
    return this.editOrder !== null;
  }
}