import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { Role } from 'src/app/contracts/role/role';
import { RoleService } from 'src/app/services/common/models/role.service';
import { OperationClaim } from 'src/app/contracts/operationClaim/operation-claim';
import { OperationClaimService } from 'src/app/services/common/models/operation-claim.service';
import { RoleOperationClaimService } from 'src/app/services/common/models/role-operation-claim.service';

// Angular Material imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RoleDialogComponent } from './role-dialog/role-dialog.component';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    MatToolbarModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ]
})
export class RolesComponent extends BaseComponent implements OnInit {

  roles: Role[] = [];
  allOperationClaims: OperationClaim[] = [];
  roleOperationClaims: any[] = [];

  displayedColumns: string[] = ['index', 'name', 'claims', 'createdDate', 'actions'];

  pageIndex: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  isLoading: boolean = false;

  constructor(
    spinner: NgxSpinnerService,
    private roleService: RoleService,
    private operationClaimService: OperationClaimService,
    private roleOperationClaimService: RoleOperationClaimService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    await this.loadRoles();
    await this.loadOperationClaims();
    await this.loadRoleOperationClaims();
  }

  async loadRoles(): Promise<void> {
    this.isLoading = true;
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      const response = await this.roleService.list(this.pageIndex, this.pageSize);
      this.roles = response.items;
      this.totalRecords = response.count;
    } catch (error) {
      this.toastr.error('Roller yüklenirken hata oluştu');
    } finally {
      this.isLoading = false;
      this.hideSpinner(SpinnerType.BallSpinClockwise);
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

  async loadRoleOperationClaims(): Promise<void> {
    try {
      this.roleOperationClaims = [];
      for (const role of this.roles) {
        const claims = await this.roleOperationClaimService.getRoleClaims(role.id);
        claims.forEach(claim => {
          this.roleOperationClaims.push({
            id: claim.id,
            roleId: role.id,
            operationClaimId: claim.operationClaimId
          });
        });
      }
    } catch (error) {
      console.warn('RoleOperationClaims yüklenirken hata oluştu.', error);
      this.roleOperationClaims = [];
    }
  }

  getRoleClaims(roleId: number): OperationClaim[] {
    const roleClaimIds = this.roleOperationClaims
      .filter(rc => rc.roleId === roleId)
      .map(rc => rc.operationClaimId);

    return this.allOperationClaims.filter(oc => roleClaimIds.includes(oc.id));
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        mode: 'create',
        role: null,
        allOperationClaims: this.allOperationClaims,
        selectedClaims: []
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.handleSaveRole(result);
      }
    });
  }

  openEditDialog(role: Role): void {
    const selectedClaims = this.getRoleClaims(role.id);

    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        mode: 'edit',
        role: role,
        allOperationClaims: this.allOperationClaims,
        selectedClaims: selectedClaims
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.handleSaveRole(result);
      }
    });
  }

  async handleSaveRole(data: any): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);

    try {
      let savedRole: Role;

      if (data.mode === 'create') {
        savedRole = await this.roleService.create({
          name: data.name,
          operationClaimIds: data.operationClaimIds
        });
        this.toastr.success('Rol başarıyla oluşturuldu');
      } else {
        savedRole = await this.roleService.update({
          id: data.roleId,
          name: data.name,
          operationClaimIds: data.operationClaimIds
        });
        this.toastr.success('Rol başarıyla güncellendi');
      }

      await this.updateRoleClaims(savedRole.id, data.operationClaimIds);
      await this.loadRoles();
      await this.loadRoleOperationClaims();

    } catch (error: any) {
      const errorMessage = error?.error?.message || 'İşlem sırasında hata oluştu';
      this.toastr.error(errorMessage);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  async updateRoleClaims(roleId: number, selectedClaimIds: string[]): Promise<void> {
    const currentClaims = this.roleOperationClaims.filter(rc => rc.roleId === roleId);
    const currentClaimIds = currentClaims.map(rc => rc.operationClaimId);

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

  async deleteRole(role: Role): Promise<void> {
    const confirmed = confirm(`"${role.name}" rolünü silmek istediğinizden emin misiniz?`);
    
    if (!confirmed) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      await this.roleService.delete(role.id);
      this.toastr.success('Rol başarıyla silindi');
      await this.loadRoles();
      await this.loadRoleOperationClaims();
    } catch (error) {
      this.toastr.error('Rol silinirken hata oluştu');
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRoles();
  }

  getRowNumber(index: number): number {
    return this.pageIndex * this.pageSize + index + 1;
  }
}
