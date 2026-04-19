import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { ChangeDetectorRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

describe('DashboardComponent (Logic Unit Tests)', () => {
  let component: DashboardComponent;
  let mockDashboardService: any;
  let mockChangeDetectorRef: any;

  beforeEach(() => {
    mockDashboardService = {
      getAllEvents: vi.fn(),
      getEventStats: vi.fn()
    };

    mockChangeDetectorRef = {
      detectChanges: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    });

    runInInjectionContext(injector, () => {
      component = new DashboardComponent();
    });
  });

  it('devrait sélectionner l\'événement futur le plus proche lors de l\'initialisation', () => {
    const today = new Date();
    
    const pastEvent = {
        id: 1, name: 'Passé', start_date: new Date(today.getTime() - 86400000).toISOString() // Hier
    };
    const futureCloseEvent = {
        id: 2, name: 'Futur Proche', start_date: new Date(today.getTime() + 86400000).toISOString() // Demain
    };
    const futureFarEvent = {
        id: 3, name: 'Futur Loin', start_date: new Date(today.getTime() + 1000000000).toISOString() // Dans longtemps
    };

    // Le backend renvoie souvent trié par date DESC (supposons cet ordre)
    mockDashboardService.getAllEvents.mockReturnValue(of([futureFarEvent, futureCloseEvent, pastEvent]));
    mockDashboardService.getEventStats.mockReturnValue(of({ kpis: {} }));

    component.ngOnInit();

    // Doit avoir sélectionné l'événement "Futur Proche"
    expect(component.selectedEventId).toBe(2);
    expect(mockDashboardService.getEventStats).toHaveBeenCalledWith(2);
  });

  it('devrait identifier correctement si l\'événement sélectionné est à venir ou déjà passé', () => {
    component.events = [
        { id: 99, name: 'Event', start_date: new Date(Date.now() + 10000).toISOString(), end_date: null, capacity: null }
    ];
    component.selectedEventId = 99;

    expect(component.isUpcomingEvent).toBe(true);

    component.events[0].start_date = new Date(Date.now() - 10000).toISOString();
    expect(component.isUpcomingEvent).toBe(false);
  });
});
