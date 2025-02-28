import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { HttpInterceptorInterceptor } from './http-interceptor.interceptor';
import { of, throwError, Subject } from 'rxjs';
import { message$ } from 'src/app/shared/components/alert/alert.component';
import { EAlertType } from 'src/app/shared/utils/alert-type.enum';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('HttpInterceptorInterceptor', () => {
  let interceptor: HttpInterceptorInterceptor;
  let nextHandler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpInterceptorInterceptor],
    });

    interceptor = TestBed.inject(HttpInterceptorInterceptor);
    nextHandler = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should intercept and add authorId header to the request', () => {
    const request = new HttpRequest('GET', '/api/data');

    nextHandler.handle.and.returnValue(of({} as HttpEvent<any>));

    interceptor.intercept(request, nextHandler).subscribe();

    expect(nextHandler.handle).toHaveBeenCalledOnceWith(jasmine.any(HttpRequest));

    const modifiedRequest = nextHandler.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(modifiedRequest.headers.get('authorId')).toEqual('96');
  });

  it('should handle HttpErrorResponse and log error message', () => {
    const errorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: JSON.stringify({ message: 'Server crashed' }),
    });

    spyOn(message$, 'next');
    nextHandler.handle.and.returnValue(throwError(() => errorResponse));

    interceptor.intercept(new HttpRequest('GET', '/api/data'), nextHandler).subscribe({
      error: (error) => {
        expect(error.message).toEqual('Server crashed');
        expect(message$.next).toHaveBeenCalledWith({
          description: 'Server crashed',
          type: EAlertType.ERROR,
        });
      },
    });
  });
});
