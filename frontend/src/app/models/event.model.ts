import { Member } from './member.model';
import { BudgetLine } from './budget.model';

export interface EventRegistration {
  id: number;
  event_id: number;
  member_id: number;
  has_deposit: boolean;
  registered_at: string;
  member?: Member;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  capacity: number;
  created_at: string;
  registrations?: EventRegistration[];
  budget_lines?: BudgetLine[];
}
