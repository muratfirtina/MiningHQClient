import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { User } from 'src/app/contracts/user/user';
import { UserService } from 'src/app/services/common/models/user.service';
import { Role } from 'src/app/contracts/role/role';
import { RoleService } from 'src/app/services/common/models/role.service';
import { UserRoleService } from 'src/app/services/common/models/user-role.service';
import { OperationClaim } from 'src/app/contracts/operationClaim/operation-claim';
import { OperationClaimService } from 'src/app/services/common/models/operation-claim.service';
import { UserOperationClaimService } from 'src/app/services/common/models/user-operation-claim.service';

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
import { MatBadgeModule } from '@angular/material/badge';

import { UserDialogComponent } from './user-dialog/user-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
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
    MatProgressSpinnerModule,
    MatBadgeModule
  ]
})
export class UsersComponent extends BaseComponent implements OnInit {

  users: User[] = [];
  allRoles: Role[] = [];
  allOperationClaims: OperationClaim[] = [];
  userRoles: any[] = [];
  userOperationClaims: any[] = [];

  displayedColumns: string[] = ['index', 'name', 'email', 'roles', 'extraClaims', 'actions'];

  pageIndex: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  isLoading: boolean = false;

  constructor(
    spinner: NgxSpinnerService,
    private userService: UserService,
    private roleService: RoleService,
    private userRoleService: UserRoleService,
    private operationClaimService: OperationClaimService,
    private userOperationClaimService: UserOperationClaimService,
    private toastr: ToastrService,
    private dialog: MatDialog
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
    this.isLoading = true;
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      const response = await this.userService.list(this.pageIndex, this.pageSize);
      this.users = response.items;
      this.totalRecords = response.count;
    } catch (error) {
      this.toastr.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      this.isLoading = false;
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
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        mode: 'create',
        user: null,
        allRoles: this.allRoles,
        allOperationClaims: this.allOperationClaims,
        selectedRoles: [],
        selectedExtraClaims: []
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.handleSaveUser(result);
      }
    });
  }

  openEditDialog(user: User): void {
    const selectedRoles = this.getUserRoles(user.id);
    const selectedExtraClaims = this.getUserExtraClaims(user.id);

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        mode: 'edit',
        user: user,
        allRoles: this.allRoles,
        allOperationClaims: this.allOperationClaims,
        selectedRoles: selectedRoles,
        selectedExtraClaims: selectedExtraClaims
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.handleSaveUser(result);
      }
    });
  }

  async handleSaveUser(data: any): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);

    try {
      let savedUser: User;

      if (data.mode === 'create') {
        savedUser = await this.userService.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password
        });
        this.toastr.success('Kullanıcı başarıyla oluşturuldu');
      } else {
        savedUser = await this.userService.update({
          id: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        });
        this.toastr.success('Kullanıcı başarıyla güncellendi');
      }

      await this.updateUserRoles(savedUser.id, data.roleIds);
      await this.updateUserExtraClaims(savedUser.id, data.extraClaimIds);

      await this.loadUsers();
      await this.loadUserRoles();
      await this.loadUserOperationClaims();

    } catch (error: any) {
      const errorMessage = error?.error?.message || 'İşlem sırasında hata oluştu';
      this.toastr.error(errorMessage);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  async updateUserRoles(userId: string, selectedRoleIds: number[]): Promise<void> {
    const currentRoles = this.userRoles.filter(ur => ur.userId === userId);
    const currentRoleIds = currentRoles.map(ur => ur.roleId);

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

  async updateUserExtraClaims(userId: string, selectedClaimIds: string[]): Promise<void> {
    const currentClaims = this.userOperationClaims.filter(uc => uc.userId === userId);
    const currentClaimIds = currentClaims.map(uc => uc.operationClaimId);

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

  async deleteUser(user: User): Promise<void> {
    const confirmed = confirm(`${user.firstName} ${user.lastName} kullanıcısını silmek istediğinizden emin misiniz?`);
    
    if (!confirmed) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      await this.userService.delete(user.id);
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

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  getRowNumber(index: number): number {
    return this.pageIndex * this.pageSize + index + 1;
  }
}
