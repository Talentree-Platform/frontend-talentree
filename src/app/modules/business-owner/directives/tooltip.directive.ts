import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input('Tooltip') text ='';
  constructor(private el : ElementRef) { }
  @HostListener('mouseenter')
  onMouseEnter(){
    console.log('hover in ' , this.text)
  }
  @HostListener('mouseleave')
  onMouseLeave(){
    console.log('hover out');
    
  }

}
