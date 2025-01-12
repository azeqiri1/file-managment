import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appDragDrop]',
  standalone: true
})
export class DragDropDirective {
  @Input() dragData: any;
  @Input() dragEnabled = true;
  @Output() itemDropped = new EventEmitter<{item: any, target: any}>();
  
  @HostBinding('attr.draggable') get draggable() {
    return this.dragEnabled;
  }
  
  @HostBinding('class.dragging') isDragging = false;
  @HostBinding('class.drag-over') isDragOver = false;

  constructor(private el: ElementRef) {}

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    if (!this.dragEnabled) return;
    
    this.isDragging = true;
    event.dataTransfer?.setData('text', JSON.stringify(this.dragData));
  }

  @HostListener('dragend')
  onDragEnd(): void {
    this.isDragging = false;
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    if (this.isDragging) return;
    this.isDragOver = true;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.isDragging) return;
    this.isDragOver = true;
  }

  @HostListener('dragleave')
  onDragLeave(): void {
    this.isDragOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (this.isDragging) return;

    const data = event.dataTransfer?.getData('text');
    if (data) {
      const draggedItem = JSON.parse(data);
      this.itemDropped.emit({
        item: draggedItem,
        target: this.dragData
      });
    }
  }
} 