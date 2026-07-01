import { TooltipDirective } from './tooltip.directive';

describe('TooltipDirective', () => {
  it('should create an instance', () => {
    const directive = new TooltipDirective({ nativeElement: document.createElement('div') } as any);
    expect(directive).toBeTruthy();
  });
});
