import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';

export interface ChartPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-custom-chart',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe, CurrencyPipe],
  template: `
    <div class="chart-wrapper" #container>
      <!-- Chart Title / Header -->
      <div class="chart-header" *ngIf="title">
        <span class="chart-title">{{ title }}</span>
        <span class="chart-subtitle" *ngIf="subtitle">{{ subtitle }}</span>
      </div>

      <!-- Main SVG Canvas -->
      <div class="svg-container">
        <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient [id]="gradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="fillColor" stop-opacity="0.4" />
              <stop offset="100%" [attr.stop-color]="fillColor" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Grid Lines (Horizontal) -->
          <g class="grid-lines">
            @for (line of gridLines; track line.y) {
              <line 
                [attr.x1]="paddingLeft" 
                [attr.y1]="line.y" 
                [attr.x2]="width - paddingRight" 
                [attr.y2]="line.y" 
                stroke="var(--color-svg-grid)" 
                stroke-width="1"
                [attr.stroke-dasharray]="line.dash ? '4 4' : 'none'" />
              
              <!-- Y Axis Label -->
              <text 
                [attr.x]="paddingLeft - 10" 
                [attr.y]="line.y + 4" 
                class="axis-label y-axis-label"
                text-anchor="end">
                {{ formatYValue(line.value) }}
              </text>
            }
          </g>
 
          <!-- Main Chart Visuals -->
          @if (points.length > 0) {
            <!-- BAR CHART TYPE -->
            @if (type === 'bar') {
              <g class="bars">
                @for (p of barPoints; track p) {
                  <rect
                    [attr.x]="p.x"
                    [attr.y]="p.y"
                    [attr.width]="p.width"
                    [attr.height]="p.height"
                    [attr.fill]="fillColor"
                    [attr.rx]="3"
                    class="chart-bar"
                    (mouseenter)="showTooltip($event, points[$index], p.x + p.width/2, p.y)"
                    (mouseleave)="hideTooltip()" />
                }
              </g>
            }
 
            <!-- LINE/AREA CHART TYPE -->
            @if (type === 'line' || type === 'area') {
              <!-- Area Fill Gradient -->
              @if (type === 'area' || fillGradient) {
                <path 
                  [attr.d]="areaPath" 
                  [attr.fill]="'url(#' + gradientId + ')'" 
                  class="chart-area" />
              }
 
              <!-- Line Stroke -->
              <path 
                [attr.d]="linePath" 
                fill="none" 
                [attr.stroke]="strokeColor" 
                stroke-width="2.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                class="chart-line" />
 
              <!-- Vertex Dots / Interactions -->
              <g class="dots">
                @for (p of vertexPoints; track p) {
                  <!-- Invisible wider circle for easier hover -->
                  <circle
                    [attr.cx]="p.x"
                    [attr.cy]="p.y"
                    r="12"
                    fill="transparent"
                    class="interaction-circle"
                    (mouseenter)="showTooltip($event, points[$index], p.x, p.y)"
                    (mouseleave)="hideTooltip()" />
 
                  <!-- Visible small dot -->
                  <circle
                    [attr.cx]="p.x"
                    [attr.cy]="p.y"
                    r="4.5"
                    [attr.fill]="strokeColor"
                    stroke="var(--color-chart-dot-border, #18130a)"
                    stroke-width="1.5"
                    class="chart-dot"
                    pointer-events="none" />
                }
              </g>
            }
          } @else {
            <!-- Empty state inside chart -->
            <text [attr.x]="width / 2" [attr.y]="height / 2" class="empty-text" text-anchor="middle">
              No data available for this period.
            </text>
          }
 
          <!-- X Axis Line -->
          <line 
            [attr.x1]="paddingLeft" 
            [attr.y1]="height - paddingBottom" 
            [attr.x2]="width - paddingRight" 
            [attr.y2]="height - paddingBottom" 
            stroke="var(--color-svg-axis-line)" 
            stroke-width="1" />
 
          <!-- X Axis Labels -->
          <g class="x-axis-labels">
            @for (label of xAxisLabels; track label) {
              <text 
                [attr.x]="label.x" 
                [attr.y]="height - paddingBottom + 18" 
                class="axis-label x-axis-label"
                text-anchor="middle">
                {{ label.text }}
              </text>
            }
          </g>
        </svg>
 
        <!-- Floating Tooltip DOM Overlay -->
        <div 
          class="chart-tooltip" 
          *ngIf="tooltip.visible"
          [style.left.px]="tooltip.x"
          [style.top.px]="tooltip.y">
          <div class="tooltip-label">{{ tooltip.label }}</div>
          <div class="tooltip-value">{{ formatYValue(tooltip.value) }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      background: var(--bg-card);
      border: var(--border-card);
      border-radius: 16px;
      padding: 20px;
      backdrop-filter: blur(14px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      position: relative;
    }
 
    .chart-header {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
    }
 
    .chart-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-card-value);
      font-family: 'DM Sans', sans-serif;
    }
 
    .chart-subtitle {
      font-size: 11px;
      color: var(--color-card-sub);
      margin-top: 2px;
    }
 
    .svg-container {
      position: relative;
      width: 100%;
    }
 
    .chart-svg {
      width: 100%;
      height: 200px;
      overflow: visible;
    }
 
    .axis-label {
      fill: var(--color-svg-axis-label);
      font-family: 'DM Sans', sans-serif;
      font-size: 9.5px;
      font-weight: 500;
      letter-spacing: 0.02em;
    }
 
    .y-axis-label {
      font-variant-numeric: tabular-nums;
    }
 
    .x-axis-label {
      font-size: 9px;
    }
 
    /* Bar animations and style */
    .chart-bar {
      transition: y 0.5s ease, height 0.5s ease, fill-opacity 0.2s;
      cursor: pointer;
      fill-opacity: 0.75;
    }
 
    .chart-bar:hover {
      fill-opacity: 0.95;
    }
 
    /* Line chart styles */
    .chart-line {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawLine 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
 
    @keyframes drawLine {
      to { stroke-dashoffset: 0; }
    }
 
    .chart-area {
      opacity: 0;
      animation: fadeInArea 0.8s 0.3s ease forwards;
    }
 
    @keyframes fadeInArea {
      to { opacity: 1; }
    }
 
    .chart-dot {
      transition: r 0.15s ease;
    }
 
    .interaction-circle {
      cursor: pointer;
    }
 
    .interaction-circle:hover + .chart-dot {
      r: 6.5;
    }
 
    .empty-text {
      fill: var(--color-card-sub);
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
    }
 
    /* Floating Tooltip */
    .chart-tooltip {
      position: absolute;
      background: var(--bg-tooltip);
      border: var(--border-tooltip);
      border-radius: 8px;
      padding: 8px 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      pointer-events: none;
      transform: translate(-50%, -100%);
      margin-top: -12px;
      z-index: 100;
      animation: tooltipFade 0.15s ease;
      min-width: 80px;
    }
 
    @keyframes tooltipFade {
      from { opacity: 0; transform: translate(-50%, -90%); }
      to { opacity: 1; transform: translate(-50%, -100%); }
    }
 
    .tooltip-label {
      font-size: 10px;
      color: var(--color-tooltip-label);
      margin-bottom: 2px;
    }
 
    .tooltip-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-tooltip-text);
    }
  `],
})
export class ChartsComponent implements OnChanges {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() points: ChartPoint[] = [];
  @Input() type: 'line' | 'bar' | 'area' = 'line';
  @Input() fillColor = '#bb891c';
  @Input() strokeColor = '#d1a33e';
  @Input() gradientId = 'chartGrad';
  @Input() yFormat: 'currency' | 'number' = 'number';
  @Input() fillGradient = true;

