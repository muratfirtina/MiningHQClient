import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerType } from 'src/app/base/base.component';
import { FileUploadDialogComponent, FileUploadDialogState } from 'src/app/dialogs/file-upload-dialog/file-upload-dialog.component';
import { CustomToastrService, ToastrMessageType, ToastrPosition } from '../custom-toastr.service';
import { DialogService } from '../dialog.service';
import { HttpClientService } from '../http-client.service';
import { EmployeeService } from '../models/employee.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, NgxFileDropModule, MatDialogModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {

  constructor(
    private httpClientService:HttpClientService,
    private customToastrService: CustomToastrService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private spinner:NgxSpinnerService,
    private employeeService: EmployeeService
    ) {}

  public files: NgxFileDropEntry[];
  
  @Input() options: Partial<FileUploadOptions>
  

  public selectedFiles(files: NgxFileDropEntry[]) {
    this.files = files;
    const fileData: FormData = new FormData();
  
    fileData.append('path', this.options.path); // Backend'in beklediği "path" parametresini FormData'ya ekleyin.
    if(this.options.employeeId) {
      fileData.append('employeeId', this.options.employeeId);
    }
    if(this.options.category) {
      fileData.append('category', this.options.category);
    }
    files.forEach((file: NgxFileDropEntry) => {
      (file.fileEntry as FileSystemFileEntry).file((_file: File) => {
        fileData.append('files', _file, _file.name); // "files" anahtarı altında dosyaları ekleyin.
      });
    });
  
    // Dialog açılıp kapandıktan sonra dosyaları yükleyin
    this.dialogService.openDialog({
      componentType: FileUploadDialogComponent,
      data: FileUploadDialogState.Yes,
      afterClosed: () => {
        this.uploadFiles(fileData); // Dosya yükleme işlemini bir fonksiyon haline getirdim.
      }
    });
  }
  
  private uploadFiles(fileData: FormData) {
    this.spinner.show(SpinnerType.BallSpinClockwise);
    this.httpClientService.post({
      controller: this.options.controller,
      action: this.options.action,
      queryString: this.options.queryString,
      headers: new HttpHeaders({ "responseType": "blob" })
    }, fileData).subscribe({
      next: (data) => {
        const message: string = "File uploaded successfully";
        this.spinner.hide(SpinnerType.BallSpinClockwise);
        this.customToastrService.message(message, "Success", {
          messageType: ToastrMessageType.Success,
          position: ToastrPosition.TopRight
        });
      },
      error: (error: HttpErrorResponse) => {
        const message: string = "File upload failed";
        this.spinner.hide(SpinnerType.BallSpinClockwise);
        this.customToastrService.message(message, "Failed", {
          messageType: ToastrMessageType.Error,
          position: ToastrPosition.TopRight
        });
      }
    });
  }
  

  // openDialog(afterClosed: any): void {
  //   const dialogRef = this.dialog.open(FileUploadDialogComponent, {
  //     data: FileUploadDialogState.Yes,
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result == FileUploadDialogState.Yes) afterClosed();
  //   });
  // }

  
}
export class FileUploadOptions {
  controller?: string;
  action?: string;
  queryString?: string;
  path?: string; // Bu satır eklendi
  explanation?: string;
  acceptedFileTypes?: string;
  employeeId?: string;
  category?: string;
  
  //isAdminPage?: boolean = false;
}