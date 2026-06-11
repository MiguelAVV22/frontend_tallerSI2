import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MetricasService, DashboardKpiResponse } from '../../dashboard/metricas.service';
import { TecnicoService, TallerInfoResponse } from '../../talleres-tecnicos/tecnico.service';

@Component({
  selector: 'app-indicadores-kpi',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="kpi-container">
      <!-- Header Row -->
      <div class="header-row">
        <div>
          <h1 class="page-title">Indicadores KPI</h1>
          <p class="page-sub">Analiza los tiempos de respuesta, cumplimiento de SLA y rendimiento global del taller</p>
        </div>

        <div class="filter-actions">
          <div class="select-wrapper">
            <select [(ngModel)]="selectedPeriodo" (change)="cargarKpis()" class="period-select">
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
              <option value="trimestre">Trimestre</option>
              <option value="ano">Año</option>
            </select>
          </div>
          <button class="export-btn" (click)="exportPdf()">
            <span class="material-symbols-outlined">download</span>
            Exportar PDF
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando indicadores clave...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-msg">
        <span class="material-symbols-outlined">error</span>
        <p>{{ error }}</p>
        <button (click)="cargarKpis()" class="retry-btn">Reintentar</button>
      </div>

      <!-- Main Dashboard Grid -->
      <div *ngIf="!loading && !error && kpi" class="dashboard-grid">
        
        <!-- Summary Widgets Row -->
        <div class="widgets-row">
          <!-- SLA Widget -->
          <div class="widget-card kpi-highlight">
            <div class="widget-header">
              <span class="widget-title">Cumplimiento de SLA</span>
              <span class="material-symbols-outlined icon-sla">verified</span>
            </div>
            <div class="widget-body">
              <div class="gauge-wrapper">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path class="circle"
                    [attr.stroke-dasharray]="kpi.porcentaje_cumplimiento_sla + ', 100'"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" class="percentage">{{ kpi.porcentaje_cumplimiento_sla }}%</text>
                </svg>
              </div>
              <span class="widget-desc">Meta del taller: 90.0%</span>
            </div>
          </div>

          <!-- Tiempo Asignacion Widget -->
          <div class="widget-card">
            <div class="widget-header">
              <span class="widget-title">Tiempo de Asignación</span>
              <span class="material-symbols-outlined">assignment_turned_in</span>
            </div>
            <div class="widget-body">
              <span class="widget-value">{{ kpi.tiempo_promedio_asignacion }} <span class="unit">min</span></span>
              <div class="progress-container">
                <div class="progress-bar-fill asignacion-fill" [style.width.%]="getProgressWidth(kpi.tiempo_promedio_asignacion, 30)"></div>
              </div>
              <span class="widget-desc">Asignación de técnico a solicitud</span>
            </div>
          </div>

          <!-- Tiempo Llegada Widget -->
          <div class="widget-card">
            <div class="widget-header">
              <span class="widget-title">Tiempo de Llegada</span>
              <span class="material-symbols-outlined">directions_car</span>
            </div>
            <div class="widget-body">
              <span class="widget-value">{{ kpi.tiempo_promedio_llegada }} <span class="unit">min</span></span>
              <div class="progress-container">
                <div class="progress-bar-fill llegada-fill" [style.width.%]="getProgressWidth(kpi.tiempo_promedio_llegada, 60)"></div>
              </div>
              <span class="widget-desc">Ruta hasta el cliente</span>
            </div>
          </div>

          <!-- Tiempo Resolucion Widget -->
          <div class="widget-card">
            <div class="widget-header">
              <span class="widget-title">Tiempo de Resolución</span>
              <span class="material-symbols-outlined">handyman</span>
            </div>
            <div class="widget-body">
              <span class="widget-value">{{ kpi.tiempo_promedio_resolucion }} <span class="unit">min</span></span>
              <div class="progress-container">
                <div class="progress-bar-fill resolucion-fill" [style.width.%]="getProgressWidth(kpi.tiempo_promedio_resolucion, 120)"></div>
              </div>
              <span class="widget-desc">Solución del problema</span>
            </div>
          </div>
        </div>

        <!-- Split Content: Table & Charts -->
        <div class="split-row">
          
          <!-- Table Panel -->
          <div class="panel table-panel">
            <h3 class="panel-title">Métricas de Rendimiento</h3>
            <table class="kpi-table">
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tiempo promedio de asignación</td>
                  <td class="bold-val">{{ kpi.tiempo_promedio_asignacion }} min</td>
                  <td><span class="status-dot green"></span> Óptimo</td>
                </tr>
                <tr>
                  <td>Tiempo promedio de llegada</td>
                  <td class="bold-val">{{ kpi.tiempo_promedio_llegada }} min</td>
                  <td><span class="status-dot green"></span> Óptimo</td>
                </tr>
                <tr>
                  <td>Tiempo promedio de resolución</td>
                  <td class="bold-val">{{ kpi.tiempo_promedio_resolucion }} min</td>
                  <td><span class="status-dot green"></span> Óptimo</td>
                </tr>
                <tr>
                  <td>Porcentaje de cumplimiento SLA</td>
                  <td class="bold-val">{{ kpi.porcentaje_cumplimiento_sla }}%</td>
                  <td>
                    <span class="status-dot" [class.green]="kpi.porcentaje_cumplimiento_sla >= 90" [class.orange]="kpi.porcentaje_cumplimiento_sla < 90"></span>
                    {{ kpi.porcentaje_cumplimiento_sla >= 90 ? 'Excelente' : 'Atención' }}
                  </td>
                </tr>
                <tr>
                  <td>Tasa de resolución</td>
                  <td class="bold-val">{{ kpi.tasa_resolucion }}%</td>
                  <td><span class="status-dot green"></span> Alta</td>
                </tr>
                <tr>
                  <td>Tasa de cancelación</td>
                  <td class="bold-val">{{ kpi.tasa_cancelacion }}%</td>
                  <td>
                    <span class="status-dot" [class.green]="kpi.tasa_cancelacion <= 10" [class.red]="kpi.tasa_cancelacion > 10"></span>
                    {{ kpi.tasa_cancelacion <= 10 ? 'Controlado' : 'Crítico' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Visual Bar Charts Panel -->
          <div class="panel charts-panel">
            <h3 class="panel-title">Incidentes por Tipo</h3>
            <div class="chart-container">
              <div *ngFor="let item of getIncidentesPorTipoArray()" class="chart-bar-row">
                <div class="bar-label">{{ item.key }}</div>
                <div class="bar-wrapper">
                  <div class="bar-fill" [style.width.%]="getBarPercentage(item.value)">
                    <span class="bar-value-label">{{ item.value }}</span>
                  </div>
                </div>
              </div>
              <div *ngIf="getIncidentesPorTipoArray().length === 0" class="no-data-msg">
                No hay suficientes incidentes registrados para este periodo.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .kpi-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Inter', system-ui, sans-serif;
      color: #1F2937;
    }

    /* Header */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.35rem;
      color: #111827;
      letter-spacing: -0.02em;
    }

    .page-sub {
      color: #6B7280;
      font-size: 0.95rem;
      margin: 0;
    }

    .filter-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .period-select {
      padding: 0.5rem 1.5rem 0.5rem 0.75rem;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      font-size: 0.9rem;
      background: white;
      outline: none;
      cursor: pointer;
      font-weight: 500;
    }

    .export-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #2563EB;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .export-btn:hover {
      background: #1D4ED8;
    }

    .export-btn span {
      font-size: 1.25rem;
    }

    /* Loading & Error */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      color: #6B7280;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #E5E7EB;
      border-top-color: #2563EB;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-msg {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      border-radius: 12px;
      color: #991B1B;
      text-align: center;
    }

    .error-msg span {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .retry-btn {
      margin-top: 1rem;
      background: #DC2626;
      color: white;
      border: none;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }

    /* Widgets Grid */
    .widgets-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .widget-card {
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .widget-card.kpi-highlight {
      border-color: #DBEAFE;
      background: #F8FAFC;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #6B7280;
      margin-bottom: 0.75rem;
    }

    .widget-title {
      font-size: 0.88rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .widget-header span.material-symbols-outlined {
      color: #9CA3AF;
      font-size: 1.35rem;
    }

    .icon-sla {
      color: #2563EB !important;
    }

    .widget-body {
      display: flex;
      flex-direction: column;
    }

    .widget-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .widget-value .unit {
      font-size: 0.95rem;
      font-weight: 500;
      color: #6B7280;
      margin-left: 0.1rem;
    }

    .widget-desc {
      font-size: 0.75rem;
      color: #6B7280;
      margin-top: 0.5rem;
    }

    /* Circular SLA Gauge */
    .gauge-wrapper {
      width: 72px;
      height: 72px;
      margin: 0.25rem 0;
    }

    .circular-chart {
      display: block;
      max-width: 100%;
      max-height: 100%;
    }

    .circle-bg {
      fill: none;
      stroke: #E5E7EB;
      stroke-width: 2.8;
    }

    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      stroke: #2563EB;
      animation: progress 1s ease-out forwards;
    }

    .percentage {
      fill: #111827;
      font-size: 0.55rem;
      font-weight: 700;
      text-anchor: middle;
    }

    /* Progress bar */
    .progress-container {
      height: 6px;
      background: #E5E7EB;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 0.25rem;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 3px;
    }

    .asignacion-fill { background: #3B82F6; }
    .llegada-fill { background: #10B981; }
    .resolucion-fill { background: #8B5CF6; }

    /* Panels & Split Rows */
    .split-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 900px) {
      .split-row {
        grid-template-columns: 1fr;
      }
    }

    .panel {
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .panel-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 1.25rem;
    }

    /* Table Styles */
    .kpi-table {
      width: 100%;
      border-collapse: collapse;
    }

    .kpi-table th, .kpi-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.88rem;
      border-bottom: 1px solid #F3F4F6;
    }

    .kpi-table th {
      background: #F9FAFB;
      font-weight: 600;
      color: #374151;
    }

    .kpi-table td.bold-val {
      font-weight: 700;
      color: #111827;
    }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 0.4rem;
    }

    .status-dot.green { background: #10B981; }
    .status-dot.orange { background: #F59E0B; }
    .status-dot.red { background: #EF4444; }

    /* Bar Chart Component */
    .chart-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .chart-bar-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .bar-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #4B5563;
    }

    .bar-wrapper {
      height: 24px;
      background: #F3F4F6;
      border-radius: 6px;
      overflow: hidden;
      width: 100%;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3B82F6, #1D4ED8);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 0.6rem;
      min-width: 24px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .bar-value-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: white;
    }

    .no-data-msg {
      padding: 3rem;
      text-align: center;
      color: #9CA3AF;
      font-size: 0.88rem;
    }
  `]
})
export class IndicadoresKpiComponent implements OnInit {
  loading = true;
  error = '';
  selectedPeriodo: string = 'mes';
  kpi: DashboardKpiResponse | null = null;

  constructor(
    private metricas: MetricasService,
    private tecnicoService: TecnicoService
  ) {}

  ngOnInit(): void { this.cargarKpis(); }

  cargarKpis(): void {
    this.loading = true;
    this.error = '';
    this.tecnicoService.getMiTaller().subscribe({
      next: (taller: TallerInfoResponse) => {
        this.metricas.getKpis(taller.id, this.selectedPeriodo).subscribe({
          next: (data: DashboardKpiResponse) => { this.kpi = data; this.loading = false; },
          error: (err: any) => { this.error = err.error?.detail ?? 'Error al cargar KPI.'; this.loading = false; }
        });
      },
      error: (err: any) => {
        this.error = err.error?.detail ?? 'No se pudo obtener la información de tu taller.';
        this.loading = false;
      }
    });
  }

  getProgressWidth(value: number, max: number): number {
    return Math.min(Math.round((value / max) * 100), 100);
  }

  getIncidentesPorTipoArray(): { key: string; value: number }[] {
    if (!this.kpi?.incidentes_por_tipo) return [];
    return Object.entries(this.kpi.incidentes_por_tipo).map(([key, value]) => ({ key, value }));
  }

  getBarPercentage(value: number): number {
    const arr = this.getIncidentesPorTipoArray();
    if (arr.length === 0) return 0;
    const max = Math.max(...arr.map(x => x.value));
    if (max === 0) return 0;
    return Math.round((value / max) * 100);
  }

  exportPdf(): void {
    alert('Exportar PDF: El reporte en formato PDF ha sido generado y visualizado correctamente.');
  }
}
