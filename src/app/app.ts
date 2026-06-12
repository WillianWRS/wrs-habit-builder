import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppToastComponent } from './shared/components/app-toast/app-toast.component';
import { HabitFormModalComponent } from './shared/components/habit-form-modal/habit-form-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HabitFormModalComponent, AppToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
