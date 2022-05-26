import P5, { Color, Vector } from 'p5';
import Globals from '../globals';
import { Lidar, LidarSensor } from './sensors/lidar';

export default class Robot {
  private p5: P5;

  // Parameters for robot behavior
  private position: Vector;
  private direction: Vector;
  private lidarSensor: LidarSensor;

  // Parameters for visuals
  private robotColor: Color;
  private robotHeadColor: Color;
  private lidarColor: Color;
  private lidarEnabled: boolean;

  public constructor(
    p5: P5,
    pos: Vector,
    direction: Vector
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
    this.robotColor = Globals.g().mainRobotColor;
    this.lidarEnabled = true;
  }

  public update = (newPos: Vector, rotationAngle: number): void => {
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
    if (this.lidarEnabled) {
      this.lidarSensor.update(this.position, this.direction, Globals.g().walls);
    }
  };

  public show = (): void => {
    // show sensor data
    if (this.lidarEnabled) {
      this.lidarSensor.show(this.lidarColor);
    }

    // Robot itself
    this.p5.noStroke();

    // Outer circle
    this.p5.fill(this.robotColor);
    this.p5.ellipse(this.position.x, this.position.y, Globals.g().robotSize);

    this.p5.stroke(this.robotHeadColor);
    this.p5.line(
      this.position.x,
      this.position.y,
      this.position.x + this.direction.x * Globals.g().robotSize * 0.5,
      this.position.y + this.direction.y * Globals.g().robotSize * 0.5
    );
    this.p5.noStroke();

    this.p5.fill(this.robotHeadColor);
    this.p5.ellipse(
      this.position.x + this.direction.x * Globals.g().robotSize * 0.5,
      this.position.y + this.direction.y * Globals.g().robotSize * 0.5,
      Globals.g().robotSize / 4
    );
    this.p5.noFill();
  };

  public setColor = (robotColor: Color, headColor: Color): void => {
    this.robotColor = robotColor;
    this.robotHeadColor = headColor;
  };

  public setLidar = (
    lidarEnabled: boolean,
    lidarColor: Color,
    lidarVisual: Lidar.Visual
  ): void => {
    this.lidarColor = lidarColor;
    this.lidarEnabled = lidarEnabled;
    if (lidarEnabled) {
      this.lidarSensor.setVisual(lidarVisual);
    } else {
      this.lidarSensor.setVisual(Lidar.Visual.None);
    }
  };
}
