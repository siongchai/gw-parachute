/**
 * Loads the pixel sprites sliced from the supplied asset sheet.
 * Artwork lives in /public/sprites and can be replaced file-for-file
 * without touching gameplay code.
 */

export const SPRITE_MANIFEST = {
  heli_0: "helicopter/heli_0.png",
  heli_1: "helicopter/heli_1.png",
  heli_2: "helicopter/heli_2.png",
  heli_3: "helicopter/heli_3.png",

  fall_0: "parachutist/fall_0.png",
  fall_1: "parachutist/fall_1.png",
  fall_2: "parachutist/fall_2.png",
  fall_3: "parachutist/fall_3.png",
  fall_4: "parachutist/fall_4.png",
  fall_5: "parachutist/fall_5.png",

  spin_0: "parachutist/spin_0.png",
  spin_1: "parachutist/spin_1.png",
  spin_2: "parachutist/spin_2.png",
  spin_3: "parachutist/spin_3.png",
  spin_4: "parachutist/spin_4.png",
  spin_5: "parachutist/spin_5.png",

  pathL_0: "path/pathL_0.png",
  pathL_1: "path/pathL_1.png",
  pathL_2: "path/pathL_2.png",
  pathL_3: "path/pathL_3.png",
  pathL_4: "path/pathL_4.png",
  pathL_5: "path/pathL_5.png",
  pathL_6: "path/pathL_6.png",

  pathC_0: "path/pathC_0.png",
  pathC_1: "path/pathC_1.png",
  pathC_2: "path/pathC_2.png",
  pathC_3: "path/pathC_3.png",
  pathC_4: "path/pathC_4.png",
  pathC_5: "path/pathC_5.png",

  pathR_0: "path/pathR_0.png",
  pathR_1: "path/pathR_1.png",
  pathR_2: "path/pathR_2.png",
  pathR_3: "path/pathR_3.png",
  pathR_4: "path/pathR_4.png",

  hang_0: "parachutist/hang_0.png",
  hang_1: "parachutist/hang_1.png",
  hang_2: "parachutist/hang_2.png",
  hang_3: "parachutist/hang_3.png",
  hang_4: "parachutist/hang_4.png",
  hang_5: "parachutist/hang_5.png",

  splash_0: "parachutist/splash_0.png",
  splash_1: "parachutist/splash_1.png",
  splash_2: "parachutist/splash_2.png",
  splash_3: "parachutist/splash_3.png",

  boat_0: "boat/boat_0.png",
  boat_1: "boat/boat_1.png",
  boat_2: "boat/boat_2.png",
  boat_3: "boat/boat_3.png",

  fin_up_0: "shark/fin_up_0.png",
  fin_up_1: "shark/fin_up_1.png",
  fin_up_2: "shark/fin_up_2.png",
  fin_dip_0: "shark/fin_dip_0.png",
  fin_dip_1: "shark/fin_dip_1.png",
  fin_dip_2: "shark/fin_dip_2.png",
  attack_0: "shark/attack_0.png",
  attack_1: "shark/attack_1.png",
  attack_2: "shark/attack_2.png",

  palm_left: "palm/palm_left.png",
  palm_right: "palm/palm_right.png",

  wave_0: "water/wave_0.png",
  wave_1: "water/wave_1.png",
  wave_2: "water/wave_2.png",

  miss_icon_0: "ui/miss_icon_0.png",
  miss_icon_1: "ui/miss_icon_1.png",
  miss_icon_2: "ui/miss_icon_2.png",
  label_game_a: "ui/label_game_a.png",
  label_game_b: "ui/label_game_b.png",
  label_miss: "ui/label_miss.png",

  digit_0: "digits/digit_0.png",
  digit_1: "digits/digit_1.png",
  digit_2: "digits/digit_2.png",
  digit_3: "digits/digit_3.png",
  digit_4: "digits/digit_4.png",
  digit_5: "digits/digit_5.png",
  digit_6: "digits/digit_6.png",
  digit_7: "digits/digit_7.png",
  digit_8: "digits/digit_8.png",
  digit_9: "digits/digit_9.png",
} as const;

export type SpriteId = keyof typeof SPRITE_MANIFEST;

export type DrawOptions = {
  flipX?: boolean;
  alpha?: number;
};

