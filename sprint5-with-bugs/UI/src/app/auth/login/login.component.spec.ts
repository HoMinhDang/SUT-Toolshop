import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';
import { LoginComponent } from './login.component';
import { CustomerAccountService } from '../../shared/customer-account.service';
import { TokenStorageService } from '../../_services/token-storage.service';
import { BrowserDetectorService } from '../../_services/browser-detector.service';
import { User } from '../../models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // Mocks
  let mockTokenStorage: any;
  let mockAccountService: any;
  let mockBrowserDetect: any;

  beforeEach(async () => {
    // tạo Subject để giả lập authSub.next
    const authSub = new Subject<string>();

    mockTokenStorage = {
      getToken: jasmine.createSpy('getToken'),
      saveToken: jasmine.createSpy('saveToken')
    };

    mockAccountService = {
      login: jasmine.createSpy('login'),
      authSub: authSub,
      getRole: jasmine.createSpy('getRole'),
      redirectToAccount: jasmine.createSpy('redirectToAccount'),
      redirectToDashboard: jasmine.createSpy('redirectToDashboard')
    };

    mockBrowserDetect = {
      isMobile: false,
      getBrowser: () => 'Chrome'
    };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: TokenStorageService, useValue: mockTokenStorage },
        { provide: CustomerAccountService, useValue: mockAccountService },
        { provide: BrowserDetectorService, useValue: mockBrowserDetect }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit sets isLoggedIn true if token exists', () => {
    mockTokenStorage.getToken.and.returnValue('abc');
    component.ngOnInit();
    expect(component.isLoggedIn).toBeTrue();
    // form luôn được tạo
    expect(component.form).toBeTruthy();
  });

  it('ngOnInit sets isLoggedIn false if no token', () => {
    mockTokenStorage.getToken.and.returnValue(null);
    component.ngOnInit();
    expect(component.isLoggedIn).toBeFalse();
  });

  it('onSubmit success with role user calls redirectToAccount', () => {
    // chuẩn bị form valid
    component.ngOnInit();
    component.form.setValue({ email: 'a@b.com', password: '123456' });

    // login trả về access_token
    mockAccountService.login.and.returnValue(of({ access_token: 'tok' }));
    // getRole trả về 'user'
    mockAccountService.getRole.and.returnValue('user');

    component.onSubmit();

    expect(component.submitted).toBeTrue();
    expect(mockAccountService.login).toHaveBeenCalledWith(<User>{
      email: 'a@b.com',
      password: '123456'
    });
    expect(mockTokenStorage.saveToken).toHaveBeenCalledWith('tok');
    expect(component.isLoginFailed).toBeFalse();
    expect(component.isLoggedIn).toBeTrue();
    expect(mockAccountService.authSub.observers.length).toBeGreaterThan(0);
    expect(mockAccountService.redirectToAccount).toHaveBeenCalled();
    expect(mockAccountService.redirectToDashboard).not.toHaveBeenCalled();
  });

  it('onSubmit success with role admin calls redirectToDashboard', () => {
    component.ngOnInit();
    component.form.setValue({ email: 'x@x.com', password: 'pwd' });

    mockAccountService.login.and.returnValue(of({ access_token: 'admintok' }));
    mockAccountService.getRole.and.returnValue('admin');

    component.onSubmit();

    expect(mockTokenStorage.saveToken).toHaveBeenCalledWith('admintok');
    expect(mockAccountService.redirectToDashboard).toHaveBeenCalled();
    expect(mockAccountService.redirectToAccount).not.toHaveBeenCalled();
  });

  it('onSubmit error Unauthorized sets error message', () => {
    component.ngOnInit();
    component.form.setValue({ email: 'u@u.com', password: 'pw' });

    const httpError = { error: 'Unauthorized' };
    mockAccountService.login.and.returnValue(throwError(() => httpError));

    component.onSubmit();

    expect(component.isLoginFailed).toBeTrue();
    expect(component.error).toBe('Invalid email or password');
  });

  it('onSubmit error other sets error to err.error', () => {
    component.ngOnInit();
    component.form.setValue({ email: 'u@u.com', password: 'pw' });

    const httpError = { error: 'Some other error' };
    mockAccountService.login.and.returnValue(throwError(() => httpError));

    component.onSubmit();

    expect(component.error).toBe('Some other error');
    expect(component.isLoginFailed).toBeTrue();
  });
});
