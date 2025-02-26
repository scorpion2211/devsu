import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AlertComponent, message$ } from './alert.component';
import { EAlertType } from '../../utils/alert-type.enum';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to message$ and show alert', fakeAsync(() => {
    const message = {
      description: 'Test alert',
      type: EAlertType.INFO,
    };
    message$.next(message);
    expect(component.message).toEqual(message);
    expect(component.showAlert).toBeTrue();
    tick(6000);
    fixture.detectChanges();
    expect(component.showAlert).toBe(false);
  }));

  it('should hide alert', () => {
    component.showAlert = true;
    component.hideAlert();
    expect(component.showAlert).toBeFalse();
  });

  it('should unsubscribe from message$ on component destruction', () => {
    spyOn(component.subscribe$, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.subscribe$.unsubscribe).toHaveBeenCalled();
  });
});
