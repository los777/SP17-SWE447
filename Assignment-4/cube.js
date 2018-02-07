var gl = null;
var cube = null;


function init() {
    var canvas = document.getElementById( "webgl-canvas" );
  
    gl = WebGLUtils.setupWebGL( canvas );
   
    square = new Square( gl,n);

    if ( !gl ) {
        alert("Unable to setup WebGL");
        return;
    }

    gl.clearColor( 1.0, 1.0, 0.0, 1.0 );

    
    
    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
   
    square.render();
}


window.onload = init;
