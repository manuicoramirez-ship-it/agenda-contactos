import { TestBed } from '@angular/core/testing';
import { NotificationContainer } from './notification-container';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('NotificationContainer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationContainer],
      providers: [
        provideAnimations()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NotificationContainer);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});