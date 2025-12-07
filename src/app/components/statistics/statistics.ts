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
  loading: boolean = false;
  
  totalContacts: number = 0;
  contactsByType: { [key: string]: number } = {};
  // Tipamos correctamente la instancia del chart:
  chart?: Chart<'bar', number[], string>;

  private authService = inject(AuthService);
  private contactService = inject(ContactService);

  async ngOnInit() {
    await this.loadStatistics();
  }

  // Usamos AfterViewInit para crear el chart cuando el canvas exista
  ngAfterViewInit() {
    // Si ya cargaron los contactos y se calculó estadísticas, creamos el chart.
    if (Object.keys(this.contactsByType).length) {
      // esperamos un tick para asegurarnos el canvas esté listo
      setTimeout(() => this.createChart(), 50);
    }
  }

  async loadStatistics() {
    try {
      this.contacts = await this.contactService.getContacts();
      this.totalContacts = this.contacts.length;
      this.calculateStatistics();

      // Si el ViewChild ya está inicializado, crea el chart.
      if (this.chartCanvas && this.chartCanvas.nativeElement) {
        setTimeout(() => this.createChart(), 100);
      }
    } catch (error) {
      console.error(error);
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
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) return;

    const labels = Object.keys(this.contactsByType);
    // Convertimos explícitamente los valores a number[] para evitar unknown[]
    const dataValues: number[] = Object.values(this.contactsByType).map(v => Number(v));

    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(255, 152, 0, 0.8)',
      'rgba(76, 175, 80, 0.8)'
    ];

    // Tipamos la configuración usando ChartConfiguration genérico
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

    // Obtener el contexto 2D (esto ayuda a que TS infiera correctamente)
    const ctx = this.chartCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

    // destruimos chart previo si existe (buena práctica)
    if (this.chart) {
      this.chart.destroy();
    }

    // ahora creamos el chart con tipos explícitos
    this.chart = new Chart<'bar', number[], string>(ctx, config);
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}
