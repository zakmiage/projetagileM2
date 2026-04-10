import { Attachment } from './attachment.model';

export interface MemberAttachment extends Attachment {
  id: number;
  member_id: number;
  document_type: 'CERTIFICATE' | 'WAIVER' | 'PARENTAL_CONSENT' | string;
}

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  t_shirt_size?: string;
  allergies?: string;
  is_certificate_ok: boolean;
  is_waiver_ok: boolean;
  is_image_rights_ok: boolean;
  created_at: string;
  attachments?: MemberAttachment[];
}
