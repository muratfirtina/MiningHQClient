import { Directive, ElementRef, HostListener, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  standalone:true,
  selector: '[appUppercaseinput]'
})
export class UppercaseinputDirective {


  constructor(private el: ElementRef, @Self() private ngControl: NgControl) {}

  @HostListener('input', ['$event.target.value']) onInputChange(value: string) {
    const upperValue = value.toLocaleUpperCase('tr-TR');
    this.ngControl.control.setValue(upperValue, { emitEvent: false });
  }

}
