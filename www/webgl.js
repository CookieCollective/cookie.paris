
const gl = document.getElementById("canvas").getContext("webgl");
const m4 = twgl.m4;
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
var geometry = {position:[],indices:{numComponents:2,data:[]},seed:{numComponents:4,data:[]}};
var cubeCount = 100;
var crossCount = 100;
var circleCount = 100;
var glassCount = 100;
var circleSegment = 16;
for (var index = 0; index < cubeCount; ++index) {
	var indices = [0,1,1,3,3,2,2,0,4,5,5,7,7,6,6,4,0,4,1,5,2,6,3,7];
	var rnd = [Math.random()*2-1,Math.random()*2-1,Math.random()*2-1];
	var positions = [-1,-1,-1,1,-1,-1,-1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,1,1,1,1,1];
	for (var i = 0; i < positions.length; ++i) positions[i] *= .75;
	for (var i = 0; i < indices.length; ++i) indices[i] += index*8;
	var seed = []; for (var i = 0; i < 8; ++i) seed.push(rnd[0],rnd[1],rnd[2],index/(cubeCount-1));
	geometry.position = geometry.position.concat(positions);
	geometry.indices.data = geometry.indices.data.concat(indices);
	geometry.seed.data = geometry.seed.data.concat(seed);
}
for (var index = 0; index < crossCount; ++index) {
	var indices = [0,1,2,3,4,5];
	var rnd = [Math.random()*2-1,Math.random()*2-1,Math.random()*2-1];
	for (var i = 0; i < indices.length; ++i) indices[i] += cubeCount*8+index*6;
	var seed = []; for (var i = 0; i < 6; ++i) seed.push(rnd[0],rnd[1],rnd[2],index/(crossCount-1));
	geometry.position = geometry.position.concat([0,1,0,0,-1,0,1,0,0,-1,0,0,0,0,1,0,0,-1]);
	geometry.indices.data = geometry.indices.data.concat(indices);
	geometry.seed.data = geometry.seed.data.concat(seed);
}
for (var index = 0; index < circleCount; ++index) {
	var indices = []; for (var i = 0; i < circleSegment; ++i) indices.push(i,(i+1)%circleSegment);
	var rnd = [Math.random()*2-1,Math.random()*2-1,Math.random()*2-1];
	for (var i = 0; i < indices.length; ++i) indices[i] += cubeCount*8+crossCount*6+index*circleSegment;
	var seed = []; for (var i = 0; i < circleSegment; ++i) seed.push(rnd[0],rnd[1],rnd[2],index/(circleCount-1));
	var positions = []; for (var i = 0; i < circleSegment; ++i) { var a=Math.PI*2*i/(circleSegment); positions.push(Math.cos(a), 0, Math.sin(a)); }
	geometry.position = geometry.position.concat(positions);
	geometry.indices.data = geometry.indices.data.concat(indices);
	geometry.seed.data = geometry.seed.data.concat(seed);
}
const bufferInfo = twgl.createBufferInfoFromArrays(gl, geometry);
const divergence = 0.2;
var projection = m4.perspective(50 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
const cameraLeft = m4.lookAt([-divergence, 0, 10], [0, 0, 0], [0, 1, 0]);
const cameraRight = m4.lookAt([divergence, 0, 10], [0, 0, 0], [0, 1, 0]);
var viewProjectionLeft = m4.multiply(projection, m4.inverse(cameraLeft));
var viewProjectionRight = m4.multiply(projection, m4.inverse(cameraRight));
const uniforms = {
	time: 0,
	resolution: [1,1],
	viewProjection: 0,
	color: [1,1,1,1],
};
function render(elapsed) {
	elapsed /= 1000;
	uniforms.time = elapsed;
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	uniforms.color = [1,1,1,1];
	uniforms.viewProjection = viewProjectionRight;
	twgl.setUniforms(programInfo, uniforms);
	twgl.drawBufferInfo(gl, bufferInfo, gl.LINES);
	requestAnimationFrame(render);
}
function onWindowResize() {
	twgl.resizeCanvasToDisplaySize(gl.canvas);
	uniforms.resolution = [gl.canvas.width, gl.canvas.height];
	projection = m4.perspective(50 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
	viewProjectionLeft = m4.multiply(projection, m4.inverse(cameraLeft));
	viewProjectionRight = m4.multiply(projection, m4.inverse(cameraRight));
}
onWindowResize();
window.addEventListener('resize', onWindowResize, false);
requestAnimationFrame(render);