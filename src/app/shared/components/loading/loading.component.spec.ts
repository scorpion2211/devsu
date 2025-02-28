import { ComponentFixture, TestBed } from '@angular/core/testing';
import { loading$, LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading when loading service emits true', () => {
    loading$.next(true);
    expect(component.showLoading).toBeTrue();
  });

  it('should hide loading when loading service emits false', () => {
    loading$.next(false);
    expect(component.showLoading).toBeFalse();
  });

  afterEach(() => {
    fixture.destroy();
  });
});
