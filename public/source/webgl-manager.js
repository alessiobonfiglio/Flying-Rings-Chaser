import {default as utils} from "./utils.js"

class WebGlManager
{
    #gl;
    #vertexShaderSource;
    #fragmentShaderSource;

    #positionAttributeLocation;
    #normalAttributeLocation;
    #textureAttributeLocation;

    #positionUniformLocation;
    #normalUniformLocation;
    #textureUniformLocation;

    #materialDiffColorHandle;
    #lightDirectionHandle;
    #lightColorHandle;
    #directionalLightColor;

    #program;
    #instantiatedObjects = []; // contains a list of {gameObject, vao}
    #classToGlObjectMap = new Map(); // maps gameObject class -> GlObject

    // Initialization
    constructor(context, vertexShaderSource, fragmentShaderSource)
    {
        this.#gl = context;        
        this.#vertexShaderSource = vertexShaderSource;
        this.#fragmentShaderSource = fragmentShaderSource;
    }

    initialize() 
    {
        // Create GLSL shaders, upload the GLSL source, compile the shaders
        var vertexShader = utils.createShader(this.#gl, this.#gl.VERTEX_SHADER, this.#vertexShaderSource);
        var fragmentShader = utils.createShader(this.#gl, this.#gl.FRAGMENT_SHADER, this.#fragmentShaderSource);

        // Link the two shaders into a program
        this.#program = utils.createProgram(this.#gl, vertexShader, fragmentShader);
        this.#gl.useProgram(this.#program);

        // Deep test
        this.#gl.enable(this.#gl.DEPTH_TEST);

        // Look up where the vertex data needs to go.
        this.#positionAttributeLocation = this.#gl.getAttribLocation(this.#program, "inPosition");
        this.#normalAttributeLocation = this.#gl.getAttribLocation(this.#program, "inNormal");
        this.#textureAttributeLocation = this.#gl.getAttribLocation(this.#program, "inTexCoords");

        this.#positionUniformLocation = this.#gl.getUniformLocation(this.#program, "matrix");
        this.#normalUniformLocation = this.#gl.getUniformLocation(this.#program, "nMatrix");
        this.#textureUniformLocation = this.#gl.getUniformLocation(this.#program, "objectTexture");

        this.#materialDiffColorHandle = this.#gl.getUniformLocation(this.#program, "mDiffColor");
        this.#lightDirectionHandle = this.#gl.getUniformLocation(this.#program, "lightDirection");
        this.#lightColorHandle = this.#gl.getUniformLocation(this.#program, "lightColor");

        // Lights
        this.#directionalLightColor = [0.1, 1.0, 1.0];
        this.#gl.uniform3fv(this.#lightDirectionHandle, this.#directionalLight());
        this.#gl.uniform3fv(this.#lightColorHandle, this.#directionalLightColor);
    }    

    // Public Methods
    instantiate(gameObject) 
    {
        var glObject = this.#classToGlObjectMap.get(gameObject.constructor.name);
        this.#instantiatedObjects.push({gameObject: gameObject, glObject: glObject});
    }
    
    destroy(gameObject)
    {
        var index = this.#instantiatedObjects.indexOf(gameObject);
        this.#instantiatedObjects.splice(index, 1);
    }

    draw()
    {
        var canvas = this.#gl.canvas;

        // canvas full screen
        this.#resizeCanvasToDisplaySize(canvas);

        // Tell WebGL how to convert from clip space to pixels
        this.#gl.viewport(0, 0, canvas.width, canvas.height);
        
        // Clear the canvas
        this.#gl.clearColor(0, 0, 0, 0);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);

        this.#drawGameObjects();
    }    

    bindGlModel(objModel, texture, className)
    {
        const glModel = this.#buildGlObject(objModel, texture);
        this.#classToGlObjectMap.set(className, glModel);
    }


    // Private Methods
    #buildGlObject(objModel, texture)
    {
        var vao = this.#gl.createVertexArray();        
        this.#gl.bindVertexArray(vao);

        // Setup position buffer
        var positionBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, positionBuffer);
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(objModel.vertices), this.#gl.STATIC_DRAW);
        this.#gl.enableVertexAttribArray(this.#positionAttributeLocation);
        this.#gl.vertexAttribPointer(this.#positionAttributeLocation, 3, this.#gl.FLOAT, false, 0, 0);

        // Setup indices
        var indexBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objModel.indices), this.#gl.STATIC_DRAW);        

        // Setup normals
        var normalBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, normalBuffer);
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(objModel.vertexNormals), this.#gl.STATIC_DRAW);
        this.#gl.enableVertexAttribArray(this.#normalAttributeLocation);
        this.#gl.vertexAttribPointer(this.#normalAttributeLocation, 3, this.#gl.FLOAT, false, 0, 0);

