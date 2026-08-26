import {Controller} from "@hotwired/stimulus";
import {FormTools} from "./util/FormTools";

export default class extends Controller<HTMLDivElement> {
    static targets = ["undoButton"]

    declare readonly undoButtonTarget: HTMLButtonElement

    undo() {
        FormTools.formUndo();
    }

    undoButtonEnabled(event: CustomEvent<{enabled: boolean}>) {
        this.undoButtonTarget.disabled = !event.detail.enabled;
    }
}
