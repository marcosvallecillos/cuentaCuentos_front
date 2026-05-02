import { Component, ChangeDetectorRef } from '@angular/core';
import { AdminService, CatalogItem } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-catalog-manager',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog-manager.html',
  styleUrl: './catalog-manager.scss',
})
export class CatalogManager {

  items: CatalogItem[] = [];
  filterType: '' | 'protagonista' | 'lugar' | 'emocion' = '';
  loading = false;
  
  showModal = false;
  editingItem: CatalogItem | null = null;
  
  newItem: CatalogItem = {
    tipo: 'protagonista',
    nombre: '',
    descripcion: '',
    emoji: '',
    prompt_sugerencia: ''
  };

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadItems();
    this.cdr.detectChanges();
  }

  loadItems() {
    this.loading = true;
    this.cdr.detectChanges();
    console.log('Cargando catálogo...');
    this.adminService.getCatalogItems(this.filterType || undefined)
      .pipe(finalize(() => {
        console.log('Finalizado carga de catálogo');
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          console.log('Catálogo cargado:', data.length);
          this.items = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading catalog:', err);
          this.cdr.detectChanges();
        }
      });
  }

  openCreateModal() {
    this.editingItem = null;
    this.newItem = {
      tipo: 'protagonista',
      nombre: '',
      descripcion: '',
      emoji: '',
      prompt_sugerencia: ''
    };
    this.showModal = true;
  }

  openEditModal(item: CatalogItem) {
    this.editingItem = item;
    this.newItem = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingItem = null;
  }

  saveItem() {
    if (!this.newItem.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    if (this.editingItem) {
      // Update
      this.adminService.updateCatalogItem(this.editingItem.id!, this.newItem).subscribe({
        next: () => {
          this.loadItems();
          this.closeModal();
        },
        error: (err) => alert('Error al actualizar: ' + err.error?.detail)
      });
    } else {
      // Create
      this.adminService.createCatalogItem(this.newItem).subscribe({
        next: () => {
          this.loadItems();
          this.closeModal();
        },
        error: (err) => alert('Error al crear: ' + err.error?.detail)
      });
    }
  }

  deleteItem(item: CatalogItem) {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return;

    this.adminService.deleteCatalogItem(item.id!).subscribe({
      next: () => {
        this.loadItems();
      },
      error: (err) => alert('Error al eliminar: ' + err.error?.detail)
    });
  }

  toggleActive(item: CatalogItem) {
    this.adminService.updateCatalogItem(item.id!, { activo: !item.activo }).subscribe({
      next: () => {
        this.loadItems();
      }
    });
  }

  getTypeLabel(tipo: string): string {
    const labels: any = {
      protagonista: '🦸 Protagonista',
      lugar: '🗺️ Lugar',
      emocion: '😊 Emoción'
    };
    return labels[tipo] || tipo;
  }
}