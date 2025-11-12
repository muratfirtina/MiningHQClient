import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Role } from 'src/app/contracts/role/role';
import { OperationClaim } from 'src/app/contracts/operationClaim/operation-claim';

export interface RoleDialogData {
  mode: 'create' | 'edit';
  role: Role | null;
  allOperationClaims: OperationClaim[];
  selectedClaims: OperationClaim[];
}

@Component({
  selector: 'app-role-dialog',
  templateUrl: '../role-dialog/role-dialog.component.html',
  styleUrls: ['../role-dialog//role-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatCheckboxModule
  ]
})
export class RoleDialogComponent implements OnInit {

  roleName: string = '';
  selectedClaims: OperationClaim[] = [];
  isAllSelected = false;

  constructor(
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoleDialogData
  ) {}

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.role) {
      this.roleName = this.data.role.name;
    }
    
    if (this.data.selectedClaims) {
      this.selectedClaims = [...this.data.selectedClaims];
      this.updateSelectAllState();
    }
  }

  getDialogTitle(): string {
    return this.data.mode === 'create' ? 'Yeni Rol Oluştur' : 'Rol Düzenle';
  }

  getDialogSubtitle(): string {
    return this.data.mode === 'create' 
      ? 'Yeni bir sistem rolü oluşturun ve yetkilerini atayın'
      : 'Rol bilgilerini ve yetkilerini güncelleyin';
  }

  getDialogIcon(): string {
    return this.data.mode === 'create' ? 'add_circle' : 'edit';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.validateForm()) {
      return;
    }

    const result = {
      mode: this.data.mode,
      roleId: this.data.role?.id,
      name: this.roleName.trim(),
      operationClaimIds: this.selectedClaims.map(c => c.id)
    };

    this.dialogRef.close(result);
  }

  validateForm(): boolean {
    if (!this.roleName || this.roleName.trim() === '') {
      alert('Rol adı zorunludur');
      return false;
    }
    return true;
  }

  onClaimSelectionChange(claims: OperationClaim[]): void {
    this.selectedClaims = claims;
    this.updateSelectAllState();
  }

  removeClaim(claim: OperationClaim): void {
    this.selectedClaims = this.selectedClaims.filter(c => c.id !== claim.id);
    this.updateSelectAllState();
  }

  toggleSelectAll(event: any): void {
    if (event.checked) {
      this.selectedClaims = [...this.data.allOperationClaims];
    } else {
      this.selectedClaims = [];
    }
    this.updateSelectAllState();
  }

  private updateSelectAllState(): void {
    this.isAllSelected = this.selectedClaims.length === this.data.allOperationClaims.length;
  }

  getSaveButtonLabel(): string {
    return this.data.mode === 'create' ? 'Rol Oluştur' : 'Değişiklikleri Kaydet';
  }
}