import {Controller} from "@hotwired/stimulus";
import {FormStateCommand} from "./contract/FormStateCommand";
import {FormTools} from "./util/FormTools";

interface FormStateEvent extends CustomEvent<{ title: string; type: string; action: object; command: FormStateCommand }> {}

export default class extends Controller<HTMLFormElement> {
    commands: FormStateEvent[] = [];

    registerFormStateEvent(event: FormStateEvent) {
        this.commands.push(event);

        FormTools.showToast(
            event.detail.title,
            `<button onclick="window.dispatchEvent(new CustomEvent('form-tools:form:undo'))" data-bs-dismiss="toast" class='btn btn-link'>Deze actie terugdraaien</button>`
        );

        FormTools.setActionBarUndoButtonEnabled(true);
    }

    undo() {
        const event = this.commands.pop();
        if (event) {
            event?.detail.command.undo(event.detail.type, event.detail.action);
        }

        if (!this.commands.length) {
            FormTools.setActionBarUndoButtonEnabled(false);
        }
    }
}
