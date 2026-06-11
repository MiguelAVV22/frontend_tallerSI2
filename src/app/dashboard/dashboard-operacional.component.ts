import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricasService, DashboardTallerMetricas } from '../dashboard/metricas.service';
import { AuthService } from '../acceso-registro/auth.service';
import { TecnicoService, TallerInfoResponse } from '../talleres-tecnicos/tecnico.service';

interface DonutSegment {
  name: string;
  value: number;
  pct: string;
  offset: number;
  strokeDash: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-operacional',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="operacional-container" *ngIf="!loading && !error && metricasData">
      
      <!-- Encabezado con título e información -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard Operacional</h1>
        <p class="dashboard-subtitle">Métricas operativas en tiempo real</p>
      </div>

      <!-- Barra de Filtros del Dashboard -->
      <div class="filter-bar">
        <div class="filter-item">
          <span class="material-symbols-outlined filter-icon">calendar_today</span>
          <span class="filter-text">Este mes</span>
          <span class="material-symbols-outlined dropdown-arrow">expand_more</span>
        </div>
        <div class="filter-item">
          <span class="material-symbols-outlined filter-icon">group</span>
          <span class="filter-text">Todos los técnicos</span>
          <span class="material-symbols-outlined dropdown-arrow">expand_more</span>
        </div>
        <div class="filter-item">
          <span class="material-symbols-outlined filter-icon">schedule</span>
          <span class="filter-text">Todos los tipos</span>
          <span class="material-symbols-outlined dropdown-arrow">expand_more</span>
        </div>
      </div>

      <!-- Fila de 5 Tarjetas de Métricas Principales (KPIs) -->
      <div class="kpi-grid">
        <!-- Card 1: Incidentes Activos -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Incidentes activos</span>
            <span class="kpi-trend trend-down">-5.2%</span>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value highlight-red">{{ metricasData.incidentes_activos }}</span>
          </div>
        </div>

        <!-- Card 2: Solicitudes Atendidas -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Solicitudes atendidas</span>
            <span class="kpi-trend trend-up">+12.8%</span>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value highlight-green">{{ metricasData.incidentes_finalizados }}</span>
          </div>
        </div>

        <!-- Card 3: Tiempo Promedio Asignación -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Tiempo promedio asignación</span>
            <span class="kpi-trend trend-down">-8.5%</span>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value highlight-blue">
              {{ metricasData.promedio_tiempo_asignacion_min }} <span class="kpi-unit">min</span>
            </span>
          </div>
        </div>

        <!-- Card 4: Tiempo Promedio Llegada -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Tiempo promedio llegada</span>
            <span class="kpi-trend trend-down">-12.3%</span>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value highlight-orange">
              {{ metricasData.promedio_tiempo_llegada_min }} <span class="kpi-unit">min</span>
            </span>
          </div>
        </div>

        <!-- Card 5: Tasa de Atención -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Tasa de atención</span>
            <span class="kpi-trend trend-up">+3.7%</span>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value highlight-teal">{{ getTasaAtencion() }}%</span>
          </div>
        </div>
      </div>

      <!-- Fila de Paneles de Visualización -->
      <div class="panels-grid">
        <!-- Panel 1: Servicios Mensuales -->
        <div class="panel-card">
          <h3 class="panel-title">Servicios mensuales</h3>
          <div class="bars-container">
            <div *ngFor="let bar of monthlyBars" class="bar-col">
              <div class="bar-track">
                <div class="bar-fill" [style.height.%]="(bar.val / 170) * 100"></div>
              </div>
              <span class="bar-label">{{ bar.label }}</span>
            </div>
          </div>
        </div>

        <!-- Panel 2: Tiempo de Respuesta -->
        <div class="panel-card">
          <h3 class="panel-title">Tiempo de respuesta</h3>
          <div class="line-chart-container">
            <svg viewBox="0 0 110 50" class="line-chart-svg">
              <line x1="10" y1="40" x2="100" y2="40" stroke="#F1F5F9" stroke-width="0.5"></line>
              <line x1="10" y1="25" x2="100" y2="25" stroke="#F1F5F9" stroke-width="0.5"></line>
              <line x1="10" y1="10" x2="100" y2="10" stroke="#F1F5F9" stroke-width="0.5"></line>
              <path [attr.d]="getLinePath()" fill="none" stroke="#1E3A8A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
              <circle *ngFor="let pt of linePoints; let i = index"
                      [attr.cx]="10 + i * 15"
                      [attr.cy]="45 - (pt.val * 0.7)"
                      r="1.8"
                      fill="#1E3A8A"
                      stroke="white"
                      stroke-width="0.5">
              </circle>
            </svg>
            <div class="line-labels">
              <span *ngFor="let pt of linePoints">{{ pt.label }}</span>
            </div>
          </div>
        </div>

