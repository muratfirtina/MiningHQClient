import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Create_LeaveType, LeaveTypeService } from 'src/app/services/common/models/leave-type.service';

declare var $: any;

@Component({
  selector: 'app-leave-type-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-type-add.component.html',
  styleUrls: ['./leave-type-add.component.scss']
})
export class LeaveTypeAddComponent {
  
  @Output() leaveTypeAdded = new EventEmitter<void>();
  
  leaveType: Create_LeaveType = new Create_LeaveType();
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private leaveTypeService: LeaveTypeService) { }

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.showError('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    if (!this.leaveType.name || this.leaveType.name.trim().length === 0) {
      this.showError('İzin türü adı boş olamaz.');
      return;
    }

    if (this.leaveType.name.trim().length < 2) {
      this.showError('İzin türü adı en az 2 karakter olmalıdır.');
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    try {
      // İzin türü adını temizle
      this.leaveType.name = this.leaveType.name.trim();

      this.leaveTypeService.create(this.leaveType).subscribe({
        next: (response) => {
          this.showSuccess('İzin türü başarıyla eklendi.');
          this.resetForm(form);
          this.leaveTypeAdded.emit();
          
          // Modal'ı kapat
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        },
        error: (error) => {
          console.error('İzin türü eklenirken hata oluştu:', error);
          this.showError('İzin türü eklenirken bir hata oluştu: ' + (error.error?.message || error.message || 'Bilinmeyen hata'));
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } catch (error) {
      console.error('İzin türü eklenirken hata oluştu:', error);
      this.showError('İzin türü eklenirken beklenmeyen bir hata oluştu.');
      this.isSubmitting = false;
    }
  }

  resetForm(form: NgForm) {
    this.leaveType = new Create_LeaveType();
    form.resetForm();
    this.clearMessages();
  }

  closeModal() {
    try {
      const modalElement = document.getElementById('leaveTypeAddModal');
      if (modalElement && (window as any).bootstrap) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
    } catch (error) {
      console.warn('Modal kapatılırken hata oluştu:', error);
    }
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Form validation methods
  isFieldInvalid(field: any): boolean {
    return field.invalid && (field.dirty || field.touched);
  }

  getFieldErrorMessage(field: any, fieldName: string): string {
    if (field.errors?.['required']) {
      return `${fieldName} zorunludur.`;
    }
    if (field.errors?.['minlength']) {
      return `${fieldName} en az ${field.errors['minlength'].requiredLength} karakter olmalıdır.`;
    }
    if (field.errors?.['maxlength']) {
      return `${fieldName} en fazla ${field.errors['maxlength'].requiredLength} karakter olabilir.`;
    }
    return '';
  }

  // Input cleaning
  onNameInput(event: any) {
    // Sadece harf, rakam, boşluk ve temel Türkçe karakterlere izin ver
    const value = event.target.value;
    const cleanedValue = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-\_]/g, '');
    if (value !== cleanedValue) {
      event.target.value = cleanedValue;
      this.leaveType.name = cleanedValue;
    }
  }
}