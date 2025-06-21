import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutComponent } from './checkout.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

// Mock các service sử dụng trong component
class MockPaymentService {
  validate(endpoint: string, payload: any) {
    return of({ message: 'Payment valid' });
  }
}
class MockInvoiceService {
  createInvoice(payload: any) {
    return of({ invoice_number: 12345 });
  }
}
class MockCartService {
  getItems() {
    return [{ id: 1, price: 100, quantity: 1, total: 100 }];
  }
  deleteItem(id: number) {}
  replaceQuantity(id: number, qty: number) {}
  emptyCart() {}
}
class MockCustomerAccountService {
  isLoggedIn() {
    return true;
  }
  getDetails() {
    return of({
      address: '123 Main',
      city: 'City',
      state: 'ST',
      country: 'Country',
      postcode: '0000'
    });
  }
  login(payload: any) {
    return of({ access_token: 'mock-token' });
  }
  getRole() {
    return ['user'];
  }
  authSub = { next: (val: string) => {} };
}
class MockTokenStorageService {
  saveToken(token: string) {}
}

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: PaymentService, useClass: MockPaymentService },
        { provide: InvoiceService, useClass: MockInvoiceService },
        { provide: CartService, useClass: MockCartService },
        { provide: CustomerAccountService, useClass: MockCustomerAccountService },
        { provide: TokenStorageService, useClass: MockTokenStorageService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should get total > 0 when items exist', () => {
    expect(component.getTotal()).toBeGreaterThan(0);
  });
});
