import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { User } from 'src/app/contracts/user/user';
import { CreateUser } from 'src/app/contracts/user/create-user';
import { UpdateUser } from 'src/app/contracts/user/update-user';
import { UserService } from 'src/app/services/common/models/user.service';
import { OperationClaimService } from 'src/app/services/common/models/operation-claim.service';
import { UserOperationClaimService } from 'src/app/services/common/models/user-operation-claim.service';
import { OperationClaim } from 'src/app/contracts/operationClaim/operation-claim';
import { UserOperationClaim } from 'src/app/contracts/userOperationClaim/user-operation-claim';
import { CreateUserOperationClaim } from 'src/app/contracts/userOperationClaim/create-user-operation-claim';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    TagModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [ConfirmationService]
})
export class UsersComponent extends BaseComponent implements OnInit {

  users: User[] = [];
  allOperationClaims: OperationClaim[] = [];
  userOperationClaims: UserOperationClaim[] = [];

  displayDialog: boolean = false;
  dialogMode: 'create' | 'edit' = 'create';

  currentUser: User | null = null;
  userForm: CreateUser | UpdateUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  selectedRoles: OperationClaim[] = [];

  pageIndex: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  constructor(
    spinner: NgxSpinnerService,
    private userService: UserService,
    private operationClaimService: OperationClaimService,
    private userOperationClaimService: UserOperationClaimService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
    await this.loadOperationClaims();
    await this.loadUserOperationClaims();
  }

  async loadUsers(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      const response = await this.userService.list(this.pageIndex, this.pageSize);
      this.users = response.items;
      this.totalRecords = response.count;
    } catch (error) {
      this.toastr.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  async loadOperationClaims(): Promise<void> {
    try {
      const response = await this.operationClaimService.list(0, 100);
      this.allOperationClaims = response.items;
    } catch (error) {
      this.toastr.error('Roller yüklenirken hata oluştu');
    }
  }

  async loadUserOperationClaims(): Promise<void> {
    try {
      const response = await this.userOperationClaimService.list(0, 1000);
      this.userOperationClaims = response.items;
    } catch (error) {
      this.toastr.error('Kullanıcı rolleri yüklenirken hata oluştu');
    }
  }

  getUserRoles(userId: string): OperationClaim[] {
    const userClaimIds = this.userOperationClaims
      .filter(uc => uc.userId === userId)
      .map(uc => uc.operationClaimId);

    return this.allOperationClaims.filter(oc => userClaimIds.includes(oc.id));
  }

  openCreateDialog(): void {
    this.dialogMode = 'create';
    this.currentUser = null;
    this.userForm = {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    };
    this.selectedRoles = [];
    this.displayDialog = true;
  }

  async openEditDialog(user: User): Promise<void> {
    this.dialogMode = 'edit';
    this.currentUser = user;
    this.userForm = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    // Load user's current roles
    this.selectedRoles = this.getUserRoles(user.id);
    this.displayDialog = true;
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.currentUser = null;
    this.selectedRoles = [];
  }

  async saveUser(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);

    try {
      let savedUser: User;

      if (this.dialogMode === 'create') {
        savedUser = await this.userService.create(this.userForm as CreateUser);
        this.toastr.success('Kullanıcı başarıyla oluşturuldu');
      } else {
        savedUser = await this.userService.update(this.userForm as UpdateUser);
        this.toastr.success('Kullanıcı başarıyla güncellendi');
      }

      // Update user roles
      await this.updateUserRoles(savedUser.id);

      await this.loadUsers();
      await this.loadUserOperationClaims();
      this.hideDialog();

    } catch (error: any) {
      const errorMessage = error?.error?.message || 'İşlem sırasında hata oluştu';
      this.toastr.error(errorMessage);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  async updateUserRoles(userId: string): Promise<void> {
    // Get current user claims
    const currentClaims = this.userOperationClaims.filter(uc => uc.userId === userId);
    const currentClaimIds = currentClaims.map(uc => uc.operationClaimId);
    const selectedClaimIds = this.selectedRoles.map(role => role.id);

    // Remove claims that are no longer selected
    const claimsToRemove = currentClaims.filter(
      uc => !selectedClaimIds.includes(uc.operationClaimId)
    );

    for (const claim of claimsToRemove) {
      try {
        await this.userOperationClaimService.delete(claim.id);
      } catch (error) {
        console.error('Error removing claim:', error);
      }
    }

    // Add new claims
    const claimsToAdd = selectedClaimIds.filter(
      id => !currentClaimIds.includes(id)
    );

    for (const claimId of claimsToAdd) {
      try {
        const newClaim: CreateUserOperationClaim = {
          userId: userId,
          operationClaimId: claimId
        };
        await this.userOperationClaimService.create(newClaim);
      } catch (error) {
        console.error('Error adding claim:', error);
      }
    }
  }

  validateForm(): boolean {
    if (!this.userForm.firstName || !this.userForm.lastName || !this.userForm.email) {
      this.toastr.warning('Lütfen tüm zorunlu alanları doldurun');
      return false;
    }

    if (this.dialogMode === 'create' && !(this.userForm as CreateUser).password) {
      this.toastr.warning('Şifre alanı zorunludur');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userForm.email)) {
      this.toastr.warning('Geçerli bir email adresi girin');
      return false;
    }

    return true;
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `${user.firstName} ${user.lastName} kullanıcısını silmek istediğinizden emin misiniz?`,
      header: 'Silme Onayı',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        this.deleteUser(user.id);
      }
    });
  }

  async deleteUser(userId: string): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      await this.userService.delete(userId);
      this.toastr.success('Kullanıcı başarıyla silindi');
      await this.loadUsers();
      await this.loadUserOperationClaims();
    } catch (error) {
      this.toastr.error('Kullanıcı silinirken hata oluştu');
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  onPageChange(event: any): void {
    this.pageIndex = event.first / event.rows;
    this.pageSize = event.rows;
    this.loadUsers();
  }
}
