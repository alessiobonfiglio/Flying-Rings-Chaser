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
  await setupGlObjects(webGlManager);
  
  var spaceship = new Spaceship();
  spaceship.position = [-2,0,5];
  
  webGlManager.instantiate(spaceship);

  refresh(webGlManager);
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

// utils
function delay(time) {
  return new Promise((resolve) => {
      setTimeout(() => resolve(), time);
  });
}


async function setupGlObjects(glManager)
{
  var info =
  [
    [Spaceship.sourceFile, "Spaceship"]
  ];

  for(var [fileName, className] of info)
  {
    var objModel = new OBJ.Mesh(await utils.get_objstr(fileName));
    glManager.bindGlModel(objModel, className);
  }
}

function logGLCall(functionName, args) {
    console.log("gl." + functionName + "(" +
        WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
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

    // de-comment to enable webgl debug (just print errors)
    //gl = WebGLDebugUtils.makeDebugContext(gl);
    // de-comment to enable webgl debug (with verbose logging of every function call)
    //gl = WebGLDebugUtils.makeDebugContext(gl, undefined, logGLCall);
    
    // load the shader files
    var vertexShaderSource;
    var fragmentShaderSource;
    
    var shaderText = await utils.loadFilesAsync([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl']);
    vertexShaderSource = shaderText[0];
    fragmentShaderSource = shaderText[1];    
    
    await main(gl, vertexShaderSource, fragmentShaderSource);
}
window.onload = init;
