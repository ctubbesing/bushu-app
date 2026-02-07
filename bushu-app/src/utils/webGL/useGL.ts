import * as circleProg from './programs/circleProg'
import * as marchProg from './programs/marchProg'

export type UseGLProgramName = 'circleProg' | 'marchProg'

export type UseGLContext = {
  success: boolean
  dispose?: () => void
}

export async function useGL(programName: UseGLProgramName, canvasId: string): Promise<UseGLContext> {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null

  const gl = canvas?.getContext('webgl')
  if (!canvas || !gl) {
    console.warn('Error setting up gl :/')
    console.log(canvas)
    console.log(gl)
    return { success: false }
  }

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  if (programName === 'circleProg') {
    return await circleProg.run(gl, canvas.width, canvas.height)
  } else if (programName === 'marchProg') {
    return await marchProg.run(gl, canvas.width, canvas.height)
  }

  return { success: false }
}
