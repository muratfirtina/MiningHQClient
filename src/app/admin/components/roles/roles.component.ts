import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { OperationClaim } from 'src/app/contracts/operationClaim/operation-claim';
import { CreateOperationClaim } from 'src/app/contracts/operationClaim/create-operation-claim';
import { UpdateOperationClaim } from 'src/app/contracts/operationClaim/update-operation-claim';
import { OperationClaimService } from 'src/app/services/common/models/operation-claim.service';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
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
    ConfirmDialogModule,
    TooltipModule,
    CardModule,
    ToolbarModule
  ],
  providers: [ConfirmationService]
})
export class RolesComponent extends BaseComponent implements OnInit {

  roles: OperationClaim[] = [];
  displayDialog: boolean = false;
  dialogMode: 'create' | 'edit' = 'create';
  currentRole: OperationClaim | null = null;

  roleForm: CreateOperationClaim | UpdateOperationClaim = {
    name: ''
  };

  pageIndex: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  constructor(
    spinner: NgxSpinnerService,
    private operationClaimService: OperationClaimService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    await this.loadRoles();
  }

  async loadRoles(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      const response = await this.operationClaimService.list(this.pageIndex, this.pageSize);
      this.roles = response.items;
      this.totalRecords = response.count;
    } catch (error) {
      this.toastr.error('Roller yüklenirken hata oluştu');
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  openCreateDialog(): void {
    this.dialogMode = 'create';
    this.currentRole = null;
    this.roleForm = {
      name: ''
    };
    this.displayDialog = true;
  }

  openEditDialog(role: OperationClaim): void {
    this.dialogMode = 'edit';
    this.currentRole = role;
    this.roleForm = {
      id: role.id,
      name: role.name
    };
    this.displayDialog = true;
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.currentRole = null;
  }

  async saveRole(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);

    try {
      if (this.dialogMode === 'create') {
        await this.operationClaimService.create(this.roleForm as CreateOperationClaim);
        this.toastr.success('Rol başarıyla oluşturuldu');
      } else {
        await this.operationClaimService.update(this.roleForm as UpdateOperationClaim);
        this.toastr.success('Rol başarıyla güncellendi');
      }

      await this.loadRoles();
      this.hideDialog();

    } catch (error: any) {
      const errorMessage = error?.error?.message || 'İşlem sırasında hata oluştu';
      this.toastr.error(errorMessage);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  validateForm(): boolean {
    if (!this.roleForm.name || this.roleForm.name.trim() === '') {
      this.toastr.warning('Rol adı zorunludur');
      return false;
    }

    return true;
  }

  confirmDelete(role: OperationClaim): void {
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
      await this.operationClaimService.delete(roleId);
      this.toastr.success('Rol başarıyla silindi');
      await this.loadRoles();
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
