import P5 from 'p5';
import Globals from '../globals';
import Color from './core/color';
import LidarSensor from './sensors/lidar';

export default class Robot {
  private p5: P5;

  // Parameters for robot behavior
  private position: P5.Vector;
  private direction: P5.Vector;
  private lidarSensor: LidarSensor;

  // Parameters for visuals
  private robotColor: Color;
  private robotHeadColor: Color;
  private lidarColor: Color;
  private showLidar: boolean;

  public constructor(
    p5: P5,
    pos: P5.Vector,
    direction: P5.Vector
    // color: Color,
    // lidarColor?: Color,
    // showLidar?: boolean
  ) {
    this.p5 = p5;

    // Behavioral parameters
    this.position = pos;
    this.direction = direction;
    this.lidarSensor = new LidarSensor(this.p5, this.position, this.direction);

    // Setting defaults for visual parameters
    this.robotColor = {
      r: Globals.g().mainRobotColor.r,
      g: Globals.g().mainRobotColor.g,
      b: Globals.g().mainRobotColor.b,
    };
    this.lidarColor = { r: 0, g: 255, b: 0 };
    this.showLidar = true;
  }

  public update = (newPos: P5.Vector, rotationAngle: number): void => {
    const newDir = this.direction.rotate(rotationAngle).normalize();
    this.position.set(
      this.position.x + newDir.x * newPos.x,
      this.position.y + newDir.y * newPos.y
    );
    // this._position.set(
    //   this._position.x + newPos.x,
    //   this._position.y + newPos.y
    // );
    // console.log(newDir);
    this.direction.set(newDir.x, newDir.y);

    // update sensor data
    this.lidarSensor.update(this.position, this.direction, Globals.g().walls);
  };

  public show = (): void => {
    // show sensor data
    if (this.showLidar) {
      this.lidarSensor.show();
    }

    this.p5.noStroke();

    this.p5.fill(this.robotColor.r, this.robotColor.g, this.robotColor.b);
    this.p5.ellipse(this.position.x, this.position.y, Globals.g().robotSize);

    this.p5.stroke(this.lidarColor.r, this.lidarColor.g, this.lidarColor.b);
    this.p5.line(
      this.position.x,
      this.position.y,
      this.position.x + this.direction.x * Globals.g().robotSize * 0.5,
      this.position.y + this.direction.y * Globals.g().robotSize * 0.5
    );
    this.p5.noStroke();

    this.p5.fill(
      this.robotHeadColor.r,
      this.robotHeadColor.g,
      this.robotHeadColor.b
    );

    this.p5.ellipse(
      this.position.x + this.direction.x * Globals.g().robotSize * 0.5,
      this.position.y + this.direction.y * Globals.g().robotSize * 0.5,
      Globals.g().robotSize / 4
    );
  };

  public setColor = (robotColor: Color, headColor: Color): void => {
    this.robotColor = robotColor;
    this.robotHeadColor = headColor;
  };
}
