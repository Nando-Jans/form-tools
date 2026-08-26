import {Controller} from "@hotwired/stimulus";
import {FormStateCommand} from "./contract/FormStateCommand";
import {FormTools} from "./util/FormTools";

interface FormStateEvent extends CustomEvent<{
    title: string;
    type: string;
    oldState: object;
    newState: object;
    command: FormStateCommand;
}> {}

export default class extends Controller<HTMLFormElement> {
    commands: FormStateEvent[] = [];
    redoCommands: FormStateEvent[] = [];

    registerFormStateEvent(event: FormStateEvent) {
        this.commands.push(event);

        FormTools.showToast(
            event.detail.title,
            `<button onclick="window.dispatchEvent(new CustomEvent('form-tools:form:undo'))" data-bs-dismiss="toast" class='btn btn-link'>Deze actie terugdraaien</button>`
        );

        FormTools.setActionBarUndoButtonEnabled(true);
        this.redoCommands = [];
        FormTools.setActionBarRedoButtonEnabled(false);
    }

    undo() {
        const event = this.commands.pop();
        if (!event) {
            return;
        }

        event.detail.command.undo(event.detail.type, event.detail.oldState);
        this.redoCommands.push(event);

        FormTools.setActionBarUndoButtonEnabled(this.commands.length > 0);
        FormTools.setActionBarRedoButtonEnabled(true);
    }

    redo() {
        const event = this.redoCommands.pop();
        if (!event) {
            return;
        }

        event.detail.command.redo(event.detail.type, event.detail.newState);
        this.commands.push(event);

        FormTools.setActionBarRedoButtonEnabled(this.redoCommands.length > 0);
        FormTools.setActionBarUndoButtonEnabled(true);
    }
}
