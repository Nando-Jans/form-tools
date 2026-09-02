function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Controller } from '@hotwired/stimulus';
export default class CollectionController extends Controller {
  constructor() {
    super(...arguments);
    _defineProperty(this, "scrollSpeed", 0);
    _defineProperty(this, "scrollAnimationFrame", null);
    _defineProperty(this, "autosaveTimers", new Map());
    _defineProperty(this, "autosaveRequests", new Map());
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
  }
  connect() {
    this.itemsTarget.addEventListener('dragover', this.dragOver);
    this.itemsTarget.addEventListener('drop', this.drop);
    this.itemsTarget.addEventListener('input', this.detectChange);
    this.itemsTarget.addEventListener('change', this.detectChange);
    window.addEventListener('dragover', this.updateAutoScroll);
    this.items().forEach(item => this.prepareItem(item));
    this.updateOrder();
  }
  disconnect() {
    this.itemsTarget.removeEventListener('dragover', this.dragOver);
    this.itemsTarget.removeEventListener('drop', this.drop);
    this.itemsTarget.removeEventListener('input', this.detectChange);
    this.itemsTarget.removeEventListener('change', this.detectChange);
    window.removeEventListener('dragover', this.updateAutoScroll);
    this.autosaveTimers.forEach(timer => window.clearTimeout(timer));
    this.autosaveRequests.forEach(request => request.abort());
    this.autosaveTimers.clear();
    this.autosaveRequests.clear();
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
    if (item) this.clearItemAutosave(item);
    item === null || item === void 0 || item.remove();
    this.updateOrder();
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
    if (!item.dataset.autosaveUrl) return;
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
    var _this = this;
    return _asyncToGenerator(function* () {
      var _this$autosaveRequest;
      var url = _this.resolveAutosaveUrl(item);
      if (!url || !item.isConnected) return;
      (_this$autosaveRequest = _this.autosaveRequests.get(item)) === null || _this$autosaveRequest === void 0 || _this$autosaveRequest.abort();
      var request = new AbortController();
      _this.autosaveRequests.set(item, request);
      _this.setAutosaveStatus(item, 'saving', 'Saving…');
      _this.dispatch('autosave:start', {
        detail: {
          item,
          url
        }
      });
      try {
        var _response$headers$get;
        var response = yield fetch(url, {
          method: item.dataset.autosaveMethod || 'POST',
          body: _this.createItemFormData(item),
          signal: request.signal,
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        if (!response.ok) throw new Error("Autosave failed with status ".concat(response.status, "."));
        var result = (_response$headers$get = response.headers.get('content-type')) !== null && _response$headers$get !== void 0 && _response$headers$get.includes('application/json') ? yield response.json() : null;
        if ((result === null || result === void 0 ? void 0 : result.id) !== undefined) item.dataset.autosaveId = String(result.id);
        if (result !== null && result !== void 0 && result.autosave_url) item.dataset.autosaveUrl = result.autosave_url;
        _this.setAutosaveStatus(item, 'saved', 'Saved');
        _this.dispatch('autosave:success', {
          detail: {
            item,
            response,
            result
          }
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        _this.setAutosaveStatus(item, 'error', 'Could not save');
        _this.dispatch('autosave:error', {
          detail: {
            item,
            error
          }
        });
      } finally {
        if (_this.autosaveRequests.get(item) === request) _this.autosaveRequests.delete(item);
      }
    })();
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
    var _this$autosaveRequest2;
    var timer = this.autosaveTimers.get(item);
    if (timer !== undefined) window.clearTimeout(timer);
    this.autosaveTimers.delete(item);
    (_this$autosaveRequest2 = this.autosaveRequests.get(item)) === null || _this$autosaveRequest2 === void 0 || _this$autosaveRequest2.abort();
    this.autosaveRequests.delete(item);
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