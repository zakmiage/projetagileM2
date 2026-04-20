import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BudgetTabComponent } from './budget-tab.component';
import { AuthService } from '../../../services/auth.service';
import { BudgetLine } from '../../../models/budget.model';
import { provideRouter } from '@angular/router';

// ============================================================
// TUF — BudgetTabComponent
// Tests unitaires fonctionnels (composant Angular)
// ============================================================

describe('BudgetTabComponent — Workflow Validation FSDIE', () => {
  let component: BudgetTabComponent;
  let authServiceSpy: Partial<AuthService>;
  let httpMock: HttpTestingController;

  const mockLine: BudgetLine = {
    id: 1,
    event_id: 1,
    type: 'EXPENSE',
    category: 'Logistique',
    label: 'Location salle',
    forecast_amount: 2000,
    is_fsdie_eligible: true,
    validation_status: 'SOUMIS',
    created_by: 1,
    created_at: '',
    updated_at: ''
  };

  beforeEach(async () => {
    authServiceSpy = {
      hasRole: ((...roles: string[]) => roles.includes('TRESORIER')) as AuthService['hasRole'],
      getRole: () => 'TRESORIER',
      isAuthenticated: () => true
    };

    await TestBed.configureTestingModule({
      imports: [BudgetTabComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(BudgetTabComponent);
    component = fixture.componentInstance;
    component['_eventId'] = 1;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // -------- isTresorier() --------

  it('isTresorier() doit retourner true pour le rôle TRESORIER', () => {
    expect(component.isTresorier()).toBe(true);
  });

  it('isTresorier() doit retourner false pour un rôle BUREAU', () => {
    (authServiceSpy as any).hasRole = (...roles: string[]) => roles.includes('BUREAU');
    expect(component.isTresorier()).toBe(false);
  });

  // -------- setStatus() --------

  it('setStatus() doit envoyer PATCH et mettre à jour line.validation_status', () => {
    const line = { ...mockLine };
    component.setStatus(line, 'APPROUVE');

    const req = httpMock.expectOne('http://localhost:3000/api/budget-lines/1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'APPROUVE' });

    req.flush(null);
    expect(line.validation_status).toBe('APPROUVE');
  });

  it('setStatus() doit mettre à jour le statut en REFUSE', () => {
    const line = { ...mockLine };
    component.setStatus(line, 'REFUSE');

    const req = httpMock.expectOne('http://localhost:3000/api/budget-lines/1/status');
    req.flush(null);
    expect(line.validation_status).toBe('REFUSE');
  });

  it('setStatus() doit remettre le statut en SOUMIS', () => {
    const line = { ...mockLine, validation_status: 'APPROUVE' as const };
    component.setStatus(line, 'SOUMIS');

    const req = httpMock.expectOne('http://localhost:3000/api/budget-lines/1/status');
    req.flush(null);
    expect(line.validation_status).toBe('SOUMIS');
  });
});
