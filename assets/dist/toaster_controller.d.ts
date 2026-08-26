import { Controller } from "@hotwired/stimulus";
export default class extends Controller<HTMLFormElement> {
    toastTemplate: HTMLTemplateElement;
    activeToast: HTMLElement | null;
    connect(): void;
    show(event: CustomEvent<{
        title: string;
        body: string;
    }>): void;
}
