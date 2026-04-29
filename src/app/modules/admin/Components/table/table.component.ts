import { TitleCasePipe, NgClass, DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableColumnType, TableRowActionEvent } from './table-action.types';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TitleCasePipe, NgClass, DatePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Input() columns: string[] = [];
  /** Accepts any row-shaped objects (e.g. `BusinessOwner[]`); avoids strict `Record` index-signature issues. */
  @Input() data: unknown[] = [];
  @Input() hasActions = false;
  @Input() actions: string[] = [];
  @Input() btnColor: string[] = [];
  /** Maps column key → CSS class string (e.g. `name-column`) */
  @Input() columnStyles: Record<string, string> = {};
  /** Maps column key → how the cell is rendered */
  @Input() columnTypes: Record<string, TableColumnType> = {};
  /** Optional map of cell value → background color for `badge` columns */
  @Input() badgeColors: Record<string, string> = {};
  @Input() sortable = false;

  @Output() actionClick = new EventEmitter<TableRowActionEvent>();
  @Output() openDetails = new EventEmitter<TableRowActionEvent>();

  private sortColumn: string | null = null;
  private sortDirection: 'asc' | 'desc' = 'asc';

  get viewRows(): Record<string, unknown>[] {
    const rows = [...this.data] as Record<string, unknown>[];
    if (!this.sortable || !this.sortColumn) {
      return rows;
    }
    const key = this.sortColumn;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    const type = this.getColumnType(key);
    rows.sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (va == null && vb == null) return 0;
      if (va == null) return 1 * dir;
      if (vb == null) return -1 * dir;
      let cmp = 0;
      if (type === 'date') {
        cmp = new Date(String(va)).getTime() - new Date(String(vb)).getTime();
      } else {
        cmp = String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' });
      }
      return cmp * dir;
    });
    return rows;
  }

  onHeaderClick(col: string): void {
    if (!this.sortable) return;
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  isSortedColumn(col: string): boolean {
    return this.sortColumn === col;
  }

  isSortedAsc(col: string): boolean {
    return this.sortColumn === col && this.sortDirection === 'asc';
  }

  isSortedDesc(col: string): boolean {
    return this.sortColumn === col && this.sortDirection === 'desc';
  }

  getColumnType(col: string): TableColumnType {
    return this.columnTypes[col] ?? 'text';
  }

  getCellClass(col: string): string {
    return this.columnStyles[col] ?? '';
  }

  getBadgeColor(value: unknown): string | null {
    const key = String(value ?? '');
    if (this.badgeColors[key]) {
      return this.badgeColors[key];
    }
    return null;
  }

  addButtonStyle(action: string): string | null {
    if (action === 'view') return 'btn-view';
    if (action === 'approve') return 'btn-approve';
    if (action === 'reject') return 'btn-reject';
    return null;
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    return phoneRegex.test(phone);
  }

  isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  asString(value: unknown): string {
    return value == null ? '' : String(value);
  }

  /** Narrows `unknown` for Angular's `DatePipe` (template type-check). */
  asDateInput(value: unknown): string | number | Date | null {
    if (value == null) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number' || typeof value === 'string') return value;
    return null;
  }

  onAction(row: Record<string, unknown>, action: string, event: MouseEvent): void {
    event.stopPropagation();
    this.actionClick.emit({ row, action });
  }

  openOwnerDetails(row: Record<string, unknown>, action: string): void {
    this.openDetails.emit({ row, action });
  }

  trackRow(_index: number, row: Record<string, unknown>): string | number {
    const id = row['profileId'];
    if (typeof id === 'number' || typeof id === 'string') return id;
    const uid = row['userId'];
    if (typeof uid === 'string') return uid;
    return _index;
  }
}
