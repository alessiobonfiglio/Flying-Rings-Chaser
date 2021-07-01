class WebGlManager
{
    #context;
    #vertexShaderSource;
    #fragmentShaderSource;
    #positionAttributeLocation;
    #program;
    #positionBuffer;    

    #instantiatedObjects = [];

    constructor(context, vertexShaderSource, fragmentShaderSource)
    {
        this.#context = context;        
        this.#vertexShaderSource = vertexShaderSource;
        this.#fragmentShaderSource = fragmentShaderSource;
    }

    // Methods    
    initialize() 
    {
        // create GLSL shaders, upload the GLSL source, compile the shaders
        var vertexShader = this.#createShader(this.#context, this.#context.VERTEX_SHADER, this.#vertexShaderSource);
        var fragmentShader = this.#createShader(this.#context, this.#context.FRAGMENT_SHADER, this.#fragmentShaderSource);

        // Link the two shaders into a program
        this.#program = this.#createProgram(this.#context, vertexShader, fragmentShader);

        // look up where the vertex data needs to go.
        this.#positionAttributeLocation = this.#context.getAttribLocation(this.#program, "a_position");

         // Create a buffer and put three 2d clip space points in it
        this.#positionBuffer = this.#context.createBuffer();

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
        var canvas = this.#context.canvas;

        // canvas full screen
        this.#resizeCanvasToDisplaySize(canvas);

        // Tell WebGL how to convert from clip space to pixels
        this.#context.viewport(0, 0, canvas.width, canvas.height);
        
        // Clear the canvas
        this.#context.clearColor(0, 0, 0, 0);
        this.#context.clear(this.#context.COLOR_BUFFER_BIT);
        
        this.#context.useProgram(this.#program);
        this.#context.enableVertexAttribArray(this.#positionAttributeLocation);

         // Bind the position buffer.
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, this.#positionBuffer);

        var totPoints = 0;
        for(var gameObject of this.#instantiatedObjects)
        {
            var points = gameObject.getVertices();
            
            // add the points to the buffer
            this.#context.bufferData(this.#context.ARRAY_BUFFER, new Float32Array(points), this.#context.STATIC_DRAW);            
            totPoints += points.length;
        }

         // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.#context.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.#context.vertexAttribPointer(this.#positionAttributeLocation, size, type, normalize, stride, offset);


        // draw
        var primitiveType = this.#context.TRIANGLES;
        var offset = 0;        
        this.#context.drawArrays(primitiveType, offset, totPoints);
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