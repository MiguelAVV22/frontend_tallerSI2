import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService, SolicitudDisponible } from '../solicitud.service';
import { environment } from '../../../environments/environment';
import { TecnicoService } from '../../talleres-tecnicos/tecnico.service';

@Component({
  selector: 'app-ver-solicitudes-disponibles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-solicitudes-disponibles.component.html',
  styleUrl: './ver-solicitudes-disponibles.component.css',
})
export class VerSolicitudesDisponiblesComponent implements OnInit, OnDestroy {
  items: SolicitudDisponible[] = [];
  loading = false;
  errorMsg = '';
  seleccion: SolicitudDisponible | null = null;
  etaMinutos: number | null = null;
  aceptando = false;
  /** Mensaje global al aceptar solicitud (éxito / error). */
  bannerMsg: { tipo: 'ok' | 'error'; texto: string } | null = null;
  
  tallerLat: number | null = null;
  tallerLng: number | null = null;
  
  private _poll?: ReturnType<typeof setInterval>;
  private mapa: any;
  private markerTaller: any;
  private markerCliente: any;
  private polylineRuta: any;

  constructor(
    private solicitudSvc: SolicitudService, 
    private tecnicoSvc: TecnicoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.obtenerCoordenadasTaller();
    this._poll = setInterval(() => this.cargar(true), 20000);
  }

  ngOnDestroy(): void {
    if (this._poll) clearInterval(this._poll);
    if (this.mapa) {
      this.mapa.remove();
    }
  }

  obtenerCoordenadasTaller(): void {
    this.tecnicoSvc.getMiTaller().subscribe({
      next: (taller) => {
        if (taller.latitud !== undefined && taller.longitud !== undefined) {
          this.tallerLat = taller.latitud;
          this.tallerLng = taller.longitud;
        }
      },
      error: () => {}
    });
  }

  renderizarMapa(latCliente: number, lngCliente: number): void {
    setTimeout(() => {
      const container = document.getElementById('map-distancia');
      if (!container) return;

      const L = (window as any)['L'];
      if (!L) {
        console.error('Leaflet no está cargado');
        return;
      }

      if (this.mapa) {
        this.mapa.remove();
        this.mapa = null;
      }

      this.mapa = L.map('map-distancia').setView([latCliente, lngCliente], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapa);

      setTimeout(() => {
        if (this.mapa) {
          this.mapa.invalidateSize();
        }
      }, 50);

      const puntos = [];

      const iconCliente = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      this.markerCliente = L.marker([latCliente, lngCliente], { icon: iconCliente })
        .addTo(this.mapa)
        .bindPopup('<b>Ubicación del Incidente</b>')
        .openPopup();
      puntos.push([latCliente, lngCliente]);

      if (this.tallerLat !== null && this.tallerLng !== null) {
        const iconTaller = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        this.markerTaller = L.marker([this.tallerLat, this.tallerLng], { icon: iconTaller })
          .addTo(this.mapa)
          .bindPopup('<b>Tu Taller</b>');
        puntos.push([this.tallerLat, this.tallerLng]);

        this.polylineRuta = L.polyline([[this.tallerLat, this.tallerLng], [latCliente, lngCliente]], {
          color: '#6366F1',
          weight: 4,
          dashArray: '5, 10',
          opacity: 0.8
        }).addTo(this.mapa);

        const bounds = L.latLngBounds(puntos);
        this.mapa.fitBounds(bounds, { padding: [50, 50] });
      }
    }, 100);
  }

  cargar(silencioso = false): void {
    if (!silencioso) {
      this.loading = true;
      this.errorMsg = '';
      this.cdr.detectChanges();
    }
    this.solicitudSvc.listarDisponibles().subscribe({
      next: (data) => {
        this.items = data;
        if (this.seleccion) {
          this.seleccion = data.find((d) => d.incidente_id === this.seleccion!.incidente_id) ?? null;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.loading = false;
        this.errorMsg =
          e?.error?.detail ??
          (typeof e?.message === 'string' ? e.message : 'No se pudieron cargar las solicitudes.');
        this.cdr.detectChanges();
      },
    });
  }

  prioridadClass(p: string): string {
    if (p === 'alta') return 'badge-danger';
    if (p === 'media') return 'badge-warning';
    return 'badge-muted';
  }

  prioridadLabel(p: string): string {
    const m: Record<string, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' };
    return m[p] ?? p;
  }

  abrirDetalle(s: SolicitudDisponible): void {
    this.seleccion = s;
    if (s.latitud !== null && s.longitud !== null) {
      this.renderizarMapa(s.latitud, s.longitud);
    }
  }

  cerrarDetalle(): void {
    this.seleccion = null;
    this.etaMinutos = null;
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }
  }

  cerrarBanner(): void {
    this.bannerMsg = null;
  }

  aceptarSeleccion(): void {
    if (!this.seleccion || this.aceptando) return;
    this.aceptando = true;
    this.bannerMsg = null;
    const eta = this.etaMinutos != null && this.etaMinutos > 0 ? this.etaMinutos : undefined;
    this.solicitudSvc.aceptar(this.seleccion.incidente_id, eta).subscribe({
      next: (a) => {
        this.aceptando = false;
        this.bannerMsg = {
          tipo: 'ok',
          texto: `Solicitud aceptada. Asignación #${a.id}. El incidente pasó a en proceso.`,
        };
        this.cargar(true);
        this.seleccion = null;
        this.etaMinutos = null;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.aceptando = false;
        const d = e?.error?.detail;
        this.bannerMsg = {
          tipo: 'error',
          texto: typeof d === 'string' ? d : 'No se pudo aceptar la solicitud.',
        };
        this.cdr.detectChanges();
      },
    });
  }

  fotoFullUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  scoreLabel(score: number): string {
    if (score >= 0.7) return 'Muy cercano';
    if (score >= 0.4) return 'Cercano';
    if (score >  0)   return 'Lejano';
    return '';
  }

  scoreClass(score: number): string {
    if (score >= 0.7) return 'badge-success';
    if (score >= 0.4) return 'badge-warning';
    return 'badge-muted';
  }
}
