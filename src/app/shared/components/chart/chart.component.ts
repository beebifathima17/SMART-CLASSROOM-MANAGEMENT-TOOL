import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ChartConfiguration,
  ChartType,
  registerables
} from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  imports: [CommonModule],
  template: `
    <div class="chart-container" [style.height]="height">
      <canvas #canvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      min-height: 200px;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) type: ChartType = 'line';
  @Input({ required: true }) data: ChartConfiguration['data'] = { datasets: [], labels: [] };
  @Input() options: ChartConfiguration['options'] = {};
  @Input() height: string = '260px';

  private chartInstance: Chart | null = null;

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chartInstance && (changes['data'] || changes['options'] || changes['type'])) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  private initChart(): void {
    if (!this.canvasRef?.nativeElement) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const defaultOptions: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            color: '#475569',
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: 'bold' },
          bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
          padding: 10,
          cornerRadius: 8
        }
      },
      ...this.options
    };

    this.chartInstance = new Chart(this.canvasRef.nativeElement, {
      type: this.type,
      data: this.data,
      options: defaultOptions
    });
  }

  private updateChart(): void {
    if (!this.chartInstance) {
      this.initChart();
      return;
    }

    this.chartInstance.data = this.data;
    if (this.options) {
      this.chartInstance.options = { ...this.chartInstance.options, ...this.options };
    }
    this.chartInstance.update('none');
  }
}
