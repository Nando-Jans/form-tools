export interface FormStateCommand {
    undo(type: string, state: object): void
    redo(type: string, state: object): void
}
