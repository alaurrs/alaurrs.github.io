import {AfterViewInit, Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appMagneticScroll]',
  standalone: true,
})
export class MagneticScrollDirective implements AfterViewInit {
  private container: HTMLElement;
  private sections: HTMLElement[] = [];
  private isAnimating = false;

  // Settings
  @Input() minDelta = 8;

  // Trackpad
  @Input() animationMs = 600;
  @Input() accumulateWindowMs = 120;
  @Input() sensitivity = 1.4;

  // Touch
  @Input() touchDeltaThreshold = 28;
  private touchStartY = 0;


  // Mouse
  @Input() hardTriggerPx = 80;
  @Input() mouseCooldownMs = 320;
  private lastMouseTriggerAt = 0;


  // Accumulation trackpad
  private wheelSum = 0;
  private lastWheelAt = 0;

  // Listener
  private boundWheel!: (e: WheelEvent) => void;

  constructor(private el: ElementRef<HTMLElement>) {
    this.container = this.el.nativeElement;
  }

  ngAfterViewInit(): void {
    this.sections = Array.from(this.container.querySelectorAll<HTMLElement>('[data-section]'));

    this.boundWheel = (e) => this.onWheel(e);
    this.container.addEventListener('wheel', this.boundWheel, { passive: false });
  }

  ngOnDestroy(): void {
    this.container.removeEventListener('wheel', this.boundWheel);
  }

  private normalizedDeltaY(e: WheelEvent): number {
    let delta = e.deltaY;

    if (e.deltaMode === 1) {
      const cs = getComputedStyle(this.container);
      const lhRaw = cs.lineHeight;
      let lineHeightPx: number;
      if (lhRaw === 'normal') {
        const fontSize = parseFloat(cs.fontSize || '16');
        lineHeightPx = 1.2 * fontSize;
      } else {
        lineHeightPx = parseFloat(lhRaw);
      }
      delta *= lineHeightPx || 16;
    } else if (e.deltaMode === 2) {
      delta *= this.container.clientHeight;
    }

    return delta * this.sensitivity;
  }

  private isDiscreteWheel(e: WheelEvent, normalizedAbs: number): boolean {
    return e.deltaMode === 1 || e.deltaMode === 2 || normalizedAbs >= this.hardTriggerPx;
  }

  private onWheel(e: WheelEvent): void {
    if (this.isAnimating || this.sections.length === 0) return;

    e.preventDefault();

    const now = performance.now();
    const dy = this.normalizedDeltaY(e);
    const abs = Math.abs(dy);

    if (abs === 0) return;

    if (this.isDiscreteWheel(e, abs)) {
      if (now - this.lastMouseTriggerAt < this.mouseCooldownMs) return;
      this.lastMouseTriggerAt = now;
      this.scrollToSibling(dy > 0 ? 1 : -1);
      this.wheelSum = 0;
      return;
    }

    if (now - this.lastWheelAt > this.accumulateWindowMs) {
      this.wheelSum = 0;
    }
    this.lastWheelAt = now;

    this.wheelSum += dy;

    if (Math.abs(this.wheelSum) >= this.minDelta) {
      const dir = this.wheelSum > 0 ? 1 : -1;
      this.wheelSum = 0;
      this.scrollToSibling(dir);
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(ev: TouchEvent) {
    this.touchStartY = ev.touches[0].clientY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(ev: TouchEvent) {
    if (this.isAnimating) return;
    const endY = ev.changedTouches[0].clientY;
    const delta = this.touchStartY - endY;
    if (Math.abs(delta) < this.touchDeltaThreshold) return;
    this.scrollToSibling(delta > 0 ? 1 : -1);
  }

  @HostListener('keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    const keysNext = ['PageDown', 'ArrowDown', 'ArrowRight'];
    const keysPrev = ['PageUp', 'ArrowUp', 'ArrowLeft'];

    if (keysNext.includes(e.key)) {
      e.preventDefault();
      this.scrollToSibling(1);
    } else if (keysPrev.includes(e.key)) {
      e.preventDefault();
      this.scrollToSibling(-1);
    }
  }

  private scrollToSibling(direction: 1 | -1) {
    const currentIdx = this.getCurrentSectionIndex();
    if (currentIdx === -1) return;

    const nextIdx = Math.max(0, Math.min(this.sections.length - 1, currentIdx + direction));
    if (nextIdx === currentIdx) return;

    const target = this.sections[nextIdx];
    this.isAnimating = true;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.container.scrollTo({
      top: target.offsetTop,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });

    window.setTimeout(
      () => (this.isAnimating = false),
      prefersReduced ? 50 : this.animationMs
    );
  }

  private getCurrentSectionIndex(): number {
    const containerTop = this.container.scrollTop;
    const viewportH = this.container.clientHeight;

    let bestIdx = -1;
    let bestDist = Number.POSITIVE_INFINITY;

    this.sections.forEach((section, idx) => {
      const center = section.offsetTop + section.offsetHeight / 2;
      const viewportCenter = containerTop + viewportH / 2;
      const dist = Math.abs(center - viewportCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    })

    return bestIdx;
  }
}
