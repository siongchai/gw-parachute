import type { Rect } from "../game/CollisionManager";
import { GAME_WIDTH, PALM, parachutistXForLane } from "../game/GameConfig";
import type { SpriteId, SpriteManager } from "../game/SpriteManager";

export class PalmTree {
  readonly side: "left" | "right";
  readonly x: number;
  readonly y = PALM.y;
  private readonly spriteId: SpriteId;

  constructor(side: "left" | "right") {
    this.side = side;
    this.spriteId = side === "left" ? "palm_left" : "palm_right";
    this.x = side === "left" ? PALM.leftX : PALM.rightX;
  }

  /** Fronds a jumper can snag on in Game B. */
  getFrondZone(): Rect {
    return this.side === "left"
      ? { x: 0, y: this.y, w: 34, h: 18 }
      : { x: GAME_WIDTH - 34, y: this.y, w: 34, h: 18 };
  }

  /** Where a snagged jumper hangs. */
  getHangPoint(): { x: number; y: number } {
    return this.side === "left"
      ? { x: parachutistXForLane(0), y: this.y + 6 }
      : { x: parachutistXForLane(2), y: this.y + 6 };
  }

  render(ctx: CanvasRenderingContext2D, sprites: SpriteManager): void {
    sprites.draw(ctx, this.spriteId, this.x, this.y);
  }
}
