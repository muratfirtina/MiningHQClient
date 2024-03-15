import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  standalone:true,
  selector: '[appUppercaseinput]'
})
export class UppercaseinputDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) 
  onInputChange($event) {
    const value = $event.target.value.toLocaleUpperCase('tr-TR');
    this.el.nativeElement.value = value;
  }

}
