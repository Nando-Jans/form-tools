import { Controller } from "@hotwired/stimulus";
export default class extends Controller<HTMLDivElement> {
    static targets: string[];
    readonly undoButtonTarget: HTMLButtonElement;
    undo(): void;
    undoButtonEnabled(event: CustomEvent<{
        enabled: boolean;
    }>): void;
}
