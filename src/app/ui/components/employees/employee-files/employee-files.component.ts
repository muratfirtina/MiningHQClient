import { Component, Inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { BloodTypeDisplayPipe } from 'src/app/pipes/bloodTypeDisplay.pipe';
import { FileUploadComponent, FileUploadOptions } from 'src/app/services/common/file-upload/file-upload.component';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { DialogService } from 'src/app/services/common/dialog.service';
import { EmployeFileDialogComponent, EmployeFileDialogState } from 'src/app/dialogs/employee-dialogs/employe-file-dialog/employe-file-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { ListImageFile } from 'src/app/contracts/list-image-file';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';

@Component({
  selector: 'app-employee-files',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BloodTypeDisplayPipe,
    FileUploadComponent,
    MatDialogModule,
    MatCardModule],
  templateUrl: './employee-files.component.html',
  styleUrls: ['./employee-files.component.scss']
})
export class EmployeeFilesComponent extends BaseComponent implements OnInit {

  employeeFiles:ListImageFile[] = [];
  employee: SingleEmployee;

  constructor(spinner: NgxSpinnerService,
    private employeeService: EmployeeService,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute) {
    super(spinner);
  }

  

   async ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const employeeId = params.get('employeeId');
      if (employeeId) {
        this.getEmployee(employeeId);
        this.getEmployeeFiles(employeeId);
        // options nesnesine employeeId ekleyin
        
      }
    });
  }

  getEmployee(employeeId: string) {
    this.employeeService.getEmployeeById(employeeId).then((response) => {
      this.employee = response;
      

    });
  }

  getEmployeeFiles(employeeId: string) {
    this.employeeService.getEmployeeFiles(employeeId).then((response) => {
      this.employeeFiles = response;
      
    });
  }

  addEmployeeFiles(employeeId:string): void {
    const dialogRef = this.dialogService.openDialog({componentType:EmployeFileDialogComponent, data:employeeId,
    options:{width:'1000px',height:'500px'}});
    
  }

  goBack() {
    if (this.employee && this.employee.id) {
      this.router.navigate([`/personeller/personel/${this.employee.id}`]); // Personel ID'sini kullanarak URL oluştur
    } else {
      // Geriye düşerse başka bir rotaya yönlendirme veya hata yönetimi
      this.router.navigate(['/personeller']); // Varsayılan geri rotası
    }
  }

  printImage(fileId: string) {
    let printContents, popupWin;
    const imageId = 'printableImage' + fileId;
    printContents = document.getElementById(imageId).outerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
  
    // Özelleştirilmiş CSS ile yeni pencere içeriği
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <style>
            /* Yazdırma stili ayarları */
            body { 
              margin: 0; 
              font-size: 12px; /* İsteğe bağlı olarak yazı tipi boyutu ayarlanabilir */
            }
            @media print {
              /* Yazdırma sırasında görünen başlık ve footer kaldırılıyor */
              @page { 
                margin: 50;
                size: auto;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">${printContents}</body>
      </html>
    `);
    popupWin.document.close();
  }
  
  


}
