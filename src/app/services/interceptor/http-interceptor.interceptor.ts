import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { message$ } from 'src/app/shared/components/alert/alert.component';
import { EAlertType } from 'src/app/shared/utils/alert-type.enum';
import { loading$ } from 'src/app/shared/components/loading/loading.component';

@Injectable()
export class HttpInterceptorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const reqClone = request.clone({
      headers: request.headers.set('authorId', '96'),
    });
    return next.handle(reqClone).pipe(catchError((error) => this.errorHandling(error)));
  }

  errorHandling(error: HttpErrorResponse) {
    loading$.next(false);
    let message = 'Ocurrió un error inesperado';
    if (error.error && typeof error.error === 'string') {
      try {
        const parsedError = JSON.parse(error.error);
        if (typeof parsedError === 'string') {
          const finalError = JSON.parse(parsedError);
          message = finalError.message ?? 'Recurso no encontrado';
        } else {
          message = parsedError.message ?? 'Recurso no encontrado';
        }
      } catch {
        message = 'Error desconocido';
      }
    } else if (error.error && typeof error.error === 'object') {
      message = error.error.message ?? 'Recurso no encontrado';
    }

    message$.next({
      description: message,
      type: EAlertType.ERROR,
    });

    return throwError(() => new Error(message));
  }
}
