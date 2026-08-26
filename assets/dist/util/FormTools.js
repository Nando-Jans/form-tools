export class FormTools {
  static showToast(title, body) {
    window.dispatchEvent(new CustomEvent('form-tools:toast', {
      detail: {
        title: title,
        body: body
      }
    }));
  }
  static registerFormStateEvent(title, type, oldState, newState, command) {
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
  static setActionBarUndoButtonEnabled(enabled) {
    window.dispatchEvent(new CustomEvent('form-tools:action-bar:undo-button-enabled', {
      detail: {
        enabled
      }
    }));
  }
  static setActionBarRedoButtonEnabled(enabled) {
    window.dispatchEvent(new CustomEvent('form-tools:action-bar:redo-button-enabled', {
      detail: {
        enabled
      }
    }));
  }
}