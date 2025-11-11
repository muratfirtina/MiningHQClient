import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { QuarryModeratorService } from 'src/app/services/common/models/quarry-moderator.service';
import { UserService } from 'src/app/services/common/models/user.service';
import { QuarryService } from 'src/app/services/common/models/quarry.service';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
    CardModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    DividerModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService]
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
    private userService: UserService,
    private quarryService: QuarryService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {
    this.assignmentForm = this.fb.group({
      userId: ['', Validators.required],
      quarryId: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadModerators();
    await this.loadQuarries();
    await this.loadAssignments();
  }

  async loadModerators(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.userService.list(0, 100);
      // Filter users with Moderator role - this will need to be implemented based on your user structure
      this.moderators = response.items.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`
      }));
    } catch (error) {
      this.toastr.error('Moderatörler yüklenirken hata oluştu');
    } finally {
      this.loading = false;
    }
  }

  async loadQuarries(): Promise<void> {
    try {
      const response = await this.quarryService.list(0, 100);
      this.quarries = response.items;
    } catch (error) {
      this.toastr.error('Ocaklar yüklenirken hata oluştu');
    }
  }

  async loadAssignments(): Promise<void> {
    this.loading = true;
    try {
      // TODO: Implement backend endpoint to get all assignments
      // For now, this is a placeholder
      this.assignments = [];
    } catch (error) {
      this.toastr.error('Atamalar yüklenirken hata oluştu');
    } finally {
      this.loading = false;
    }
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

  confirmRemoveAssignment(userId: string, quarryId: string): void {
    this.confirmationService.confirm({
      message: 'Bu atamayı kaldırmak istediğinizden emin misiniz?',
      header: 'Atama Kaldırma Onayı',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        this.removeAssignment(userId, quarryId);
      }
    });
  }

  removeAssignment(userId: string, quarryId: string): void {
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
