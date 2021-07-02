import {default as utils} from "/source/utils.js"

class WebGlManager
{
    #gl;
    #vertexShaderSource;
    #fragmentShaderSource;
    #positionAttributeLocation;    
    #matrixUniformLocation;
    #program;
    #positionBuffer;    
    #indexBuffer;
    #vao;
    camera;

    #instantiatedObjects = [];

    constructor(context, vertexShaderSource, fragmentShaderSource)
    {
        this.#gl = context;        
        this.#vertexShaderSource = vertexShaderSource;
        this.#fragmentShaderSource = fragmentShaderSource;
    }

    // Methods    
    initialize() 
    {
        // create GLSL shaders, upload the GLSL source, compile the shaders
        var vertexShader = this.#createShader(this.#gl, this.#gl.VERTEX_SHADER, this.#vertexShaderSource);
        var fragmentShader = this.#createShader(this.#gl, this.#gl.FRAGMENT_SHADER, this.#fragmentShaderSource);

        // Link the two shaders into a program
        this.#program = this.#createProgram(this.#gl, vertexShader, fragmentShader);

        // look up where the vertex data needs to go.
        this.#positionAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_position");

        this.#matrixUniformLocation = this.#gl.getUniformLocation(this.#program, "matrix");
        this.#positionBuffer = this.#gl.createBuffer();
        this.#indexBuffer = this.#gl.createBuffer();;
        this.#vao = this.#gl.createVertexArray();
    }    

    instantiate(gameObject) 
    {
        this.#instantiatedObjects.push(gameObject);
    }
    
    destroy(gameObject)
    {
        // todo
    }


    // Private
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
        this.#gl.enable(this.#gl.DEPTH_TEST);
        this.#gl.useProgram(this.#program);
        this.#gl.enableVertexAttribArray(this.#positionAttributeLocation);
        this.#gl.vertexAttribPointer(this.#positionAttributeLocation, 3, this.#gl.FLOAT, false, 0, 0);

        // Bind the position buffer.
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#positionBuffer);
        this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.#indexBuffer);


        var viewMatrix = this.camera ? this.camera.viewMatrix() : utils.MakeView(3.0, 3.0, 2.5, -45.0, -40.0); // default viewMatrix 
        // setup transformation matrix from local coordinates to Clip Camera coordinates
        for(var gameObject of this.#instantiatedObjects)
        {
            // add the vertices to the buffer
            this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(gameObject.vertices), this.#gl.STATIC_DRAW);            

            //add the indices to the buffer
            this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gameObject.indices), this.#gl.STATIC_DRAW); 

            this.#gl.bindVertexArray(this.#vao);

            var canvas = this.#gl.canvas;
            var worldMatrix = gameObject.worldMatrix();
            var perspectiveMatrix = utils.MakePerspective(90, canvas.width/canvas.height, 0.1, 100.0);
            var mat = utils.multiplyAllMatrices(perspectiveMatrix, viewMatrix, worldMatrix)
            this.#gl.uniformMatrix4fv(this.#matrixUniformLocation, this.#gl.FALSE, utils.transposeMatrix(mat));

            this.#gl.drawElements(this.#gl.TRIANGLES, gameObject.indices.length, this.#gl.UNSIGNED_SHORT, 0 );
        }
    }


    #createProgram(gl, vertexShader, fragmentShader)
    {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) 
          return program;
    }

    #createShader(gl, type, source)
    {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) 
          return shader;
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
}

export default WebGlManager;
