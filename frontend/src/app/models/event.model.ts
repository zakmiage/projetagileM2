import { BudgetLine } from './budget.model';

/**
 * Inscrit à un événement — entité INDÉPENDANTE des adhérents (Member).
 * Un participant n'est pas nécessairement adhérent de l'asso.
 * Seule la décharge droit à l'image est requise pour un event.
 */
export interface EventParticipant {
  id: number;
  event_id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_image_rights_ok: boolean;
  has_deposit: boolean;
  registered_at: string;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  capacity: number;
  created_at: string;
  participants?: EventParticipant[];
  budget_lines?: BudgetLine[];
}
