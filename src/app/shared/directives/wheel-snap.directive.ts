import {AfterViewInit, Directive, ElementRef, Input, OnDestroy} from '@angular/core';

@Directive({
  selector: '[appWheelSnap]',
  standalone: true,
})
export class WheelSnapDirective implements AfterViewInit, OnDestroy {
  private container: HTMLElement;
  private sections: HTMLElement[] = [];
  private wheelHandler!: (e: WheelEvent) => void;
  private lastTriggerAt = 0;
  private accumulatedDelta = 0;
  private resetTimeout: any;

  @Input() sectionSelector = '[data-section]';
  @Input() cooldownMs = 800;
  @Input() hardTriggerPx = 50;

  constructor(el: ElementRef<HTMLElement>) {
    this.container = el.nativeElement;
  }

  ngAfterViewInit(): void {
    this.sections = Array.from(
      this.container.querySelectorAll<HTMLElement>(this.sectionSelector)
    );
    this.wheelHandler = (e) => this.onWheel(e);
    this.container.addEventListener('wheel', this.wheelHandler, { passive: false });
  }

  ngOnDestroy(): void {
    this.container.removeEventListener('wheel', this.wheelHandler);
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
  }

  private onWheel(e: WheelEvent) {
    if (!this.sections.length) return;
    if (this.isInsideScrollable(e)) return;

    const now = performance.now();
    if (now - this.lastTriggerAt < this.cooldownMs) {
      e.preventDefault();
      return;
    }

    const dy = this.normalizeDeltaY(e);
    this.accumulatedDelta += dy;

    if (this.resetTimeout) clearTimeout(this.resetTimeout);
    this.resetTimeout = setTimeout(() => {
      this.accumulatedDelta = 0;
    }, 150);

    const abs = Math.abs(this.accumulatedDelta);
    if (abs >= this.hardTriggerPx) {
      e.preventDefault();
      this.lastTriggerAt = now;
      const direction = this.accumulatedDelta > 0 ? 1 : -1;
      this.accumulatedDelta = 0;
      this.scrollByOne(direction);
    }
  }

  private normalizeDeltaY(e: WheelEvent): number {
    let d = e.deltaY;
    if (e.deltaMode === 1) {
      const cs = getComputedStyle(this.container);
      const lh = cs.lineHeight === 'normal'
        ? 1.2 * parseFloat(cs.fontSize || '16')
        : parseFloat(cs.lineHeight);
      d *= lh || 16;
    } else if (e.deltaMode === 2) {
      d *= this.container.clientHeight;
    }
    return d;
  }

  private isInsideScrollable(e: WheelEvent): boolean {
    let node = e.target as HTMLElement | null;
    while (node && node !== this.container) {
      const style = getComputedStyle(node);
      const isScrollableY =
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        node.scrollHeight > node.clientHeight;

      if (isScrollableY) {
        if ((e.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight) ||
          (e.deltaY < 0 && node.scrollTop > 0)) {
          return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }

  private scrollByOne(direction: 1 | -1) {
    const idx = this.getCurrentIndex();
    if (idx === -1) return;
    const next = Math.max(0, Math.min(this.sections.length - 1, idx + direction));
    if (next === idx) return;

    const target = this.sections[next];
    this.container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  }

  private getCurrentIndex(): number {
    const top = this.container.scrollTop;
    const vh = this.container.clientHeight;
    let best = -1, bestDist = Infinity;

    this.sections.forEach((sec, i) => {
      const center = sec.offsetTop + sec.offsetHeight / 2;
      const viewportCenter = top + vh / 2;
      const d = Math.abs(center - viewportCenter);
      if (d < bestDist) { bestDist = d; best = i; }
    });

    return best;
  }
}
