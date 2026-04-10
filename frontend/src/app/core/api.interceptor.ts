import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = 'http://localhost:3000/api';

  const resolvedUrl = req.url.startsWith('http')
    ? req.url
    : `${apiUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`;

  const isFormData = req.body instanceof FormData;

  // Keep browser-managed boundary for multipart/form-data uploads.
  const apiReq = req.clone(
    isFormData
      ? { url: resolvedUrl }
      : {
          url: resolvedUrl,
          setHeaders: {
            'Content-Type': 'application/json'
          }
        }
  );

  return next(apiReq);
};
