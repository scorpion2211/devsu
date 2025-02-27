import { HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { message$ } from '../components/alert/alert.component';
import { throwError } from 'rxjs';
import { EAlertType } from './alert-type.enum';

/* export function errorHandling(
  error: HttpErrorResponse,
  loadingService: LoadingService,
  message = '',
) {
  loadingService.loading$.next(false);
  let newMessage = message ? message : 'Ocurrió un error inesperado';
  if (error.error) {
    newMessage = error.error.message || message;
    console.error('Error:', newMessage);
  }
  message$.next({
    description: newMessage,
    type: EAlertType.ERROR,
  });
  return throwError(() => new Error(error.error?.message || 'Error desconocido'));
}
 */
