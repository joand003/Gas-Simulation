/* --------------------------------------------------------------------------------------------
// Variables for DOM manipulation
-------------------------------------------------------------------------------------------- */

const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');

const addParticles = document.getElementById('add');

const removeParticles = document.getElementById('remove');

const clearCanvas = document.getElementById('clear');

const heat = document.getElementById('heat');

const cool = document.getElementById('cool');

const start = document.getElementById('start');

const stop = document.getElementById('stop');

const message = document.querySelector('.message');

const temperatureDisplay = document.querySelector('.temp');

const molesDisplay = document.querySelector('.moles');

const volumeDisplay = document.querySelector('.volume');

const pressureDisplay = document.querySelector('.pressure');

const volumeUp = document.querySelector('.volumeUp');

const volumeDown = document.querySelector('.volumeDown');

/* --------------------------------------------------------------------------------------------
// Global Variables -------------------------------------------------------------------------------------------- */

const circleArray = [];
let particles = 5;
let temperature = 300;

const dataArray = {
  numberOfParticles: particles,
  temp: temperature,
  volume: 1,
  // might need to change the following to a measure of the distance left in the canvas with the plunger
  plungerWidthPosition: 500,
  plungerRodLength: 0
};

// Can add back in if add feature of changing volume... need to change volume to be equal to height * width and set a max/min for each... then program it to set max equal to window dimensions and minimum equal to ????? (based on space needed for 50 particles)
/* let volume = {
  height: 300,
  width: 500
}; */

// let moles = particles * 0.1;

canvas.width = 500;
canvas.height = 300;

let x;
let y;
let radius;

let animationStartStop;

function changeParticles(e) {
  dataArray.numberOfParticles = dataArray.numberOfParticles + e;
}

const pressure = (t, v) => {
  let value = Math.floor((moles(dataArray.numberOfParticles) * 8.314 * t) / v);
  return value;
};

const moles = e => {
  let value = e / 10;
  return value;
};

/* --------------------------------------------------------------------------------------------
Line for plunger when changing volume
-------------------------------------------------------------------------------------------- */

// Need to add plunger, but canvas won't draw my rectangles without errors... so come back to this and try again.. need to link the plunger to the volume buttons.. have it change the width by 50 px a shot or maybe less.. but start with 50.. then work on the math for displaying the volume

function plunger(x, z) {
  let y = x + 20;
  c.fillRect(x, 0, 20, 300);
  c.fillRect(y, 135, z, 30);
}

/* --------------------------------------------------------------------------------------------
Circle Object Code
-------------------------------------------------------------------------------------------- */

// Circle Object
function Circle(x, y, radius) {
  this.x = x;
  this.y = y;
  // gives circles a random + or - velocity in x and y direction
  this.velocity = {
    x: ((Math.random() - 0.5) * dataArray.temp) / 100,
    y: ((Math.random() - 0.5) * dataArray.temp) / 100
  };
  this.radius = radius;
  this.mass = 1;

  this.draw = () => {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = 'orange';
    c.fill();
    c.closePath();
  };

  this.update = () => {
    // Logic to bounce off other circles
    for (let i = 0; i < circleArray.length; i++) {
      if (this === circleArray[i]) continue;
      if (
        distance(this.x, this.y, circleArray[i].x, circleArray[i].y) -
          this.radius * 2 <
        0
      ) {
        // need collision reversal equations
        resolveCollision(this, circleArray[i]);
      }
    }

    // Logic to bounce off sides
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.velocity.x = -this.velocity.x;
    }

    // Logic to bounce off top and bottom
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.velocity.y = -this.velocity.y;
    }

    // giving circles velocity
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.draw();
  };
}

/* --------------------------------------------------------------------------------------------
Code dealing with the displaying values of Pressure, Temperature, Volume, Moles
-------------------------------------------------------------------------------------------- */

function updateDisplay() {
  temperatureDisplay.innerHTML = `${dataArray.temp} Kelvin`;
  pressureDisplay.innerHTML = `${pressure(
    dataArray.temp,
    dataArray.volume
  )} kPa`;
  volumeDisplay.innerHTML = `${dataArray.volume} Liter`;
  molesDisplay.innerHTML = `${moles(dataArray.numberOfParticles)} moles`;
}

function messageTimeout() {
  setTimeout(() => {
    message.innerHTML = '';
  }, 3000);
}

/* --------------------------------------------------------------------------------------------
// Event Listeners for buttons
-------------------------------------------------------------------------------------------- */

start.addEventListener('click', () => {
  animate();
  start.disabled = true;
  updateDisplay();
});

stop.addEventListener('click', () => {
  animationStartStop = cancelAnimationFrame(animationStartStop);
  start.disabled = false;
  updateDisplay();
});

// 2000 is upperlimit for temp as it causes glitching in images
heat.addEventListener('click', () => {
  if (dataArray.temp < 1500) {
    for (let i = 0; i < circleArray.length; i++) {
      circleArray[i].velocity.x *= 1.1;
      circleArray[i].velocity.y *= 1.1;
    }
    dataArray.temp += 50;
  } else {
    message.innerHTML = "You've reached the max temperature";
    messageTimeout();
  }
  updateDisplay();
});

cool.addEventListener('click', () => {
  if (dataArray.temp > 50) {
    for (let i = 0; i < circleArray.length; i++) {
      circleArray[i].velocity.x *= 0.9;
      circleArray[i].velocity.y *= 0.9;
    }
    dataArray.temp -= 50;
  } else {
    message.innerHTML = "You've reached the lowest temperature";
    messageTimeout();
  }
  updateDisplay();
});

