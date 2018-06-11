const OPTIONS = {
  passive: false,
  capture: false
};

class UserEvent {
  constructor(el, type) {
    let evt = document.createEvent("Events");
    evt.initEvent(type, true, true);
    this.el = el;
    this.evt = evt;
    this.type = type;
  }

  // 监听事件
  on(fn) {
    this.off(fn);
    this.el.addEventListener(this.type, fn, OPTIONS);
  }

  // 移除事件
  off(fn) {
    this.el.removeEventListener(this.type, fn, OPTIONS);
  }

  // 触发事件
  emit(data) {
    this.evt.data = data;
    this.el.dispatchEvent(this.evt);
  }
}

export default UserEvent
