function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Controller } from '@hotwired/stimulus';
export default class extends Controller {
  constructor() {
    super(...arguments);
    _defineProperty(this, "targetElement", null);
  }
  connect() {
    var _this$element$closest, _this$element$closest2, _targetField$closest;
    var targetId = this.element.dataset.targetElement;
    if (!targetId) {
      console.log(this.element);
      throw new Error('IconCheckType requires a target field id.');
    }
    var targetField = document.getElementById(targetId);
    if (!targetField) targetField = (_this$element$closest = (_this$element$closest2 = this.element.closest('.custom-collection__item')) === null || _this$element$closest2 === void 0 ? void 0 : _this$element$closest2.querySelector(targetId)) !== null && _this$element$closest !== void 0 ? _this$element$closest : null;
    if (!targetField) throw new Error("IconCheckType target \"".concat(targetId, "\" was not found."));
    this.targetElement = (_targetField$closest = targetField.closest('[data-icon-check-target-row]')) !== null && _targetField$closest !== void 0 ? _targetField$closest : targetField;
    this.updateVisibility();
  }
  toggle() {
    this.updateVisibility();
  }
  updateVisibility() {
    if (!this.targetElement) return;
    this.targetElement.classList.toggle('d-none', !this.element.checked);
    this.targetElement.setAttribute('aria-hidden', String(!this.element.checked));
  }
}