import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { QuarryModeratorService } from 'src/app/services/common/models/quarry-moderator.service';
import { ToastrService } from 'ngx-toastr';
import { Role } from 'src/app/contracts/enums/role.enum';

interface ModeratorQuarry {
  moderatorId: string;
  moderatorName: string;
  quarryId: string;
  quarryName: string;
}

@Component({
  selector: 'app-moderator-management',
  templateUrl: './moderator-management.component.html',
  styleUrls: ['./moderator-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule
  ]
})
export class ModeratorManagementComponent implements OnInit {
  assignmentForm: FormGroup;
  moderators: any[] = [];
  quarries: any[] = [];
  assignments: ModeratorQuarry[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private quarryModeratorService: QuarryModeratorService,
    private toastr: ToastrService
  ) {
    this.assignmentForm = this.fb.group({
      userId: ['', Validators.required],
      quarryId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadModerators();
    this.loadQuarries();
    this.loadAssignments();
  }

  loadModerators(): void {
    this.loading = true;
    // Bu metodu UserService üzerinden implement edin
    // this.userService.getList({ pageIndex: 0, pageSize: 100 }).subscribe({
    //   next: (response) => {
    //     this.moderators = response.items.filter(user => 
    //       user.roles?.includes(Role.Moderator)
    //     );
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     this.toastr.error('Moderatörler yüklenirken hata oluştu');
    //     this.loading = false;
    //   }
    // });
  }

  loadQuarries(): void {
    // Bu metodu QuarryService üzerinden implement edin
    // this.quarryService.getList({ pageIndex: 0, pageSize: 100 }).subscribe({
    //   next: (response) => {
    //     this.quarries = response.items;
    //   },
    //   error: (error) => {
    //     this.toastr.error('Ocaklar yüklenirken hata oluştu');
    //   }
    // });
  }

  loadAssignments(): void {
    // Backend'de tüm assignment'ları getiren endpoint eklenmelidir
    // Şimdilik boş bırakıyoruz
  }

  assignQuarry(): void {
    if (this.assignmentForm.invalid) {
      this.toastr.warning('Lütfen tüm alanları doldurun');
      return;
    }

    this.loading = true;
    const formValue = this.assignmentForm.value;

    this.quarryModeratorService.assignQuarryToModerator(formValue).subscribe({
      next: (response) => {
        this.toastr.success('Ocak ataması başarılı');
        this.assignmentForm.reset();
        this.loadAssignments();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Atama sırasında hata oluştu');
        this.loading = false;
      }
    });
  }

  removeAssignment(userId: string, quarryId: string): void {
    if (!confirm('Bu atamayı kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    this.loading = true;
    this.quarryModeratorService.removeQuarryFromModerator(userId, quarryId).subscribe({
      next: () => {
        this.toastr.success('Atama kaldırıldı');
        this.loadAssignments();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Atama kaldırılırken hata oluştu');
        this.loading = false;
      }
    });
  }

  getUserQuarries(userId: string): void {
    this.quarryModeratorService.getUserQuarries(userId).subscribe({
      next: (response) => {
        console.log('User quarries:', response.quarries);
      },
      error: (error) => {
        console.error('Error loading user quarries:', error);
      }
    });
  }
}
