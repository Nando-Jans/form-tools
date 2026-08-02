import {Controller} from "@hotwired/stimulus";

export default class extends Controller<HTMLElement> {
    connect() {

    }

    onClickTr(event: MouseEvent) {
        const target: HTMLElement = event.currentTarget as HTMLElement;
        if (!target || !target.dataset.id) return;
        const clickUrl = this.element.dataset.clickUrl;
        if (clickUrl) {
            window.location.href = clickUrl.replace('__ID__', target.dataset.id);
        }
    }
}