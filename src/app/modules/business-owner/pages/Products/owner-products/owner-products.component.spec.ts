import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OwnerProductsComponent } from './owner-products.component';

describe('OwnerProductsComponent', () => {
  let component: OwnerProductsComponent;
  let fixture: ComponentFixture<OwnerProductsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerProductsComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        {
          provide: ToastrService,
          useValue: { success: jasmine.createSpy('success'), info: jasmine.createSpy('info'), warning: jasmine.createSpy('warning') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerProductsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne('/api/BusinessOwnerProducts').flush({ success: true, data: [] });
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
