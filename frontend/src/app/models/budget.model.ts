import { User } from './user.model';
import { Attachment } from './attachment.model';

export interface BudgetAttachment extends Attachment {
  id: number;
  budget_line_id: number;
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
  validation_status?: 'SOUMIS' | 'APPROUVE' | 'REFUSE';
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  attachments?: BudgetAttachment[];
}
