import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { Member, MemberAttachment } from '../../models/member.model';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.component.html'
})
export class MembersComponent implements OnInit {
  private memberService = inject(MemberService);
  
  members: Member[] = [];
  searchQuery = '';
  
  selectedMember: Member | null = null;
  editedMember!: Member;
  isNewMember = false;
  
  // Tableau de gestion dynamique des inputs d'allergies
  parsedAllergies: string[] = [];

  ngOnInit() {
    this.memberService.getMembers().subscribe(data => {
      this.members = data;
    });
  }

  filteredMembers() {
    if (!this.searchQuery) return this.members;
    const q = this.searchQuery.toLowerCase();
    return this.members.filter(m => 
      m.first_name.toLowerCase().includes(q) || 
      m.last_name.toLowerCase().includes(q) || 
      m.email.toLowerCase().includes(q)
    );
  }

  trackByIndex(index: number, item: any) {
    return index;
  }

  openAddModal() {
    this.isNewMember = true;
    const newMemberTemplate: Partial<Member> = {
      first_name: '', last_name: '', email: '',
      t_shirt_size: 'M', allergies: '',
      is_certificate_ok: false, is_waiver_ok: false, is_image_rights_ok: false,
      attachments: []
    };
    this.selectedMember = newMemberTemplate as Member; // Trick display
    this.editedMember = JSON.parse(JSON.stringify(newMemberTemplate));
    this.parsedAllergies = [];
  }

  openModal(member: Member) {
    this.isNewMember = false;
    this.selectedMember = member;
    this.editedMember = JSON.parse(JSON.stringify(member));
    if (!this.editedMember.attachments) this.editedMember.attachments = [];
    
    // Parse les allergies ou set un array vide
    if (this.editedMember.allergies) {
      this.parsedAllergies = this.editedMember.allergies.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else {
      this.parsedAllergies = [];
    }
  }

  closeModal() {
    this.selectedMember = null;
    this.isNewMember = false;
  }

  addAllergy() {
    this.parsedAllergies.push('');
  }

  removeAllergy(index: number) {
    this.parsedAllergies.splice(index, 1);
  }

  saveMember() {
    if (!this.editedMember.first_name || !this.editedMember.last_name) return;

    // Reconstruire la string depuis les inputs dynamiques
    const filtered = this.parsedAllergies.map(s => s.trim()).filter(s => s.length > 0);
    this.editedMember.allergies = filtered.length > 0 ? filtered.join(', ') : '';

    if (this.isNewMember) {
      this.memberService.createMember(this.editedMember as Omit<Member, 'id' | 'created_at' | 'updated_at'>).subscribe({
        next: (created) => {
          this.members = [...this.members, created];
          this.closeModal();
        },
        error: () => alert("Erreur lors de la création")
      });
    } else {
      this.memberService.updateMember(this.editedMember.id, this.editedMember).subscribe({
        next: (updated) => {
          const index = this.members.findIndex(m => m.id === updated.id);
          if (index > -1) {
            this.members[index] = updated;
          }
          this.closeModal();
        },
        error: () => alert("Erreur lors de la mise a jour")
      });
    }
  }

  triggerUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*, application/pdf';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // Demander le type de document pour être propre (Mock simple)
        const docType = prompt("Type de document ? (Ex: CERTIFICAT, DECHARGE, AUTRE)", "AUTRE");
        
        const fileUrl = URL.createObjectURL(file);
        const mockAttachment: MemberAttachment = {
          id: Math.floor(Math.random() * 1000),
          member_id: this.editedMember.id,
          document_type: docType || 'AUTRE',
          file_name: file.name,
          file_path: fileUrl,
          uploaded_at: new Date().toISOString()
        };
        
        this.editedMember.attachments?.push(mockAttachment);
      }
    };
    
    input.click();
  }

  viewAttachment(att: MemberAttachment) {
    window.open(att.file_path, '_blank');
  }
}
