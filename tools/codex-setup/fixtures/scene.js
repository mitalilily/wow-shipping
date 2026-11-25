// Deterministic, locally authored WebGL validation fixture.
window.validation = { clicks: 0, keys: 0, hovered: false, frames: 0 };
document.querySelector('#action').addEventListener('click', () => {
  window.validation.clicks++;
  document.querySelector('#result').textContent = 'Clicked ' + window.validation.clicks;
});
document.querySelector('#entry').addEventListener('keydown', () => window.validation.keys++);
document.querySelector('#action').addEventListener('mouseenter', () => window.validation.hovered = true);
fetch('/data.json').then(r => r.json()).then(data => {
  document.querySelector('#network').textContent = data.message;
  window.validation.network = data.message;
});
const canvas = document.querySelector('#scene');
const gl = canvas.getContext('webgl', {preserveDrawingBuffer:true});
if (!gl) throw new Error('WebGL unavailable');
const compile = (type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
};
const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}'));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, 'precision mediump float; varying vec2 uv; uniform sampler2D tex; void main(){gl_FragColor=texture2D(tex,uv);}'));
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
gl.useProgram(program);
const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-.8,-.8,.8,-.8,0,.8]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
const pixels = new Uint8Array([30,160,230,255,230,90,120,255,90,220,150,255,240,200,50,255]);
function draw() {
  gl.viewport(0,0,640,360); gl.clearColor(.04,.08,.14,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Upload per frame so the capture can verify texture inspection too.
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2,2,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  gl.drawArrays(gl.TRIANGLES,0,3);
  window.validation.frames++; window.__ready = true;
  requestAnimationFrame(draw);
}
draw();
