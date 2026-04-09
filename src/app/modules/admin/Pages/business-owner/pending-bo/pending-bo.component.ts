import {  ToastrService } from 'ngx-toastr';
import { AdminService } from './../../../core/Services/admin.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableComponent } from "../../../Components/table/table.component";
import { TitleCasePipe } from '@angular/common';
import { Subscription, timeInterval, timeout } from 'rxjs';
import { BusinessOwner } from '../../../core/Interfaces/ibusiness-owner';
import { PaginationComponent } from "../../../Components/pagination/pagination.component";
import { BoDetailsComponent } from '../bo-details/bo-details.component';
import { ApproveOwnerComponent } from '../approve-owner/approve-owner.component';


@Component({
  selector: 'app-pending-bo',
  standalone: true,
  imports: [TableComponent, TitleCasePipe, PaginationComponent , BoDetailsComponent , ApproveOwnerComponent ],
  templateUrl: './pending-bo.component.html',
  styleUrl: './pending-bo.component.css'
})
export class PendingBoComponent implements OnInit, OnDestroy {

  constructor(private _AdminService: AdminService ,private _ToastrService: ToastrService) {}

  AdminSub!: Subscription;
  ApprovalSub!:Subscription;
  rejectionSub!:Subscription;
  

  // table data
  pendingOwners!: BusinessOwner[];

  // selected owner
  selectedBusinessOwner: BusinessOwner | null = null;

  // modals
  isDetailsOpen = false;
  isApproveOpen = false;

  // pagination
  hasNext!: boolean;
  hasPrevious!: boolean;
  pageIndex: number = 1;
  pageSize: number = 20;
  totalPages!: number;
  // for top cards
  totalPendingOwners!:number;
  AutoApprovalOwners!:number;
  ManualApprovalOwners!:number;


  ngOnInit(){
    this.laodPendingOwners();
  }

  laodPendingOwners(){
    this.AdminSub = this._AdminService
      .getPendingBusinessOwner({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      })
      .subscribe({
        next:(res)=>{
          console.log(res);

          this.pendingOwners = res.data.data;
          this.hasNext = res.data.hasNext;
          this.hasPrevious = res.data.hasPrevious;
          this.totalPages = res.data.totalPages;
          this.pageIndex = res.data.pageIndex;
          this.totalPendingOwners=res.data.count;
          this.AutoApprovalOwners=res.data.data.filter(item => item.willAutoApprove).length;
          this.ManualApprovalOwners=res.data.data.filter(item => !item.willAutoApprove).length;
        },
        error:(err)=>{
          console.log(err);
        }
      })
  }

  ngOnDestroy(){
    if(this.AdminSub){
      this.AdminSub.unsubscribe();
    }
    if(this.ApprovalSub){
      this.ApprovalSub.unsubscribe();
    }
  }


  // ================================
  // table actions
  // ================================

  handelevent(event:any){

    const action = event.action;
    const row = event.row;

    this.selectedBusinessOwner = row;

    if(action === 'view'){
      this.isDetailsOpen = true;
    }

    if(action === 'approve'){
      this.isApproveOpen = true;
    }

    if(action === 'reject'){
      console.log("reject clicked", row);
    }

  }


  // ================================
  // modal actions
  // ================================

  closeModal(){
    this.isDetailsOpen = false;
    this.isApproveOpen = false;
    this.selectedBusinessOwner = null;
  }


  onApprove(owner:BusinessOwner|null){

    console.log("approved", owner);

    // هنا ممكن تنادي API approve
    this.ApprovalSub=this._AdminService.ApproveOwner(owner?.profileId, '').subscribe({
      next:(res)=>{console.log(res);
        this.closeModal();
        this._ToastrService.success(res.message , 'Talentree', {timeOut:2000 , closeButton:true})
        
      },
      error:(err)=>{console.log(err);
        this._ToastrService.error(err.error.message , 'Talentree', {timeOut:2000 , closeButton:true})
      }
    });

  }


  onReject(owner:BusinessOwner|null){

    console.log("rejected", owner);

    // call reject API
    this.rejectionSub=this._AdminService.rejectOwner(owner?.profileId , '').subscribe({
      next:(res)=>{console.log(res);
        this._ToastrService.warning(res.message,'Talentree',{timeOut:2000 , closeButton:true})
      },
      error:(err)=>{
        console.log(err);
        this._ToastrService.error(err.error.message , 'Talentree', {timeOut:2000 , closeButton:true})
        
      }
    })
  }


  onSendMessage(){

    console.log("send message to");

  }


  noteEvent(note:string){
    console.log("note:", note);
  }


  // ================================
  // pagination
  // ================================

  pageChangeEvent(event:any){

    this.pageIndex = event;

    this.laodPendingOwners();

  }

}