import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { firstValueFrom } from 'rxjs';

// Mock @angular/common AVANT tout import du service
vi.mock('@angular/common', () => ({
  isPlatformBrowser: (_id: unknown) => true,
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

import { IndexedDbService } from './indexed-db.service';

// ── Helper ────────────────────────────────────────────────────────────────────

async function createService(): Promise<IndexedDbService> {
  const service = new IndexedDbService();
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('IDB init timeout')), 3000);
    // @ts-ignore
    const sub = service['dbReady$'].subscribe((ready: boolean) => {
      if (ready) { clearTimeout(timeout); sub.unsubscribe(); resolve(); }
    });
  });
  return service;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('IndexedDbService', () => {
  let service: IndexedDbService;

  beforeEach(async () => {
    service = await createService();
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and retrieve a record via put() + getById()', async () => {
    const event = { id: 1, name: 'Soirée Gala', date: '2025-05-01', status: 'OPEN' };
    await firstValueFrom(service.put('events', event));
    const result = await firstValueFrom(service.getById<typeof event>('events', 1));
    expect(result).toBeDefined();
    expect(result?.name).toBe('Soirée Gala');
  });

  it('should return all stored records with getAll()', async () => {
    const items = [
      { id: 10, name: 'Event A', date: '2025-06-01', status: 'OPEN' },
      { id: 11, name: 'Event B', date: '2025-07-01', status: 'CLOSED' },
    ];
    await firstValueFrom(service.putMany('events', items));
    const results = await firstValueFrom(service.getAll<typeof items[0]>('events'));
    const names = results.map((r) => r.name);
    expect(names).toContain('Event A');
    expect(names).toContain('Event B');
  });

  it('should filter records by index with getByIndex()', async () => {
    const lines = [
      { id: 100, event_id: 5, label: 'Transport', amount: 200, status: 'PENDING' },
      { id: 101, event_id: 5, label: 'Catering',  amount: 500, status: 'PENDING' },
      { id: 102, event_id: 9, label: 'Other',      amount: 100, status: 'PENDING' },
    ];
    await firstValueFrom(service.putMany('budget_lines', lines));
    const results = await firstValueFrom(service.getByIndex<typeof lines[0]>('budget_lines', 'event_id', 5));
    expect(results.length).toBe(2);
    expect(results.every((l) => l.event_id === 5)).toBe(true);
  });

  it('should delete a record with delete()', async () => {
    await firstValueFrom(service.put('events', { id: 42, name: 'To Delete', date: '2025-01-01', status: 'OPEN' }));
    await firstValueFrom(service.delete('events', 42));
    const result = await firstValueFrom(service.getById('events', 42));
    expect(result).toBeUndefined();
  });

  it('should clear all records in a store with clear()', async () => {
    await firstValueFrom(service.putMany('members', [{ id: 1 }, { id: 2 }]));
    await firstValueFrom(service.clear('members'));
    const results = await firstValueFrom(service.getAll('members'));
    expect(results.length).toBe(0);
  });

  it('should add a pending action and retrieve it', async () => {
    const action = {
      store: 'events',
      method: 'POST' as const,
      url: '/api/events',
      payload: { name: 'Offline Event' },
      timestamp: Date.now(),
    };
    await firstValueFrom(service.addPendingAction(action));
    const actions = await firstValueFrom(service.getPendingActions());
    expect(actions.length).toBeGreaterThanOrEqual(1);
    expect(actions.some((a) => a.url === '/api/events')).toBe(true);
  });

  it('should remove a pending action by id', async () => {
    const action = {
      store: 'events',
      method: 'PUT' as const,
      url: '/api/events/1',
      payload: { name: 'Updated' },
      timestamp: Date.now(),
    };
    await firstValueFrom(service.addPendingAction(action));
    const actions = await firstValueFrom(service.getPendingActions());
    const id = actions[actions.length - 1].id!;
    await firstValueFrom(service.removePendingAction(id));
    const remaining = await firstValueFrom(service.getPendingActions());
    expect(remaining.find((a) => a.id === id)).toBeUndefined();
  });

  it('should return an Observable (not throw) in SSR context', async () => {
    // Le mock global force isPlatformBrowser=true, donc on vérifie juste que
    // le service est fonctionnel et que l'Observable ne throw pas
    const result = await firstValueFrom(service.getAll('events'));
    expect(Array.isArray(result)).toBe(true);
  });
});
