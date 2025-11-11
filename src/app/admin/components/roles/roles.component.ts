import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { Role } from 'src/app/contracts/role/role';
import { CreateRole } from 'src/app/contracts/role/create-role';
import { UpdateRole } from 'src/app/contracts/role/update-role';
import { RoleService } from 'src/app/services/common/models/role.service';
import { OperationClaim } from 'src/app/contracts/operationClaim/operation-claim';
import { OperationClaimService } from 'src/app/services/common/models/operation-claim.service';
import { RoleOperationClaimService } from 'src/app/services/common/models/role-operation-claim.service';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    ConfirmDialogModule,
    TooltipModule,
    CardModule,
    ToolbarModule,
    TagModule,
    ChipModule
  ],
  providers: [ConfirmationService]
})
export class RolesComponent extends BaseComponent implements OnInit {

  roles: Role[] = [];
  allOperationClaims: OperationClaim[] = [];
  roleOperationClaims: any[] = [];

  displayDialog: boolean = false;
  dialogMode: 'create' | 'edit' = 'create';
  currentRole: Role | null = null;

  roleForm: CreateRole | UpdateRole = {
    name: '',
    operationClaimIds: []
  };

  selectedClaims: OperationClaim[] = [];

  pageIndex: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  constructor(
    spinner: NgxSpinnerService,
    private roleService: RoleService,
    private operationClaimService: OperationClaimService,
    private roleOperationClaimService: RoleOperationClaimService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    await this.loadRoles();
    await this.loadOperationClaims();
    await this.loadRoleOperationClaims();
  }

  async loadRoles(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      const response = await this.roleService.list(this.pageIndex, this.pageSize);
      this.roles = response.items;
      this.totalRecords = response.count;
    } catch (error) {
      this.toastr.error('Roller yüklenirken hata oluştu');
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  async loadOperationClaims(): Promise<void> {
    try {
      const response = await this.operationClaimService.list(0, 100);
      this.allOperationClaims = response.items;
    } catch (error) {
      this.toastr.error('Yetkiler yüklenirken hata oluştu');
    }
  }

  async loadRoleOperationClaims(): Promise<void> {
    try {
      const response = await this.roleOperationClaimService.list(0, 1000);
      this.roleOperationClaims = response.items;
    } catch (error) {
      this.toastr.error('Rol yetkileri yüklenirken hata oluştu');
    }
  }

  getRoleClaims(roleId: string): OperationClaim[] {
    const roleClaimIds = this.roleOperationClaims
      .filter(rc => rc.roleId === roleId)
      .map(rc => rc.operationClaimId);

    return this.allOperationClaims.filter(oc => roleClaimIds.includes(oc.id));
  }

  openCreateDialog(): void {
    this.dialogMode = 'create';
    this.currentRole = null;
    this.roleForm = {
      name: '',
      operationClaimIds: []
    };
    this.selectedClaims = [];
    this.displayDialog = true;
  }

  async openEditDialog(role: Role): Promise<void> {
    this.dialogMode = 'edit';
    this.currentRole = role;
    this.roleForm = {
      id: role.id,
      name: role.name,
      operationClaimIds: []
    };

    // Load role's current claims
    this.selectedClaims = this.getRoleClaims(role.id);
    this.displayDialog = true;
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.currentRole = null;
    this.selectedClaims = [];
  }

  async saveRole(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);

    try {
      // Set selected claim IDs
      this.roleForm.operationClaimIds = this.selectedClaims.map(c => c.id);

      let savedRole: Role;

      if (this.dialogMode === 'create') {
        savedRole = await this.roleService.create(this.roleForm as CreateRole);
        this.toastr.success('Rol başarıyla oluşturuldu');
      } else {
        savedRole = await this.roleService.update(this.roleForm as UpdateRole);
        this.toastr.success('Rol başarıyla güncellendi');
      }

      // Update role claims
      await this.updateRoleClaims(savedRole.id);

      await this.loadRoles();
      await this.loadRoleOperationClaims();
      this.hideDialog();

    } catch (error: any) {
      const errorMessage = error?.error?.message || 'İşlem sırasında hata oluştu';
      this.toastr.error(errorMessage);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  async updateRoleClaims(roleId: string): Promise<void> {
    // Get current role claims
    const currentClaims = this.roleOperationClaims.filter(rc => rc.roleId === roleId);
    const currentClaimIds = currentClaims.map(rc => rc.operationClaimId);
    const selectedClaimIds = this.selectedClaims.map(claim => claim.id);

    // Remove claims that are no longer selected
    const claimsToRemove = currentClaims.filter(
      rc => !selectedClaimIds.includes(rc.operationClaimId)
    );

    for (const claim of claimsToRemove) {
      try {
        await this.roleOperationClaimService.delete(claim.id);
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
        await this.roleOperationClaimService.create({
          roleId: roleId,
          operationClaimId: claimId
        });
      } catch (error) {
        console.error('Error adding claim:', error);
      }
    }
  }

  validateForm(): boolean {
    if (!this.roleForm.name || this.roleForm.name.trim() === '') {
      this.toastr.warning('Rol adı zorunludur');
      return false;
    }

    return true;
  }

  confirmDelete(role: Role): void {
    this.confirmationService.confirm({
      message: `"${role.name}" rolünü silmek istediğinizden emin misiniz?`,
      header: 'Silme Onayı',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        this.deleteRole(role.id);
      }
    });
  }

  async deleteRole(roleId: string): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      await this.roleService.delete(roleId);
      this.toastr.success('Rol başarıyla silindi');
      await this.loadRoles();
      await this.loadRoleOperationClaims();
    } catch (error) {
      this.toastr.error('Rol silinirken hata oluştu');
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  onPageChange(event: any): void {
    this.pageIndex = event.first / event.rows;
    this.pageSize = event.rows;
    this.loadRoles();
  }

  getDialogHeader(): string {
    return this.dialogMode === 'create' ? 'Yeni Rol Oluştur' : 'Rol Düzenle';
  }
}
