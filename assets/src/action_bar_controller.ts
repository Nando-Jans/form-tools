import {Controller} from "@hotwired/stimulus";
import {FormTools} from "./util/FormTools";

export default class extends Controller<HTMLDivElement> {
    static targets = ["undoButton", "redoButton"]

    declare readonly undoButtonTarget: HTMLButtonElement
    declare readonly redoButtonTarget: HTMLButtonElement

    undo() {
        FormTools.formUndo();
    }

    redo() {
        FormTools.formRedo();
    }

    undoButtonEnabled(event: CustomEvent<{enabled: boolean}>) {
        this.undoButtonTarget.disabled = !event.detail.enabled;
    }

    redoButtonEnabled(event: CustomEvent<{enabled: boolean}>) {
        this.redoButtonTarget.disabled = !event.detail.enabled;
    }
}
