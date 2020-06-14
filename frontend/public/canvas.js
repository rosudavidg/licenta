// grab the canvas element, get the context for API access and
// preset some variables
var canvas = document.querySelector("canvas"),
  c = canvas.getContext("2d"),
  mouseX = 0,
  mouseY = 0,
  width = 500,
  height = 500,
  colour = "black",
  mousedown = false;

// resize the canvas
canvas.width = width;
canvas.height = height;

function draw() {
  if (mousedown) {
    // set the colour
    c.fillStyle = colour;
    // start a path and paint a circle of 20 pixels at the mouse position
    c.beginPath();
    c.arc(mouseX, mouseY, 2.5, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();
  }
}

// get the mouse position on the canvas (some browser trickery involved)
canvas.addEventListener(
  "mousemove",
  function (event) {
    if (event.offsetX) {
      mouseX = event.offsetX;
      mouseY = event.offsetY;
    } else {
      mouseX = event.pageX - event.target.offsetLeft;
      mouseY = event.pageY - event.target.offsetTop;
    }
    // call the draw function
    draw();
  },
  false
);

canvas.addEventListener(
  "mousedown",
  function (event) {
    mousedown = true;
  },
  false
);
canvas.addEventListener(
  "mouseup",
  function (event) {
    mousedown = false;
  },
  false
);
