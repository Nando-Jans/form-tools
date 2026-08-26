import { Controller } from "@hotwired/stimulus";
import { FormStateCommand } from "./contract/FormStateCommand";
interface FormStateEvent extends CustomEvent<{
    title: string;
    type: string;
    action: object;
    command: FormStateCommand;
}> {
}
export default class extends Controller<HTMLFormElement> {
    commands: FormStateEvent[];
    registerFormStateEvent(event: FormStateEvent): void;
    undo(): void;
}
export {};
