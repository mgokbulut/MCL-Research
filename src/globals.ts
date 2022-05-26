import P5 from 'p5';
import Boundary from './models/core/boundary';
import Color from './models/core/color';

/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
export default class Globals {
  // ------ Singleton Initialization ------ //
  private static instance: Globals;

  private constructor() {}

  public static getInstance(): Globals {
    if (!Globals.instance) {
      Globals.instance = new Globals();
    }

    return Globals.instance;
  }

  public static g(): Globals {
    return Globals.getInstance();
  }

  // ------ Declerations ------ //

  public Keys = {
    w: 87,
    a: 65,
    s: 83,
    d: 68,
    space: 32,
    enter: 13,
  };

  public keyboardSpeed = 5;
  public keyboardRotationAngle = 3; // 3 degrees

  // Robot
  public particleSize = 15;
  public mainRobotColor: Color = { r: 100, g: 0, b: 0 };
  public mainRobotHeadColor: Color = { r: 0, g: 255, b: 0 };
  public particleRobotColor: Color = { r: 100, g: 100, b: 100 };
  public particleRobotHeadColor: Color = { r: 200, g: 100, b: 100 };

  // Global Constants
  public minDimention: number;
  public robotSize: number;
  public walls: Array<Boundary> = [];
  public wallColor: Color = { r: 255, g: 255, b: 255 };

  // Sensors
  //   * Lidar
  //     lidarAngle = lidarSampling * (integer constant)
  public lidarAngle = 60;
  public lidarSampling = 30;
  public lidarDotSize = 4;
  public lidarNoiseAmplification = 40;
  public lidarNoiseOffset = 0.04;
  public lidarColor: Color = { r: 0, g: 200, b: 0 };

  public init = (p5: P5) => {
    this.minDimention = Math.min(p5.windowWidth, p5.windowHeight);
    this.robotSize = this.minDimention / 20;
    this.initBoundries(p5);
  };

  private initBoundries = (p5: P5) => {
    // for convinience
    const width = p5.windowWidth;
    const height = p5.windowHeight;

    // walls
    for (let i = 0; i < 5; i++) {
      let x1 = p5.random(width);
      let x2 = p5.random(width);
      let y1 = p5.random(height);
      let y2 = p5.random(height);
      p5.stroke(this.wallColor.r, this.wallColor.g, this.wallColor.b);
      this.walls[i] = new Boundary(p5, x1, y1, x2, y2);
      p5.noStroke();
    }

    // Edges of the screen
    p5.stroke(this.wallColor.r, this.wallColor.g, this.wallColor.b);
    this.walls.push(new Boundary(p5, 0, 0, width, 0));
    this.walls.push(new Boundary(p5, width, 0, width, height));
    this.walls.push(new Boundary(p5, width, height, 0, height));
    this.walls.push(new Boundary(p5, 0, height, 0, 0));
    p5.noStroke();
  };
}
