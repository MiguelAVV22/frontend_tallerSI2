import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardTallerMetricas {
  incidentes_activos: number;
  incidentes_finalizados: number;
  solicitudes_pendientes: number;
  tecnicos_disponibles: number;
  tecnicos_ocupados: number;
  promedio_tiempo_asignacion_min: number;
  promedio_tiempo_llegada_min: number;
  incidentes_por_estado: Record<string, number>;
  incidentes_por_tipo: Record<string, number>;
}

export interface DashboardKpiResponse {
  tiempo_promedio_asignacion: number;
  tiempo_promedio_llegada: number;
  tiempo_promedio_resolucion: number;
  porcentaje_cumplimiento_sla: number;
  tasa_cancelacion: number;
  tasa_resolucion: number;
  incidentes_por_tipo: Record<string, number>;
  incidentes_por_mes: Record<string, number>;
  sla_por_mes: Record<string, number>;
}

export interface TecnicoDesempenoResponse {
  tecnico_id: number;
  nombre: string;
  especialidad: string;
  estado: string;
  servicios_atendidos: number;
  servicios_finalizados: number;
  tiempo_promedio_llegada_min: number;
  tiempo_promedio_reparacion_min: number;
  calificacion_promedio: number;
  porcentaje_cumplimiento: number;
  puntaje_desempeno: number;
  posicion_ranking: number;
}

@Injectable({ providedIn: 'root' })
export class MetricasService {
  private readonly API = `${environment.apiUrl}/api/metricas`;

  constructor(private http: HttpClient) {}

  getDashboardTaller(tallerId: number): Observable<DashboardTallerMetricas> {
    return this.http.get<DashboardTallerMetricas>(`${this.API}/dashboard-taller?taller_id=${tallerId}`).pipe(timeout(8000));
  }

  getKpis(tallerId: number, periodo?: string): Observable<DashboardKpiResponse> {
    let url = `${this.API}/kpi?taller_id=${tallerId}`;
    if (periodo) {
      url += `&periodo=${periodo}`;
    }
    return this.http.get<DashboardKpiResponse>(url).pipe(timeout(8000));
  }

  getDesempenoTecnicos(tallerId: number, periodo?: string): Observable<TecnicoDesempenoResponse[]> {
    let url = `${this.API}/desempeno-tecnicos?taller_id=${tallerId}`;
    if (periodo) {
      url += `&periodo=${periodo}`;
    }
    return this.http.get<TecnicoDesempenoResponse[]>(url).pipe(timeout(8000));
  }

  getHeatmapData(): Observable<{lat: number, lng: number}[]> {
    return this.http.get<{lat: number, lng: number}[]>(`${this.API}/heatmap`).pipe(timeout(8000));
  }
}
