import P5, { Color } from 'p5';
import Boundary from './models/core/boundary';

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
  public particleSize = 3;
  public mainRobotColor: Color;
  public mainRobotHeadColor: Color;
  public particleRobotColor: Color;
  public particleRobotHeadColor: Color;

  // Global Constants
  public minDimention: number;
  public robotSize: number;
  public walls: Array<Boundary> = [];
  public wallColor: Color;

  // Sensors
  //   * Lidar
  //     lidarAngle = lidarSampling * (integer constant)
  public lidarAngle = 60;
  public lidarSampling = 30;
  public lidarDotSize = 4;
  public lidarNoiseAmplification = 40;
  public lidarNoiseOffset = 0.04;
  public lidarColor: Color;

  public init = (p5: P5) => {
    this.minDimention = Math.min(p5.windowWidth, p5.windowHeight);
    this.robotSize = this.minDimention / 20;
    this.initColors(p5);
    this.initBoundries(p5);
  };

  private initColors = (p5: P5) => {
    this.mainRobotColor = p5.color(100, 0, 0);
    this.mainRobotHeadColor = p5.color(0, 255, 0);
    this.particleRobotColor = p5.color(130, 130, 130);
    this.particleRobotHeadColor = p5.color(255, 100, 100);
    this.lidarColor = p5.color(0, 200, 0);
    this.wallColor = p5.color(255, 255, 255);
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
      p5.stroke(this.wallColor);
      this.walls[i] = new Boundary(p5, x1, y1, x2, y2);
      p5.noStroke();
    }

    // Edges of the screen
    p5.stroke(this.wallColor);
    this.walls.push(new Boundary(p5, 0, 0, width, 0));
    this.walls.push(new Boundary(p5, width, 0, width, height));
    this.walls.push(new Boundary(p5, width, height, 0, height));
    this.walls.push(new Boundary(p5, 0, height, 0, 0));
    p5.noStroke();
  };
}
