var gl = null;
var cone = null;

function init() {
    var canvas = document.getElementById( "webgl-canvas" );
  
    gl = WebGLUtils.setupWebGL( canvas );
    
    cone = new Cone(gl,n);


    if ( !gl ) {
        alert("Unable to setup WebGL");
        return;
    }

    gl.clearColor( 1.0, 0.0, 1.0, 1.0 );

    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    var start = 0;       
    var count = this.count;       
    gl.drawArrays(gl.POINTS,start, count);
    cone.render();
}

window.onload = init;
