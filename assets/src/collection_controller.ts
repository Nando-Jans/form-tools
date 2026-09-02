import { Controller } from '@hotwired/stimulus';

export default class CollectionController extends Controller<HTMLElement> {
    private static readonly scrollZoneRatio = 0.1;
    private static readonly maximumScrollSpeed = 24;

    static targets = ['items', 'empty'];
    static values = {
        index: Number,
        prototype: String,
        prototypes: Object,
        positionField: String,
        confirmDelete: String,
    };

    declare readonly itemsTarget: HTMLElement;
    declare readonly emptyTarget: HTMLElement;
    declare indexValue: number;
    declare prototypeValue: string;
    declare prototypesValue: Record<string, string>;
    declare positionFieldValue: string;
    declare confirmDeleteValue: string;

    private scrollSpeed = 0;
    private scrollAnimationFrame: number | null = null;

    connect(): void {
        this.itemsTarget.addEventListener('dragover', this.dragOver);
        this.itemsTarget.addEventListener('drop', this.drop);
        window.addEventListener('dragover', this.updateAutoScroll);
        this.items().forEach((item) => this.prepareItem(item));
        this.updateOrder();
    }

    disconnect(): void {
        this.itemsTarget.removeEventListener('dragover', this.dragOver);
        this.itemsTarget.removeEventListener('drop', this.drop);
        window.removeEventListener('dragover', this.updateAutoScroll);
        this.stopAutoScroll();
    }

    add(event: Event): void {
        event.preventDefault();
        const type = (event.currentTarget as HTMLElement).dataset.collectionType;
        const prototype = type ? this.prototypesValue[type] : this.prototypeValue;
        if (!prototype) return;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = prototype.replace(/__name__/g, String(this.indexValue++));
        const item = wrapper.firstElementChild as HTMLElement;
        this.itemsTarget.append(item);
        this.prepareItem(item);
        this.updateOrder();
    }

    remove(event: Event): void {
        event.preventDefault();
        if (this.confirmDeleteValue && !window.confirm(this.confirmDeleteValue)) return;
        this.itemForEvent(event)?.remove();
        this.updateOrder();
    }

    moveUp(event: Event): void {
        event.preventDefault();
        const item = this.itemForEvent(event);
        if (item?.previousElementSibling) this.itemsTarget.insertBefore(item, item.previousElementSibling);
        this.updateOrder();
    }

    moveDown(event: Event): void {
        event.preventDefault();
        const item = this.itemForEvent(event);
        if (item?.nextElementSibling) this.itemsTarget.insertBefore(item.nextElementSibling, item);
        this.updateOrder();
    }

    private prepareItem(item: HTMLElement): void {
        const handle = item.querySelector<HTMLElement>('.movable');
        if (!handle) return;
        handle.addEventListener('dragstart', (event) => {
            const itemBounds = item.getBoundingClientRect();

            event.dataTransfer?.setDragImage(
                item,
                event.clientX - itemBounds.left,
                event.clientY - itemBounds.top,
            );
            item.classList.add('opacity-50');
            item.dataset.dragging = 'true';
            event.dataTransfer?.setData('text/plain', 'collection-item');
        });
        handle.addEventListener('dragend', () => {
            item.classList.remove('opacity-50');
            delete item.dataset.dragging;
            this.stopAutoScroll();
            this.updateOrder();
        });
    }

    private dragOver = (event: DragEvent): void => {
        event.preventDefault();
        const dragged = this.itemsTarget.querySelector<HTMLElement>('[data-dragging="true"]');
        const target = (event.target as HTMLElement).closest<HTMLElement>('.custom-collection__item');
        if (!dragged || !target || dragged === target) return;
        const before = event.clientY < target.getBoundingClientRect().top + target.offsetHeight / 2;
        this.itemsTarget.insertBefore(dragged, before ? target : target.nextElementSibling);
    };

    private drop = (event: DragEvent): void => { event.preventDefault(); this.updateOrder(); };

    private updateAutoScroll = (event: DragEvent): void => {
        if (!this.itemsTarget.querySelector('[data-dragging="true"]')) {
            this.stopAutoScroll();
            return;
        }

        const zoneHeight = window.innerHeight * CollectionController.scrollZoneRatio;
        const distanceFromBottom = window.innerHeight - event.clientY;

        if (event.clientY < zoneHeight) {
            this.scrollSpeed = -CollectionController.maximumScrollSpeed * (1 - event.clientY / zoneHeight);
        } else if (distanceFromBottom < zoneHeight) {
            this.scrollSpeed = CollectionController.maximumScrollSpeed * (1 - distanceFromBottom / zoneHeight);
        } else {
            this.stopAutoScroll();
            return;
        }

        if (this.scrollAnimationFrame === null) {
            this.scrollAnimationFrame = window.requestAnimationFrame(this.autoScroll);
        }
    };

    private autoScroll = (): void => {
        if (this.scrollSpeed === 0) {
            this.scrollAnimationFrame = null;
            return;
        }

        window.scrollBy({ top: this.scrollSpeed, behavior: 'instant' });
        this.scrollAnimationFrame = window.requestAnimationFrame(this.autoScroll);
    };

    private stopAutoScroll(): void {
        this.scrollSpeed = 0;
        if (this.scrollAnimationFrame !== null) {
            window.cancelAnimationFrame(this.scrollAnimationFrame);
            this.scrollAnimationFrame = null;
        }
    }

    private itemForEvent(event: Event): HTMLElement | null {
        return (event.currentTarget as HTMLElement).closest('.custom-collection__item');
    }

    private items(): HTMLElement[] {
        return Array.from(this.itemsTarget.querySelectorAll<HTMLElement>(':scope > .custom-collection__item'));
    }

    private updateOrder(): void {
        const items = this.items();
        items.forEach((item, index) => {
            const number = item.querySelector<HTMLElement>('.custom-collection__number');
            if (number) number.textContent = `#${index + 1}`;
            if (this.positionFieldValue) {
                const input = item.querySelector<HTMLInputElement>(`[name$="[${CSS.escape(this.positionFieldValue)}]"]`);
                if (input) input.value = String(index);
            }
        });
        this.emptyTarget.classList.toggle('d-none', items.length > 0);
    }
}
