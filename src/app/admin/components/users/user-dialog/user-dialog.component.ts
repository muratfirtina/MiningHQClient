import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { User } from 'src/app/contracts/user/user';
import { Role } from 'src/app/contracts/role/role';
import { OperationClaim } from 'src/app/contracts/operationClaim/operation-claim';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user: User | null;
  allRoles: Role[];
  allOperationClaims: OperationClaim[];
  selectedRoles: Role[];
  selectedExtraClaims: OperationClaim[];
}

@Component({
  selector: 'app-user-dialog',
  templateUrl: '../user-dialog/user-dialog.component.html',
  styleUrls: ['../user-dialog//user-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatStepperModule,
    MatDividerModule
  ]
})
export class UserDialogComponent implements OnInit {

  userInfoFormGroup!: FormGroup;
  rolesFormGroup!: FormGroup;
  claimsFormGroup!: FormGroup;

  selectedRoles: Role[] = [];
  selectedExtraClaims: OperationClaim[] = [];

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // Initialize form groups
    if (this.data.mode === 'create') {
      this.userInfoFormGroup = this.formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
      });
    } else {
      this.userInfoFormGroup = this.formBuilder.group({
        firstName: [this.data.user?.firstName || '', Validators.required],
        lastName: [this.data.user?.lastName || '', Validators.required],
        email: [this.data.user?.email || '', [Validators.required, Validators.email]]
      });
    }

    this.rolesFormGroup = this.formBuilder.group({
      roles: [[]]
    });

    this.claimsFormGroup = this.formBuilder.group({
      extraClaims: [[]]
    });

    // Load selected roles and claims
    if (this.data.selectedRoles) {
      this.selectedRoles = [...this.data.selectedRoles];
    }

    if (this.data.selectedExtraClaims) {
      this.selectedExtraClaims = [...this.data.selectedExtraClaims];
    }
  }

  getDialogTitle(): string {
    return this.data.mode === 'create' ? 'Yeni Kullanıcı Ekle' : 'Kullanıcı Düzenle';
  }

  getDialogSubtitle(): string {
    return this.data.mode === 'create' 
      ? 'Yeni kullanıcı oluşturun ve yetkilerini atayın'
      : 'Kullanıcı bilgilerini ve yetkilerini güncelleyin';
  }

  getDialogIcon(): string {
    return this.data.mode === 'create' ? 'person_add' : 'edit';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.validateAllForms()) {
      return;
    }

    const userInfo = this.userInfoFormGroup.value;

    const result = {
      mode: this.data.mode,
      userId: this.data.user?.id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      password: userInfo.password,
      roleIds: this.selectedRoles.map(r => r.id),
      extraClaimIds: this.selectedExtraClaims.map(c => c.id)
    };

    this.dialogRef.close(result);
  }

  validateAllForms(): boolean {
    if (this.userInfoFormGroup.invalid) {
      alert('Lütfen kullanıcı bilgilerini eksiksiz doldurun');
      return false;
    }
    return true;
  }

  onRoleSelectionChange(roles: Role[]): void {
    this.selectedRoles = roles;
  }

  onClaimSelectionChange(claims: OperationClaim[]): void {
    this.selectedExtraClaims = claims;
  }

  removeRole(role: Role): void {
    this.selectedRoles = this.selectedRoles.filter(r => r.id !== role.id);
  }

  removeClaim(claim: OperationClaim): void {
    this.selectedExtraClaims = this.selectedExtraClaims.filter(c => c.id !== claim.id);
  }

  getSaveButtonLabel(): string {
    return this.data.mode === 'create' ? 'Kullanıcı Oluştur' : 'Değişiklikleri Kaydet';
  }
}
