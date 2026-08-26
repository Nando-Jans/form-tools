function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Controller } from "@hotwired/stimulus";
import Toast from "bootstrap/js/dist/toast";
export default class extends Controller {
  constructor() {
    super(...arguments);
    _defineProperty(this, "toastTemplate", void 0);
    _defineProperty(this, "activeToast", null);
  }
  connect() {
    this.toastTemplate = this.element.querySelector('.toast-template');
  }
  show(event) {
    var _event$detail = event.detail,
      title = _event$detail.title,
      body = _event$detail.body;
    if (this.activeToast) {
      Toast.getOrCreateInstance(this.activeToast).hide();
    }
    var fragment = this.toastTemplate.content.cloneNode(true);
    var toast = fragment.querySelector('.toast');
    if (!toast) {
      return;
    }
    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-body').innerHTML = body;
    this.element.appendChild(fragment);
    this.activeToast = toast;
    toast.addEventListener('hidden.bs.toast', () => {
      if (this.activeToast === toast) {
        this.activeToast = null;
      }
      window.setTimeout(() => {
        var _Toast$getInstance;
        (_Toast$getInstance = Toast.getInstance(toast)) === null || _Toast$getInstance === void 0 || _Toast$getInstance.dispose();
        toast.remove();
      }, 0);
    }, {
      once: true
    });
    var toastBootstrap = Toast.getOrCreateInstance(toast);
    toastBootstrap.show();
  }
}