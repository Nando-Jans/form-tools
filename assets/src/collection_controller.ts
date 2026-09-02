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
        autosaveDelay: { type: Number, default: 1000 },
    };

    declare readonly itemsTarget: HTMLElement;
    declare readonly emptyTarget: HTMLElement;
    declare indexValue: number;
    declare prototypeValue: string;
    declare prototypesValue: Record<string, string>;
    declare positionFieldValue: string;
    declare confirmDeleteValue: string;
    declare autosaveDelayValue: number;

    private scrollSpeed = 0;
    private scrollAnimationFrame: number | null = null;
    private autosaveTimers = new Map<HTMLElement, number>();
    private autosaveRequests = new Map<HTMLElement, AbortController>();

    connect(): void {
        this.itemsTarget.addEventListener('dragover', this.dragOver);
        this.itemsTarget.addEventListener('drop', this.drop);
        this.itemsTarget.addEventListener('input', this.detectChange);
        this.itemsTarget.addEventListener('change', this.detectChange);
        window.addEventListener('dragover', this.updateAutoScroll);
        this.items().forEach((item) => this.prepareItem(item));
        this.updateOrder();
    }

    disconnect(): void {
        this.itemsTarget.removeEventListener('dragover', this.dragOver);
        this.itemsTarget.removeEventListener('drop', this.drop);
        this.itemsTarget.removeEventListener('input', this.detectChange);
        this.itemsTarget.removeEventListener('change', this.detectChange);
        window.removeEventListener('dragover', this.updateAutoScroll);
        this.autosaveTimers.forEach((timer) => window.clearTimeout(timer));
        this.autosaveRequests.forEach((request) => request.abort());
        this.autosaveTimers.clear();
        this.autosaveRequests.clear();
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
        const item = this.itemForEvent(event);
        if (item) this.clearItemAutosave(item);
        item?.remove();
        this.updateOrder();
    }

    moveUp(event: Event): void {
        event.preventDefault();
        const item = this.itemForEvent(event);
        if (item?.previousElementSibling) this.itemsTarget.insertBefore(item, item.previousElementSibling);
        this.updateOrder(true);
    }

    moveDown(event: Event): void {
        event.preventDefault();
        const item = this.itemForEvent(event);
        if (item?.nextElementSibling) this.itemsTarget.insertBefore(item.nextElementSibling, item);
        this.updateOrder(true);
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
            this.updateOrder(true);
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

    private drop = (event: DragEvent): void => { event.preventDefault(); this.updateOrder(true); };

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

    private detectChange = (event: Event): void => {
        const item = (event.target as HTMLElement).closest<HTMLElement>('.custom-collection__item');
        if (item) this.scheduleAutosave(item);
    };

    private scheduleAutosave(item: HTMLElement): void {
        if (!item.dataset.autosaveUrl) return;

        const existingTimer = this.autosaveTimers.get(item);
        if (existingTimer !== undefined) window.clearTimeout(existingTimer);
        this.setAutosaveStatus(item, 'pending', 'Changes detected…');

        const timer = window.setTimeout(() => {
            this.autosaveTimers.delete(item);
            void this.saveItem(item);
        }, this.autosaveDelayValue);
        this.autosaveTimers.set(item, timer);
    }

    private async saveItem(item: HTMLElement): Promise<void> {
        const url = this.resolveAutosaveUrl(item);
        if (!url || !item.isConnected) return;

        this.autosaveRequests.get(item)?.abort();
        const request = new AbortController();
        this.autosaveRequests.set(item, request);
        this.setAutosaveStatus(item, 'saving', 'Saving…');
        this.dispatch('autosave:start', { detail: { item, url } });

        try {
            const response = await fetch(url, {
                method: item.dataset.autosaveMethod || 'POST',
                body: this.createItemFormData(item),
                signal: request.signal,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (!response.ok) throw new Error(`Autosave failed with status ${response.status}.`);

            const result = response.headers.get('content-type')?.includes('application/json')
                ? await response.json() as { id?: string | number, autosave_url?: string }
                : null;
            if (result?.id !== undefined) item.dataset.autosaveId = String(result.id);
            if (result?.autosave_url) item.dataset.autosaveUrl = result.autosave_url;

            this.setAutosaveStatus(item, 'saved', 'Saved');
            this.dispatch('autosave:success', { detail: { item, response, result } });
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            this.setAutosaveStatus(item, 'error', 'Could not save');
            this.dispatch('autosave:error', { detail: { item, error } });
        } finally {
            if (this.autosaveRequests.get(item) === request) this.autosaveRequests.delete(item);
        }
    }

    private createItemFormData(item: HTMLElement): FormData {
        const data = new FormData();
        const prefix = item.dataset.autosavePrefix || '';
        item.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea').forEach((control) => {
            if (!control.name || control.disabled) return;
            const name = this.relativeFieldName(control.name, prefix);
            if (control instanceof HTMLInputElement && ['checkbox', 'radio'].includes(control.type) && !control.checked) return;
            if (control instanceof HTMLInputElement && control.type === 'file') {
                Array.from(control.files ?? []).forEach((file) => data.append(name, file));
                return;
            }
            if (control instanceof HTMLSelectElement && control.multiple) {
                Array.from(control.selectedOptions).forEach((option) => data.append(name, option.value));
                return;
            }
            data.append(name, control.value);
        });
        return data;
    }

    private resolveAutosaveUrl(item: HTMLElement): string | null {
        const url = item.dataset.autosaveUrl;
        if (!url) return null;
        if (!url.includes('__ID__')) return url;

        const id = item.dataset.autosaveId;
        if (!id) {
            this.setAutosaveStatus(item, 'error', 'Could not save');
            this.dispatch('autosave:error', {
                detail: { item, error: new Error('The autosave URL requires an item id.') },
            });
            return null;
        }

        return url.replaceAll('__ID__', encodeURIComponent(id));
    }

    private relativeFieldName(name: string, prefix: string): string {
        if (!prefix || !name.startsWith(`${prefix}[`)) return name;
        const segments = Array.from(
            name.slice(prefix.length).matchAll(/\[([^\]]*)\]/g),
            (match) => match[1],
        );
        if (segments.length === 0) return name;
        return segments[0] + segments.slice(1).map((segment) => `[${segment}]`).join('');
    }

    private setAutosaveStatus(item: HTMLElement, state: string, message: string): void {
        item.dataset.autosaveState = state;
        const status = item.querySelector<HTMLElement>('.custom-collection__autosave-status');
        if (status) status.textContent = message;
    }

    private clearItemAutosave(item: HTMLElement): void {
        const timer = this.autosaveTimers.get(item);
        if (timer !== undefined) window.clearTimeout(timer);
        this.autosaveTimers.delete(item);
        this.autosaveRequests.get(item)?.abort();
        this.autosaveRequests.delete(item);
    }

    private itemForEvent(event: Event): HTMLElement | null {
        return (event.currentTarget as HTMLElement).closest('.custom-collection__item');
    }

    private items(): HTMLElement[] {
        return Array.from(this.itemsTarget.querySelectorAll<HTMLElement>(':scope > .custom-collection__item'));
    }

    private updateOrder(autosaveChangedPositions = false): void {
        const items = this.items();
        items.forEach((item, index) => {
            const number = item.querySelector<HTMLElement>('.custom-collection__number');
            if (number) number.textContent = `#${index + 1}`;
            if (this.positionFieldValue) {
                const input = item.querySelector<HTMLInputElement>(`[name$="[${CSS.escape(this.positionFieldValue)}]"]`);
                if (input && input.value !== String(index)) {
                    input.value = String(index);
                    if (autosaveChangedPositions) this.scheduleAutosave(item);
                }
            }
        });
        this.emptyTarget.classList.toggle('d-none', items.length > 0);
    }
}
