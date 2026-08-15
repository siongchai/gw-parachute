import { GAME_WIDTH, WATER_Y } from "../game/GameConfig";
import type { SpriteId, SpriteManager } from "../game/SpriteManager";

const FIN_UP: SpriteId[] = ["fin_up_0", "fin_up_1", "fin_up_2"];
const FIN_DIP: SpriteId[] = ["fin_dip_0", "fin_dip_1", "fin_dip_2"];
const ATTACK: SpriteId[] = ["attack_0", "attack_1", "attack_2"];

export type SharkKind = "fin" | "attack";

const LIFE_MS = 1100;

export class Shark {
  x: number;
  y: number;
  kind: SharkKind;
  remove = false;

  private life = LIFE_MS;
  private frame = 0;
  private frameTimer = 0;
  private variant: number;

  constructor(x: number, kind: SharkKind, waterOffset = 6) {
    this.kind = kind;
    this.variant = Math.floor(Math.random() * 3);
    this.y = WATER_Y + waterOffset;
    this.x = Math.max(2, Math.min(GAME_WIDTH - 26, x));
  }

  update(dt: number): void {
    this.life -= dt;
    this.frameTimer += dt;
    if (this.frameTimer >= 130) {
      this.frameTimer = 0;
      this.frame += 1;
    }
    if (this.life <= 0) this.remove = true;
  }

  render(ctx: CanvasRenderingContext2D, sprites: SpriteManager): void {
    let id: SpriteId;
    if (this.kind === "attack") {
      id = ATTACK[Math.min(ATTACK.length - 1, this.frame % ATTACK.length)];
    } else {
      const bobbing = this.frame % 2 === 0 ? FIN_UP : FIN_DIP;
      id = bobbing[this.variant];
    }
    const { h } = sprites.size(id);
    sprites.draw(ctx, id, this.x, this.y + 10 - h);
  }
}
