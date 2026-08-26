import {Controller} from "@hotwired/stimulus";
import Toast from "bootstrap/js/dist/toast";

export default class extends Controller<HTMLFormElement> {

    toastTemplate!: HTMLTemplateElement;
    activeToast: HTMLElement | null = null;

    connect() {
        this.toastTemplate = this.element.querySelector('.toast-template') as HTMLTemplateElement;
    }

    show(event: CustomEvent<{ title: string, body: string }>) {
        const { title, body } = event.detail;

        if (this.activeToast) {
            Toast.getOrCreateInstance(this.activeToast).hide();
        }

        const fragment = this.toastTemplate.content.cloneNode(true) as DocumentFragment;
        const toast = fragment.querySelector<HTMLElement>('.toast');
        if (!toast) {
            return;
        }

        toast.querySelector('.toast-title')!.textContent = title;
        toast.querySelector('.toast-body')!.innerHTML = body;

        this.element.appendChild(fragment);

        this.activeToast = toast;
        toast.addEventListener('hidden.bs.toast', () => {
            if (this.activeToast === toast) {
                this.activeToast = null;
            }

            window.setTimeout(() => {
                Toast.getInstance(toast)?.dispose();
                toast.remove();
            }, 0);
        }, { once: true });

        const toastBootstrap = Toast.getOrCreateInstance(toast);
        toastBootstrap.show();
    }

}
