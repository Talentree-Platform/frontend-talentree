import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, output, ElementRef, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerMarketplaceService } from '../../Core/services/customer-marketplace.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss'],
})
export class ProductSearchComponent implements OnInit, OnDestroy {
  readonly searched = output<string>();

  protected readonly svc    = inject(CustomerMarketplaceService);
  private  readonly router  = inject(Router);
  private  readonly elRef   = inject(ElementRef);

  searchQuery = '';

  ngOnInit(): void {
    this.searchQuery = this.svc.filters().search;
    this.svc.initAutocomplete();
  }

  ngOnDestroy(): void {
    this.svc.closeAutocomplete();
  }

  onInput(): void {
    this.svc.pushAutocompleteQuery(this.searchQuery);
    if (!this.searchQuery) this.svc.autocompleteVisible.set(false);
  }

  onSearch(): void {
    this.svc.closeAutocomplete();
    this.svc.updateFilters({ search: this.searchQuery });
    this.searched.emit(this.searchQuery);
    this.router.navigate(['/customer/customerProduct'], {
      queryParams: this.searchQuery ? { search: this.searchQuery } : {}
    });
  }

  selectSuggestion(name: string): void {
    this.searchQuery = name;
    this.svc.closeAutocomplete();
    this.onSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.svc.closeAutocomplete();
    this.svc.updateFilters({ search: '' });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(e.target)) {
      this.svc.closeAutocomplete();
    }
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.onSearch();
    if (e.key === 'Escape') this.svc.closeAutocomplete();
  }
}