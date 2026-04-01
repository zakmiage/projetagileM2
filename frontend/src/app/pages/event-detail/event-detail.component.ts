import { Component, OnInit, inject } from '@angular/core';
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
  template: `
    <div class="space-y-6" *ngIf="event">
      <!-- Header -->
      <div class="flex items-center space-x-4">
        <a routerLink="/events" class="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-text">{{ event.name }}</h1>
          <p class="text-sm text-gray-500">{{ event.start_date | date:'longDate' }} - {{ event.capacity }} places max</p>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button 
            (click)="activeTab = 'budget'"
            [class.border-primary]="activeTab === 'budget'"
            [class.text-primary]="activeTab === 'budget'"
            [class.border-transparent]="activeTab !== 'budget'"
            [class.text-gray-500]="activeTab !== 'budget'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-primary transition"
          >
            Budget & FSDIE
          </button>
          
          <button 
            (click)="activeTab = 'participants'"
            [class.border-primary]="activeTab === 'participants'"
            [class.text-primary]="activeTab === 'participants'"
            [class.border-transparent]="activeTab !== 'participants'"
            [class.text-gray-500]="activeTab !== 'participants'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-primary transition"
          >
            Participants
          </button>
        </nav>
      </div>

      <!-- Tabs Content -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-100 p-6 min-h-[500px]">
        @if (activeTab === 'budget') {
          <app-budget-tab [eventId]="event.id"></app-budget-tab>
        } @else if (activeTab === 'participants') {
          <app-participants-tab [eventId]="event.id"></app-participants-tab>
        }
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="!event && !error" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    
    <!-- Error state -->
    <div *ngIf="error" class="p-4 bg-red-50 text-red-600 rounded-lg">
      {{ error }}
    </div>
  `
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  
  event?: Event;
  error?: string;
  activeTab: 'budget' | 'participants' = 'budget';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEvent(+id).subscribe({
        next: (ev) => this.event = ev,
        error: (err) => this.error = "Impossible de charger cet événement."
      });
    }
  }
}
