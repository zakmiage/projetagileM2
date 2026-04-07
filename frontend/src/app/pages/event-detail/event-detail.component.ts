import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { BudgetTabComponent } from './budget-tab/budget-tab.component';
import { ParticipantsTabComponent } from './participants-tab/participants-tab.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BudgetTabComponent, ParticipantsTabComponent],
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);
  
  event?: Event;
  error?: string;
  activeTab: 'budget' | 'participants' = 'budget';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEvent(+id).subscribe({
        next: (ev) => {
          this.event = ev;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = "Impossible de charger cet événement.";
          this.cdr.detectChanges();
        }
      });
    }
  }
}
