import * as glUtils from '../glUtils'
import type { UseGLContext } from '../useGL'

const programName: string = 'circleProg'

type CircleProgramInfo = {
  program: WebGLProgram
  attributeLocations: {
    vertexPosVec: number
    circlePosVec: number
  }
  uniformLocations: {
    resolutionVec: WebGLUniformLocation | null
  }
}

type BufferCollection = {
  vertPosition: WebGLBuffer | null
  circlePosition: WebGLBuffer | null
}

function initBuffers(gl: WebGLRenderingContext): BufferCollection {
  const vertPositionBuffer = glUtils.initVertPositionBuffer(gl)
  const circlePositionBuffer = initCirclePositionBuffer(gl)

  return {
    vertPosition: vertPositionBuffer,
    circlePosition: circlePositionBuffer,
  }
}

function initCirclePositionBuffer(gl: WebGLRenderingContext): WebGLBuffer | null {
  // Create a buffer for the circle's position. Since the position will
  // be recalculated before drawing each frame, no need to compute it here
  return gl.createBuffer()
}

// compute circle position and assign result to circlePosition attribute
function setCirclePositionAttribute(gl: WebGLRenderingContext, programInfo: CircleProgramInfo, buffers: BufferCollection, dt: number) {
  const numComponents = 2 // pull out 2 values per iteration
  const type = gl.FLOAT // the data in the buffer is 32bit floats
  const normalize = false // don't normalize
  const stride = 0 // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0 // how many bytes inside the buffer to start from

  // compute current position of circle and generate posBuffer array
  const pos1 = [Math.sin(dt / 500), Math.cos(dt / 500)]
  const posBuffer = [...pos1, ...pos1, ...pos1, ...pos1]

  // bind the circlePosition buffer as the one to receive buffer operations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.circlePosition)

  // update the data in the bound buffer with the contents of the posBuffer array
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posBuffer), gl.STATIC_DRAW)

  // tell WebGL how to read the bound buffer's contents into the designated attribute
  gl.vertexAttribPointer(
    programInfo.attributeLocations.circlePosVec,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  )
  gl.enableVertexAttribArray(programInfo.attributeLocations.circlePosVec)
}

function dispose(intervalId: number, gl: WebGLRenderingContext, buffers: BufferCollection, program: WebGLProgram): void {
  // delete interval
  window.clearInterval(intervalId)

  // delete buffers ////////// maybe don't do this if we're just switching to a new GL program
  // glUtils.deleteBuffers(gl, buffers)
  // gl.bindBuffer(gl.ARRAY_BUFFER, null)

  // delete shaders
  const shaders = gl.getAttachedShaders(program)
  shaders?.forEach(s => gl.deleteShader(s))

  // delete program
  gl.deleteProgram(program)
}

export async function run(gl: WebGLRenderingContext, canvasWidth: number, canvasHeight: number): Promise<UseGLContext> {
  const shaderProgram = await glUtils.setUpShaders(gl, programName)
  if (!shaderProgram) {
    console.warn('Failed to init shader program :/')
    return { success: false }
  }

  const programInfo: CircleProgramInfo = {
    program: shaderProgram,
    attributeLocations: {
      vertexPosVec: gl.getAttribLocation(shaderProgram, 'a_vertexPosition'),
      circlePosVec: gl.getAttribLocation(shaderProgram, 'a_circlePosition'),
    },
    uniformLocations: {
      resolutionVec: gl.getUniformLocation(shaderProgram, 'u_resolution'),
    },
  }

  // Here's where we call the routine that builds all the
  // objects we'll be drawing
  const buffers = initBuffers(gl)

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  glUtils.setVertPositionAttribute(gl, programInfo, buffers)

  // set program to use
  gl.useProgram(programInfo.program)

  // define uniforms
  gl.uniform2fv(programInfo.uniformLocations.resolutionVec, [canvasWidth, canvasHeight])

  const fps = 40
  const startMs = new Date().valueOf()

  const intervalId = window.setInterval(() => {
    const currentMs = new Date().valueOf()
    const dt = currentMs - startMs

    // update circlePosition attribute with current dt
    setCirclePositionAttribute(gl, programInfo, buffers, dt)

    // Draw the scene
    glUtils.drawScene(gl)
  }, 1000 / fps)

  return {
    success: true,
    dispose: () => dispose(intervalId, gl, buffers, programInfo.program),
  }
}
