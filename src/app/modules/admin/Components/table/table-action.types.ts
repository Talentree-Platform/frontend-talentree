/** Emitted when a row action button is clicked or row opens details */
export interface TableRowActionEvent<T = Record<string, unknown>> {
  row: T;
  action: string;
}

export type TableColumnType = 'text' | 'date' | 'email' | 'phone' | 'badge';
