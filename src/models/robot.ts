import P5, { Color, Vector } from 'p5';
import { height, mainRobotColor, robotSize, walls, width } from '../globals';
import {
  gaussian,
  gaussianRandom,
  handleKeyboard,
  handleKeyboardRotation,
} from '../helpers';
import { Anchor } from './sensors/anchor';
import { Lidar, LidarSensor } from './sensors/lidar';

export default class Robot {
  private p5: P5;

  // Noise
  public forward_noise = 1; //noise of the forward movement -> %2 error for magnitude 5 step in 1000x1000
  public turn_noise = 1; //noise of the turn -> %2 error for magnitude 5 step in 1000x1000
  public sense_noise = 20; //noise of the sensing -> %2 error for 1000x1000

  // Parameters for robot behavior
  public position: Vector;
  public direction: Vector;
  private lidarSensor: LidarSensor;

  // Parameters for visuals
  private robotColor: Color;
  private robotHeadColor: Color;
  private lidarColor: Color;
  private lidarEnabled: boolean;

  // public deepCopy(): Robot {
  //   let newRobot = new Robot(this.p5, this.position, this.direction);
  //   newRobot.setColor(this.robotColor, this.robotHeadColor);
  //   newRobot.set_noise(this.forward_noise, this.turn_noise, this.sense_noise);
  //   newRobot.setLidar(this.lidarEnabled, this.lidarColor, Lidar.Visual.Lines);
  //   return newRobot;
  // }

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
    this.robotColor = mainRobotColor;
    this.lidarEnabled = false;
  }

  public move = (newPos: Vector, rotationAngle: number): Robot => {
    const newDir = this.direction
      .rotate(rotationAngle + gaussianRandom(0, this.turn_noise))
      .normalize();

    // Add noise to the new pos
    newPos.x = newPos.x + gaussianRandom(0, this.forward_noise);
    newPos.y = newPos.y + gaussianRandom(0, this.forward_noise);

    this.position.set(
      this.position.x + newDir.x * newPos.x,
      this.position.y + newDir.y * newPos.y
    );

    // Cyclic position
    this.position.x = this.position.x % width;
    this.position.y = this.position.y % height;

    this.direction.set(newDir.x, newDir.y);

    // set particle
    let res: Robot = new Robot(
      this.p5,
      this.p5.createVector(this.position.x, this.position.y),
      this.direction
    );

    res.set_noise(this.forward_noise, this.turn_noise, this.sense_noise);

    return res;
  };

  public update = (newPos: Vector, rotationAngle: number): void => {
    const newDir = this.direction
      .rotate(rotationAngle + gaussianRandom(0, this.turn_noise))
      .normalize();

    // Add noise to the new pos
    newPos.x = newPos.x + gaussianRandom(0, this.forward_noise);
    newPos.y = newPos.y + gaussianRandom(0, this.forward_noise);

    this.position.set(
      this.position.x + newDir.x * newPos.x,
      this.position.y + newDir.y * newPos.y
    );

    // Cyclic position
    this.position.x = this.position.x % width;
    this.position.y = this.position.y % height;

    this.direction.set(newDir.x, newDir.y);

    // update sensor data
    if (this.lidarEnabled) {
      this.lidarSensor.update(this.position, this.direction, walls);
    }
  };

  public show = (index?: number): void => {
    // show sensor data
    if (this.lidarEnabled) {
      this.lidarSensor.show(this.lidarColor);
    }

    // Robot itself
    this.p5.noStroke();

    // Outer circle
    this.p5.stroke(this.robotHeadColor);
    this.p5.fill(this.robotColor);
    this.p5.ellipse(this.position.x, this.position.y, robotSize);

    this.p5.stroke(this.robotHeadColor);
    this.p5.line(
      this.position.x,
      this.position.y,
      this.position.x + this.direction.x * robotSize * 0.5,
      this.position.y + this.direction.y * robotSize * 0.5
    );
    this.p5.noStroke();

    this.p5.fill(this.robotHeadColor);
    this.p5.ellipse(
      this.position.x + this.direction.x * robotSize * 0.5,
      this.position.y + this.direction.y * robotSize * 0.5,
      robotSize / 4
    );
    this.p5.noFill();

    if (index != null) {
      this.p5.fill('Yellow');
      this.p5.textSize(22);
      this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
      this.p5.text(index.toString(), this.position.x, this.position.y);
      this.p5.noFill();
    }
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

  public getLidarReading = (): Array<number> => {
    return this.lidarSensor.getLidarDistances();
  };

  public set_noise = (
    new_forward_noise: number,
    new_turn_noise: number,
    new_sense_noise: number
  ): void => {
    // Simulate noise, often useful in particle filters
    this.forward_noise = new_forward_noise;
    this.turn_noise = new_turn_noise;
    this.sense_noise = new_sense_noise;
  };

  public getAnchorReading = (anchors: Array<Anchor>): Array<number> => {
    // Measure the distances from the robot toward the landmarks/anchors
    let z: Array<number> = new Array<number>(anchors.length);
    anchors.forEach((anchor: Anchor, i: number) => {
      let dist: number = anchor.getDistance(this.position);
      dist += gaussianRandom(0.0, this.sense_noise);
      z[i] = dist;
    });
    return z;
  };

  public measurement_prob = (
    anchors: Array<Anchor>,
    measurement: Array<number>
  ): number => {
    // Calculates how likely a measurement should be
    let prob: number = 1.0;

    anchors.forEach((anchor: Anchor, i: number) => {
      let dist: number = anchor.getDistance(this.position);
      prob = prob * gaussian(dist, this.sense_noise, measurement[i]);
    });

    return prob;
  };

  public static displayRobot = (robot: Robot, p5: P5): void => {
    // robot.update(handleKeyboard(p5), handleKeyboardRotation(p5));
    // p5.fill(0, 255, 0);
    // p5.noStroke();
    // p5.circle(robot.position.x, robot.position.y, 10);
    // p5.noFill();
    robot.show();
  };
}
