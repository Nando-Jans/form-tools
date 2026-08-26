import {FormStateCommand} from "../contract/FormStateCommand";

export class FormTools {
    static showToast(title: string, body: string) {
        window.dispatchEvent(new CustomEvent('form-tools:toast', {
            detail: {
                title: title,
                body: body
            }
        }));
    }

    static registerFormStateEvent(
        title: string,
        type: string,
        oldState: object,
        newState: object,
        command: FormStateCommand
    ) {
        window.dispatchEvent(new CustomEvent('form-tools:form:register', {
            detail: {
                title: title,
                type: type,
                oldState: oldState,
                newState: newState,
                command: command
            }
        }));
    }

    static formUndo() {
        window.dispatchEvent(new CustomEvent('form-tools:form:undo'));
    }

    static formRedo() {
        window.dispatchEvent(new CustomEvent('form-tools:form:redo'));
    }

    static setActionBarUndoButtonEnabled(enabled: boolean) {
        window.dispatchEvent(new CustomEvent(
            'form-tools:action-bar:undo-button-enabled',
            {
                detail: {
                    enabled
                }
            }
        ));
    }

    static setActionBarRedoButtonEnabled(enabled: boolean) {
        window.dispatchEvent(new CustomEvent(
            'form-tools:action-bar:redo-button-enabled',
            {
                detail: {
                    enabled
                }
            }
        ));
    }
}
