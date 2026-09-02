function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Controller } from '@hotwired/stimulus';
export default class CollectionController extends Controller {
  constructor() {
    super(...arguments);
    _defineProperty(this, "scrollSpeed", 0);
    _defineProperty(this, "scrollAnimationFrame", null);
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
      this.updateOrder();
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
  }
  connect() {
    this.itemsTarget.addEventListener('dragover', this.dragOver);
    this.itemsTarget.addEventListener('drop', this.drop);
    window.addEventListener('dragover', this.updateAutoScroll);
    this.items().forEach(item => this.prepareItem(item));
    this.updateOrder();
  }
  disconnect() {
    this.itemsTarget.removeEventListener('dragover', this.dragOver);
    this.itemsTarget.removeEventListener('drop', this.drop);
    window.removeEventListener('dragover', this.updateAutoScroll);
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
    var _this$itemForEvent;
    event.preventDefault();
    if (this.confirmDeleteValue && !window.confirm(this.confirmDeleteValue)) return;
    (_this$itemForEvent = this.itemForEvent(event)) === null || _this$itemForEvent === void 0 || _this$itemForEvent.remove();
    this.updateOrder();
  }
  moveUp(event) {
    event.preventDefault();
    var item = this.itemForEvent(event);
    if (item !== null && item !== void 0 && item.previousElementSibling) this.itemsTarget.insertBefore(item, item.previousElementSibling);
    this.updateOrder();
  }
  moveDown(event) {
    event.preventDefault();
    var item = this.itemForEvent(event);
    if (item !== null && item !== void 0 && item.nextElementSibling) this.itemsTarget.insertBefore(item.nextElementSibling, item);
    this.updateOrder();
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
      this.updateOrder();
    });
  }
  stopAutoScroll() {
    this.scrollSpeed = 0;
    if (this.scrollAnimationFrame !== null) {
      window.cancelAnimationFrame(this.scrollAnimationFrame);
      this.scrollAnimationFrame = null;
    }
  }
  itemForEvent(event) {
    return event.currentTarget.closest('.custom-collection__item');
  }
  items() {
    return Array.from(this.itemsTarget.querySelectorAll(':scope > .custom-collection__item'));
  }
  updateOrder() {
    var items = this.items();
    items.forEach((item, index) => {
      var number = item.querySelector('.custom-collection__number');
      if (number) number.textContent = "#".concat(index + 1);
      if (this.positionFieldValue) {
        var input = item.querySelector("[name$=\"[".concat(CSS.escape(this.positionFieldValue), "]\"]"));
        if (input) input.value = String(index);
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
  confirmDelete: String
});