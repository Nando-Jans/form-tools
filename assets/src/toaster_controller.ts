import {Controller} from "@hotwired/stimulus";
import Toast from "bootstrap/js/dist/toast";

export default class extends Controller<HTMLFormElement> {

    toastTemplate!: HTMLTemplateElement;

    connect() {
        this.toastTemplate = this.element.querySelector('.toast-template') as HTMLTemplateElement;
    }

    show(event: CustomEvent<{ title: string, body: string }>) {
        const { title, body } = event.detail;

        const fragment = this.toastTemplate.content.cloneNode(true) as DocumentFragment;
        const toast = fragment.querySelector<HTMLElement>('.toast');
        if (!toast) {
            return;
        }

        toast.querySelector('.toast-title')!.textContent = title;
        toast.querySelector('.toast-body')!.innerHTML = body;

        this.element.appendChild(fragment);

        const toastBootstrap = Toast.getOrCreateInstance(toast);
        toastBootstrap.show();
    }

}
