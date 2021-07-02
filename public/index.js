import {default as WebGlManager} from "/source/webgl-manager.js"
import {default as Cube} from "/source/gameObjects/cube.js"
import {default as Camera} from "/source/gameObjects/camera.js"

function main() {
  // Get A WebGL context
  var canvas = document.querySelector("#c");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Get the strings for our GLSL shaders
  var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
  
  var webGlManager = new WebGlManager(gl, vertexShaderSource, fragmentShaderSource);
  webGlManager.camera = buildCamera();
  webGlManager.initialize();
  
  var cube1 = new Cube();
  cube1.position = [5,0,0];

  var cube2 = new Cube();
  webGlManager.instantiate(cube2);
  webGlManager.instantiate(cube1);

  refresh(webGlManager);
  // translate(gameObject);
}


function buildCamera()
{
  var camera = new Camera();
  camera.position = [3.0, 3.0, 5];
  camera.horizontalAngle = -45.0;
  camera.verticalAngle = -40.0;

  return camera;
}



// simulation of in game time
async function refresh(glManager)
{
  while(true)
  {
    await delay(20);
    glManager.draw();
  }
}

async function translate(gameObject)
{
  var deltaPos = [0.01, 0, 0];
  while(true) 
  {    
    var x = gameObject.position[0];
    if(x < -0.3 || x > 1.3)
      deltaPos = minus(deltaPos);
    gameObject.position = sum(gameObject.position, deltaPos);
    await delay(20);
  }
}


// utils
function delay(time) {
  return new Promise((resolve) => {
      setTimeout(() => resolve(), time);
  });
}

function sum(a, b)
{
    return [a[0] + b[0], a[1] + b[1]];
}

function minus(a)
{
  return [-a[0], -a[1]];
}

main(document);