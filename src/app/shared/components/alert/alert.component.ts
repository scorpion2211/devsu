import { Component, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IAlert } from '../../utils/alert.interface';
import { EAlertType } from '../../utils/alert-type.enum';

export const message$ = new BehaviorSubject<IAlert>({
  description: '',
  type: EAlertType.DEFAULT,
});

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnDestroy {
  @Input() message!: IAlert;
  showAlert = false;
  subscribe$ = new Subscription();
  enumTypes = EAlertType;

  constructor() {
    this.subscribe$ = message$.subscribe((data) => {
      this.message = data;
      if (data.description !== '') {
        this.showAlert = true;
        setTimeout(() => {
          this.showAlert = false;
        }, 5000);
      }
    });
  }

  hideAlert() {
    this.showAlert = false;
  }

  ngOnDestroy(): void {
    this.subscribe$.unsubscribe();
  }
}