  @ViewChild('container') containerRef!: ElementRef;

  width = 500;
  height = 220;

  // Chart padding
  paddingLeft = 50;
  paddingRight = 15;
  paddingTop = 20;
  paddingBottom = 35;

  // Grid / labels layout
  gridLines: { y: number; value: number; dash: boolean }[] = [];
  xAxisLabels: { x: number; text: string }[] = [];
  
  // Computed path strings and dimensions
  linePath = '';
  areaPath = '';
  barPoints: { x: number; y: number; width: number; height: number }[] = [];
  vertexPoints: { x: number; y: number }[] = [];

  // Tooltip state
  tooltip = {
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: 0
  };

  constructor(private decimalPipe: DecimalPipe, private currencyPipe: CurrencyPipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['points'] || changes['type']) {
      this.calculateChartLayout();
    }
  }

  private calculateChartLayout(): void {
    if (!this.points || this.points.length === 0) {
      this.gridLines = [];
      this.xAxisLabels = [];
      this.linePath = '';
      this.areaPath = '';
      this.barPoints = [];
      this.vertexPoints = [];
      return;
    }

    // Determine max and min value
    const values = this.points.map(p => p.value);
    let maxVal = Math.max(...values);
    
    // Ensure we don't have a 0 max to prevent division by zero
    if (maxVal <= 0) maxVal = 10;
    // Add small buffer to top of graph
    const maxValue = maxVal * 1.1;

    const graphWidth = this.width - this.paddingLeft - this.paddingRight;
    const graphHeight = this.height - this.paddingTop - this.paddingBottom;

    // Calculate Y gridlines (4 sections, 5 lines: 0%, 25%, 50%, 75%, 100%)
    this.gridLines = [];
    for (let i = 0; i <= 4; i++) {
      const pct = i / 4;
      const val = maxValue * pct;
      const y = this.paddingTop + graphHeight - (pct * graphHeight);
      this.gridLines.push({
        y,
        value: val,
        dash: i !== 0 && i !== 4
      });
    }

    // Calculate X labels (spread across width)
    this.xAxisLabels = [];
    const labelSpacing = Math.ceil(this.points.length / 6); // Max 6 labels on X axis to avoid overlap
    for (let i = 0; i < this.points.length; i++) {
      if (i % labelSpacing === 0 || i === this.points.length - 1) {
        const pct = i / (this.points.length - 1 || 1);
        const x = this.paddingLeft + pct * graphWidth;
        this.xAxisLabels.push({
          x,
          text: this.points[i].label
        });
      }
    }

    // Calculate coordinates based on chart type
    if (this.type === 'bar') {
      this.barPoints = [];
      const colWidth = graphWidth / this.points.length;
      const barWidth = colWidth * 0.65;
      
      for (let i = 0; i < this.points.length; i++) {
        const pct = i / this.points.length;
        const val = this.points[i].value;
        const x = this.paddingLeft + (pct * graphWidth) + (colWidth * 0.175);
        const yPct = val / maxValue;
        const y = this.paddingTop + graphHeight - (yPct * graphHeight);
        const height = yPct * graphHeight;
        this.barPoints.push({
          x,
          y,
          width: barWidth,
          height: Math.max(height, 2) // minimum height of 2px
        });
      }
    } else {
      // Line or Area chart
      this.vertexPoints = [];
      let dLine = '';
      
      for (let i = 0; i < this.points.length; i++) {
        const pct = i / (this.points.length - 1 || 1);
        const val = this.points[i].value;
        const x = this.paddingLeft + pct * graphWidth;
        const yPct = val / maxValue;
        const y = this.paddingTop + graphHeight - (yPct * graphHeight);
        
        this.vertexPoints.push({ x, y });
        if (i === 0) {
          dLine += `M ${x} ${y}`;
        } else {
          dLine += ` L ${x} ${y}`;
        }
      }
      this.linePath = dLine;

      // Area Path needs to form a polygon closing at the bottom x-axis
      if (this.vertexPoints.length > 0) {
        const first = this.vertexPoints[0];
        const last = this.vertexPoints[this.vertexPoints.length - 1];
        const bottomY = this.paddingTop + graphHeight;
        this.areaPath = `${dLine} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
      }
    }
  }

  formatYValue(val: number): string {
    if (this.yFormat === 'currency') {
      if (val >= 1000) {
        return `$${this.decimalPipe.transform(val / 1000, '1.0-1')}k`;
      }
      return this.currencyPipe.transform(val, 'USD', 'symbol', '1.0-0') || '$0';
    }
    
    if (val >= 1000) {
      return `${this.decimalPipe.transform(val / 1000, '1.0-1')}k`;
    }
    return this.decimalPipe.transform(val, '1.0-0') || '0';
  }

  showTooltip(event: MouseEvent, point: ChartPoint, svgX: number, svgY: number): void {
    // We need to calculate position relative to the container element
    if (!this.containerRef) return;
    const containerRect = this.containerRef.nativeElement.getBoundingClientRect();
    const svgEl = this.containerRef.nativeElement.querySelector('.chart-svg');
    const svgRect = svgEl.getBoundingClientRect();

    // Map svg coordinate system to actual DOM pixel coordinates relative to the wrapper
    const scaleX = svgRect.width / this.width;
    const scaleY = svgRect.height / this.height;

    const actualX = (svgX * scaleX) + (svgRect.left - containerRect.left);
    const actualY = (svgY * scaleY) + (svgRect.top - containerRect.top);

    this.tooltip = {
      visible: true,
      x: actualX,
      y: actualY,
      label: point.label,
      value: point.value
    };
  }

  hideTooltip(): void {
    this.tooltip.visible = false;
  }
}