addParticles.addEventListener('click', () => {
  if (circleArray.length < 50) {
    changeParticles(1);
    spawnNewCircle();
    circleArray[circleArray.length - 1].draw();
  } else {
    message.innerHTML = "You've reacted max particles";
    messageTimeout();
  }
  updateDisplay();
});

removeParticles.addEventListener('click', () => {
  if (circleArray.length > 0) {
    changeParticles(-1);
  } else {
    message.innerHTML = 'No more particles to remove';
    messageTimeout();
  }
  circleArray.pop();
  // Following is to allow user to remove particles while stopped and still show particles being removed
  c.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < circleArray.length; i++) {
    circleArray[i].draw();
  }
  updateDisplay();
});

clearCanvas.addEventListener('click', () => {
  window.location.reload();
  updateDisplay();
});

// Need to add a line to canvas that also blocks or has the particles bounce off of.... then need to have it move as a way to shorten up the volume.. can add a plunger type look to it to make the aesthetics better... best to do it in 50 pixel increments up to a

volumeUp.addEventListener('click', () => {
  // need to change to volume of the canvas total width and somehow remove plunger when it gets to the end
  if (dataArray.plungerWidthPosition >= 450) {
    c.clearRect(0, 0, 500, 300);
    dataArray.plungerWidthPosition = 500;
    dataArray.plungerRodLength = 0;
    console.log('Max volume reached');
  } else {
    c.clearRect(0, 0, 500, 300);
    dataArray.plungerWidthPosition += 50;
    dataArray.plungerRodLength -= 50;
    plunger(dataArray.plungerWidthPosition, dataArray.plungerRodLength);
  }
  console.log(plungerWidthPosition);
  plunger(dataArray.plungerWidthPosition, dataArray.plungerRodLength);
  updateDisplay();
  return dataArray;
});

// For some reason the page is reloading when this button is clicked....
volumeDown.addEventListener('click', () => {
  // need to change to volume of the canvas width - the width of plunger
  if (dataArray.plungerWidthPosition > 300) {
    c.clearRect(0, 0, 500, 300);
    dataArray.plungerWidthPosition -= 50;
    dataArray.plungerRodLength += 50;
    plunger(dataArray.plungerWidthPosition, dataArray.plungerRodLength);
  } else {
    console.log('Lowest volume reached');
  }
  console.log(dataArray.plungerWidthPosition);
  plunger(dataArray.plungerWidthPosition, dataArray.plungerRodLength);
  return dataArray;
});

/* --------------------------------------------------------------------------------------------
Code dealing with collisions including rotation, resolve collision, and distance functions (Copied from Chris Courses on YouTube)
-------------------------------------------------------------------------------------------- */

// Rotates coordinate system for velocities
function rotate(velocity, angle) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };

  return rotatedVelocities;
}

// colliding objects code that will swap 2 objects velocities after running thru elastic collision reaction equation
function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Grab angle between two colliding particles
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );

    // Store mass in variable for better readability in collision eqation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1D collision equation
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y
    };
    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
}

// Distance function to determine if circles are touching
function distance(x1, y1, x2, y2) {
  let xDistance = x2 - x1;
  let yDistance = y2 - y1;

  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

/* --------------------------------------------------------------------------------------------
Implementation Code
-------------------------------------------------------------------------------------------- */

// Implementation
function init() {
  if (circleArray.length < dataArray.numberOfParticles) {
    preventSpawnClash();
  }
}

function preventSpawnClash() {
  for (let i = 0; i < dataArray.numberOfParticles; i++) {
    radius = 5;
    // spawns circles in the canvas only
    x = Math.random() * (canvas.width - radius * 2) + radius;
    y = Math.random() * (canvas.height - radius * 2) + radius;
    // Logic to make sure particles don't spawn on top of each other
    if (i !== 0) {
      for (let j = 0; j < circleArray.length; j++) {
        if (
          distance(x, y, circleArray[j].x, circleArray[j].y) - radius * 2 <
          0
        ) {
          x = Math.random() * (canvas.width - radius * 2) + radius;
          y = Math.random() * (canvas.height - radius * 2) + radius;
          j = -1;
        }
      }
    }
    circleArray.push(new Circle(x, y, radius));
  }
}

function spawnNewCircle() {
  x = Math.random() * (canvas.width - radius * 2) + radius;
  y = Math.random() * (canvas.height - radius * 2) + radius;
  for (let j = 0; j < circleArray.length; j++) {
    if (distance(x, y, circleArray[j].x, circleArray[j].y) - radius * 2 < 0) {
      x = Math.random() * (canvas.width - radius * 2) + radius;
      y = Math.random() * (canvas.height - radius * 2) + radius;
      j = -1;
    }
  }

  circleArray.push(new Circle(x, y, radius));
}

/* --------------------------------------------------------------------------------------------
Animation Code
-------------------------------------------------------------------------------------------- */

// Animation Loop
function animate() {
  animationStartStop = requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < circleArray.length; i++) {
    circleArray[i].update();
  }
  plunger(dataArray.plungerWidthPosition, dataArray.plungerRodLength);
  // console.log(dataArray.plungerWidthPosition);
}

init();
updateDisplay();
animate();

// could make a clear canvas function that takes into account size of canvas instead of current clearRect method

// need to add a max number of particles... and display a warning for 3 seconds saying at max particles

// Need to make a readout of values for P, V, n, T... Will take the values, but not use them in calculations... need to vary the values by 1% to mimmic real values of an experiment while holding the general trend to remain true.
