export interface FormStateCommand {
    undo(type: string, action: object): void
}