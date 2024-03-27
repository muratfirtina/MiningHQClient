import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseDialog } from '../baseDialog';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-file-upload-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss']
})
export class FileUploadDialogComponent extends BaseDialog<FileUploadDialogComponent> {

  constructor(
    dialogRef: MatDialogRef<FileUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FileUploadDialogState,
    ) {
    super(dialogRef);
  
   }

}
export enum FileUploadDialogState {
  Yes,
  No
}