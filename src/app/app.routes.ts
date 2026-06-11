import { Routes } from '@angular/router';
import { IniciarSesionComponent } from './acceso-registro/iniciar-sesion/iniciar-sesion.component';
import { RegistrarseComponent } from './acceso-registro/registrarse/registrarse.component';
import { RecuperarContrasenaComponent } from './acceso-registro/recuperar-contrasena/recuperar-contrasena.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AdjuntarFotosComponent } from './emergencias/adjuntar-fotos/adjuntar-fotos.component';
import { EnviarAudioComponent } from './emergencias/enviar-audio/enviar-audio.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';
import { AccesoDenegadoComponent } from './acceso-denegado/acceso-denegado.component';
import { CambiarContrasenaComponent } from './acceso-registro/cambiar-contrasena/cambiar-contrasena.component';
import { AppLayoutComponent } from './shared/layout/app-layout.component';
import { VerEstadoSolicitudComponent } from './solicitudes/ver-estado-solicitud/ver-estado-solicitud.component';
import { VerSolicitudesDisponiblesComponent } from './solicitudes/ver-solicitudes-disponibles/ver-solicitudes-disponibles.component';
import { VerDetalleIncidenteComponent } from './solicitudes/ver-detalle-incidente/ver-detalle-incidente.component';
import { GestionarTecnicosComponent } from './talleres-tecnicos/gestionar-tecnicos/gestionar-tecnicos.component';
import { GestionarDisponibilidadComponent } from './talleres-tecnicos/gestionar-disponibilidad/gestionar-disponibilidad.component';
import { ActualizarEstadoServicioComponent } from './talleres-tecnicos/actualizar-estado-servicio/actualizar-estado-servicio.component';
import { RegistrarServicioRealizadoComponent } from './talleres-tecnicos/registrar-servicio-realizado/registrar-servicio-realizado.component';
import { GenerarCotizacionComponent } from './cotizacion-pagos/generar-cotizacion/generar-cotizacion.component';
import { VerCotizacionComponent } from './cotizacion-pagos/ver-cotizacion/ver-cotizacion.component';
import { ConfirmarCotizacionComponent } from './cotizacion-pagos/confirmar-cotizacion/confirmar-cotizacion.component';
import { VerComisionesComponent } from './cotizacion-pagos/ver-comisiones/ver-comisiones.component';
import { RealizarPagoComponent } from './cotizacion-pagos/realizar-pago/realizar-pago.component';
import { ChatComponent } from './comunicacion/chat/chat.component';
import { NotificacionesComponent } from './comunicacion/notificaciones/notificaciones.component';
import { AuditoriaComponent } from './reportes/auditoria/auditoria.component';
import { HistorialServiciosComponent } from './reportes/historial-servicios/historial-servicios.component';
import { MetricasTallerComponent } from './reportes/metricas-taller/metricas-taller.component';
import { MetricasGlobalesComponent } from './reportes/metricas-globales/metricas-globales.component';
import { CalificarServicioComponent } from './reportes/calificar-servicio/calificar-servicio.component';
import { DashboardOperacionalComponent } from './dashboard/dashboard-operacional.component';
import { IndicadoresKpiComponent } from './reportes/indicadores-kpi/indicadores-kpi.component';
import { DesempenoTecnicosComponent } from './reportes/desempeno-tecnicos/desempeno-tecnicos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: IniciarSesionComponent },
  { path: 'registro', component: RegistrarseComponent },
  { path: 'recuperar-contrasena', component: RecuperarContrasenaComponent },

  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardHomeComponent },

      // Dashboard Operacional (CU41)
      { path: 'dashboard-operacional', component: DashboardOperacionalComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },

      // Acceso denegado
      { path: 'acceso-denegado', component: AccesoDenegadoComponent },

      // Acceso y registro
      { path: 'acceso-registro/cambiar-contrasena', component: CambiarContrasenaComponent },
      { path: 'acceso-registro/registrar-taller', component: RegistrarseComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },
      { path: 'acceso-registro/aprobar-talleres', component: RegistrarseComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'acceso-registro/gestionar-usuarios', component: RegistrarseComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'acceso-registro/gestionar-vehiculos', component: DashboardHomeComponent, canActivate: [roleGuard], data: { roles: ['cliente'] } },

      // Emergencias
      { path: 'emergencias/adjuntar-fotos', component: AdjuntarFotosComponent, canActivate: [roleGuard], data: { roles: ['cliente'] } },
      { path: 'emergencias/enviar-audio', component: EnviarAudioComponent, canActivate: [roleGuard], data: { roles: ['cliente'] } },
      { path: 'emergencias/reportar-emergencia', component: DashboardHomeComponent, canActivate: [roleGuard], data: { roles: ['cliente'] } },
      { path: 'emergencias/enviar-ubicacion', component: DashboardHomeComponent, canActivate: [roleGuard], data: { roles: ['cliente'] } },

      // Solicitudes
      { path: 'solicitudes/ver-solicitudes-disponibles', component: VerSolicitudesDisponiblesComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },
      { path: 'solicitudes/ver-estado-solicitud', component: VerEstadoSolicitudComponent, canActivate: [roleGuard], data: { roles: ['cliente'] } },
      { path: 'solicitudes/ver-detalle-incidente', component: VerDetalleIncidenteComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },
      { path: 'solicitudes/cancelar-solicitud', component: DashboardHomeComponent, canActivate: [roleGuard], data: { roles: ['cliente'] } },

      // Talleres y Técnicos
      { path: 'talleres-tecnicos/gestionar-tecnicos', component: GestionarTecnicosComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },
      { path: 'talleres-tecnicos/gestionar-disponibilidad', component: GestionarDisponibilidadComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },
      { path: 'talleres-tecnicos/actualizar-estado-servicio', component: ActualizarEstadoServicioComponent, canActivate: [roleGuard], data: { roles: ['taller', 'tecnico'] } },
      { path: 'talleres-tecnicos/registrar-servicio-realizado', component: RegistrarServicioRealizadoComponent, canActivate: [roleGuard], data: { roles: ['taller', 'tecnico'] } },

      // Cotización y pagos
      { path: 'cotizacion-pagos/generar-cotizacion', component: GenerarCotizacionComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },
      { path: 'cotizacion-pagos/ver-cotizacion', component: VerCotizacionComponent, canActivate: [roleGuard], data: { roles: ['taller', 'cliente'] } },
      { path: 'cotizacion-pagos/confirmar-cotizacion', component: ConfirmarCotizacionComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },
      { path: 'cotizacion-pagos/ver-comisiones', component: VerComisionesComponent, canActivate: [roleGuard], data: { roles: ['taller', 'admin'] } },
      { path: 'cotizacion-pagos/realizar-pago', component: RealizarPagoComponent, canActivate: [roleGuard], data: { roles: ['cliente'] } },

      // Comunicación
      { path: 'comunicacion/chat', component: ChatComponent, canActivate: [roleGuard], data: { roles: ['cliente', 'taller', 'tecnico'] } },
      { path: 'comunicacion/notificaciones', component: NotificacionesComponent, canActivate: [roleGuard], data: { roles: ['cliente', 'taller'] } },

      // Reportes
      { path: 'reportes/auditoria', component: AuditoriaComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'reportes/historial-servicios', component: HistorialServiciosComponent, canActivate: [roleGuard], data: { roles: ['cliente', 'taller'] } },
      { path: 'reportes/metricas-taller', component: MetricasTallerComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },
      { path: 'reportes/metricas-globales', component: MetricasGlobalesComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'reportes/calificar-servicio', component: CalificarServicioComponent, canActivate: [roleGuard], data: { roles: ['cliente'] } },

      // CU42 – Indicadores KPI
      { path: 'reportes/indicadores-kpi', component: IndicadoresKpiComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },

      // CU43 – Desempeño Técnicos
      { path: 'reportes/desempeno-tecnicos', component: DesempenoTecnicosComponent, canActivate: [roleGuard], data: { roles: ['taller'] } },

      // Stubs catch‑all (rutas no implementadas aún)
      { path: 'emergencias/:cu', component: DashboardHomeComponent },
      { path: 'solicitudes/:cu', component: DashboardHomeComponent },
      { path: 'talleres-tecnicos/:cu', component: DashboardHomeComponent },
      { path: 'cotizacion-pagos/:cu', component: DashboardHomeComponent },
      { path: 'comunicacion/:cu', component: DashboardHomeComponent },
      { path: 'reportes/:cu', component: DashboardHomeComponent },
      { path: 'acceso-registro/:cu', component: DashboardHomeComponent },
    ],
  },

  { path: 'dashboard', redirectTo: 'app/dashboard', pathMatch: 'full' },
];
