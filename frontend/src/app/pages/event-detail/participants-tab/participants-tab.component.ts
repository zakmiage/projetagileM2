import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { MemberService } from '../../../services/member.service';
import { EventParticipant } from '../../../models/event.model';
import { Member } from '../../../models/member.model';

@Component({
  selector: 'app-participants-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participants-tab.component.html',
  styleUrls: ['./participants-tab.component.css']
})
export class ParticipantsTabComponent implements OnInit {
  @Input() eventId!: number;
  private eventService = inject(EventService);
  private memberService = inject(MemberService);
  private cdr = inject(ChangeDetectorRef);

  participants: EventParticipant[] = [];

  // Formulaire d'ajout
  form = {
    first_name: '',
    last_name: '',
    email: '',
    is_image_rights_ok: false
  };

  // Recherche dans l'annuaire pour pré-remplir
  directoryMembers: Member[] = [];
  searchQuery = '';
  showResults = false;

  ngOnInit() {
    this.loadParticipants();
    this.memberService.getMembers().subscribe(members => {
      this.directoryMembers = members;
      this.cdr.detectChanges();
    });
  }

  loadParticipants() {
    this.eventService.getEvent(this.eventId).subscribe(ev => {
      this.participants = ev.participants || [];
      this.cdr.detectChanges();
    });
  }

  /** Membres de l'annuaire non encore inscrits, filtrés par searchQuery */
  filteredDirectory(): Member[] {
    if (!this.searchQuery || this.searchQuery.length < 2) return [];
    const q = this.searchQuery.toLowerCase();
    const registeredEmails = new Set(this.participants.map(p => p.email));
    return this.directoryMembers
      .filter(m => !registeredEmails.has(m.email))
      .filter(m =>
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }

  /** Pré-remplir le formulaire depuis un adhérent sélectionné */
  prefillFromMember(m: Member) {
    this.form.first_name = m.first_name;
    this.form.last_name = m.last_name;
    this.form.email = m.email;
    this.form.is_image_rights_ok = m.is_image_rights_ok;
    this.searchQuery = '';
    this.showResults = false;
  }

  clearForm() {
    this.form = { first_name: '', last_name: '', email: '', is_image_rights_ok: false };
    this.searchQuery = '';
  }

  isFormValid(): boolean {
    return this.form.first_name.trim() !== '' &&
           this.form.last_name.trim() !== '' &&
           this.form.email.trim() !== '';
  }

  addParticipant() {
    if (!this.isFormValid()) return;

    this.eventService.addParticipant(this.eventId, {
      first_name: this.form.first_name.trim(),
      last_name: this.form.last_name.trim(),
      email: this.form.email.trim(),
      is_image_rights_ok: this.form.is_image_rights_ok
    }).subscribe({
      next: () => {
        this.clearForm();
        this.loadParticipants();
      },
      error: (err) => alert(err.message)
    });
  }

  removeParticipant(p: EventParticipant) {
    if (confirm(`Désinscrire ${p.first_name} ${p.last_name} ?`)) {
      this.eventService.removeParticipant(this.eventId, p.id).subscribe(() => {
        this.loadParticipants();
      });
    }
  }
}
