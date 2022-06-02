import P5, { Vector } from 'p5';

import Mcl from './mcl';
import Globals from './globals';
import Boundary from './models/core/boundary';
import Robot from './models/robot';
import { Lidar } from './models/sensors/lidar';

// Local variables for adminstration
let firstClick: boolean = true;
let lockedMouseX: number = 0;
let lockedMouseY: number = 0;

// Local variables for simulation
let robot: Robot;

// Filters
export let mcl: Mcl;

// export const cumulativeSum = (
//   (sum: number) => (value: number) =>
//     (sum += value)
// )(0);

export const setupMcl = (p5: P5): void => {
  mcl = new Mcl(p5, 10);
};

export const displayMcl = (p5: P5): void => {
  mcl.update(robot);
  // mcl.displayParticles(robot.getLidarReading());
};

export const setupRobot = (p5: P5): void => {
  // const pos: Vector = p5.createVector(p5.windowWidth / 2, p5.windowHeight / 2);
  const pos: Vector = p5.createVector(p5.windowWidth / 2, p5.windowHeight / 2);
  const dir: Vector = p5.createVector(-1, 0).normalize();
  robot = new Robot(p5, pos, dir);
  robot.setColor(Globals.g().mainRobotColor, Globals.g().mainRobotHeadColor);
  robot.setLidar(true, Globals.g().lidarColor, Lidar.Visual.Lines);
};

export const showWalls = (): void => {
  // Walls
  for (let wall of Globals.g().walls) {
    wall.show();
  }
};

export const drawBoundaries = (p5: P5): void => {
  if (!firstClick) {
    p5.stroke(Globals.g().wallColor);
    p5.line(lockedMouseX, lockedMouseY, p5.mouseX, p5.mouseY);
    p5.noStroke();
  }
};

export const handleKeyboard = (p5: P5): Vector => {
  let navigation = p5.createVector(0, 0);
  if (p5.keyIsDown(Globals.g().Keys.w)) {
    navigation.set(1, 1).mult(Globals.g().keyboardSpeed);
  }
  if (p5.keyIsDown(Globals.g().Keys.s)) {
    navigation.set(-1, -1).mult(Globals.g().keyboardSpeed);
  }
  return navigation;
};

export const handleKeyboardRotation = (p5: P5): number => {
  let rotation = 0;
  if (p5.keyIsDown(Globals.g().Keys.a)) {
    rotation -= Globals.g().keyboardRotationAngle;
  }
  if (p5.keyIsDown(Globals.g().Keys.d)) {
    rotation += Globals.g().keyboardRotationAngle;
  }
  return rotation;
};

export const displayRobot = (p5: P5): void => {
  robot.update(handleKeyboard(p5), handleKeyboardRotation(p5));
  // p5.fill(0, 255, 0);
  // p5.noStroke();
  // p5.circle(robot.position.x, robot.position.y, 10);
  // p5.noFill();
  robot.show();
};

export const mouseClicked = (p5: P5) => {
  if (firstClick) {
    lockedMouseX = p5.mouseX;
    lockedMouseY = p5.mouseY;
    firstClick = false;
  } else {
    let newBoundary: Boundary = new Boundary(
      p5,
      lockedMouseX,
      lockedMouseY,
      p5.mouseX,
      p5.mouseY
    );

    Globals.g().walls.push(newBoundary);
    firstClick = true;
  }
};
