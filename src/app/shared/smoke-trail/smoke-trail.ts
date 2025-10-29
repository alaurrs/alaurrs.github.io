import {
  Component, ElementRef, HostListener, Input, NgZone,
  OnDestroy, OnInit, ViewChild
} from '@angular/core';

type Particle = {
  x: number; y: number; vx: number; vy: number;
  life: number; ttl: number; size: number; baseSize: number;
};

@Component({
  selector: 'app-smoke-trail',
  standalone: true,
  template: `<canvas #canvas class="smoke-canvas" aria-hidden="true"></canvas>`,
  styles: [`
    .smoke-canvas {
      position: fixed; inset: 0;
      width: 100vw; height: 100vh;
      pointer-events: none; z-index: 9998;
      background: transparent;
      filter: blur(1.2px);
    }
    @media (prefers-reduced-motion: reduce) {
      .smoke-canvas { display: none; }
    }
  `]
})
export class SmokeTrail implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() colorStart = '#cfcfcf';  // gris clair
  @Input() colorEnd   = '#7f7f7f';  // gris moyen
  @Input() alpha      = 0.35;       // opacité particule
  @Input() blurFade   = 0.06;       // quantité du voile (motion blur) par frame (0.03–0.1)
  @Input() emission   = 5;          // particules/frame selon vitesse souris
  @Input() lifeMs     = 1200;       // durée de vie (fumée lente)
  @Input() baseSize   = 6;          // taille moyenne
  @Input() sizeJitter = 3;          // variation de taille
  @Input() friction   = 0.975;      // ralentissement
  @Input() spread     = 0.25;       // ouverture (0.1–0.4)
  @Input() maxParticles = 600;
  @Input() blendMode: GlobalCompositeOperation = 'lighter'; // “glow” doux

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private pool: Particle[] = [];
  private dpr = 1;
  private rafId: number | null = null;

  private mx = 0; private my = 0; private pmx = 0; private pmy = 0;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    const c = this.canvasRef.nativeElement;
    const ctx = c.getContext('2d', { alpha: true })!;
    this.ctx = ctx;
    this.resizeCanvas();

    this.zone.runOutsideAngular(() => {
      const loop = () => {
        this.update();
        this.draw();
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  @HostListener('window:resize') onResize() { this.resizeCanvas(); }

  @HostListener('document:visibilitychange') onVis() {
    if (document.hidden && this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    if (!document.hidden && !this.rafId) {
      this.zone.runOutsideAngular(() => {
        const loop = () => { this.update(); this.draw(); this.rafId = requestAnimationFrame(loop); };
        this.rafId = requestAnimationFrame(loop);
      });
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMove(e: MouseEvent) {
    this.mx = e.clientX; this.my = e.clientY;
    const dx = this.mx - this.pmx; const dy = this.my - this.pmy;
    const speed = Math.min(1, Math.hypot(dx, dy) / 36); // normalisé

    this.emit(this.mx, this.my, dx, dy, speed);
    this.pmx = this.mx; this.pmy = this.my;
  }

  private resizeCanvas() {
    const c = this.canvasRef.nativeElement;
    const w = window.innerWidth, h = window.innerHeight;
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    c.width = Math.floor(w * this.dpr);
    c.height = Math.floor(h * this.dpr);
    c.style.width = w + 'px'; c.style.height = h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.globalCompositeOperation = this.blendMode;
  }

  private emit(x: number, y: number, dx: number, dy: number, speed: number) {
    const n = Math.max(1, Math.round(this.emission * (0.4 + 0.6 * speed)));
    const dir = Math.atan2(dy, dx);

    for (let i = 0; i < n && this.particles.length < this.maxParticles; i++) {
      const p = this.pool.pop() ?? { x, y, vx: 0, vy: 0, life: 0, ttl: 0, size: 0, baseSize: 0 };
      const ang = (isFinite(dir) ? dir : Math.random() * Math.PI * 2) +
        (Math.random() - 0.5) * (Math.PI * this.spread);
      const spd = 0.45 + Math.random() * 1.4 * (0.5 + 0.5 * speed);

      p.x = x; p.y = y;
      p.vx = Math.cos(ang) * spd;
      p.vy = Math.sin(ang) * spd;
      p.life = 0; p.ttl = this.lifeMs;
      p.baseSize = this.baseSize + (Math.random() * 2 - 1) * this.sizeJitter;
      p.size = Math.max(1, p.baseSize);

      this.particles.push(p);
    }
  }

  private update() {
    const dt = 16; // ~60fps
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.ttl) {
        this.pool.push(p);
        this.particles.splice(i, 1);
        continue;
      }
      // fumée qui se dilate doucement
      const t = p.life / p.ttl;
      p.size = p.baseSize * (1.0 + 0.6 * t);

      p.vx *= this.friction; p.vy *= this.friction;
      p.x += p.vx; p.y += p.vy;
    }
  }

  private draw() {
    const ctx = this.ctx;
    const w = window.innerWidth, h = window.innerHeight;

    // MOTION BLUR: voile semi-transparent (ne pas clear brutalement)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${this.blurFade})`; // fond transparent → juste atténuation
    ctx.clearRect(0, 0, w, h); // garantir alpha propre
    // Astuce “voile” sur transparent : on peut omettre le fill si tu veux zéro voile.
    // Si tu as un fond uni derrière, remplace par ctx.fillRect pour vrai motion blur :
    // ctx.fillStyle = 'rgba(255,255,255,0.06)' pour fond blanc par ex.

    // Dessin des particules (glow doux)
    ctx.globalCompositeOperation = this.blendMode;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const t = 1 - p.life / p.ttl; // 1 → 0

      const r = p.size;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      const col = this.mix(this.colorStart, this.colorEnd, 1 - t);
      g.addColorStop(0, this.hexA(col, this.alpha * t * 0.9));
      g.addColorStop(1, this.hexA(col, 0));

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // utils couleurs
  private hexA(hex: string, a: number) {
    const { r, g, b } = this.hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }
  private mix(a: string, b: string, t: number) {
    const ca = this.hexToRgb(a), cb = this.hexToRgb(b);
    const m = (x: number, y: number) => Math.round(x + (y - x) * t);
    return this.rgbToHex(m(ca.r, cb.r), m(ca.g, cb.g), m(ca.b, cb.b));
  }
  private hexToRgb(hex: string) {
    const h = hex.replace('#', '');
    const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    return { r: parseInt(s.slice(0,2),16), g: parseInt(s.slice(2,4),16), b: parseInt(s.slice(4,6),16) };
  }
  private rgbToHex(r:number,g:number,b:number) {
    const to = (n:number)=>n.toString(16).padStart(2,'0');
    return `#${to(r)}${to(g)}${to(b)}`;
  }
}
