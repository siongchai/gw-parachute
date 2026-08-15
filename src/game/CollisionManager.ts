export type Rect = { x: number; y: number; w: number; h: number };

export class CollisionManager {
  /** Deliberately forgiving AABB test — catching should feel generous. */
  static overlaps(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
  }
}
