import { User } from './user.model';

export interface BudgetAttachment {
  id: number;
  budget_line_id: number;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}

export interface BudgetLine {
  id: number;
  event_id: number;
  type: 'REVENUE' | 'EXPENSE';
  category: string;
  label: string;
  forecast_amount: number;
  actual_amount?: number;
  is_fsdie_eligible: boolean;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  attachments?: BudgetAttachment[];
}
