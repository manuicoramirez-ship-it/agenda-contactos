import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ContactService } from '../../services/contact';
import { Contact } from '../../models/contact';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class Statistics implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
    
  contacts: Contact[] = [];
  loading: boolean = true;
    
  totalContacts: number = 0;
  contactsByType: { [key: string]: number } = {};
  chart?: Chart<'bar', number[], string>;
  chartReady: boolean = false;

  private authService = inject(AuthService);
  private contactService = inject(ContactService);

  async ngOnInit() {
    await this.loadStatistics();
  }

  ngAfterViewInit() {
    // Esperar a que se calculen las estadísticas
    if (Object.keys(this.contactsByType).length > 0 && !this.chartReady) {
      setTimeout(() => this.createChart(), 100);
    }
  }

  async loadStatistics() {
    this.loading = true;
    try {
      this.contacts = await this.contactService.getContacts();
      this.totalContacts = this.contacts.length;
      this.calculateStatistics();
      
      // ARREGLADO: Crear gráfico después de cargar datos
      if (this.totalContacts > 0) {
        setTimeout(() => {
          if (this.chartCanvas && this.chartCanvas.nativeElement) {
            this.createChart();
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      alert('Error al cargar estadísticas');
    } finally {
      this.loading = false;
    }
  }

  calculateStatistics() {
    this.contactsByType = this.contacts.reduce((acc: any, contact) => {
      acc[contact.contactType] = (acc[contact.contactType] || 0) + 1;
      return acc;
    }, {});
  }

  createChart() {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.error('Canvas no disponible');
      return;
    }

    if (this.chartReady) {
      console.log('El gráfico ya fue creado');
      return;
    }

    const labels = Object.keys(this.contactsByType);
    const dataValues: number[] = Object.values(this.contactsByType).map(v => Number(v));

    if (labels.length === 0) {
      console.warn('No hay datos para mostrar');
      return;
    }

    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(56, 142, 60, 0.8)',
      'rgba(245, 124, 0, 0.8)',
      'rgba(123, 31, 162, 0.8)'
    ];

    const config: ChartConfiguration<'bar', number[], string> = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de Contactos',
          data: dataValues,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#333'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 16 },
            bodyFont: { size: 14 },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 12, weight: 'bold' },
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              font: { size: 12, weight: 'bold' },
              color: '#666'
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    try {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) {
        console.error('No se pudo obtener el contexto 2D');
        return;
      }

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart<'bar', number[], string>(ctx, config);
      this.chartReady = true;
      console.log('✅ Gráfico creado exitosamente');
    } catch (error) {
      console.error('Error al crear el gráfico:', error);
    }
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}