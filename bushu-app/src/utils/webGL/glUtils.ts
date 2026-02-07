type BaseProgramInfo = {
  program: WebGLProgram
  attributeLocations: { [attributeName: string]: number }
  uniformLocations: { [uniformName: string]: WebGLUniformLocation | null }
}

type BaseBufferCollection = {
  vertPosition: WebGLBuffer | null
  [bufferName: string]: WebGLBuffer | null
}

function loadShader(gl: WebGLRenderingContext, type: GLenum, src: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (shader === null) {
    console.warn('Failed to create shader :/')
    return null
  }

  gl.shaderSource(shader, src)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(`Failed to compile shader: ${gl.getShaderInfoLog(shader)}`)
    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function initShaderProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
  const vertShader = loadShader(gl, gl.VERTEX_SHADER, vertSrc)
  const fragShader = loadShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  if (!vertShader || !fragShader) {
    console.warn('Failed to load shaders :/')
    return null
  }

  const shaderProgram = gl.createProgram()
  if (!shaderProgram) {
    console.log('error creating shader program')
    return null
  }
  gl.attachShader(shaderProgram, vertShader)
  gl.attachShader(shaderProgram, fragShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(`Failed to init shader program: ${gl.getProgramInfoLog(shaderProgram)}`)
    return null
  }

  return shaderProgram
}

async function setUpShaders(gl: WebGLRenderingContext, programName: string): Promise<WebGLProgram | null> {
  const vertResponse = await fetch(`./shaders/${programName}/vertShader.vert`)
  const fragResponse = await fetch(`./shaders/${programName}/fragShader.frag`)
  const vsSource = await vertResponse.text()
  const fsSource = await fragResponse.text()

  return initShaderProgram(gl, vsSource, fsSource)
}

function initVertPositionBuffer(gl: WebGLRenderingContext): WebGLBuffer | null {
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer()

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Now create an array of positions for the square.
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  return positionBuffer
}

// assign vertPosition buffer contents to the corresponding vertPosition attribute
function setVertPositionAttribute(gl: WebGLRenderingContext, programInfo: BaseProgramInfo, buffers: BaseBufferCollection) {
  const numComponents = 2 // pull out 2 values per iteration
  const type = gl.FLOAT // the data in the buffer is 32bit floats
  const normalize = false // don't normalize
  const stride = 0 // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0 // how many bytes inside the buffer to start from

  // bind the vertPosition buffer as the one to receive buffer operations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertPosition)

  // tell WebGL how to read the bound buffer's contents into the designated attribute
  gl.vertexAttribPointer(
    programInfo.attributeLocations.vertexPosVec,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  )
  gl.enableVertexAttribArray(programInfo.attributeLocations.vertexPosVec)
}

function drawScene(gl: WebGLRenderingContext) {
  const offset = 0
  const vertexCount = 4
  gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
}

function deleteBuffers(gl: WebGLRenderingContext, buffers: BaseBufferCollection): void {
  const bufferKeys: (keyof BaseBufferCollection)[] = Object.keys(buffers)
  bufferKeys.forEach(k => gl.deleteBuffer(buffers[k]))
}

export {
  setUpShaders,
  initVertPositionBuffer,
  setVertPositionAttribute,
  drawScene,
  deleteBuffers,
}
