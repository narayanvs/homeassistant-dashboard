class MyHomeFloatingSettingsV1 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this.config = config;
    if (this.button) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; height: 0; min-height: 0; }
        button {
          position: fixed; z-index: 1000; width: 44px; height: 44px;
          border-radius: 50%; border: 1px solid rgba(202,183,144,.32);
          background: rgba(25,27,31,.86); color: #d1bf99;
          box-shadow: 0 4px 18px rgba(0,0,0,.25);
          display: grid; place-items: center; padding: 0;
          font: 25px system-ui; cursor: grab; touch-action: none;
          -webkit-user-select: none; user-select: none;
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        }
        button:active { cursor: grabbing; }
        button:focus-visible { outline: 2px solid #d1bf99; outline-offset: 3px; }
        @media (prefers-reduced-motion: no-preference) {
          button { transition: background .18s ease, border-color .18s ease; }
          button:hover { background: rgba(40,43,49,.94); border-color: rgba(202,183,144,.7); }
        }
      </style>
      <button type="button" aria-label="Open Home Assistant settings" title="Tap for Home Assistant settings · drag to move">⚙</button>
    `;
    this.button = this.shadowRoot.querySelector('button');
    this.button.addEventListener('pointerdown', this.onDown.bind(this));
    this.button.addEventListener('pointermove', this.onMove.bind(this));
    this.button.addEventListener('pointerup', this.onUp.bind(this));
    this.button.addEventListener('pointercancel', this.onCancel.bind(this));
    this.button.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openSettings();
      }
    });
    this.place();
    this.resizeHandler = () => this.place();
    window.addEventListener('resize', this.resizeHandler);
  }

  get storageKey() { return 'myhome-floating-settings-position-v1'; }
  getCardSize() { return 0; }

  place() {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey)); } catch (_) {}
    const x = Number.isFinite(saved?.x) ? saved.x : innerWidth - 58;
    const y = Number.isFinite(saved?.y) ? saved.y : Math.max(100, innerHeight * .42);
    this.setPosition(x, y);
  }

  setPosition(x, y) {
    this.x = Math.min(Math.max(8, x), Math.max(8, innerWidth - 52));
    this.y = Math.min(Math.max(8, y), Math.max(8, innerHeight - 52));
    this.button.style.left = `${this.x}px`;
    this.button.style.top = `${this.y}px`;
  }

  onDown(e) {
    if (e.button !== 0) return;
    this.drag = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY,
      x: this.x, y: this.y, moved: false };
    this.button.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  onMove(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.pointerId) return;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    if (Math.hypot(dx, dy) > 7) d.moved = true;
    if (d.moved) this.setPosition(d.x + dx, d.y + dy);
  }

  onUp(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.pointerId) return;
    this.drag = null;
    if (d.moved) {
      try { localStorage.setItem(this.storageKey, JSON.stringify({x:this.x,y:this.y})); } catch (_) {}
    } else this.openSettings();
  }

  onCancel() { this.drag = null; }

  openSettings() {
    const url = new URL(window.location.href);
    url.searchParams.delete('kiosk');
    url.searchParams.set('disable_km', '');
    window.location.assign(url.toString());
  }

  disconnectedCallback() {
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
  }
}

customElements.define('myhome-floating-settings-v1', MyHomeFloatingSettingsV1);
