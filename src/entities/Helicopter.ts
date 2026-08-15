import { HELICOPTER } from "../game/GameConfig";
import type { SpriteId, SpriteManager } from "../game/SpriteManager";

const FRAMES: SpriteId[] = ["heli_0", "heli_1", "heli_2", "heli_3"];

/** Fixed top-right helicopter — rotor animates, body never moves (LCD mockup). */
export class Helicopter {
  readonly x = HELICOPTER.x;
  readonly y = HELICOPTER.y;

  private frame = 0;
  private frameTimer = 0;

  reset(): void {
    this.frame = 0;
    this.frameTimer = 0;
  }

  update(dt: number): void {
    this.frameTimer += dt;
    if (this.frameTimer >= HELICOPTER.rotorFrameMs) {
      this.frameTimer = 0;
      this.frame = (this.frame + 1) % FRAMES.length;
    }
  }

  render(ctx: CanvasRenderingContext2D, sprites: SpriteManager): void {
    sprites.draw(ctx, FRAMES[this.frame], this.x, this.y);
  }
}
