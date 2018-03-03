//
//  Sphere.js
//

"use strict";

function Sphere( slices, stacks, vertexShader, fragmentShader ) { 
    var i, j;  // loop counters

    var program = initShaders(gl,
        vertexShader || "Sphere-vertex-shader",
        fragmentShader || "Sphere-fragment-shader");

    var nSlices = slices || 20; // Default number of slices
    var nStacks = stacks || 12; // Default number of stacks

    var dPhi = Math.PI / nStacks;
    var dTheta = 2.0 * Math.PI / nSlices;

    var positions = [];
	var normals = [];
	var texCoords = [];

    positions.push(0.0, 0.0, 1.0);
	normals.push(0.0, 0.0, 1.0);
	texCoords.push(0.0, 0.0);

    for (j = 1; j < nStacks; ++j) {
        var phi = j * dPhi;
        var z = Math.cos(phi);

        for (i = 0; i < nSlices; ++i) {
            var theta = i * dTheta;
            var sinPhi = Math.sin(phi);
            var x = Math.cos(theta) * sinPhi;
            var y = Math.sin(theta) * sinPhi;

            positions.push(x, y, z);
			normals.push(x, y, z);
			
			//Push uv coords per vertex
			texCoords.push(i / (nSlices - 1), j / nStacks);
        }
    }

    positions.push(0.0, 0.0, -1.0);
	normals.push(0.0, 0.0, -1.0);
	texCoords.push(1.0, 0.0);

    // Generate the sphere's topology (i.e., indices)
    var indices = [];

    // Since we'll be using multiple draw calls to render the sphere,
    // build up an array of those calls' parameters to simplify rendering
    var drawCalls = [];

    // Generate the indices for the North Pole cap.  "indices.length" will
    // be zero at this point, but you'll see the pattern of using indices'
    // length value in future computations, so we use it here as well to
    // not break the pattern 
    var start = indices.length; // this will be zero here, but 
    var offset = start * 2 /* sizeof(gl.UNSIGNED_SHORT) */ ;

    var n = 1; // starting value of each "row" of indices
    var m;  // 
    
    indices.push(0);
    for (i = 0; i < nSlices; ++i) {
        m = n + i;
        indices.push(n + i);
    }
    indices.push(n);

    drawCalls.push({
        type: gl.TRIANGLE_FAN,
        count: indices.length,
        offset: offset
    });

    // Generate the indices for each band around the sphere
    start = indices.length;
    offset = start * 2 /* sizeof(gl.UNSIGNED_SHORT) */ ;

    for (j = 0; j < nStacks - 2; ++j) {
        for (i = 0; i < nSlices; ++i) {
            m = n + i;
            indices.push(m);
            indices.push(m + nSlices);
        }
        indices.push(n);
        indices.push(n + nSlices);

        n += nSlices;

        drawCalls.push({
            type: gl.TRIANGLE_STRIP,
            count: indices.length - start,
            offset: offset
        });

        start = indices.length;
        offset = start * 2 /* sizeof(gl.UNSIGNED_SHORT) */ ;
    }

    // Generate the indices for the South Pole cap
    indices.push(n + nSlices);
    indices.push(n);
    for (i = 0; i < nSlices; ++i) {
        m = n + this.slices - i - 1;
        indices.push(m);
    }

    drawCalls.push({
        type: gl.TRIANGLE_FAN,
        count: indices.length - start,
        offset: offset
    });

    var vPosition = {
        numComponents: 3,
        buffer: gl.createBuffer(),
        location: gl.getAttribLocation(program, "vPosition")
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, vPosition.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions),
        gl.STATIC_DRAW);

    gl.enableVertexAttribArray(vPosition.location);
	
	var vNormal = {
		numComponents: 3,
		buffer: gl.createBuffer(),
		location: gl.getAttribLocation(program, "vNormal")
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vNormal.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals),
        gl.STATIC_DRAW);

    gl.enableVertexAttribArray(vNormal.location);
	
	var vTexCoord = {
        numComponents: 2,
        buffer: gl.createBuffer(),
        location: gl.getAttribLocation(program, "vTexCoord")
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, vTexCoord.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords),
        gl.STATIC_DRAW);

    gl.enableVertexAttribArray(vTexCoord.location);

    var elementArray = {
        buffer: gl.createBuffer()
    };

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementArray.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
        gl.STATIC_DRAW);
		
	var texture = null;
	var textureHasLoaded = false;
	
	var diffuseTexture = gl.createTexture();
	
	diffuseTexture.image = new Image();
	
	diffuseTexture.image.crossOrigin = "anonymous";
	
	diffuseTexture.image.onload = function(){
		handleTextureLoad(diffuseTexture);
		//console.log("I have been loaded");
	}
	
	function handleTextureLoad(texture){
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		//gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		textureHasLoaded = true;
	}

	//TODO: Figure out how to handle CORS domain errors later
	//Utilize: --allow-file-access-from-files
	//		   --disable-web-security
	//         --user-data-dir
	//diffuseTexture.image.src = "../Images/Box_Diffuse.png";
	diffuseTexture.image.src = "mars.jpg";

    // Initialize our externally viewable variables
    this.PointMode = false;
    this.program = program;

    this.render = function () {

        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, vPosition.buffer);
        gl.vertexAttribPointer(
			vPosition.location, 
			vPosition.numComponents,
            gl.FLOAT, 
			gl.FALSE, 
			0, 
			0
		);
			
		gl.bindBuffer(gl.ARRAY_BUFFER, vNormal.buffer);
        gl.vertexAttribPointer(
			vNormal.location, 
			vNormal.numComponents,
            gl.FLOAT, 
			gl.FALSE, 
			vNormal.numComponents * Float32Array.BYTES_PER_ELEMENT, 
			0
		);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vTexCoord.buffer);
        gl.vertexAttribPointer(
			vTexCoord.location, 
			vTexCoord.numComponents,
            gl.FLOAT, 
			gl.FALSE, 
			vTexCoord.numComponents * Float32Array.BYTES_PER_ELEMENT, 
			0
		);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementArray.buffer);
		
				
		if(textureHasLoaded){
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, diffuseTexture);
			gl.uniform1i(this.uniforms.Diffuse, 0);
		}

        // Iterate across the drawCalls array.  The variable "p" contains
        // each set of parameters for the gl.drawElements call
        for (i = 0; i < drawCalls.length; ++i ) {
            var p = drawCalls[i];
            gl.drawElements(this.PointMode ? gl.POINTS : p.type,
                p.count, gl.UNSIGNED_SHORT, p.offset);
        }
    };
};