const BASE_PATH = "/sprites/";
const SPRITE_CACHE_BUST = "20260819-boat-v4";
const HELICOPTER_HIRES = [
  "helicopter/heli_hires_0.png",
  "helicopter/heli_hires_1.png",
  "helicopter/heli_hires_2.png",
  "helicopter/heli_hires_3.png",
] as const;

const BOAT_HIRES = [
  "boat/boat_hires_0.png",
  "boat/boat_hires_1.png",
  "boat/boat_hires_2.png",
] as const;

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
  } catch {
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  }
  return img;
}

export class SpriteManager {
  private images = new Map<SpriteId, HTMLImageElement>();
  private helicopterHires: (HTMLImageElement | null)[] = [];
  private boatHires: (HTMLImageElement | null)[] = [];
  private ready = false;

  async init(): Promise<void> {
    if (typeof window === "undefined") return;

    const entries = Object.entries(SPRITE_MANIFEST) as [SpriteId, string][];
    const [sprites, heliHires, boatHires] = await Promise.all([
      Promise.all(
        entries.map(async ([id, file]) => {
          const img = await loadImage(`${BASE_PATH}${file}?v=${SPRITE_CACHE_BUST}`);
          return [id, img] as const;
        }),
      ),
      Promise.all(
        HELICOPTER_HIRES.map((file) =>
          loadImage(`${BASE_PATH}${file}?v=${SPRITE_CACHE_BUST}`),
        ),
      ),
      Promise.all(
        BOAT_HIRES.map((file) =>
          loadImage(`${BASE_PATH}${file}?v=${SPRITE_CACHE_BUST}`),
        ),
      ),
    ]);

    for (const [id, img] of sprites) {
      this.images.set(id, img);
    }
    this.helicopterHires = heliHires.map((img) =>
      img.naturalWidth > 0 ? img : null,
    );
    this.boatHires = boatHires.map((img) =>
      img.naturalWidth > 0 ? img : null,
    );
    this.ready = true;
  }

  isReady(): boolean {
    return this.ready;
  }

  get(id: SpriteId): HTMLImageElement | null {
    return this.images.get(id) ?? null;
  }

  size(id: SpriteId): { w: number; h: number } {
    const img = this.images.get(id);
    return { w: img?.naturalWidth ?? 0, h: img?.naturalHeight ?? 0 };
  }

  draw(
    ctx: CanvasRenderingContext2D,
    id: SpriteId,
    x: number,
    y: number,
    opts?: DrawOptions,
  ): void {
    const img = this.images.get(id);
    if (!img || !img.naturalWidth) return;

    const px = Math.round(x);
    const py = Math.round(y);

    if (!opts?.flipX && opts?.alpha == null) {
      ctx.drawImage(img, px, py);
      return;
    }

    ctx.save();
    if (opts?.alpha != null) ctx.globalAlpha = opts.alpha;
    if (opts?.flipX) {
      ctx.translate(px + img.naturalWidth, py);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
    } else {
      ctx.drawImage(img, px, py);
    }
    ctx.restore();
  }

  /** Four-frame rotor animation — smooth-scaled from aligned hires sprites. */
  drawHelicopter(
    ctx: CanvasRenderingContext2D,
    frame: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    const idx = frame % 4;
    const hires = this.helicopterHires[idx];
    const img =
      hires ??
      this.images.get(`heli_${idx}` as SpriteId);
    if (!img?.naturalWidth) return;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  /** Lane pose (left / centre / right) — smooth-scaled from hires sprites. */
  drawBoat(
    ctx: CanvasRenderingContext2D,
    lane: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    const idx = Math.max(0, Math.min(2, lane));
    const hires = this.boatHires[idx];
    const img =
      hires ??
      this.images.get(`boat_${idx}` as SpriteId);
    if (!img?.naturalWidth) return;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  /** Three-digit LCD score, matching the reference HUD. */
  drawScore(
    ctx: CanvasRenderingContext2D,
    score: number,
    x: number,
    y: number,
    advance: number,
  ): void {
    const text = String(Math.min(999, Math.max(0, score))).padStart(3, "0");
    let ox = x;
    for (const ch of text) {
      this.draw(ctx, `digit_${ch}` as SpriteId, ox, y);
      ox += advance;
    }
  }
}
