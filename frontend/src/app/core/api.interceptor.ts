import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = 'http://localhost:3000/api';
  
  // Clone the request to add the new header and url
  const apiReq = req.clone({
    url: req.url.startsWith('http') ? req.url : `${apiUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`,
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });

  return next(apiReq);
};
