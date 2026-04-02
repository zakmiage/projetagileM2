import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse) {
    if (error instanceof HttpErrorResponse) {
      // Backend returned an unsuccessful response code
      console.error(`[API Error]: Status ${error.status}, Message: ${error.message}`);
      
      if (error.status === 404) {
        console.warn('API Endpoint not found (404). Falling back to mock data if available.');
        // Here we could trigger a toast or notification service
      } else if (error.status >= 500) {
        console.error('Server Error (500). The backend might be unreachable or crashing.');
      }
    } else {
      // A client-side or network error occurred.
      console.error('[Client Error]:', error.message);
    }
  }
}
