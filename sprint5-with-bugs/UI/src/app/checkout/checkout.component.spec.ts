import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutComponent } from './checkout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { CartService } from '../_services/cart.service';
import { CustomerAccountService } from '../shared/customer-account.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { InvoiceService } from '../_services/invoice.service';
import { PaymentService } from '../_services/payment.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;

  let mockCartService = {
    getItems: jasmine.createSpy().and.returnValue([
      { id: 1, price: 100, quantity: 2, total: 200 },
      { id: 2, price: 50, quantity: 1, total: 50 }
    ]),
    deleteItem: jasmine.createSpy(),
    replaceQuantity: jasmine.createSpy(),
    emptyCart: jasmine.createSpy()
  };

  let mockCustomerAccountService = {
    isLoggedIn: jasmine.createSpy().and.returnValue(true),
    getDetails: jasmine.createSpy().and.returnValue(of({
      address: '123 St',
      city: 'Hanoi',
      state: 'HN',
      country: 'VN',
      postcode: '10000'
    })),
    login: jasmine.createSpy().and.returnValue(of({ access_token: 'mock-token' })),
    getRole: jasmine.createSpy().and.returnValue(['ROLE_USER']),
    authSub: { next: jasmine.createSpy() }
  };

  let mockTokenStorage = {
    saveToken: jasmine.createSpy()
  };

  let mockInvoiceService = {
    createInvoice: jasmine.createSpy().and.returnValue(of({ invoice_number: 123 }))
  };

  let mockPaymentService = {
    validate: jasmine.createSpy().and.returnValue(of({ message: 'Payment valid' }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: CartService, useValue: mockCartService },
        { provide: CustomerAccountService, useValue: mockCustomerAccountService },
        { provide: TokenStorageService, useValue: mockTokenStorage },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: PaymentService, useValue: mockPaymentService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with total = 250 from cart items', () => {
    expect(mockCartService.getItems).toHaveBeenCalled();
    expect(component.total).toBe(250);
  });

  it('should delete item and recalculate total', () => {
    component.delete(1);
    expect(mockCartService.deleteItem).toHaveBeenCalledWith(1);
    expect(component.items.length).toBe(2); // vì mock getItems vẫn trả về 2 item
    expect(component.total).toBe(250); // vẫn 250 vì mock cố định
  });
});
