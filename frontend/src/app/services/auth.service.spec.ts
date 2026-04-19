import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn()
    };
    service = new AuthService(mockRouter as unknown as Router);
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format credentials properly and store in localStorage on valid login', () => {
    const success = service.login('toto@mail.com', 'toto');
    expect(success).toBe(true);
    
    // Check localstorage
    const storedStr = localStorage.getItem('kubik_auth_session');
    expect(storedStr).toBeDefined();
    if(storedStr) {
      const data = JSON.parse(storedStr);
      expect(data.email).toBe('toto@mail.com');
      expect(data.expiresAt).toBeGreaterThan(Date.now());
    }
  });

  it('should reject invalid credentials', () => {
    const success = service.login('fake@mail.com', 'wrong');
    expect(success).toBe(false);
    expect(localStorage.getItem('kubik_auth_session')).toBeNull();
  });

  it('should return true for isAuthenticated if session is valid', () => {
    service.login('toto@mail.com', 'toto');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should logout and redirect', () => {
    service.login('toto@mail.com', 'toto');
    service.logout();
    expect(localStorage.getItem('kubik_auth_session')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
