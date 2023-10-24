import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class CustomToastrService {

  constructor(private toastr: ToastrService) { }

  message(message: string, title: string, toastrOption: ToastrOptions) {
    this.toastr[toastrOption.messageType](message, title,{
      positionClass: toastrOption.position
    });
  }
}
export class ToastrOptions {
  messageType: ToastrMessageType;
  position: ToastrPosition;
  constructor(messageType: ToastrMessageType, position: ToastrPosition) {
    this.messageType = messageType;
    this.position = position;
  }
  
}

export enum ToastrMessageType {
  Success= "success",
  Error = "error",
  Warning = "warning",
  Info = "info"
}

export enum ToastrPosition {
  TopRight = "toast-top-right",
  TopLeft = "toast-top-left",
  TopCenter = "toast-top-center",
  TopFullWidth = "toast-top-full-width",
  TopFullWidthCenter = "toast-top-full-width-center",
  BottomRight = "toast-bottom-right",
  BottomLeft = "toast-bottom-left",
  BottomCenter = "toast-bottom-center",
  BottomFullWidth = "toast-bottom-full-width",
  BottomFullWidthCenter = "toast-bottom-full-width-center"
}