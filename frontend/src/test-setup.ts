/**
 * Setup global pour Vitest — initialise l'environnement Angular TestBed.
 * Les templateUrl sont résolus via le plugin Vite dans vitest.config.ts.
 */

// Polyfill indexedDB pour jsdom (nécessaire pour BudgetService → IndexedDbService)
import 'fake-indexeddb/auto';

import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: true } }
);

// Reset TestBed après chaque test pour éviter "already instantiated"
afterEach(() => {
  TestBed.resetTestingModule();
});


