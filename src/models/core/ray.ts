import P5, { Vector } from 'p5';
import Boundary from './boundary';

export default class Ray {
  private direction: Vector;

  public constructor(direction: Vector) {
    this.direction = direction;
  }

  public cast = (p5: P5, position: Vector, wall: Boundary): Vector | null => {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = position.x;
    const y3 = position.y;
    const x4 = position.x + this.direction.x;
    const y4 = position.y + this.direction.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return null;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = p5.createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return null;
    }
  };

  public update = (direction: Vector) => {
    this.direction = direction;
  };
}
