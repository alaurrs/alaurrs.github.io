import {Component, ElementRef, Input, OnDestroy, NgZone, OnInit, ViewChild, HostListener} from '@angular/core';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  size: number;
};

@Component({
  selector: 'app-particle-trail',
  standalone: true,
  imports: [],
  templateUrl: './particle-trail.html',
  styleUrl: './particle-trail.scss',
})
export class ParticleTrail implements OnInit, OnDestroy{
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() color = '#7dd3fc';           // couleur des particules (ex: Tailwind sky-300)
  @Input() colorEnd = '#a78bfa';        // couleur 2 (dégradé)
  @Input() blendMode: GlobalCompositeOperation = 'lighter'; // 'lighter' => glow
  @Input() maxParticles = 400;          // limite hard pour ne pas exploser le CPU
  @Input() emission = 6;                // particules émises par event (ajusté par vitesse)
  @Input() lifeMs = 700;                // durée de vie (ms)
  @Input() sizePx = 6;                  // taille moyenne d’une particule
  @Input() sizeJitter = 3;              // variation aléatoire
  @Input() friction = 0.965;            // ralentissement par frame
  @Input() spread = 0.12;               // dispersion angulaire
  @Input() alpha = 0.85;                // opacité de base

  private ctx!: CanvasRenderingContext2D;
  private dpr = Math.max(1, window.devicePixelRatio || 1);
  private particles: Particle[] = [];
  private rafId: number | null = null;

  private hasMouse = false;
  private mx = 0;
  private my = 0;
  private pmx = 0;
  private pmy = 0;

  private pool: Particle[] = [];

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    this.ctx = ctx;

    this.resizeCanvas();
    this.ctx.globalCompositeOperation = this.blendMode;

    this.zone.runOutsideAngular(() => {
      const loop = (t: number) => {
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

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.hasMouse = true;
    this.mx = e.clientX;
    this.my = e.clientY;

    const dx = this.mx - this.pmx;
    const dy = this.my - this.pmy;
    const speed = Math.min(1, Math.hypot(dx, dy) / 40);

    this.emit(this.mx, this.my, dx, dy, speed);
    this.pmx = this.mx;
    this.pmy = this.my;
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
  }

  @HostListener('document:visibilitychange')
  onVisChange() {
    if (document.hidden && this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    } else if (!document.hidden && !this.rafId) {
      this.zone.runOutsideAngular(() => {
        const loop = () => {
          this.update();
          this.draw();
          this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
      });
    }
  }

  private resizeCanvas() {
    const c = this.canvasRef.nativeElement;
    const rect = { w: window.innerWidth, h: window.innerHeight };
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    c.width = Math.floor(rect.w * this.dpr);
    c.height = Math.floor(rect.h * this.dpr);
    c.style.width = rect.w + 'px';
    c.style.height = rect.h + 'px';
    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  private emit(x: number, y: number, dx: number, dy: number, speedFactor: number) {
    const n = Math.max(1, Math.round(this.emission * (0.4 + speedFactor * 0.6)));

    for (let i = 0; i < n; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const baseAngle = Math.atan2(dy, dx);
      const angle = isFinite(baseAngle)
        ? baseAngle + (Math.random() - 0.5) * (Math.PI * this.spread)
        : Math.random() * Math.PI * 2;

      const speed = 0.6 + Math.random() * 2.2 * (0.4 + speedFactor * 0.6);

      const p = this.pool.pop() ?? { x, y, vx: 0, vy: 0, life: 0, ttl: 0, size: 0 };
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.ttl = this.lifeMs;
      const jitter = (Math.random() * 2 - 1) * this.sizeJitter;
      p.size = Math.max(1, this.sizePx + jitter);

      this.particles.push(p);
    }
  }

  private update() {
    const dt = 16;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.life += dt;
      if (p.life >= p.ttl) {
        this.pool.push(p);
        this.particles.splice(i, 1);
        continue;
      }

      p.vx *= this.friction;
      p.vy *= this.friction;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  private draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const t = 1 - (p.life / p.ttl); // 1 → 0

      const r = p.size * (0.8 + 0.6 * t); // légère décroissance
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, this.hexToRgba(this.mixColors(this.color, this.colorEnd, 1 - t), this.alpha * t));
      g.addColorStop(1, this.hexToRgba(this.mixColors(this.color, this.colorEnd, 1 - t), 0));

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private hexToRgba(hex: string, a: number) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3
      ? h.split('').map(c => c + c).join('')
      : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  private mixColors(hex1: string, hex2: string, t: number) {
    const c1 = this.hexToRgb(hex1);
    const c2 = this.hexToRgb(hex2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return this.rgbToHex(r, g, b);
  }

  private hexToRgb(hex: string) {
    const h = hex.replace('#', '');
    const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
    };
  }

  private rgbToHex(r: number, g: number, b: number) {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
