import { Component, Inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { FileUploadComponent, FileUploadOptions } from 'src/app/services/common/file-upload/file-upload.component';
import { BaseDialog } from '../../baseDialog';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { DialogService } from 'src/app/services/common/dialog.service';
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';
import { ListImageFile } from 'src/app/contracts/list-image-file';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { SpinnerType } from 'src/app/base/base.component';

@Component({
  selector: 'app-employe-photo-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule,NgxSpinnerModule,RouterModule,FileUploadComponent,MatCardModule],
  templateUrl: './employe-photo-dialog.component.html',
  styleUrls: ['./employe-photo-dialog.component.scss']
})
export class EmployePhotoDialogComponent extends BaseDialog<EmployePhotoDialogComponent> implements OnInit{

  constructor(
    dialogRef: MatDialogRef<EmployePhotoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployePhotoDialogState | string,
    private employeeService: EmployeeService,
    private spinner:NgxSpinnerService,
    private dialogService: DialogService,
    private customToastrService: CustomToastrService) {
    super(dialogRef);
  }

  employeeImage:ListImageFile;
  employee: SingleEmployee;
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  @Output() options: Partial<FileUploadOptions> = {
    acceptedFileTypes: ".png, .jpg, .jpeg, .gif, .webp, .heic",
    controller: 'Employees',
    action: 'UploadEmployeePhoto',
    explanation: 'Personel Fotoğrafı Yükle',
    category: 'employee-images/photo',
   
    
   }

  // EmployeeImageDialogComponent

  async ngOnInit() {
    this.spinner.show(SpinnerType.BallSpinClockwise);
    this.employee = await this.employeeService.getEmployeeById(this.data as string);
    const images = await this.employeeService.getEmployeePhoto(this.data as string);
    this.employeeImage = images; // Eğer servis doğrudan bir nesne döndürüyorsa
  
    // personelin bilgilerini aldıktan sonra options nesnesini güncelle
    this.options = {
      ...this.options,
      path: `${this.employee.firstName}${this.employee.lastName}`,
      employeeId: this.employee.id,
    };
  
    this.spinner.hide(SpinnerType.BallSpinClockwise);
  }

openFileUploadDialog() {
  this.dialogService.openDialog({
    componentType: FileUploadComponent,
    data: this.options, // options nesnesini FileUploadComponent'e aktar
    
  });
}
  
}



export enum EmployePhotoDialogState {
  Close
}
