import { TitleCasePipe, NgClass, DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BusinessOwner } from '../../core/Interfaces/ibusiness-owner';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TitleCasePipe, NgClass, DatePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Input() columns : string[]=[];
  @Input() data : any[]=[];
  @Input() hasActions: boolean = false;
  @Input() actions : string[] =[];
  @Input() btnColor :string[]=[];
  @Output() actionClick = new EventEmitter<{row: any, action: string}>();
  @Output() openDetails = new EventEmitter<{row: any, action: string}>();

  onAction(row:any , action :string ){
    this.actionClick.emit({row,action})
  }

  //['ownerName','businessName','email','phoneNumber','businessCategory','submittedAt','statusText']
  // for special styling
  getColumnClass(col: string) {

  if(col === 'ownerName'){
    return 'name-column';
  }
  if(col === 'businessCategory'){
    return 'category-column';
  }
  if(col === 'businessName'){
    return 'business-name';
  }
  
  return '';
}

  getBadgeColor(category: string) {

  if (category === 'Fashion & Accessories') {
    return '#F8C8DC'; // pastel pink
  }

  if (category === 'Handmade') {
    return '#FFD6A5'; // pastel peach
  }

  if (category === 'Natural & Beauty Products') {
    return '#CDEAC0'; // pastel green
  }

  return null; 
}

// [actions]="['view' ,'approve' , 'reject']"
addButtonStyle(action:string){
  if(action ==='view'){
    return 'btn-view'
  }  
  if(action ==='approve'){
    return 'btn-approve'
  }  
  if(action ==='reject'){
    return 'btn-reject'
  }  


  return null;}

  isValidPhone(phone: string): boolean {
  // مثال: الرقم لازم يكون 11 رقم و يبدأ بـ 010 أو 011 أو 012
  const phoneRegex = /^(010|011|012|015)\d{8}$/;
  return phoneRegex.test(phone);
}
  isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

formatPhone(phone: string): string {
  // مثال: 01012345678 → 010-1234-5678
  if (!phone) return '';
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}
openOwnerDetails(row:any , action:string){
  this.openDetails.emit({row, action});
}
}
