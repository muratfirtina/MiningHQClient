import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-quarry-add',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <i class="fas fa-mountain fa-5x text-warning mb-4"></i>
          <h3>Yeni Ocak Ekle</h3>
          <p class="text-muted mb-4">Ocak ekleme işlemi için admin panelini kullanın</p>
          <a routerLink="/admin/quarries/quarry-add" class="btn btn-warning btn-lg">
            <i class="fas fa-arrow-right"></i> Admin Panele Git
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fa-5x {
      opacity: 0.7;
    }
  `]
})
export class QuarryAddComponent implements OnInit {
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // Auto redirect after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/admin/quarries/quarry-add']);
    }, 2000);
  }
}
