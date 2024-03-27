import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
import { DeleteDialogState } from 'src/app/dialogs/delete-dialog/delete-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog:MatDialog) { }


  openDialog(dialogParameters: Partial<DialogParameters>): void {
    const dialogRef = this.dialog.open(dialogParameters.componentType, {
      width: dialogParameters.options?.width,
      height: dialogParameters.options?.height,
      position: dialogParameters.options?.position,
      data: dialogParameters.data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == dialogParameters.data) 
        dialogParameters.afterClosed(DeleteDialogState.Yes);
      
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }
  
}

export class DialogParameters {
  componentType: ComponentType<any>;
  data: any;
  afterClosed: (result: DeleteDialogState) => void;
  options?: Partial<DialogOptions> = new DialogOptions();
 
}

export class DialogOptions{
  width?: string = '250px';
  height?: string;
  position?: DialogPosition;
}
