import { FormStateCommand } from "../contract/FormStateCommand";
export declare class FormTools {
    static showToast(title: string, body: string): void;
    static registerFormStateEvent(title: string, type: string, action: object, command: FormStateCommand): void;
    static formUndo(): void;
    static setActionBarUndoButtonEnabled(enabled: boolean): void;
}
