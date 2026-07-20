import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TecnicoService,
  TecnicoResponse,
  AsignacionResponse,
  UnidadAuxilioResponse,
  UnidadAuxilioCreate,
} from '../tecnico.service';

type PanelMode = 'registrar' | 'editar' | null;

@Component({
  selector: 'app-gestionar-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-tecnicos.component.html',
})
export class GestionarTecnicosComponent implements OnInit {

  // ── Datos ──────────────────────────────────────────────
  tecnicos: TecnicoResponse[] = [];
  asignaciones: AsignacionResponse[] = [];
  unidades: UnidadAuxilioResponse[] = [];

  // ── Carga ──────────────────────────────────────────────
  loadingTecnicos  = false;
  loadingAsig      = false;
  loadingUnidades  = false;
  errorTecnicos    = '';
  errorAsig        = '';
  errorUnidades    = '';

  // ── Panel registro / edición ───────────────────────────
  panelMode: PanelMode = null;
  editandoId: number | null = null;

  form = { nombre: '', especialidad: '', telefono: '', email: '', password: '' };
  guardando = false;
  formError = '';
  formSuccess = '';

  // ── Panel Grúas ───────────────────────────────────────
  formUnidad = { placa: '', modelo: '', tipo: 'grua_liviana', capacidad_carga_kg: 2000 };
  guardandoUnidad = false;
  unidadFormError = '';
  unidadFormSuccess = '';

  // ── Asignar ────────────────────────────────────────────
  asignandoId: number | null = null;
  tecnicoSeleccionado: Record<number, number | null> = {};
  unidadSeleccionada: Record<number, number | null> = {};
  asigMensaje: Record<number, { tipo: 'ok' | 'error'; texto: string }> = {};

  // ── Desactivar ─────────────────────────────────────────
  desactivando: Record<number, boolean> = {};
  desactivandoUnidad: Record<number, boolean> = {};

  constructor(private svc: TecnicoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarTecnicos();
    this.cargarAsignaciones();
    this.cargarUnidades();
  }

