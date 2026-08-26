import { Controller } from "@hotwired/stimulus";
export default class extends Controller<HTMLDivElement> {
    static targets: string[];
    readonly undoButtonTarget: HTMLButtonElement;
    readonly redoButtonTarget: HTMLButtonElement;
    undo(): void;
    redo(): void;
    undoButtonEnabled(event: CustomEvent<{
        enabled: boolean;
    }>): void;
    redoButtonEnabled(event: CustomEvent<{
        enabled: boolean;
    }>): void;
}
