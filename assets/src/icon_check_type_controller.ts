import { Controller } from '@hotwired/stimulus';

export default class extends Controller<HTMLInputElement> {
    private targetElement: HTMLElement | null = null;

    connect(): void {
        const targetId = this.element.dataset.targetElement;
        if (!targetId) {
            console.log(this.element)
            throw new Error('IconCheckType requires a target field id.');
        }

        let targetField = document.getElementById(targetId);
        if (!targetField) targetField = this.element.closest('.custom-collection__item')?.querySelector(targetId) ?? null;
        if (!targetField) throw new Error(`IconCheckType target "${targetId}" was not found.`);

        this.targetElement = targetField.closest('[data-icon-check-target-row]') ?? targetField;
        this.updateVisibility();
    }

    toggle(): void {
        this.updateVisibility();
    }

    private updateVisibility(): void {
        if (!this.targetElement) return;

        this.targetElement.classList.toggle('d-none', !this.element.checked);
        this.targetElement.setAttribute('aria-hidden', String(!this.element.checked));
    }
}