  // ── Carga de datos ─────────────────────────────────────
  cargarTecnicos(): void {
    this.loadingTecnicos = true;
    this.errorTecnicos   = '';
    this.svc.listar().subscribe({
      next: (data) => { this.tecnicos = data; this.loadingTecnicos = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.errorTecnicos = err.error?.detail ?? 'Error al cargar técnicos';
        this.loadingTecnicos = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarAsignaciones(): void {
    this.loadingAsig = true;
    this.errorAsig   = '';
    this.svc.listarAsignacionesPendientes().subscribe({
      next: (data) => { this.asignaciones = data; this.loadingAsig = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.errorAsig = err.error?.detail ?? 'Error al cargar asignaciones';
        this.loadingAsig = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarUnidades(): void {
    this.loadingUnidades = true;
    this.errorUnidades = '';
    this.svc.listarUnidades().subscribe({
      next: (data) => { this.unidades = data; this.loadingUnidades = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.errorUnidades = err.error?.detail ?? 'Error al cargar unidades';
        this.loadingUnidades = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Panel form ─────────────────────────────────────────
  abrirRegistrar(): void {
    this.form        = { nombre: '', especialidad: '', telefono: '', email: '', password: '' };
    this.formError   = '';
    this.formSuccess = '';
    this.editandoId  = null;
    this.panelMode   = 'registrar';
  }

  abrirEditar(t: TecnicoResponse): void {
    this.form        = { nombre: t.nombre, especialidad: t.especialidad, telefono: t.telefono ?? '', email: '', password: '' };
    this.formError   = '';
    this.formSuccess = '';
    this.editandoId  = t.id;
    this.panelMode   = 'editar';
  }

  cerrarPanel(): void {
    this.panelMode  = null;
    this.editandoId = null;
  }

  guardar(): void {
    if (!this.form.nombre.trim() || !this.form.especialidad.trim()) {
      this.formError = 'Nombre y especialidad son obligatorios';
      return;
    }
    this.guardando = true;
    this.formError = '';
    this.formSuccess = '';

    const payload = {
      nombre:       this.form.nombre.trim(),
      especialidad: this.form.especialidad.trim(),
      telefono:     this.form.telefono.trim() || undefined,
      email:        this.form.email.trim() || undefined,
      password:     this.form.password.trim() || undefined,
    };

    if (this.panelMode === 'registrar') {
      this.svc.registrar(payload).subscribe({
        next: (nuevo) => {
          this.tecnicos = [nuevo, ...this.tecnicos];
          this.formSuccess = 'Técnico registrado correctamente';
          this.guardando = false;
          setTimeout(() => this.cerrarPanel(), 1500);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.formError = err.error?.detail ?? 'Error al registrar técnico';
          this.guardando = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.svc.actualizar(this.editandoId!, payload).subscribe({
        next: (actualizado) => {
          this.tecnicos = this.tecnicos.map((t) => t.id === actualizado.id ? actualizado : t);
          this.formSuccess = 'Técnico actualizado correctamente';
          this.guardando = false;
          setTimeout(() => this.cerrarPanel(), 1500);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.formError = err.error?.detail ?? 'Error al actualizar técnico';
          this.guardando = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  // ── Desactivar ─────────────────────────────────────────
  desactivar(t: TecnicoResponse): void {
    if (!confirm(`¿Desactivar a ${t.nombre}?`)) return;
    this.desactivando[t.id] = true;
    this.svc.desactivar(t.id).subscribe({
      next: () => {
        this.tecnicos = this.tecnicos.filter((x) => x.id !== t.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.desactivando[t.id] = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Asignar ────────────────────────────────────────────
  asignar(asig: AsignacionResponse): void {
    const tecnicoId = this.tecnicoSeleccionado[asig.id];
    if (!tecnicoId) { this.asigMensaje[asig.id] = { tipo: 'error', texto: 'Selecciona un técnico' }; return; }
    
    const unidadId = this.unidadSeleccionada[asig.id] || null;
    this.asignandoId = asig.id;

    this.svc.asignarTecnico(asig.id, tecnicoId, unidadId).subscribe({
      next: () => {
        this.asignaciones = this.asignaciones.filter((a) => a.id !== asig.id);
        this.cargarTecnicos();
        this.cargarUnidades();
        this.asignandoId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.asigMensaje[asig.id] = { tipo: 'error', texto: err.error?.detail ?? 'Error al asignar' };
        this.asignandoId = null;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Unidades de Auxilio CRUD ───────────────────────────
  guardarUnidad(): void {
    if (!this.formUnidad.placa.trim() || !this.formUnidad.modelo.trim() || !this.formUnidad.tipo.trim()) {
      this.unidadFormError = 'Placa, modelo y tipo son obligatorios';
      return;
    }
    if (this.formUnidad.capacidad_carga_kg <= 0) {
      this.unidadFormError = 'La capacidad de carga debe ser mayor a 0 kg';
      return;
    }

    this.guardandoUnidad = true;
    this.unidadFormError = '';
    this.unidadFormSuccess = '';

    const payload: UnidadAuxilioCreate = {
      placa: this.formUnidad.placa.trim().toUpperCase(),
      modelo: this.formUnidad.modelo.trim(),
      tipo: this.formUnidad.tipo.trim(),
      capacidad_carga_kg: this.formUnidad.capacidad_carga_kg,
    };

    this.svc.registrarUnidad(payload).subscribe({
      next: (nueva) => {
        this.unidades = [nueva, ...this.unidades];
        this.unidadFormSuccess = 'Unidad registrada correctamente';
        this.guardandoUnidad = false;
        this.formUnidad = { placa: '', modelo: '', tipo: 'grua_liviana', capacidad_carga_kg: 2000 };
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.unidadFormError = err.error?.detail ?? 'Error al registrar unidad';
        this.guardandoUnidad = false;
        this.cdr.detectChanges();
      },
    });
  }

  desactivarUnidad(u: UnidadAuxilioResponse): void {
    if (!confirm(`¿Dar de baja la unidad con placa ${u.placa}?`)) return;
    this.desactivandoUnidad[u.id] = true;
    this.svc.desactivarUnidad(u.id).subscribe({
      next: () => {
        this.unidades = this.unidades.filter((x) => x.id !== u.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.desactivandoUnidad[u.id] = false;
        alert(err.error?.detail ?? 'Error al desactivar unidad');
        this.cdr.detectChanges();
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────
  badgeEstado(estado: string): string {
    return { disponible: 'badge-success', ocupado: 'badge-warning', mantenimiento: 'badge-danger' }[estado] ?? 'badge-muted';
  }

  get disponibles(): TecnicoResponse[] {
    return this.tecnicos.filter((t) => t.estado === 'disponible');
  }

  get unidadesDisponibles(): UnidadAuxilioResponse[] {
    return this.unidades.filter((u) => u.estado === 'disponible');
  }
}
