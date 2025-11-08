import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule]
})
export class UnauthorizedComponent {
  
  constructor(private router: Router) { }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
