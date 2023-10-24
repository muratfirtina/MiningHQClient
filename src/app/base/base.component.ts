import { NgxSpinnerService } from 'ngx-spinner';


export class BaseComponent {
  constructor(private spinner:NgxSpinnerService) { }

  showSpinner(spinnerNameType: SpinnerType) {
    this.spinner.show(spinnerNameType);
    
    
  }

  hideSpinner(spinnerNameType: SpinnerType) {
    this.spinner.hide(spinnerNameType);
  }
}

export enum SpinnerType {
  BallSpinClockwise = "s1",
  BallScaleMultiple = "s2",
  LineSpinFade = "s3",

}