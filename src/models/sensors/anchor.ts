import P5, { Vector } from 'p5';
import { anchorColor, anchorSize } from '../../globals';

export class Anchor {
  private p5: P5;
  private position: Vector;

  constructor(p5: P5, position: Vector) {
    this.p5 = p5;
    this.position = position;
  }

  public getDistance = (robotPosition: Vector): number => {
    return Math.sqrt(
      Math.pow(robotPosition.x - this.position.x, 2) +
        Math.pow(robotPosition.y - this.position.y, 2)
    );
  };

  public show = (): void => {
    this.p5.fill(anchorColor);
    this.p5.stroke(anchorColor);
    this.p5.circle(this.position.x, this.position.y, anchorSize);
    this.p5.noStroke();
    this.p5.noFill();
  };
}
