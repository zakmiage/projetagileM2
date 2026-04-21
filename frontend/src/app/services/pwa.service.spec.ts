import { describe, it, expect, afterEach, vi } from 'vitest';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

// Mock @angular/common avant tout import du service
vi.mock('@angular/common', () => ({
  isPlatformBrowser: () => true,
}));
vi.mock('@angular/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@angular/core')>();
  return {
    ...actual,
    inject: (token: unknown) => {
      if (token === actual.PLATFORM_ID) return 'browser';
      return undefined;
    },
  };
});

import { PwaService } from './pwa.service';

// ── Helper ────────────────────────────────────────────────────────────────────

function buildService(isOnline: boolean) {
  const mockRegister  = vi.fn().mockResolvedValue({ scope: '/', addEventListener: vi.fn(), installing: null });
  const mockPostMessage = vi.fn();

  Object.defineProperty(globalThis, 'navigator', {
    writable: true, configurable: true,
    value: {
      onLine: isOnline,
      serviceWorker: {
        register: mockRegister,
        controller: isOnline ? { postMessage: mockPostMessage } : null,
      },
    },
  });

  if (typeof (globalThis as any).window === 'undefined') {
    Object.defineProperty(globalThis, 'window', {
      writable: true, configurable: true,
      value: { addEventListener: vi.fn() },
    });
  }

  const service = new PwaService();
  return { service, mockRegister, mockPostMessage };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PwaService', () => {
  afterEach(() => { vi.clearAllMocks(); vi.restoreAllMocks(); });

  it('should be created', () => {
    const { service } = buildService(true);
    expect(service).toBeTruthy();
  });

  it('isOnline getter should return true when network is up', () => {
    const { service } = buildService(true);
    // @ts-ignore
    service['_isOnline$'].next(true);
    expect(service.isOnline).toBe(true);
  });

  it('isOnline getter should return false when network is down', () => {
    const { service } = buildService(false);
    // @ts-ignore
    service['_isOnline$'].next(false);
    expect(service.isOnline).toBe(false);
  });

  it('isOnline$ should emit the correct sequence of states', async () => {
    const { service } = buildService(true);
    // @ts-ignore
    const subject: BehaviorSubject<boolean> = service['_isOnline$'];
    const emissions: boolean[] = [];

    const sub = service.isOnline$.subscribe((v) => emissions.push(v));
    subject.next(false);
    subject.next(true);
    sub.unsubscribe();

    expect(emissions).toContain(false);
    expect(emissions).toContain(true);
  });

  it('should call navigator.serviceWorker.register with /sw.js', async () => {
    const { service, mockRegister } = buildService(true);
    await service.registerServiceWorker();
    expect(mockRegister).toHaveBeenCalledWith('/sw.js', { scope: '/' });
  });

  it('should set swRegistered$ to true after successful SW registration', async () => {
    const { service } = buildService(true);
    await service.registerServiceWorker();
    // @ts-ignore
    expect(service['_swRegistered$'].value).toBe(true);
  });

  it('should not throw when serviceWorker API is unavailable', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      writable: true, configurable: true,
      value: { onLine: true },
    });
    const service = new PwaService();
    await expect(service.registerServiceWorker()).resolves.toBeUndefined();
  });

  it('should handle SW registration failure gracefully', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      writable: true, configurable: true,
      value: {
        onLine: true,
        serviceWorker: {
          register: vi.fn().mockRejectedValue(new Error('SW registration failed')),
          controller: null,
        },
      },
    });
    const service = new PwaService();
    await expect(service.registerServiceWorker()).resolves.toBeUndefined();
    // @ts-ignore
    expect(service['_swRegistered$'].value).toBe(false);
  });
});
