import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';
import { LoginComponent } from './login.component';
import { CustomerAccountService } from '../../shared/customer-account.service';
import { TokenStorageService } from '../../_services/token-storage.service';
import { BrowserDetectorService } from '../../_services/browser-detector.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let mockTokenStorage: any;
  let mockAccountService: any;
  let mockBrowserDetect: any;

  beforeEach(async () => {
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
    mockBrowserDetect = { isMobile: false, getBrowser: () => 'Chrome' };

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

  it('ngOnInit sets isLoggedIn correctly based on token', () => {
    mockTokenStorage.getToken.and.returnValue('abc');
    component.ngOnInit();
    expect(component.isLoggedIn).toBeTrue();

    mockTokenStorage.getToken.and.returnValue(null);
    component.ngOnInit();
    expect(component.isLoggedIn).toBeFalse();
  });

  it('onSubmit for user role redirects to account', () => {
    component.ngOnInit();
    component.form.setValue({ email: 'a@b.com', password: '123456' });

    mockAccountService.login.and.returnValue(of({ access_token: 'tok' }));
    mockAccountService.getRole.and.returnValue('user');

    component.onSubmit();

    expect(component.submitted).toBeTrue();
    expect(mockAccountService.login).toHaveBeenCalledWith(jasmine.objectContaining({ email:'a@b.com', password:'123456' }));
    expect(mockTokenStorage.saveToken).toHaveBeenCalledWith('tok');
    expect(component.isLoginFailed).toBeFalse();
    expect(component.isLoggedIn).toBeTrue();
    expect(mockAccountService.redirectToAccount).toHaveBeenCalled();
    expect(mockAccountService.redirectToDashboard).not.toHaveBeenCalled();
  });

  it('onSubmit for admin role redirects to dashboard', () => {
    component.ngOnInit();
    component.form.setValue({ email: 'x@x.com', password: 'pwd' });

    mockAccountService.login.and.returnValue(of({ access_token: 'admintok' }));
    mockAccountService.getRole.and.returnValue('admin');

    component.onSubmit();

    expect(mockAccountService.login).toHaveBeenCalledWith(jasmine.objectContaining({ email:'x@x.com', password:'pwd' }));
    expect(mockTokenStorage.saveToken).toHaveBeenCalledWith('admintok');
    expect(mockAccountService.redirectToDashboard).toHaveBeenCalled();
    expect(mockAccountService.redirectToAccount).not.toHaveBeenCalled();
  });

  it('onSubmit sets error message for Unauthorized', () => {
    component.ngOnInit();
    component.form.setValue({ email: 'u@u.com', password: 'pw' });

    mockAccountService.login.and.returnValue(throwError(() => ({ error: 'Unauthorized' })));

    component.onSubmit();

    expect(component.isLoginFailed).toBeTrue();
    expect(component.error).toBe('Invalid email or password');
  });

  it('onSubmit sets error message for other errors', () => {
    component.ngOnInit();
    component.form.setValue({ email: 'u@u.com', password: 'pw' });

    mockAccountService.login.and.returnValue(throwError(() => ({ error: 'Some other error' })));

    component.onSubmit();

    expect(component.isLoginFailed).toBeTrue();
    expect(component.error).toBe('Some other error');
  });
});
