import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input() totalPages! :number;
  @Input() pageIndex! :number;
  @Input() hasPrevious! :boolean;
  @Input() hasNext! :boolean;
  @Output() pageChange = new EventEmitter<number>();

  nextPage(){
    if(this.pageIndex<this.totalPages && this.pageIndex>0){
      this.pageIndex++;
      this.pageChange.emit(this.pageIndex);
    }
  }
  previousPage(){
    if(this.pageIndex>1 ){
      this.pageIndex--;
      this.pageChange.emit(this.pageIndex);
    }

  }
  goToPage(pageNumber:number){
    this.pageIndex = pageNumber;      
    this.pageChange.emit(this.pageIndex);
  }
}
