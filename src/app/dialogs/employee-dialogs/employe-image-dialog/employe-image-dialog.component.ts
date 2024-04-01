import { Component, Inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseDialog } from '../../baseDialog';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { DialogService } from 'src/app/services/common/dialog.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ListImageFile } from 'src/app/contracts/list-image-file';
import { FileUploadComponent, FileUploadOptions } from 'src/app/services/common/file-upload/file-upload.component';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Employee } from 'src/app/contracts/employee/employee';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { SpinnerType } from 'src/app/base/base.component';
import {MatCardModule} from '@angular/material/card';
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';

@Component({
  selector: 'app-employe-image-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule,NgxSpinnerModule,RouterModule,FileUploadComponent,MatCardModule],
  templateUrl: './employe-image-dialog.component.html',
  styleUrls: ['./employe-image-dialog.component.scss']
})
export class EmployeImageDialogComponent extends BaseDialog<EmployeImageDialogComponent> implements OnInit{

  constructor(
    dialogRef: MatDialogRef<EmployeImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeImageDialogState | string,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private spinner:NgxSpinnerService,
    private dialogService: DialogService,
    private customToastrService: CustomToastrService) {
    super(dialogRef);
  }

  employeeImages:ListImageFile[] = [];
  employee: SingleEmployee;
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  @Output() options: Partial<FileUploadOptions> = {
    acceptedFileTypes: ".png, .jpg, .jpeg, .gif, .webp",
    controller: 'Employees',
    action: 'Upload',
    explanation: 'Çalışan Resmi Yükle',
    category: 'employee-images',
   
    
   }

  // EmployeeImageDialogComponent

async ngOnInit() {
  this.spinner.show(SpinnerType.BallSpinClockwise);
  this.employee = await this.employeeService.getEmployeeById(this.data as string);
  this.employeeImages = await this.employeeService.getEmployeeImages(this.data as string);

  // personelin bilgilerini aldıktan sonra options nesnesini güncelle
  this.options = {
    ...this.options,
    path: `${this.employee.firstName} ${this.employee.lastName}`, // Path'i çalışanın adı ve soyadıyla ayarla
    employeeId: this.employee.id, // employeeId'yi de ayarla
  
  };

  this.spinner.hide(SpinnerType.BallSpinClockwise);
}

openFileUploadDialog() {
  this.dialogService.openDialog({
    componentType: FileUploadComponent,
    data: this.options, // options nesnesini FileUploadComponent'e aktar
    afterClosed: async () => {
      // Dialog kapandıktan sonra yapılmak istenen işlemler, örneğin yeniden resim listesini yükle
      this.employeeImages = await this.employeeService.getEmployeeImages(this.data as string);
    }
  });
}

showCase(id: string) {
  this.spinner.show(SpinnerType.BallSpinClockwise);
  this.employeeService.changeShowcase(this.data as string,id,true).then(() => {
    this.employeeImages = this.employeeImages.map((image: ListImageFile) => {
      image.showcase = image.id === id;
      return image;
    });
    this.spinner.hide(SpinnerType.BallSpinClockwise);
    this.customToastrService.message("Resim başarıyla vitrin resmi olarak ayarlandı.", "Başarılı",
     new ToastrOptions(ToastrMessageType.Success, ToastrPosition.BottomRight));
     
  })
  console.log(id);
  console.log(this.data);
  }
  
}



export enum EmployeImageDialogState {
  Close
}
