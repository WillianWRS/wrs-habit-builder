import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HabitFormModalComponent } from './shared/components/habit-form-modal/habit-form-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HabitFormModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
