import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ChartConfiguration, ChartOptions, CategoryScale, LinearScale, PointElement, LineElement, LineController, Title, Tooltip, Legend, Filler, Chart as ChartJS } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart as ChartService } from '../../../../services/chart/chart';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Title, Tooltip, Legend, Filler);

@Component({
  selector: 'app-chart',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class Chart implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  filter: 'day' | 'week' | 'month' | 'year' = 'month';
  
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Income',
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        tension: 0.4,
      },
    ],
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        display: true,
      },
      y: {
        type: 'linear',
        beginAtZero: true,
        display: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          },
        },
      },
    },
    plugins: { 
      legend: { 
        display: true,
        position: 'top',
      }, 
      tooltip: { 
        enabled: true,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y ?? 0;
            return 'Income: ₹' + value.toLocaleString();
          },
        },
      } 
    },
  };

  loading = false;
  error?: string;

  constructor(
    private chartService: ChartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    // Load data after view is initialized
    this.loadChartData();
  }

  onFilterChange(): void {
    this.loadChartData();
  }

  loadChartData(): void {
    this.loading = true;
    this.error = undefined;

    this.chartService.statsWithPeriod(this.filter).subscribe({
      next: (res: any) => {
        console.log('Chart API response:', res);
        
        if (res && res.success && res.data) {
          const labels = res.data.labels || [];
          const values = res.data.values || [];
          
          console.log('Labels:', labels, 'Values:', values);
          
          if (labels.length > 0 && values.length > 0) {
            // Update chart data
            this.lineChartData = {
              labels: [...labels], // Create new array reference
              datasets: [
                {
                  data: [...values], // Create new array reference
                  label: 'Income',
                  fill: true,
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.3)',
                  tension: 0.4,
                },
              ],
            };
            
            this.loading = false;
            this.error = undefined;
            
            // Force change detection
            this.cdr.detectChanges();
            
            // Update chart after a brief delay to ensure DOM is ready
            setTimeout(() => {
              if (this.chart?.chart) {
                console.log('Updating chart with new data');
                this.chart.update();
              } else {
                console.warn('Chart instance not found');
              }
            }, 200);
          } else {
            this.error = 'No data available for the selected period';
            this.loading = false;
          }
        } else {
          this.error = 'Invalid response format';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Chart API error:', err);
        this.error = err.error?.message || err.message || 'Failed to load income data';
        this.loading = false;
      },
    });
  }
}