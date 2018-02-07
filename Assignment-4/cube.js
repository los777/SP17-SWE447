var gl = null;
var cube = null;


function init() {
    var canvas = document.getElementById( "webgl-canvas" );
  
    gl = WebGLUtils.setupWebGL( canvas );
   
    cube = new Cube(gl, 90);

    if ( !gl ) {
        alert("Unable to setup WebGL");
        return;
    }

    gl.clearColor( 0.0, 1.0, 0.0, 1.0 );

    
    
    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
   
    cube.render();
}


window.onload = init;
