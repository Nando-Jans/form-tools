function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Controller } from '@hotwired/stimulus';
export default class CollectionController extends Controller {
  constructor() {
    var _this;
    super(...arguments);
    _this = this;
    _defineProperty(this, "scrollSpeed", 0);
    _defineProperty(this, "scrollAnimationFrame", null);
    _defineProperty(this, "autosaveTimers", new Map());
    _defineProperty(this, "autosaveRequests", new Map());
    _defineProperty(this, "removals", new Set());
    _defineProperty(this, "form", null);
    _defineProperty(this, "resubmitting", false);
    _defineProperty(this, "submitting", false);
    _defineProperty(this, "dragOver", event => {
      event.preventDefault();
      var dragged = this.itemsTarget.querySelector('[data-dragging="true"]');
      var target = event.target.closest('.custom-collection__item');
      if (!dragged || !target || dragged === target) return;
      var before = event.clientY < target.getBoundingClientRect().top + target.offsetHeight / 2;
      this.itemsTarget.insertBefore(dragged, before ? target : target.nextElementSibling);
    });
    _defineProperty(this, "drop", event => {
      event.preventDefault();
      this.updateOrder(true);
    });
    _defineProperty(this, "updateAutoScroll", event => {
      if (!this.itemsTarget.querySelector('[data-dragging="true"]')) {
        this.stopAutoScroll();
        return;
      }
      var zoneHeight = window.innerHeight * CollectionController.scrollZoneRatio;
      var distanceFromBottom = window.innerHeight - event.clientY;
      if (event.clientY < zoneHeight) {
        this.scrollSpeed = -CollectionController.maximumScrollSpeed * (1 - event.clientY / zoneHeight);
      } else if (distanceFromBottom < zoneHeight) {
        this.scrollSpeed = CollectionController.maximumScrollSpeed * (1 - distanceFromBottom / zoneHeight);
      } else {
        this.stopAutoScroll();
        return;
      }
      if (this.scrollAnimationFrame === null) {
        this.scrollAnimationFrame = window.requestAnimationFrame(this.autoScroll);
      }
    });
    _defineProperty(this, "autoScroll", () => {
      if (this.scrollSpeed === 0) {
        this.scrollAnimationFrame = null;
        return;
      }
      window.scrollBy({
        top: this.scrollSpeed,
        behavior: 'instant'
      });
      this.scrollAnimationFrame = window.requestAnimationFrame(this.autoScroll);
    });
    _defineProperty(this, "detectChange", event => {
      var item = event.target.closest('.custom-collection__item');
      if (item) this.scheduleAutosave(item);
    });
    _defineProperty(this, "beforeSubmit", event => {
      if (this.resubmitting) return;
      this.autosaveTimers.forEach(timer => window.clearTimeout(timer));
      this.autosaveTimers.clear();
      if (!this.autosaveRequests.size && !this.removals.size) return;
      event.preventDefault();
      if (this.submitting) return;
      this.submitting = true;
      var submitter = event.submitter;
      void _asyncToGenerator(function* () {
        while (_this.autosaveRequests.size || _this.removals.size) {
          yield Promise.all([..._this.autosaveRequests.values(), ..._this.removals]);
        }
        _this.resubmitting = true;
        try {
          var _this$form;
          // Include the actual navigator button and the newly assigned ids.
          (_this$form = _this.form) === null || _this$form === void 0 || _this$form.requestSubmit(submitter);
        } finally {
          _this.resubmitting = false;
          _this.submitting = false;
        }
      })();
    });
  }
  connect() {
    var _this$form2;
    this.form = this.element.closest('form');
    (_this$form2 = this.form) === null || _this$form2 === void 0 || _this$form2.addEventListener('submit', this.beforeSubmit, true);
    this.itemsTarget.addEventListener('dragover', this.dragOver);
    this.itemsTarget.addEventListener('drop', this.drop);
    this.itemsTarget.addEventListener('input', this.detectChange);
    this.itemsTarget.addEventListener('change', this.detectChange);
    window.addEventListener('dragover', this.updateAutoScroll);
    this.items().forEach(item => this.prepareItem(item));
    this.updateOrder();
  }
  disconnect() {
    var _this$form3;
    (_this$form3 = this.form) === null || _this$form3 === void 0 || _this$form3.removeEventListener('submit', this.beforeSubmit, true);
    this.itemsTarget.removeEventListener('dragover', this.dragOver);
    this.itemsTarget.removeEventListener('drop', this.drop);
    this.itemsTarget.removeEventListener('input', this.detectChange);
    this.itemsTarget.removeEventListener('change', this.detectChange);
    window.removeEventListener('dragover', this.updateAutoScroll);
    this.autosaveTimers.forEach(timer => window.clearTimeout(timer));
    this.autosaveTimers.clear();
    this.stopAutoScroll();
  }
  add(event) {
    event.preventDefault();
    var type = event.currentTarget.dataset.collectionType;
    var prototype = type ? this.prototypesValue[type] : this.prototypeValue;
    if (!prototype) return;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = prototype.replace(/__name__/g, String(this.indexValue++));
    var item = wrapper.firstElementChild;
    this.itemsTarget.append(item);
    this.prepareItem(item);
    this.updateOrder();
  }
  remove(event) {
    event.preventDefault();
    if (this.confirmDeleteValue && !window.confirm(this.confirmDeleteValue)) return;
    var item = this.itemForEvent(event);
    if (!item) return;
    var operation = this.removeItem(item);
    this.removals.add(operation);
    void operation.finally(() => this.removals.delete(operation));
  }
  removeItem(item) {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      _this2.clearItemAutosave(item);
      item.dataset.removing = 'true';
      try {
        var _item$dataset$autosav;
        // Creation may already have reached the server; never abort it.
        yield _this2.autosaveRequests.get(item);
        var id = item.dataset.autosaveId;
        var url = id ? (_item$dataset$autosav = item.dataset.autosaveDeleteUrl) === null || _item$dataset$autosav === void 0 ? void 0 : _item$dataset$autosav.replaceAll('__ID__', encodeURIComponent(id)) : item.dataset.autosaveCreateUrl;
        if (!id && url && item.dataset.autosaveKeyField) {
          var _key$value;
          var key = _this2.identityInput(item, 'autosaveKeyField');
          url += "".concat(url.includes('?') ? '&' : '?').concat(encodeURIComponent(item.dataset.autosaveKeyField), "=").concat(encodeURIComponent((_key$value = key === null || key === void 0 ? void 0 : key.value) !== null && _key$value !== void 0 ? _key$value : ''));
        }
        if (url) {
          var response = yield fetch(url, {
            method: 'DELETE',
            body: _this2.createItemFormData(item),
            headers: _this2.autosaveHeaders()
          });
          if (!response.ok) throw new Error("Delete failed with status ".concat(response.status, "."));
        }
        item.remove();
        _this2.updateOrder(true);
      } catch (error) {
        delete item.dataset.removing;
        _this2.setAutosaveStatus(item, 'error', 'Could not delete');
        _this2.dispatch('autosave:error', {
          detail: {
            item,
            error
          }
        });
      }
    })();
  }
  moveUp(event) {
    event.preventDefault();
    var item = this.itemForEvent(event);
    if (item !== null && item !== void 0 && item.previousElementSibling) this.itemsTarget.insertBefore(item, item.previousElementSibling);
    this.updateOrder(true);
  }
  moveDown(event) {
    event.preventDefault();
    var item = this.itemForEvent(event);
    if (item !== null && item !== void 0 && item.nextElementSibling) this.itemsTarget.insertBefore(item.nextElementSibling, item);
    this.updateOrder(true);
  }
  prepareItem(item) {
    var key = this.identityInput(item, 'autosaveKeyField');
    if (key && !key.value) key.value = crypto.randomUUID();
    var handle = item.querySelector('.movable');
    if (!handle) return;
    handle.addEventListener('dragstart', event => {
      var _event$dataTransfer, _event$dataTransfer2;
      var itemBounds = item.getBoundingClientRect();
      (_event$dataTransfer = event.dataTransfer) === null || _event$dataTransfer === void 0 || _event$dataTransfer.setDragImage(item, event.clientX - itemBounds.left, event.clientY - itemBounds.top);
      item.classList.add('opacity-50');
      item.dataset.dragging = 'true';
      (_event$dataTransfer2 = event.dataTransfer) === null || _event$dataTransfer2 === void 0 || _event$dataTransfer2.setData('text/plain', 'collection-item');
    });
    handle.addEventListener('dragend', () => {
      item.classList.remove('opacity-50');
      delete item.dataset.dragging;
      this.stopAutoScroll();
      this.updateOrder(true);
    });
  }
  stopAutoScroll() {
    this.scrollSpeed = 0;
    if (this.scrollAnimationFrame !== null) {
      window.cancelAnimationFrame(this.scrollAnimationFrame);
      this.scrollAnimationFrame = null;
    }
  }
  scheduleAutosave(item) {
    if (!item.dataset.autosaveUrl || item.dataset.removing || this.submitting) return;
    var existingTimer = this.autosaveTimers.get(item);
    if (existingTimer !== undefined) window.clearTimeout(existingTimer);
    this.setAutosaveStatus(item, 'pending', 'Changes detected…');
    var timer = window.setTimeout(() => {
      this.autosaveTimers.delete(item);
      void this.saveItem(item);
    }, this.autosaveDelayValue);
    this.autosaveTimers.set(item, timer);
  }
  saveItem(item) {
    var _this3 = this;
    return _asyncToGenerator(function* () {
      // Serialize writes to each row so a second edit cannot create another task
      // or overtake an earlier update. Resolve the URL after creation completes.
      while (_this3.autosaveRequests.has(item)) yield _this3.autosaveRequests.get(item);
      if (!item.isConnected || item.dataset.removing || _this3.submitting) return;
      var operation = _this3.performSave(item);
      _this3.autosaveRequests.set(item, operation);
      try {
        yield operation;
      } finally {
        if (_this3.autosaveRequests.get(item) === operation) _this3.autosaveRequests.delete(item);
      }
    })();
  }
  performSave(item) {
    var _this4 = this;
    return _asyncToGenerator(function* () {
      var url = _this4.resolveAutosaveUrl(item);
      if (!url) return;
      _this4.setAutosaveStatus(item, 'saving', 'Saving…');
      _this4.dispatch('autosave:start', {
        detail: {
          item,
          url
        }
      });
      try {
        var _response$headers$get;
        var response = yield fetch(url, {
          method: item.dataset.autosaveMethod || 'POST',
          body: _this4.createItemFormData(item),
          headers: _this4.autosaveHeaders()
        });
        if (!response.ok) throw new Error("Autosave failed with status ".concat(response.status, "."));
        var result = (_response$headers$get = response.headers.get('content-type')) !== null && _response$headers$get !== void 0 && _response$headers$get.includes('application/json') ? yield response.json() : null;
        if ((result === null || result === void 0 ? void 0 : result.saved) === false) throw new Error('Autosave was rejected.');
        if ((result === null || result === void 0 ? void 0 : result.id) !== undefined) {
          item.dataset.autosaveId = String(result.id);
          var input = _this4.identityInput(item, 'autosaveIdField');
          if (input) input.value = String(result.id);
        }
        if (result !== null && result !== void 0 && result.autosave_url) item.dataset.autosaveUrl = result.autosave_url;
        if (_this4.autosaveTimers.has(item)) _this4.setAutosaveStatus(item, 'pending', 'Changes detected…');else _this4.setAutosaveStatus(item, 'saved', 'Saved');
        _this4.dispatch('autosave:success', {
          detail: {
            item,
            response,
            result
          }
        });
      } catch (error) {
        _this4.setAutosaveStatus(item, 'error', 'Could not save');
        _this4.dispatch('autosave:error', {
          detail: {
            item,
            error
          }
        });
      }
    })();
  }
  identityInput(item, option) {
    var field = item.dataset[option];
    return field ? item.querySelector("[name=\"".concat(CSS.escape("".concat(item.dataset.autosavePrefix, "[").concat(field, "]")), "\"]")) : null;
  }
  autosaveHeaders() {
    var _this$form4;
    var token = (_this$form4 = this.form) === null || _this$form4 === void 0 ? void 0 : _this$form4.querySelector('input[name$="[_token]"], input[name="_token"]');
    return _objectSpread({
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }, token ? {
      'X-CSRF-TOKEN': token.value
    } : {});
  }
  createItemFormData(item) {
    var data = new FormData();
    var prefix = item.dataset.autosavePrefix || '';
    item.querySelectorAll('input, select, textarea').forEach(control => {
      if (!control.name || control.disabled) return;
      var name = this.relativeFieldName(control.name, prefix);
      if (control instanceof HTMLInputElement && ['checkbox', 'radio'].includes(control.type) && !control.checked) return;
      if (control instanceof HTMLInputElement && control.type === 'file') {
        var _control$files;
        Array.from((_control$files = control.files) !== null && _control$files !== void 0 ? _control$files : []).forEach(file => data.append(name, file));
        return;
      }
      if (control instanceof HTMLSelectElement && control.multiple) {
        Array.from(control.selectedOptions).forEach(option => data.append(name, option.value));
        return;
      }
      data.append(name, control.value);
    });
    return data;
  }
  resolveAutosaveUrl(item) {
    var url = item.dataset.autosaveUrl;
    if (!url) return null;
    if (!url.includes('__ID__')) return url;
    var id = item.dataset.autosaveId;
    if (!id && item.dataset.autosaveCreateUrl) return item.dataset.autosaveCreateUrl;
    if (!id) {
      this.setAutosaveStatus(item, 'error', 'Could not save');
      this.dispatch('autosave:error', {
        detail: {
          item,
          error: new Error('The autosave URL requires an item id.')
        }
      });
      return null;
    }
    return url.replaceAll('__ID__', encodeURIComponent(id));
  }
  relativeFieldName(name, prefix) {
    if (!prefix || !name.startsWith("".concat(prefix, "["))) return name;
    var segments = Array.from(name.slice(prefix.length).matchAll(/\[([^\]]*)\]/g), match => match[1]);
    if (segments.length === 0) return name;
    return segments[0] + segments.slice(1).map(segment => "[".concat(segment, "]")).join('');
  }
  setAutosaveStatus(item, state, message) {
    item.dataset.autosaveState = state;
    var status = item.querySelector('.custom-collection__autosave-status');
    if (status) status.textContent = message;
  }
  clearItemAutosave(item) {
    var timer = this.autosaveTimers.get(item);
    if (timer !== undefined) window.clearTimeout(timer);
    this.autosaveTimers.delete(item);
  }
  itemForEvent(event) {
    return event.currentTarget.closest('.custom-collection__item');
  }
  items() {
    return Array.from(this.itemsTarget.querySelectorAll(':scope > .custom-collection__item'));
  }
  updateOrder() {
    var autosaveChangedPositions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var items = this.items();
    items.forEach((item, index) => {
      var number = item.querySelector('.custom-collection__number');
      if (number) number.textContent = "#".concat(index + 1);
      if (this.positionFieldValue) {
        var input = item.querySelector("[name$=\"[".concat(CSS.escape(this.positionFieldValue), "]\"]"));
        if (input && input.value !== String(index)) {
          input.value = String(index);
          if (autosaveChangedPositions) this.scheduleAutosave(item);
        }
      }
    });
    this.emptyTarget.classList.toggle('d-none', items.length > 0);
  }
}
_defineProperty(CollectionController, "scrollZoneRatio", 0.1);
_defineProperty(CollectionController, "maximumScrollSpeed", 24);
_defineProperty(CollectionController, "targets", ['items', 'empty']);
_defineProperty(CollectionController, "values", {
  index: Number,
  prototype: String,
  prototypes: Object,
  positionField: String,
  confirmDelete: String,
  autosaveDelay: {
    type: Number,
    default: 1000
  }
});