        <!-- Panel 3: Incidentes por Tipo -->
        <div class="panel-card">
          <h3 class="panel-title">Incidentes por tipo</h3>
          <div class="donut-chart-wrapper">
            <div class="donut-visual">
              <svg viewBox="0 0 100 100" class="donut-chart-svg">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" stroke-width="10"></circle>
                <circle *ngFor="let seg of donutSegments"
                        cx="50" cy="50" r="40" fill="transparent"
                        [attr.stroke]="seg.color"
                        stroke-width="10"
                        [attr.stroke-dasharray]="seg.strokeDash"
                        [attr.stroke-dashoffset]="seg.offset"
                        transform="rotate(-90 50 50)">
                </circle>
              </svg>
              <div class="donut-center">
                <span class="donut-center-pct">100%</span>
                <span class="donut-center-lbl">total</span>
              </div>
            </div>
            
            <!-- Lista Leyenda -->
            <div class="donut-legend">
              <div *ngFor="let seg of donutSegments" class="legend-item">
                <div class="legend-info">
                  <span class="legend-dot" [style.background-color]="seg.color"></span>
                  <span class="legend-name">{{ seg.name }}</span>
                </div>
                <span class="legend-val">{{ seg.pct }}%</span>
              </div>
              <div *ngIf="donutSegments.length === 0" class="no-data-legend">
                Sin incidentes registrados
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Cargas y Errores -->
    <div *ngIf="loading" class="state-container">
      <div class="spinner"></div>
      <p class="state-text">Cargando métricas operacionales...</p>
    </div>
    <div *ngIf="error" class="state-container error-state">
      <span class="material-symbols-outlined state-icon">error</span>
      <p class="state-text">{{error}}</p>
      <button class="retry-btn" (click)="ngOnInit()">Reintentar</button>
    </div>
  `,
  styles: [`
    .operacional-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* Encabezado */
    .dashboard-header {
      margin-bottom: 1.5rem;
    }
    .dashboard-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #1E3A8A; /* Azul Corporativo */
      margin: 0 0 0.25rem;
    }
    .dashboard-subtitle {
      font-size: 0.88rem;
      color: #64748B;
      margin: 0;
    }

    /* Barra de filtros */
    .filter-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .filter-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 0.5rem 0.88rem;
      font-size: 0.85rem;
      color: #475569;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
      transition: all 0.15s;
    }
    .filter-item:hover {
      border-color: #CBD5E1;
      background: #F8FAFC;
    }
    .filter-icon {
      font-size: 1.1rem;
      color: #94A3B8;
    }
    .filter-text {
      font-weight: 500;
    }
    .dropdown-arrow {
      font-size: 1.1rem;
      color: #94A3B8;
      margin-left: 0.25rem;
    }

    /* KPI Grid de 5 columnas */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    @media (max-width: 1024px) {
      .kpi-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (max-width: 640px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }

    .kpi-card {
      background: white;
      border: 1px solid #F1F5F9;
      border-radius: 12px;
      padding: 1.2rem 1rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 96px;
    }
    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .kpi-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .kpi-trend {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.1rem 0.4rem;
      border-radius: 6px;
    }
    .trend-up {
      background: #ECFDF5;
      color: #10B981;
    }
    .trend-down {
      background: #FEF2F2;
      color: #EF4444;
    }
    .kpi-value-row {
      display: flex;
      align-items: baseline;
    }
    .kpi-value {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .kpi-unit {
      font-size: 0.9rem;
      font-weight: 500;
      color: #64748B;
      margin-left: 0.15rem;
    }

    /* Colores para las metricas */
    .highlight-red { color: #DC2626; }
    .highlight-green { color: #059669; }
    .highlight-blue { color: #1E3A8A; }
    .highlight-orange { color: #EA580C; }
    .highlight-teal { color: #0F766E; }

    /* Fila de Paneles de Visualización */
    .panels-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }
    @media (max-width: 900px) {
      .panels-grid {
        grid-template-columns: 1fr;
      }
    }

    .panel-card {
      background: white;
      border: 1px solid #F1F5F9;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      min-height: 240px;
    }
    .panel-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1E293B;
      margin: 0 0 1.5rem;
    }

    /* Panel 1: Servicios Mensuales (Bars) */
    .bars-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 140px;
      padding: 0 0.5rem;
    }
    .bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    .bar-track {
      height: 110px;
      width: 12px;
      background: #F1F5F9;
      border-radius: 6px;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }
    .bar-fill {
      width: 100%;
      background: #2563EB;
      border-radius: 6px 6px 0 0;
      transition: height 0.5s ease-out;
    }
    .bar-label {
      font-size: 0.72rem;
      color: #64748B;
      margin-top: 0.5rem;
    }

    /* Panel 2: Tiempo de Respuesta (Line SVG) */
    .line-chart-container {
      display: flex;
      flex-direction: column;
      height: 140px;
      justify-content: space-between;
    }
    .line-chart-svg {
      width: 100%;
      height: 110px;
    }
    .line-labels {
      display: flex;
      justify-content: space-between;
      padding: 0 0.4rem;
    }
    .line-labels span {
      font-size: 0.72rem;
      color: #64748B;
      width: 15px;
      text-align: center;
    }

    /* Panel 3: Donut Chart (Incidentes por Tipo) */
    .donut-chart-wrapper {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      height: 140px;
    }
    .donut-visual {
      position: relative;
      width: 100px;
      height: 100px;
      flex-shrink: 0;
    }
    .donut-chart-svg {
      width: 100px;
      height: 100px;
    }
    .donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .donut-center-pct {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1E293B;
      line-height: 1;
    }
    .donut-center-lbl {
      font-size: 0.65rem;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
    }
    .donut-legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      max-height: 130px;
      overflow-y: auto;
    }
    .legend-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #475569;
    }
    .legend-info {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .legend-name {
      font-weight: 500;
    }
    .legend-val {
      font-weight: 700;
      color: #1E293B;
    }
    .no-data-legend {
      font-size: 0.75rem;
      color: #94A3B8;
      text-align: center;
    }

    /* Estados de Carga y Error */
    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      color: #64748B;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #E2E8F0;
      border-top-color: #2563EB;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-state {
      color: #EF4444;
    }
    .state-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .state-text {
      font-size: 0.9rem;
      font-weight: 500;
    }
    .retry-btn {
      margin-top: 1rem;
      background: #2563EB;
      color: white;
      border: none;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class DashboardOperacionalComponent implements OnInit {
  loading = true;
  error = '';
  metricasData: DashboardTallerMetricas | null = null;
  donutSegments: DonutSegment[] = [];

  monthlyBars = [
    { label: 'Ene', val: 45 },
    { label: 'Feb', val: 62 },
    { label: 'Mar', val: 85 },
    { label: 'Abr', val: 110 },
    { label: 'May', val: 135 },
    { label: 'Jun', val: 156 }
  ];

  linePoints = [
    { label: 'Lun', val: 42 },
    { label: 'Mar', val: 35 },
    { label: 'Mié', val: 38 },
    { label: 'Jue', val: 28 },
    { label: 'Vie', val: 32 },
    { label: 'Sáb', val: 25 },
    { label: 'Dom', val: 35 }
  ];

  constructor(
    private metricas: MetricasService,
    private tecnicoService: TecnicoService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = '';
    this.tecnicoService.getMiTaller().subscribe({
      next: (taller: TallerInfoResponse) => {
        this.metricas.getDashboardTaller(taller.id).subscribe({
          next: (data: DashboardTallerMetricas) => {
            this.metricasData = data;
            this.calculateDonutSegments();
            this.loading = false;
          },
          error: (err) => {
            this.error = err.error?.detail ?? 'Error al cargar métricas del taller.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = err.error?.detail ?? 'No se pudo obtener la información de tu taller.';
        this.loading = false;
      }
    });
  }

  getTasaAtencion(): string {
    if (!this.metricasData) return '0.0';
    const total = this.metricasData.incidentes_finalizados + this.metricasData.incidentes_activos;
    if (total === 0) return '100.0';
    return ((this.metricasData.incidentes_finalizados / total) * 100).toFixed(1);
  }

  getLinePath(): string {
    const xCoords = [10, 25, 40, 55, 70, 85, 100];
    const points = this.linePoints.map((pt, idx) => {
      const x = xCoords[idx];
      const y = 45 - (pt.val * 0.7);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  private calculateDonutSegments(): void {
    if (!this.metricasData?.incidentes_por_tipo) {
      this.donutSegments = [];
      return;
    }
    const entries = Object.entries(this.metricasData.incidentes_por_tipo);
    const total = entries.reduce((sum, [_, val]) => sum + val, 0) || 1;
    let accumulatedPercent = 0;
    const colors = ['#1E3A8A', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    
    this.donutSegments = entries.map(([key, value], idx) => {
      const pct = (value / total) * 100;
      const offset = (accumulatedPercent / 100) * 251.2;
      const strokeDash = `${(pct / 100) * 251.2} 251.2`;
      accumulatedPercent += pct;
      return {
        name: key,
        value: value,
        pct: pct.toFixed(1),
        offset: -offset,
        strokeDash: strokeDash,
        color: colors[idx % colors.length]
      };
    });
  }
}
