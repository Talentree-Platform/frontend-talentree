import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../Services/supplier.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Supplier } from '../../../core/Interfaces/isupplier';
import { TableComponent } from '../../../Components/table/table.component';
import { PaginationComponent } from '../../../Components/pagination/pagination.component';
import { SupplierDetailsComponent } from '../supplier-details/supplier-details.component';
import { SupplierFormComponent } from '../supplier-form/supplier-form.component';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    PaginationComponent,
    SupplierDetailsComponent,
    SupplierFormComponent
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SupplierListComponent implements OnInit, OnDestroy {

  constructor(
    private _SupplierService: SupplierService,
    private _ToastrService: ToastrService
  ) {}

  listSub!: Subscription;
  actionSub!: Subscription;

  // table data
  suppliers: Supplier[] = [];

  // selected
  selectedSupplier: Supplier | null = null;

  // modals
  isDetailsOpen = false;
  isFormOpen = false;
  isEditMode = false;

  // filters
  searchTerm = '';
  selectedActive: boolean | undefined = undefined;

  // pagination
  pageIndex = 1;
  pageSize = 20;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;
  totalCount = 0;

  // stats
  activeCount = 0;
  inactiveCount = 0;

  // table config
  columns = ['name', 'email', 'phone', 'city', 'country', 'contactPerson', 'materialCount', 'isActive'];
  actions = ['view', 'edit', 'delete'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.listSub = this._SupplierService.getSuppliers({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      isActive: this.selectedActive,
    }).subscribe({
      next: (res) => {
        this.suppliers = res.data.data;
        this.totalPages = res.data.totalPages;
        this.hasNext = res.data.hasNext;
        this.hasPrevious = res.data.hasPrevious;
        this.pageIndex = res.data.pageIndex;
        this.totalCount = res.data.count;
        this.activeCount = res.data.data.filter(s => s.isActive).length;
        this.inactiveCount = res.data.data.filter(s => !s.isActive).length;
      },
      error: (err) => {
        console.log(err);
        this._ToastrService.error('Failed to load suppliers', 'Talentree', { timeOut: 2000, closeButton: true });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.listSub) this.listSub.unsubscribe();
    if (this.actionSub) this.actionSub.unsubscribe();
  }

  // ================================
  // filters
  // ================================

  onSearch(): void {
    this.pageIndex = 1;
    this.load();
  }

  onActiveChange(val: string): void {
    if (val === 'true') this.selectedActive = true;
    else if (val === 'false') this.selectedActive = false;
    else this.selectedActive = undefined;
    this.pageIndex = 1;
    this.load();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedActive = undefined;
    this.pageIndex = 1;
    this.load();
  }

  // ================================
  // table actions
  // ================================

  handleEvent(event: any): void {
    const action = event.action;
    const row: Supplier = event.row;
    this.selectedSupplier = row;

    if (action === 'view')  this.isDetailsOpen = true;
    if (action === 'edit') { this.isEditMode = true; this.isFormOpen = true; }
    if (action === 'delete') this.deleteSupplier(row);
  }

  deleteSupplier(supplier: Supplier): void {
    if (!confirm(`Delete supplier "${supplier.name}"?`)) return;
    this.actionSub = this._SupplierService.deleteSupplier(supplier.id).subscribe({
      next: (res) => {
        this._ToastrService.warning(res.message ?? 'Supplier deleted', 'Talentree', { timeOut: 2000, closeButton: true });
        this.load();
      },
      error: (err) => {
        this._ToastrService.error(err.error?.message ?? 'Failed to delete', 'Talentree', { timeOut: 2000, closeButton: true });
      }
    });
  }

  // ================================
  // modal actions
  // ================================

  openCreateForm(): void {
    this.selectedSupplier = null;
    this.isEditMode = false;
    this.isFormOpen = true;
  }

  closeModals(): void {
    this.isDetailsOpen = false;
    this.isFormOpen = false;
    this.selectedSupplier = null;
    this.isEditMode = false;
  }

  onFormSaved(): void {
    this.closeModals();
    this.load();
    this._ToastrService.success(
      this.isEditMode ? 'Supplier updated!' : 'Supplier created!',
      'Talentree', { timeOut: 2000, closeButton: true }
    );
  }

  // ================================
  // pagination
  // ================================

  pageChangeEvent(page: number): void {
    this.pageIndex = page;
    this.load();
  }
}