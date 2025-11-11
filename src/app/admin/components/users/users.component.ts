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
import { Role } from 'src/app/contracts/role/role';
import { RoleService } from 'src/app/services/common/models/role.service';
import { UserRoleService } from 'src/app/services/common/models/user-role.service';
import { OperationClaim } from 'src/app/contracts/operationClaim/operation-claim';
import { OperationClaimService } from 'src/app/services/common/models/operation-claim.service';
import { UserOperationClaimService } from 'src/app/services/common/models/user-operation-claim.service';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
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
    ChipModule,
    CardModule,
    ToolbarModule,
    DividerModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [ConfirmationService]
})
export class UsersComponent extends BaseComponent implements OnInit {

  users: User[] = [];
  allRoles: Role[] = [];
  allOperationClaims: OperationClaim[] = [];
  userRoles: any[] = [];
  userOperationClaims: any[] = [];

  displayDialog: boolean = false;
  dialogMode: 'create' | 'edit' = 'create';

  currentUser: User | null = null;
  userForm: CreateUser | UpdateUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  selectedRoles: Role[] = [];
  selectedExtraClaims: OperationClaim[] = [];

  pageIndex: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  constructor(
    spinner: NgxSpinnerService,
    private userService: UserService,
    private roleService: RoleService,
    private userRoleService: UserRoleService,
    private operationClaimService: OperationClaimService,
    private userOperationClaimService: UserOperationClaimService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
    await this.loadRoles();
    await this.loadOperationClaims();
    await this.loadUserRoles();
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

  async loadRoles(): Promise<void> {
    try {
      const response = await this.roleService.list(0, 100);
      this.allRoles = response.items;
    } catch (error) {
      console.warn('Roles endpoint bulunamadı. Backend henüz hazır olmayabilir.', error);
      this.allRoles = [];
    }
  }

  async loadOperationClaims(): Promise<void> {
    try {
      const response = await this.operationClaimService.list(0, 100);
      this.allOperationClaims = response.items;
    } catch (error) {
      console.warn('OperationClaims endpoint bulunamadı. Backend henüz hazır olmayabilir.', error);
      this.allOperationClaims = [];
    }
  }

  async loadUserRoles(): Promise<void> {
    try {
      // Backend'de list endpoint'i olmadığı için her user için ayrı ayrı yükleyelim
      this.userRoles = [];
      for (const user of this.users) {
        const roles = await this.userRoleService.getUserRoles(user.id);
        roles.forEach(role => {
          this.userRoles.push({
            id: role.id,
            userId: user.id,
            roleId: role.roleId
          });
        });
      }
    } catch (error) {
      console.warn('UserRoles yüklenirken hata oluştu.', error);
      this.userRoles = [];
    }
  }

  async loadUserOperationClaims(): Promise<void> {
    try {
      const response = await this.userOperationClaimService.list(0, 1000);
      this.userOperationClaims = response.items;
    } catch (error) {
      console.warn('UserOperationClaims endpoint bulunamadı. Backend henüz hazır olmayabilir.', error);
      this.userOperationClaims = [];
    }
  }

  getUserRoles(userId: string): Role[] {
    const userRoleIds = this.userRoles
      .filter(ur => ur.userId === userId)
      .map(ur => ur.roleId);

    return this.allRoles.filter(r => userRoleIds.includes(r.id));
  }

  getUserExtraClaims(userId: string): OperationClaim[] {
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
    this.selectedExtraClaims = [];
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

    // Load user's current roles and extra claims
    this.selectedRoles = this.getUserRoles(user.id);
    this.selectedExtraClaims = this.getUserExtraClaims(user.id);
    this.displayDialog = true;
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.currentUser = null;
    this.selectedRoles = [];
    this.selectedExtraClaims = [];
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

      // Update user roles and extra claims
      await this.updateUserRoles(savedUser.id);
      await this.updateUserExtraClaims(savedUser.id);

      await this.loadUsers();
      await this.loadUserRoles();
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
    // Get current user roles
    const currentRoles = this.userRoles.filter(ur => ur.userId === userId);
    const currentRoleIds = currentRoles.map(ur => ur.roleId);
    const selectedRoleIds = this.selectedRoles.map(role => role.id);

    // Remove roles that are no longer selected
    const rolesToRemove = currentRoles.filter(
      ur => !selectedRoleIds.includes(ur.roleId)
    );

    for (const role of rolesToRemove) {
      try {
        await this.userRoleService.delete(role.id);
      } catch (error) {
        console.error('Error removing role:', error);
      }
    }

    // Add new roles
    const rolesToAdd = selectedRoleIds.filter(
      id => !currentRoleIds.includes(id)
    );

    for (const roleId of rolesToAdd) {
      try {
        await this.userRoleService.create({
          userId: userId,
          roleId: roleId
        });
      } catch (error) {
        console.error('Error adding role:', error);
      }
    }
  }

  async updateUserExtraClaims(userId: string): Promise<void> {
    // Get current user extra claims
    const currentClaims = this.userOperationClaims.filter(uc => uc.userId === userId);
    const currentClaimIds = currentClaims.map(uc => uc.operationClaimId);
    const selectedClaimIds = this.selectedExtraClaims.map(claim => claim.id);

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
        await this.userOperationClaimService.create({
          userId: userId,
          operationClaimId: claimId
        });
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
      await this.loadUserRoles();
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

  getDialogHeader(): string {
    return this.dialogMode === 'create' ? 'Yeni Kullanıcı Ekle' : 'Kullanıcı Düzenle';
  }
}
