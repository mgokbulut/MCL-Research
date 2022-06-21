import P5, { Vector } from 'p5';
import { wallColor } from '../../globals';

export default class Boundary {
  p5: P5;
  a: Vector;
  b: Vector;

  public constructor(p5: P5, x1: number, y1: number, x2: number, y2: number) {
    this.p5 = p5;
    this.a = this.p5.createVector(x1, y1);
    this.b = this.p5.createVector(x2, y2);
  }

  public show() {
    this.p5.stroke(wallColor);
    this.p5.line(this.a.x, this.a.y, this.b.x, this.b.y);
  }

  public static showWalls = (walls: Array<Boundary>): void => {
    // Walls
    for (let wall of walls) {
      wall.show();
    }
  };
}
