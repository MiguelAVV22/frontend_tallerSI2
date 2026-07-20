import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricasService } from '../metricas.service';

@Component({
  selector: 'app-heatmap-incidentes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 1.5rem; background-color: #F9FAFB; min-height: 100vh;">
      
      <!-- Encabezado del Módulo -->
      <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="margin: 0; font-size: 1.75rem; font-weight: 700; color: #111827;">Mapa de Calor de Incidentes (SOS)</h1>
            <p style="margin: 0.25rem 0 0; color: #6B7280; font-size: 0.875rem;">
              Zonas críticas y acumulación de emergencias vehiculares calculadas por densidad de coordenadas GPS.
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <span style="background-color: #FEE2E2; color: #991B1B; padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600;">
              {{ puntos.length }} incidentes geolocalizados
            </span>
            <button 
              (click)="cargarDatos()" 
              style="background-color: #2563EB; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s;"
              onmouseover="this.style.backgroundColor='#1D4ED8'"
              onmouseout="this.style.backgroundColor='#2563EB'"
            >
              Actualizar Mapa
            </button>
          </div>
        </div>
      </div>

      <!-- Contenedor del Mapa -->
      <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; padding: 1rem; margin-bottom: 1.5rem;">
        @if (loading) {
          <div style="height: 550px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1rem;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
            <p style="color: #6B7280;">Cargando datos y ajustando cobertura geolocalizada...</p>
          </div>
        } @else if (errorMsg) {
          <div style="height: 550px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1rem; color: #DC2626;">
            <p style="font-weight: 600;">{{ errorMsg }}</p>
            <button (click)="cargarDatos()" style="background-color: #EF4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Reintentar</button>
          </div>
        } @else {
          <div id="map-heatmap" style="height: 550px; width: 100%; border-radius: 8px; z-index: 1;"></div>
        }
      </div>

      <!-- Sección Informativa: Leyenda e Indicadores de Calor -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        
        <!-- Tarjeta 1: Leyenda e Interpretación Térmica -->
        <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 700; color: #1F2937; display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: #EF4444;">🔥</span> Leyenda del Mapa de Calor
          </h3>
          <p style="font-size: 0.875rem; color: #4B5563; margin-bottom: 1rem; line-height: 1.4;">
            La densidad de incidentes se determina agrupando las coordenadas GPS <code>(Latitud, Longitud)</code>. Al acumularse varias emergencias en un mismo radio geográfico, la intensidad del gradiente térmico se incrementa:
          </p>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 24px; height: 16px; border-radius: 4px; background: linear-gradient(to right, #0000ff, #00ffff);"></div>
              <div>
                <span style="font-size: 0.85rem; font-weight: 600; color: #1E3A8A;">Azul / Cían (Densidad Baja):</span>
                <span style="font-size: 0.8rem; color: #6B7280; display: block;">1 incidente aislado registrado en las coordenadas de la zona.</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 24px; height: 16px; border-radius: 4px; background: linear-gradient(to right, #00ff00, #ffff00);"></div>
              <div>
                <span style="font-size: 0.85rem; font-weight: 600; color: #854D0E;">Verde / Amarillo (Densidad Media):</span>
                <span style="font-size: 0.8rem; color: #6B7280; display: block;">2 o más solicitudes de auxilio próximas en un radio de ~200 metros.</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 24px; height: 16px; border-radius: 4px; background: linear-gradient(to right, #ff8000, #ff0000);"></div>
              <div>
                <span style="font-size: 0.85rem; font-weight: 600; color: #991B1B;">Naranja / Rojo (Zona Crítica de Alto Riesgo):</span>
                <span style="font-size: 0.8rem; color: #6B7280; display: block;">Concentración crítica de múltiples accidentes en avenidas o nudos viales.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta 2: Análisis Estadístico y Geolocalización por Tenant -->
        <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 700; color: #1F2937; display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: #2563EB;">📍</span> Identificación Geográfica por Coordenadas
          </h3>
          <p style="font-size: 0.875rem; color: #4B5563; margin-bottom: 1rem; line-height: 1.4;">
            Los datos mostrados corresponden exclusivamente a las solicitudes pertenecientes al <strong>Tenant (Red de Talleres)</strong> del usuario actualmente autenticado:
          </p>

          <div style="background-color: #F3F4F6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-size: 0.85rem; font-weight: 600; color: #374151;">Total Coordenadas Mapeadas:</span>
              <span style="font-size: 0.85rem; font-weight: 700; color: #2563EB;">{{ puntos.length }} puntos</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-size: 0.85rem; font-weight: 600; color: #374151;">Ajuste Automático de Encadre (Fit Bounds):</span>
              <span style="font-size: 0.85rem; font-weight: 700; color: #059669;">Activo (Cubre todas las zonas)</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 0.85rem; font-weight: 600; color: #374151;">Filtro Multi-tenant:</span>
              <span style="font-size: 0.85rem; font-weight: 700; color: #D97706;">Aislamiento por Tenant ID</span>
            </div>
          </div>

          <p style="font-size: 0.8rem; color: #6B7280; font-style: italic; margin: 0;">
            Nota: Al registrarse en la plataforma, cada cliente y taller queda vinculado a una Red (Tenant). Si tu taller pertenece a otra red con incidentes en Santa Cruz o Cochabamba, el mapa ajustará automáticamente el zoom y centrado hacia dichas coordenadas.
          </p>
        </div>

      </div>

    </div>
    
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `
})
export class HeatmapIncidentesComponent implements OnInit, OnDestroy {
  puntos: { lat: number; lng: number }[] = [];
  loading = true;
  errorMsg = '';
  private mapa: any = null;
  private heatLayer: any = null;

  constructor(private metricasSvc: MetricasService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    if (this.mapa) {
      this.mapa.remove();
    }
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMsg = '';
    
    this.metricasSvc.getHeatmapData().subscribe({
      next: (data) => {
        this.puntos = data;
        this.loading = false;
        this.inicializarMapa();
      },
      error: (err) => {
        console.error('Error al obtener datos del mapa de calor:', err);
        this.errorMsg = 'No se pudieron cargar los datos del mapa de calor.';
        this.loading = false;
      }
    });
  }

  async inicializarMapa(): Promise<void> {
    const maxIntentos = 20;
    let intento = 0;

    const intentar = async () => {
      const container = document.getElementById('map-heatmap');
      if (!container) {
        intento++;
        if (intento < maxIntentos) {
          setTimeout(intentar, 100);
        } else {
          console.error('El contenedor map-heatmap no se renderizó en el DOM a tiempo.');
        }
        return;
      }

      const L = (window as any)['L'];
      if (!L) {
        console.error('Leaflet no está disponible globalmente.');
        this.errorMsg = 'Error: Leaflet no está disponible en la página.';
        return;
      }

      await this.cargarScriptHeatmap();

      if (this.mapa) {
        try {
          this.mapa.remove();
        } catch (e) {
          console.error('Error al remover el mapa anterior:', e);
        }
        this.mapa = null;
      }

      // Inicializar el mapa base
      this.mapa = L.map('map-heatmap').setView([-16.5000, -68.1500], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapa);

      if (this.puntos.length > 0) {
        // Ajustar el encadre dinámicamente para incluir TODOS los puntos geolocalizados de la red (La Paz, Santa Cruz, etc.)
        const latLngs = this.puntos.map(p => [p.lat, p.lng]);
        const bounds = L.latLngBounds(latLngs);
        this.mapa.fitBounds(bounds, { padding: [50, 50] });

        // Preparar puntos para el Heatmap [lat, lng, intensidad]
        const heatPoints = this.puntos.map(p => [p.lat, p.lng, 0.6]);

        if ((L as any).heatLayer) {
          this.heatLayer = (L as any).heatLayer(heatPoints, {
            radius: 30,
            blur: 18,
            maxZoom: 15,
            max: 1.0
          }).addTo(this.mapa);
        } else {
          console.error('Plugin Leaflet.heat no se pudo cargar. Mostrando marcadores fallback.');
          this.puntos.forEach(p => {
            L.marker([p.lat, p.lng]).addTo(this.mapa);
          });
        }
      }

      setTimeout(() => {
        if (this.mapa) {
          this.mapa.invalidateSize();
        }
      }, 200);
    };

    setTimeout(intentar, 50);
  }

  private cargarScriptHeatmap(): Promise<void> {
    return new Promise((resolve) => {
      const L = (window as any)['L'];
      if (L && (L as any).heatLayer) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }
}
