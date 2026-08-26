function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Controller } from "@hotwired/stimulus";
import { FormTools } from "./util/FormTools";
export default class extends Controller {
  constructor() {
    super(...arguments);
    _defineProperty(this, "commands", []);
  }
  registerFormStateEvent(event) {
    this.commands.push(event);
    FormTools.showToast(event.detail.title, "<button onclick=\"window.dispatchEvent(new CustomEvent('form-tools:form:undo'))\" data-bs-dismiss=\"toast\" class='btn btn-link'>Deze actie terugdraaien</button>");
    console.log(this.commands);
  }
  undo() {
    var event = this.commands.pop();
    if (event) {
      event === null || event === void 0 || event.detail.command.undo(event.detail.type, event.detail.action);
    }
  }
}