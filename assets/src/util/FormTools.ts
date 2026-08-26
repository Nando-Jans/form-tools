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
        action: object,
        command: FormStateCommand
    ) {
        window.dispatchEvent(new CustomEvent('form-tools:form:register', {
            detail: {
                title: title,
                type: type,
                action: action,
                command: command
            }
        }));
    }

    static formUndo() {
        window.dispatchEvent(new CustomEvent('form-tools:form:undo'));
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
}
