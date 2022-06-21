import Gaussian from 'multivariate-gaussian';
import GGG from 'gaussian';
import { calculateSD, calculateVariance } from './probability';
import { lidarSampling } from './globals';

let test = true;

const singleGaussian = (mu_i: number, z_i: number) => {
  if (test) {
    console.log('------- test ----------');
    // const z = 144.4235009659347;
    // const mu = 185.89426185590278;

    const z = 100;
    const mu = 100;
    const variance = 1;
    console.log('z: ' + z);
    console.log('mu: ' + mu);
    console.log('variance: ' + variance);
    const distribution1 = GGG(z, variance);
    console.log('pdf: ' + distribution1.pdf(mu));
    test = false;
    console.log('------- test ----------');

    const z2 = 100;
    const mu2 = 90;
    const variance2 = 1;
    console.log('z: ' + z2);
    console.log('mu: ' + mu2);
    console.log('variance: ' + variance2);
    const distribution2 = GGG(0, variance2);
    console.log('pdf: ' + distribution2.pdf(Math.abs(mu2 - z2)));
    test = false;
    console.log('------- test ----------');
  }

  console.log('z_i: ' + z_i);
  console.log('mu_i: ' + mu_i);
  // const distribution = GGG(z_i, Math.pow(Math.abs(z_i - mu_i), 2));
  // const distribution = GGG(z_i, minDimention);
  // console.log(minDimention / 10);
  const distribution = GGG(z_i, 100);
  // Take a random sample using inverse transform sampling method.
  const ppf = distribution.ppf(mu_i);
  const pdf = distribution.pdf(mu_i);
  const cdf = distribution.cdf(mu_i);

  console.log('ppf: ' + ppf);
  console.log('pdf: ' + pdf);
  console.log('cdf: ' + cdf);
};

const gaussDeneme = () => {
  const mu = [222, 198, 212]; // bizim gordugumuz
  const x = [220, 200, 210]; // virtual particlein gordugu

  const variance = calculateSD(calculateVariance(mu));
  const sigma = [
    [50, 0, 0],
    [0, 50, 0],
    [0, 0, 50],
  ];

  // var sigma = [
  //   [Math.abs(mu[0] - x[0]), 0, 0],
  //   [0, Math.abs(mu[1] - x[1]), 0],
  //   [0, 0, Math.abs(mu[2] - x[2])],
  // ];
  const distribution_parameters = {
    sigma: sigma,
    mu: mu,
  };
  const my_gaussian = new Gaussian(distribution_parameters);
  const res = my_gaussian.density(x); // Returns the value of the density function at (0,0)
  console.log(sigma);
  console.log(mu);
  console.log(x);
  console.log(res);
};

const gauss = (robotReading: Array<number>, particleReading: Array<number>) => {
  let sigmaDimentions = lidarSampling;
  // Creates n x n identity matrix
  var sigma: Array<Array<number>> = new Array<Array<number>>(sigmaDimentions)
    .fill(null)
    .map((value: number[], i: number) => {
      let arr = new Array(sigmaDimentions).fill(0);
      arr[i] = 1000; //Math.pow(10, 8);
      return arr;
    });

  console.log(sigma);
  console.log(robotReading);
  console.log(particleReading);

  var distribution_parameters = {
    // n*n covariance matrix
    sigma: sigma,
    // n-dimensional mean vector
    mu: robotReading,
  };

  var my_gaussian = new Gaussian(distribution_parameters);
  var res = my_gaussian.density(particleReading); // Returns the value of the density function at (0,0)
  console.log(res);
};

export { singleGaussian, gauss, gaussDeneme };
