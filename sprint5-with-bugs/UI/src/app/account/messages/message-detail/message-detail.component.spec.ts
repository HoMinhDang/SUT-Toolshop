import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageDetailComponent } from './message-detail.component';
import { ContactService } from '../_services/contact.service'; // import service
import { HttpClientTestingModule } from '@angular/common/http/testing'; // import module

describe('MessageDetailComponent', () => {
  let component: MessageDetailComponent;
  let fixture: ComponentFixture<MessageDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessageDetailComponent ],
      imports: [ HttpClientTestingModule ], // ✅ thêm để mock HttpClient
      providers: [ ContactService ] // ✅ thêm nếu bạn inject service vào component
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