        // Setup texture coordinates
        var textureCoordinateBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, textureCoordinateBuffer);
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(objModel.textures), this.#gl.STATIC_DRAW);
        this.#gl.enableVertexAttribArray(this.#textureAttributeLocation);
        this.#gl.vertexAttribPointer(this.#textureAttributeLocation, 2, this.#gl.FLOAT, false, 0, 0);

        // setup Texture
        this.#gl.activeTexture(this.#gl.TEXTURE0);
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, texture);
        this.#gl.uniform1i(this.#textureUniformLocation, 0);

        return new WebGlObject(vao, objModel);
    }

    #drawGameObjects()
    {
        var viewMatrix = this.camera?.viewMatrix() ?? utils.MakeView(3.0, 3.0, 2.5, -45.0, -40.0); // default viewMatrix 
        // setup transformation matrix from local coordinates to Clip coordinates
        for(var instance of this.#instantiatedObjects)
        {
            var [gameObject, glObject] = [instance.gameObject, instance.glObject];
            this.#gl.bindVertexArray(glObject.vao);

            // Computing transformation matrix
            var matrix = this.#computeMatrix(gameObject, viewMatrix);

            // Passing the matrix as a uniform to the vertex shader
            this.#gl.uniformMatrix4fv(this.#positionUniformLocation, this.#gl.FALSE, utils.transposeMatrix(matrix));
            this.#gl.uniformMatrix4fv(this.#normalUniformLocation, this.#gl.FALSE, utils.transposeMatrix(gameObject.worldMatrix()));

            // GameObject Color
            this.#gl.uniform3fv(this.#materialDiffColorHandle, gameObject.materialColor);

            // Drawing the gameObject
            this.#gl.drawElements(this.#gl.TRIANGLES, glObject.totIndices, this.#gl.UNSIGNED_SHORT, 0);
        }
    }

    #computeMatrix(gameObject, viewMatrix)
    {
        var canvas = this.#gl.canvas;
        var worldMatrix = gameObject.worldMatrix();
        var perspectiveMatrix = utils.MakePerspective(90, canvas.width/canvas.height, 0.1, 100.0);
        return utils.multiplyAllMatrices(perspectiveMatrix, viewMatrix, worldMatrix)
    }

    #resizeCanvasToDisplaySize(canvas, multiplier)
    {
        multiplier = multiplier || 1;
        const width  = canvas.clientWidth  * multiplier | 0;
        const height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width ||  canvas.height !== height) {
          canvas.width  = width;
          canvas.height = height;
          return true;
        }
        return false;
    }

    #directionalLight()
    {
        var dirLightAlpha = -utils.degToRad(60);
        var dirLightBeta  = -utils.degToRad(120);

        return [
            Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
            Math.sin(dirLightAlpha),
            Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
        ];
    }
}


class WebGlObject
{
    vao;
    texture;
    totIndices;
    
    constructor(vao, objModel)
    {
        this.vao = vao;
        this.totIndices = objModel.indices.length;
    }
}

export default WebGlManager;
