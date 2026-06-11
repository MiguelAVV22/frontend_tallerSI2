import { Component } from '@angular/core';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  template: `<div class="access-denied"><h2>Acceso denegado</h2><p>No tienes permiso para acceder a esta página.</p></div>`,
  styles: [`
    .access-denied { padding: 2rem; text-align: center; color: var(--text); }
    .access-denied h2 { font-size: 1.8rem; margin-bottom: 0.5rem; }
  `]
})
export class AccesoDenegadoComponent {}
