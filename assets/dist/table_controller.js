import { Controller } from "@hotwired/stimulus";
export default class extends Controller {
  connect() {}
  onClickTr(event) {
    var target = event.currentTarget;
    if (!target || !target.dataset.id) return;
    var clickUrl = this.element.dataset.clickUrl;
    if (clickUrl) {
      window.location.href = clickUrl.replace('__ID__', target.dataset.id);
    }
  }
}