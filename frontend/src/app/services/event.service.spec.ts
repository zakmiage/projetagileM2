import { describe, it, expect, afterEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

// Mock @angular/common et @angular/common/http avant tout import du service
// pour éviter le JIT compiler error lié à PlatformLocation
vi.mock('@angular/common', () => ({
  isPlatformBrowser: () => true,
}));
vi.mock('@angular/common/http', () => ({
  HttpClient: class MockHttpClient {},
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

import { EventService } from './event.service';
import { Event } from '../models/event.model';


// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockEvents: Event[] = [
  { id: 1, name: 'Soirée Gala',    date: '2025-05-01', status: 'OPEN',   location: 'Campus',  participants: [], budget_lines: [] } as any,
  { id: 2, name: 'Tournoi Sportif', date: '2025-06-15', status: 'CLOSED', location: 'Gymnase', participants: [], budget_lines: [] } as any,
];

// ── Factory ────────────────────────────────────────────────────────────────────

function buildService(isOnline: boolean) {
  const mockHttp = {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  };
  const mockIdb = {
    getAll:     vi.fn().mockReturnValue(of(mockEvents)),
    getById:    vi.fn().mockReturnValue(of(mockEvents[0])),
    put:        vi.fn().mockReturnValue(of(mockEvents[0])),
    putMany:    vi.fn().mockReturnValue(of(mockEvents)),
    delete:     vi.fn().mockReturnValue(of(undefined)),
    getByIndex: vi.fn().mockReturnValue(of([])),
  };
  const mockPwa = { isOnline };

  const service = new EventService();
  // @ts-ignore
  service['http'] = mockHttp;
  // @ts-ignore
  service['idb'] = mockIdb;
  // @ts-ignore
  service['pwa'] = mockPwa;

  return { service, mockHttp, mockIdb };
}

// ── Mode ONLINE ───────────────────────────────────────────────────────────────

describe('EventService — ONLINE', () => {
  afterEach(() => vi.clearAllMocks());

  it('should fetch events from API', async () => {
    const { service, mockHttp } = buildService(true);
    mockHttp.get.mockReturnValue(of({ success: true, data: mockEvents }));
    const events = await firstValueFrom(service.getEvents());
    expect(mockHttp.get).toHaveBeenCalledWith('http://localhost:3000/api/events');
    expect(events.length).toBe(2);
  });

  it('should cache events to IndexedDB after successful fetch', async () => {
    const { service, mockHttp, mockIdb } = buildService(true);
    mockHttp.get.mockReturnValue(of({ success: true, data: mockEvents }));
    await firstValueFrom(service.getEvents());
    expect(mockIdb.putMany).toHaveBeenCalledWith('events', mockEvents);
  });

  it('should fall back to IndexedDB when API fails', async () => {
    const { service, mockHttp, mockIdb } = buildService(true);
    mockHttp.get.mockReturnValue(throwError(() => new Error('Network error')));
    const events = await firstValueFrom(service.getEvents());
    expect(mockIdb.getAll).toHaveBeenCalledWith('events');
    expect(events).toEqual(mockEvents);
  });

  it('should fetch a single event and cache it in IndexedDB', async () => {
    const { service, mockHttp, mockIdb } = buildService(true);
    mockHttp.get.mockReturnValue(of({ success: true, data: mockEvents[0] }));
    const event = await firstValueFrom(service.getEvent(1));
    expect(event.id).toBe(1);
    expect(mockIdb.put).toHaveBeenCalledWith('events', mockEvents[0]);
  });

  it('should fall back to IDB for getEvent() when API fails', async () => {
    const { service, mockHttp, mockIdb } = buildService(true);
    mockHttp.get.mockReturnValue(throwError(() => new Error('Network error')));
    const event = await firstValueFrom(service.getEvent(1));
    expect(mockIdb.getById).toHaveBeenCalledWith('events', 1);
    expect(event.id).toBe(1);
  });

  it('should create an event and cache it', async () => {
    const { service, mockHttp, mockIdb } = buildService(true);
    const newEvent = { name: 'New', date: '2025-09-01', status: 'OPEN', location: 'Hall' };
    mockHttp.post.mockReturnValue(of({ success: true, data: { id: 3, ...newEvent } }));
    const created = await firstValueFrom(service.createEvent(newEvent as any));
    expect(created.id).toBe(3);
    expect(mockIdb.put).toHaveBeenCalled();
  });

  it('should update an event and sync to IDB', async () => {
    const { service, mockHttp, mockIdb } = buildService(true);
    const patch = { name: 'Updated', date: '2025-10-01', status: 'OPEN', location: 'Room' };
    mockHttp.put.mockReturnValue(of({ success: true, data: { id: 1, ...patch } }));
    const updated = await firstValueFrom(service.updateEvent(1, patch as any));
    expect(updated.name).toBe('Updated');
    expect(mockIdb.put).toHaveBeenCalled();
  });

  it('should delete an event and remove from IDB', async () => {
    const { service, mockHttp, mockIdb } = buildService(true);
    mockHttp.delete.mockReturnValue(of({ success: true }));
    const ok = await firstValueFrom(service.deleteEvent(1));
    expect(ok).toBe(true);
    expect(mockIdb.delete).toHaveBeenCalledWith('events', 1);
  });
});

// ── Mode OFFLINE ──────────────────────────────────────────────────────────────

describe('EventService — OFFLINE', () => {
  afterEach(() => vi.clearAllMocks());

  it('should serve getEvents() from IndexedDB without HTTP call', async () => {
    const { service, mockHttp, mockIdb } = buildService(false);
    const events = await firstValueFrom(service.getEvents());
    expect(mockHttp.get).not.toHaveBeenCalled();
    expect(mockIdb.getAll).toHaveBeenCalledWith('events');
    expect(events).toEqual(mockEvents);
  });

  it('should serve getEvent() from IndexedDB without HTTP call', async () => {
    const { service, mockHttp, mockIdb } = buildService(false);
    const event = await firstValueFrom(service.getEvent(1));
    expect(mockHttp.get).not.toHaveBeenCalled();
    expect(mockIdb.getById).toHaveBeenCalledWith('events', 1);
    expect(event.id).toBe(1);
  });

  it('should throw when event not found in IDB while offline', async () => {
    const { service, mockIdb } = buildService(false);
    mockIdb.getById.mockReturnValue(of(undefined));
    await expect(firstValueFrom(service.getEvent(99))).rejects.toThrow('99');
  });
});
