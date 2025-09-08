// BaseParticleEffect.ts
import { ParticleContainer, Particle, Texture, Ticker } from 'pixi.js';

export interface ParticleEffectConfig {
    maxParticles?: number; // własny limit systemu
    emissionRate?: number; // cząsteczki/s w trybie ciągłym
    lifetime?: [number, number]; // sekundy (min, max)
    speed?: [number, number]; // px/s (min, max)
    scale?: [number, number]; // skala początkowa (min, max)
    alpha?: [number, number]; // [startAlpha, endAlpha]
    angle?: [number, number]; // zakres emisji w stopniach
    gravity?: number; // px/s^2 (po osi Y)
    friction?: number; // 0..1 (np. 0.92 hamuje, 1.0 = bez tarcia)

    /** start i end koloru (0xRRGGBB). Jeżeli oba jednakowe – stały tint. */
    tint?: [number, number];

    dynamic?: {
        position?: boolean;
        rotation?: boolean;
        scale?: boolean; // w Pixi 8 to "vertex" property
        color?: boolean; // alpha/tint
    };
}

/**
 * Czysty, lekki system cząsteczek pod PixiJS 8, bez zewn. zależności.
 * Używa ParticleContainer + Particle (API v8) i własnego poolingu.
 */
export class BaseParticleEffect extends ParticleContainer {
    private _tex: Texture;

    private cfg: Required<ParticleEffectConfig>;
    private pool: Particle[] = [];
    private live: Particle[] = [];
    private data: {
        vx: number;
        vy: number;
        life: number;
        age: number;
        startAlpha: number;
        endAlpha: number;
        startScale: number;
        endScale: number;
        startTint: number;
        endTint: number;
    }[] = [];

    private running = false; // tryb ciągły (start/stop)
    private onceUpdating = false; // tymczasowy updater dla emitOnce
    private emitAcc = 0; // akumulator emisji dla trybu ciągłego

    constructor(config: ParticleEffectConfig, texture: Texture) {
        super({
            texture,
            // Dobierz dynamicProperties do tego, co animujesz w ticku.
            dynamicProperties: {
                position: config.dynamic?.position ?? true,
                rotation: config.dynamic?.rotation ?? false,
                vertex: config.dynamic?.scale ?? true, // skalujemy scaleX/scaleY
                color: config.dynamic?.color ?? true, // zmieniamy alpha + tint
                uvs: false,
            },
        });

        this._tex = texture;
        this.cfg = {
            maxParticles: config.maxParticles ?? 500,
            emissionRate: config.emissionRate ?? 80,
            lifetime: config.lifetime ?? [0.5, 1.5],
            speed: config.speed ?? [80, 220],
            scale: config.scale ?? [0.6, 1.2],
            alpha: config.alpha ?? [1, 0],
            angle: config.angle ?? [0, 360],
            gravity: config.gravity ?? 0,
            friction: config.friction ?? 1.0, // 1.0 = brak hamowania
            tint: config.tint ?? [0xffffff, 0xffffff],
            dynamic: {
                position: config.dynamic?.position ?? true,
                rotation: config.dynamic?.rotation ?? false,
                scale: config.dynamic?.scale ?? true,
                color: config.dynamic?.color ?? true,
            },
        };
    }

    /** Start emisji ciągłej (podpina tick do Ticker.shared). */
    public start(autoUpdate = true): void {
        this.running = true;
        this.emitAcc = 0;
        if (autoUpdate) Ticker.shared.add(this._tickMain, this);
    }

    /** Stop emisji ciągłej (odpina tick). */
    public stop(): void {
        this.running = false;
        Ticker.shared.remove(this._tickMain, this);
    }

    /**
     * Jednorazowa emisja N cząsteczek, niezależna od trybu ciągłego.
     * Podpina tymczasowy updater tylko na czas „życia” tych cząsteczek.
     */
    public emitOnce(count?: number): void {
        const amount = count ?? this.cfg.maxParticles;
        for (let i = 0; i < amount && this.live.length < this.cfg.maxParticles; i++) {
            this._spawn();
        }
        if (!this.running && !this.onceUpdating) {
            this.onceUpdating = true;
            Ticker.shared.add(this._tickOnce, this);
        }
    }

    /** Ustaw pozycję emitera (czyli kontenera). */
    public setEmitterPosition(x: number, y: number): void {
        this.position.set(x, y);
    }

