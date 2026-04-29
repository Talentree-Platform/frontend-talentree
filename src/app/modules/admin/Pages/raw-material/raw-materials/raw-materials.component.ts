import { ToastrService } from 'ngx-toastr';
import { RawMaterialService } from '../../../Services/raw-material.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableComponent } from '../../../Components/table/table.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RawMaterial } from '../../../core/Interfaces/iraw-material';
import { PaginationComponent } from '../../../Components/pagination/pagination.component';
import { RawMaterialDetailsComponent } from '../raw-material-details/raw-material-details.component';
import { RawMaterialFormComponent } from '../raw-material-form/raw-material-form.component';
import { RestockModalComponent } from '../restock-modal/restock-modal.component';

@Component({
  selector: 'app-raw-materials',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    PaginationComponent,
    RawMaterialDetailsComponent,
    RawMaterialFormComponent,
    RestockModalComponent,
  ],
  templateUrl: './raw-materials.component.html',
  styleUrl: './raw-materials.component.css'
})
export class RawMaterialListComponent implements OnInit, OnDestroy {

  constructor(
    private _RawMaterialService: RawMaterialService,
    private _ToastrService: ToastrService
  ) {}

  listSub!: Subscription;
  actionSub!: Subscription;

  // table data
  materials: RawMaterial[] = [];

  // selected
  selectedMaterial: RawMaterial | null = null;

  // modals
  isDetailsOpen = false;
  isFormOpen = false;
  isRestockOpen = false;
  isEditMode = false;

  // filters
  searchTerm = '';
  selectedCategory = '';
  selectedAvailability: boolean | undefined = undefined;
  categories = ['Fashion & Accessories', 'Handmade', 'Natural & Beauty Products'];

  // pagination
  pageIndex = 1;
  pageSize = 20;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;
  totalCount = 0;

  // stats
  availableCount = 0;
  outOfStockCount = 0;

  // table config
  columns = ['name', 'category', 'price', 'unit', 'stockQuantity', 'isAvailable', 'supplierName'];
  actions = ['view', 'edit', 'restock', 'delete'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.listSub = this._RawMaterialService.getRawMaterials({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      isAvailable: this.selectedAvailability,
    }).subscribe({
      next: (res) => {
        this.materials = res.data.data;
        this.totalPages = res.data.totalPages;
        this.hasNext = res.data.hasNext;
        this.hasPrevious = res.data.hasPrevious;
        this.pageIndex = res.data.pageIndex;
        this.totalCount = res.data.count;
        this.availableCount = res.data.data.filter(m => m.isAvailable).length;
        this.outOfStockCount = res.data.data.filter(m => !m.isAvailable).length;
      },
      error: (err) => {
        console.log(err);
        this._ToastrService.error('Failed to load materials', 'Talentree', { timeOut: 2000, closeButton: true });
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

  onFilterChange(): void {
    this.pageIndex = 1;
    this.load();
  }

  onAvailabilityChange(val: string): void {
    if (val === 'true') this.selectedAvailability = true;
    else if (val === 'false') this.selectedAvailability = false;
    else this.selectedAvailability = undefined;
    this.onFilterChange();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedAvailability = undefined;
    this.pageIndex = 1;
    this.load();
  }

  // ================================
  // table actions
  // ================================

  handleEvent(event: any): void {
    const action = event.action;
    const row: RawMaterial = event.row;
    this.selectedMaterial = row;

    if (action === 'view')    this.isDetailsOpen = true;
    if (action === 'edit')  { this.isEditMode = true;  this.isFormOpen = true; }
    if (action === 'restock') this.isRestockOpen = true;
    if (action === 'delete')  this.deleteMaterial(row);
  }

  deleteMaterial(material: RawMaterial): void {
    if (!confirm(`Delete "${material.name}"?`)) return;
    this.actionSub = this._RawMaterialService.deleteRawMaterial(material.id).subscribe({
      next: (res) => {
        this._ToastrService.warning(res.message ?? 'Material deleted', 'Talentree', { timeOut: 2000, closeButton: true });
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
    this.selectedMaterial = null;
    this.isEditMode = false;
    this.isFormOpen = true;
  }

  closeModals(): void {
    this.isDetailsOpen = false;
    this.isFormOpen = false;
    this.isRestockOpen = false;
    this.selectedMaterial = null;
    this.isEditMode = false;
  }

  onFormSaved(): void {
    this.closeModals();
    this.load();
    this._ToastrService.success(
      this.isEditMode ? 'Material updated!' : 'Material created!',
      'Talentree', { timeOut: 2000, closeButton: true }
    );
  }

  onRestocked(): void {
    this.closeModals();
    this.load();
    this._ToastrService.success('Stock updated!', 'Talentree', { timeOut: 2000, closeButton: true });
  }

  // ================================
  // pagination
  // ================================

  pageChangeEvent(page: number): void {
    this.pageIndex = page;
    this.load();
  }
}