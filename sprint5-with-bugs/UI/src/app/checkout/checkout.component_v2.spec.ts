// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { CheckoutComponent } from './checkout.component';
// import { ReactiveFormsModule } from '@angular/forms';
// import { of, throwError } from 'rxjs';
// import { CartService } from '../_services/cart.service';
// import { CustomerAccountService } from '../shared/customer-account.service';
// import { TokenStorageService } from '../_services/token-storage.service';
// import { InvoiceService } from '../_services/invoice.service';
// import { PaymentService } from '../_services/payment.service';
// import { NO_ERRORS_SCHEMA } from '@angular/core';

// describe('CheckoutComponent', () => {
//   let component: CheckoutComponent;
//   let fixture: ComponentFixture<CheckoutComponent>;

//   const mockCartService = {
//     getItems: jasmine.createSpy().and.returnValue([
//       { id: 1, price: 100, quantity: 2, total: 200 },
//       { id: 2, price: 50, quantity: 1, total: 50 }
//     ]),
//     deleteItem: jasmine.createSpy(),
//     replaceQuantity: jasmine.createSpy(),
//     emptyCart: jasmine.createSpy()
//   };

//   const mockCustomerAccountService = {
//     isLoggedIn: jasmine.createSpy().and.returnValue(true),
//     getDetails: jasmine.createSpy().and.returnValue(of({
//       address: '123 St',
//       city: 'Hanoi',
//       state: 'HN',
//       country: 'VN',
//       postcode: '10000'
//     })),
//     login: jasmine.createSpy().and.returnValue(of({ access_token: 'mock-token' })),
//     getRole: jasmine.createSpy().and.returnValue(['ROLE_USER']),
//     authSub: { next: jasmine.createSpy() }
//   };

//   const mockTokenStorage = {
//     saveToken: jasmine.createSpy()
//   };

//   const mockInvoiceService = {
//     createInvoice: jasmine.createSpy().and.returnValue(of({ invoice_number: 123 }))
//   };

//   const mockPaymentService = {
//     validate: jasmine.createSpy().and.returnValue(of({ message: 'Payment valid' }))
//   };

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       declarations: [CheckoutComponent],
//       imports: [ReactiveFormsModule],
//       providers: [
//         { provide: CartService, useValue: mockCartService },
//         { provide: CustomerAccountService, useValue: mockCustomerAccountService },
//         { provide: TokenStorageService, useValue: mockTokenStorage },
//         { provide: InvoiceService, useValue: mockInvoiceService },
//         { provide: PaymentService, useValue: mockPaymentService }
//       ],
//       schemas: [NO_ERRORS_SCHEMA]
//     }).compileComponents();
//   });

//   beforeEach(() => {
//     fixture = TestBed.createComponent(CheckoutComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should initialize with total = 250 from cart items', () => {
//     expect(mockCartService.getItems).toHaveBeenCalled();
//     expect(component.total).toBe(250);
//   });

//   it('should delete item and recalculate total', () => {
//     component.delete(1);
//     expect(mockCartService.deleteItem).toHaveBeenCalledWith(1);
//     expect(component.items.length).toBe(2); // Do mock luôn trả lại 2 items
//     expect(component.total).toBe(250);
//   });

//   it('should initialize forms and login state in ngOnInit', () => {
//     component.ngOnInit();
//     expect(component.cusForm).toBeTruthy();
//     expect(component.cusAddress).toBeTruthy();
//     expect(component.cusPayment).toBeTruthy();
//     expect(component.isLoggedIn).toBeTrue();
//   });

//   it('should not login if form is invalid', () => {
//     component.cusForm.controls['email'].setValue('');
//     component.cusForm.controls['password'].setValue('');
//     component.onCusSubmit();
//     expect(mockCustomerAccountService.login).not.toHaveBeenCalled();
//   });

//   it('should login and set data when form is valid', () => {
//     component.cusForm.controls['email'].setValue('test@example.com');
//     component.cusForm.controls['password'].setValue('123456');
//     component.onCusSubmit();
//     expect(mockCustomerAccountService.login).toHaveBeenCalled();
//     expect(mockTokenStorage.saveToken).toHaveBeenCalledWith('mock-token');
//     expect(component.isLoggedIn).toBeTrue();
//     expect(component.roles).toEqual(['ROLE_USER']);
//   });

//   it('should handle login error', () => {
//     mockCustomerAccountService.login = jasmine.createSpy().and.returnValue(
//       throwError({ error: 'Unauthorized' })
//     );
//     component.cusForm.controls['email'].setValue('bad@example.com');
//     component.cusForm.controls['password'].setValue('wrongpass');
//     component.onCusSubmit();
//     expect(component.isLoginFailed).toBeTrue();
//     expect(component.customerError).toBe('Invalid email or password');
//   });

//   it('should call createInvoice and clear cart on finishFunction', () => {
//     component.customer = { id: 99 };
//     component.cusAddress.setValue({
//       address: 'abc',
//       city: 'xyz',
//       state: 'HN',
//       country: 'VN',
//       postcode: '10000'
//     });
//     component.cusPayment.setValue({
//       payment_method: 'Bank Transfer',
//       account_name: 'John Doe',
//       account_number: '123456'
//     });

//     spyOn(component, 'checkPayment').and.returnValue(of(true));
//     component.finishFunction();

//     expect(mockInvoiceService.createInvoice).toHaveBeenCalled();
//     expect(component.paid).toBeTrue();
//     expect(component.invoice_number).toBe(123);
//     expect(mockCartService.emptyCart).toHaveBeenCalled();
//   });

//   it('should validate payment in checkPayment()', () => {
//     window.localStorage.setItem('PAYMENT_ENDPOINT', 'mock-endpoint');
//     component.cusPayment.setValue({
//       payment_method: 'Credit Card',
//       account_name: 'Test User',
//       account_number: '987654'
//     });

//     const result$ = component.checkPayment();
//     expect(mockPaymentService.validate).toHaveBeenCalledWith('mock-endpoint', {
//       method: 'Credit Card',
//       account_name: 'Test User',
//       account_number: '987654'
//     });

//     result$.subscribe(res => {
//       expect(res).toBeTrue();
//       expect(component.paymentMessage).toBe('Payment valid');
//     });
//   });

//   it('should update quantity within valid range', () => {
//     const event = { target: { value: '3' } } as any;
//     const item = { id: 1 };
//     component.updateQuantity(event, item);
//     expect(mockCartService.replaceQuantity).toHaveBeenCalledWith(1, 3);
//   });

//   it('should clamp quantity above 10 to 10', () => {
//     const event = { target: { value: '50' } } as any;
//     const item = { id: 1 };
//     component.updateQuantity(event, item);
//     expect(mockCartService.replaceQuantity).toHaveBeenCalledWith(1, 10);
//   });
// });
