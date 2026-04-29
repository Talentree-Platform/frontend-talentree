import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AdminProductHomeComponent } from './admin-product-home.component';
import { AdminService } from '../../../core/services/admin.service';

describe('AdminProductHomeComponent', () => {
  let component: AdminProductHomeComponent;
  let fixture: ComponentFixture<AdminProductHomeComponent>;

  beforeEach(async () => {
    const adminStub = {
      getPendingProducts: () =>
        of({
          success: true,
          data: {
            data: [],
            pageIndex: 1,
            pageSize: 20,
            count: 0,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false,
            firstItemIndex: 0,
            lastItemIndex: 0
          },
          message: '',
          errors: [],
          timestamp: ''
        })
    };

    await TestBed.configureTestingModule({
      imports: [AdminProductHomeComponent],
      providers: [{ provide: AdminService, useValue: adminStub }]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AdminProductHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
