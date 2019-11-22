
const gl = document.getElementById("canvas").getContext("webgl");
const m4 = twgl.m4;
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
var positions = [];
for (var i = 0; i < 200; ++i) { positions.push(0,0,0); }
const bufferInfo = twgl.createBufferInfoFromArrays(gl, create({ position: positions }, [5,5])[0]);
const camera = m4.lookAt([0, 0, 10], [0, 0, 0], [0, 1, 0]);
const uniforms = {
	time: 0,
	resolution: [1,1],
	viewProjection: 0,
	color: [1,1,1,1],
};
function create (attributes, subdivisions) {
	subdivisions = subdivisions || [1,1];
	var count = attributes.position.length / 3;
	var geometries = [];
	var verticesMax = Math.pow(2, 16);
	var geometryCount = 1 + Math.floor(count / verticesMax);
	var faces = [subdivisions[0]+1, subdivisions[1]+1];
	var quadCount = subdivisions[0] * subdivisions[1];
	var numberIndex = 0;
	for (var m = 0; m < geometryCount; ++m) {
		var vertexCount = count;
		if (geometryCount > 1) {
			if (m == geometryCount - 1) count = count % verticesMax;
			else vertexCount = verticesMax;
		}
		var arrays = {
			anchor: [],
			quantity: [],
			indices: [],
		};
		var vIndex = 0;
		var attributeNames = Object.keys(attributes);
		attributeNames.forEach(name => { arrays[name] = []; });
		for (var index = 0; index < vertexCount; ++index) {
			for (var y = 0; y < faces[1]; ++y) {
				for (var x = 0; x < faces[0]; ++x) {
					attributeNames.forEach(name => {
						var array = attributes[name];
						for (var i = 0; i < 3; i++) {
							arrays[name].push(array[index*3+i]);
						}
					});
					var anchorX = x / subdivisions[0];
					var anchorY = y / subdivisions[1];
					arrays.anchor.push(anchorX*2.-1., anchorY*2.-1., 0);
					arrays.quantity.push(numberIndex / (count-1), numberIndex, 0);
				}
			}
			for (var y = 0; y < subdivisions[1]; ++y) {
				for (var x = 0; x < subdivisions[0]; ++x) {
					arrays.indices.push(vIndex, vIndex+1, vIndex+1+subdivisions[0]);
					arrays.indices.push(vIndex+1+subdivisions[0], vIndex+1, vIndex+2+subdivisions[0]);
					vIndex += 1;
				}
				vIndex += 1;
			}
			vIndex += faces[0];
			numberIndex++;
		}
		geometries.push(arrays);
	}
	return geometries;
}
function render(elapsed) {
	elapsed /= 1000;
	uniforms.time = elapsed;
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	twgl.setUniforms(programInfo, uniforms);
	twgl.drawBufferInfo(gl, bufferInfo);
	requestAnimationFrame(render);
}
function onWindowResize() {
	twgl.resizeCanvasToDisplaySize(gl.canvas);
	uniforms.resolution = [gl.canvas.width, gl.canvas.height];
	var projection = m4.perspective(50 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
	uniforms.viewProjection = m4.multiply(projection, m4.inverse(camera));
}
onWindowResize();
window.addEventListener('resize', onWindowResize, false);
requestAnimationFrame(render);

