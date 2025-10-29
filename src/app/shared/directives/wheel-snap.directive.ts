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
  private isScrolling = false;

  @Input() sectionSelector = '[data-section]';
  @Input() cooldownMs = 1000;
  @Input() hardTriggerPx = 80;

  constructor(el: ElementRef<HTMLElement>) {
    this.container = el.nativeElement;
  }

  ngAfterViewInit(): void {
    this.sections = Array.from(
      this.container.querySelectorAll<HTMLElement>(this.sectionSelector)
    );
    this.wheelHandler = (e) => this.onWheel(e);
    this.container.addEventListener('wheel', this.wheelHandler, { passive: true });
  }

  ngOnDestroy(): void {
    this.container.removeEventListener('wheel', this.wheelHandler);
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
  }

  private onWheel(e: WheelEvent) {
    if (!this.sections.length) return;
    if (this.isInsideScrollable(e)) return;
    if (this.isScrolling) return;

    const isTrackpad = this.isLikelyTrackpad(e);
    const threshold = isTrackpad ? 120 : this.hardTriggerPx;
    const cooldown = isTrackpad ? 500 : this.cooldownMs;

    this.container.dataset['lastInputTrackpad'] = String(isTrackpad);

    const now = performance.now();
    if (now - this.lastTriggerAt < cooldown) {
      return;
    }

    const dy = this.normalizeDeltaY(e);
    this.accumulatedDelta += dy;

    if (this.resetTimeout) clearTimeout(this.resetTimeout);
    this.resetTimeout = setTimeout(() => {
      this.accumulatedDelta = 0;
    }, 200);

    const abs = Math.abs(this.accumulatedDelta);
    if (abs >= threshold) {
      this.lastTriggerAt = now;
      const direction = this.accumulatedDelta > 0 ? 1 : -1;
      this.accumulatedDelta = 0;
      this.scrollByOne(direction);
    }
  }

  private isLikelyTrackpad(e: WheelEvent): boolean {
    const delta = Math.abs(e.deltaY);
    if (delta > 0 && delta < 10) return true;
    return delta < 120 && !Number.isInteger(delta / 40);
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
    this.isScrolling = true;

    const isTrackpad = this.container.dataset['lastInputTrackpad'] === 'true';
    if (isTrackpad) {
      this.smoothScrollTo(target.offsetTop, 1200, () => {
        this.isScrolling = false;
      });
    } else {
      this.container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
      setTimeout(() => {
        this.isScrolling = false;
      }, 700);
    }
  }

  private smoothScrollTo(targetY: number, duration: number, onComplete?: () => void) {
    const startY = this.container.scrollTop;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeInOutQuart = (t: number): number => {
      return t < 0.5
        ? 8 * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 4) / 2;
    };

    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuart(progress);

      this.container.scrollTop = startY + distance * eased;

      if (progress < 1) {
        requestAnimationFrame(scroll);
      } else {
        onComplete?.();
      }
    };

    requestAnimationFrame(scroll);
  }

  private getCurrentIndex(): number {
    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight;
    const viewportCenter = scrollTop + viewportHeight / 2;

    let best = -1;
    let bestDist = Infinity;

    this.sections.forEach((sec, i) => {
      const sectionTop = sec.offsetTop;
      const sectionHeight = sec.offsetHeight;
      const sectionCenter = sectionTop + sectionHeight / 2;

      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < bestDist) {
        bestDist = distance;
        best = i;
      }
    });

    return best;
  }
}

