import { Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

export const loading$ = new BehaviorSubject<boolean>(false);
@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnDestroy {
  public showLoading = false;
  private subscribe$ = new Subscription();

  constructor() {
    this.subscribe$ = loading$.subscribe((show) => {
      this.showLoading = show;
    });
  }

  ngOnDestroy(): void {
    this.subscribe$.unsubscribe();
  }
}
