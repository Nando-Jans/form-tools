import { FormStateCommand } from "../contract/FormStateCommand";
export declare class FormTools {
    static showToast(title: string, body: string): void;
    static registerFormStateEvent(title: string, type: string, oldState: object, newState: object, command: FormStateCommand): void;
    static formUndo(): void;
    static formRedo(): void;
    static setActionBarUndoButtonEnabled(enabled: boolean): void;
    static setActionBarRedoButtonEnabled(enabled: boolean): void;
}
