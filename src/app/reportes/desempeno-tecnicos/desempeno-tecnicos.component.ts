import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetricasService, TecnicoDesempenoResponse } from '../../dashboard/metricas.service';
import { TecnicoService, TallerInfoResponse } from '../../talleres-tecnicos/tecnico.service';

@Component({
    selector: 'app-desempeno-tecnicos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './desempeno-tecnicos.component.html',
    styleUrl: './desempeno-tecnicos.component.css'
})
export class DesempenoTecnicosComponent implements OnInit {
    tecnicos: TecnicoDesempenoResponse[] = [];
    filteredTecnicos: TecnicoDesempenoResponse[] = [];
    selectedTecnico: TecnicoDesempenoResponse | null = null;

    loading = true;
    errorMsg = '';
    isApproved = true;
    selectedPeriodo = 'mes';

    searchText = '';
    selectedStateFilter = '';

    constructor(
        private metricasSvc: MetricasService,
        private tecnicoService: TecnicoService
    ) { }

    ngOnInit(): void {
        this.cargarDesempeno();
    }

    cargarDesempeno(): void {
        this.loading = true;
        this.errorMsg = '';
        this.isApproved = true;

        this.tecnicoService.getMiTaller().subscribe({
            next: (taller: TallerInfoResponse) => {
                this.metricasSvc.getDesempenoTecnicos(taller.id, this.selectedPeriodo).subscribe({
                    next: (data) => {
                        this.tecnicos = data;
                        this.applyFilters();
                        this.loading = false;
                    },
                    error: (err) => {
                        this.loading = false;
                        if (err.status === 403) {
                            this.isApproved = false;
                            this.errorMsg = 'Tu taller aún no está aprobado o no tienes permisos para visualizar métricas.';
                        } else {
                            this.errorMsg = err.error?.detail ?? 'No se pudo cargar la evaluación de los técnicos.';
                        }
                    }
                });
            },
            error: (err) => {
                this.loading = false;
                this.errorMsg = err.error?.detail ?? 'No se pudo obtener la información de tu taller.';
            }
        });
    }

    applyFilters(): void {
        let list = [...this.tecnicos];

        if (this.searchText) {
            const q = this.searchText.toLowerCase().trim();
            list = list.filter(t =>
                t.nombre.toLowerCase().includes(q) ||
                t.especialidad.toLowerCase().includes(q)
            );
        }

        if (this.selectedStateFilter) {
            list = list.filter(t => t.estado === this.selectedStateFilter);
        }

        this.filteredTecnicos = list;

        // Reset selection if previous selection is not in filtered list
        if (this.selectedTecnico) {
            const exists = this.filteredTecnicos.some(t => t.tecnico_id === this.selectedTecnico!.tecnico_id);
            if (!exists) {
                this.selectedTecnico = this.filteredTecnicos[0] ?? null;
            }
        } else {
            this.selectedTecnico = this.filteredTecnicos[0] ?? null;
        }
    }

    changePeriodo(periodo: string): void {
        if (this.selectedPeriodo === periodo) return;
        this.selectedPeriodo = periodo;
        this.cargarDesempeno();
    }

    selectTecnico(t: TecnicoDesempenoResponse): void {
        this.selectedTecnico = t;
    }

    limpiarFiltros(): void {
        this.searchText = '';
        this.selectedStateFilter = '';
        this.applyFilters();
    }

    getInicial(nombre: string): string {
        return (nombre || 'T')[0].toUpperCase();
    }

    // Check if there is enough data
    get tieneDatosSuficientes(): boolean {
        if (this.tecnicos.length === 0) return false;
        const totalServicios = this.tecnicos.reduce((sum, t) => sum + t.servicios_atendidos, 0);
        return totalServicios > 0;
    }

    // KPI calculations
    get mejorTecnico(): TecnicoDesempenoResponse | null {
        if (this.tecnicos.length === 0) return null;
        // The ranking is already sorted by performance descending
        const active = this.tecnicos.filter(t => t.servicios_atendidos > 0);
        return active[0] ?? null;
    }

    get promedioDesempenoGeneral(): number {
        if (this.tecnicos.length === 0) return 0;
        const sum = this.tecnicos.reduce((acc, t) => acc + t.puntaje_desempeno, 0);
        return Math.round((sum / this.tecnicos.length) * 10) / 10;
    }

    get totalServiciosTaller(): number {
        return this.tecnicos.reduce((acc, t) => acc + t.servicios_atendidos, 0);
    }

    get totalTecnicosActivos(): number {
        return this.tecnicos.filter(t => t.servicios_atendidos > 0).length;
    }

    // Top 5 list
    get top5Tecnicos(): TecnicoDesempenoResponse[] {
        // Return top 5 who have services attended
        return this.tecnicos
            .filter(t => t.servicios_atendidos > 0)
            .slice(0, 5);
    }
}
