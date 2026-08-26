export class FormTools {
  static showToast(title, body) {
    window.dispatchEvent(new CustomEvent('form-tools:toast', {
      detail: {
        title: title,
        body: body
      }
    }));
  }
  static registerFormStateEvent(title, type, action, command) {
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
  static setActionBarUndoButtonEnabled(enabled) {
    window.dispatchEvent(new CustomEvent('form-tools:action-bar:undo-button-enabled', {
      detail: {
        enabled
      }
    }));
  }
}