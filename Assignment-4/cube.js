var gl = null;
var square = null;


function init() {
    var canvas = document.getElementById( "webgl-canvas" );
  
    gl = WebGLUtils.setupWebGL( canvas );
   
   

    if ( !gl ) {
        alert("Unable to setup WebGL");
        return;
    }

    gl.clearColor( 0.0, 1.0, 1.0, 1.0 );
    
     square = new Square( gl);

    
    
    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
   
    square.render();
}


window.onload = init;
