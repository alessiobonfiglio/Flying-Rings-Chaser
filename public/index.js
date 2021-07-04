import {default as WebGlManager} from "./source/webgl-manager.js"
import {default as Cube} from "./source/gameObjects/cube.js"
import {default as Spaceship} from "./source/gameObjects/spaceship.js"
import {default as Camera} from "./source/gameObjects/camera.js"
import {default as utils} from "./source/utils.js"


async function main(gl, vertexShaderSource, fragmentShaderSource) 
{
  var webGlManager = new WebGlManager(gl, vertexShaderSource, fragmentShaderSource);
  webGlManager.camera = buildCamera();
  webGlManager.initialize();
  
  var spaceship = new Spaceship();
  spaceship.position = [-2,0,5];
  await spaceship.init();
  
  var cube1 = new Cube();
  cube1.position = [5,0,0];
  
  var cube2 = new Cube();
  webGlManager.instantiate(cube1);
  webGlManager.instantiate(spaceship);
  webGlManager.instantiate(cube2);

  refresh(webGlManager);

  tmp(cube1, webGlManager);
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

async function tmp(gameObject, glManager)
{
  await delay(3000);
  glManager.destroy(gameObject);
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

async function init() {
  
    var path = window.location.pathname;
    var page = path.split("/").pop();
    var baseDir = window.location.href.replace(page, '');
    var shaderDir = baseDir+"shaders/";

    // Get A WebGL context
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    
    
    // load the shader files
    var vertexShaderSource;
    var fragmentShaderSource;
    
    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
      vertexShaderSource = shaderText[0];
      fragmentShaderSource = shaderText[1];
    });
    
    main(gl, vertexShaderSource, fragmentShaderSource);
}

window.onload = init;