    /** Sprzątanie zasobów klasy (bez niszczenia Particle – nie mają destroy()). */
    public override destroy(options?: Parameters<ParticleContainer['destroy']>[0]): void {
        this.stop();
        if (this.onceUpdating) {
            Ticker.shared.remove(this._tickOnce, this);
            this.onceUpdating = false;
        }
        for (let i = this.live.length - 1; i >= 0; i--) {
            this.removeParticle(this.live[i]);
        }
        this.pool.length = 0;
        this.live.length = 0;
        this.data.length = 0;
        super.destroy(options as any);
    }

    // ===== Ticki =====

    /** Tick trybu ciągłego: emituje wg emissionRate i aktualizuje cząsteczki. */
    private _tickMain(ticker: Ticker): void {
        if (!this.running) return;
        const dt = ticker.deltaMS / 1000;
        this._emitContinuous(dt);
        this._updateParticles(dt);
    }

    /** Tick dla emitOnce(): tylko aktualizuje cząsteczki aż do wygaśnięcia ostatniej. */
    private _tickOnce(ticker: Ticker): void {
        const dt = ticker.deltaMS / 1000;
        this._updateParticles(dt);
        if (this.live.length === 0) {
            Ticker.shared.remove(this._tickOnce, this);
            this.onceUpdating = false;
        }
    }

    // ===== Emisja / update =====

    private _emitContinuous(dt: number): void {
        this.emitAcc += dt;
        let toEmit = Math.floor(this.emitAcc * this.cfg.emissionRate);
        if (toEmit > 0) this.emitAcc -= toEmit / this.cfg.emissionRate;
        while (toEmit-- > 0 && this.live.length < this.cfg.maxParticles) {
            this._spawn();
        }
    }

    private _updateParticles(dt: number): void {
        const hasFriction = this.cfg.friction !== 1.0;
        for (let i = this.live.length - 1; i >= 0; i--) {
            const p = this.live[i];
            const d = this.data[i];

            d.age += dt;
            if (d.age >= d.life) {
                this._despawnAt(i);
                continue;
            }

            // ruch
            if (hasFriction) {
                d.vx *= this.cfg.friction;
                d.vy *= this.cfg.friction;
            }
            p.x += d.vx * dt;
            p.y += d.vy * dt;
            d.vy += this.cfg.gravity * dt;

            // interpolacje
            const t = d.age / d.life;
            p.alpha = d.startAlpha + t * (d.endAlpha - d.startAlpha);
            const s = d.startScale + t * (d.endScale - d.startScale);
            p.scaleX = s;
            p.scaleY = s;

            // morfowanie koloru (tint)
            p.tint = lerpColor(d.startTint, d.endTint, t);
        }
    }

    // ===== Spawn / despawn =====

    private _spawn(): void {
        const p = this.pool.pop() ?? new Particle({ texture: this._tex });

        // kotwiczenie na środku, jak w Sprite.anchor.set(0.5)
        p.anchorX = 0.5;
        p.anchorY = 0.5;

        p.x = 0;
        p.y = 0;
        p.rotation = 0;

        const ang = deg2rad(rand(this.cfg.angle[0], this.cfg.angle[1]));
        const spd = rand(this.cfg.speed[0], this.cfg.speed[1]);
        const startScale = rand(this.cfg.scale[0], this.cfg.scale[1]);
        const endScale = startScale * 0.5;

        const [startTint, endTint] = this.cfg.tint;

        p.alpha = this.cfg.alpha[0];
        p.scaleX = startScale;
        p.scaleY = startScale;
        p.tint = startTint;

        this.addParticle(p);

        this.live.push(p);
        this.data.push({
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: rand(this.cfg.lifetime[0], this.cfg.lifetime[1]),
            age: 0,
            startAlpha: this.cfg.alpha[0],
            endAlpha: this.cfg.alpha[1],
            startScale,
            endScale,
            startTint,
            endTint,
        });
    }

    private _despawnAt(i: number): void {
        const p = this.live[i];
        this.removeParticle(p);
        this.pool.push(p); // recykling
        this.live.splice(i, 1);
        this.data.splice(i, 1);
    }
}

// ===== Helpers =====
function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}
function deg2rad(d: number) {
    return (d * Math.PI) / 180;
}

function lerpColor(a: number, b: number, t: number): number {
    const ar = (a >> 16) & 0xff,
        ag = (a >> 8) & 0xff,
        ab = a & 0xff;
    const br = (b >> 16) & 0xff,
        bg = (b >> 8) & 0xff,
        bb = b & 0xff;
    const rr = (ar + (br - ar) * t) & 0xff;
    const rg = (ag + (bg - ag) * t) & 0xff;
    const rb = (ab + (bb - ab) * t) & 0xff;
    return (rr << 16) | (rg << 8) | rb;
}
