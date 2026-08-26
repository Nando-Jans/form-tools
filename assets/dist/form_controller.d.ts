import { Controller } from "@hotwired/stimulus";
import { FormStateCommand } from "./contract/FormStateCommand";
interface FormStateEvent extends CustomEvent<{
    title: string;
    type: string;
    oldState: object;
    newState: object;
    command: FormStateCommand;
}> {
}
export default class extends Controller<HTMLFormElement> {
    commands: FormStateEvent[];
    redoCommands: FormStateEvent[];
    registerFormStateEvent(event: FormStateEvent): void;
    undo(): void;
    redo(): void;
}
export {};
