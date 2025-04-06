<template>
  <div style="display: flex;">
    <div>
      <div
        :style="'font-weight: bold; background-color: ' + (pen.element ? vec2RGB(pen.element.color) : '#eee') + '; border-radius: 4px; margin: 1px; text-align: center;'"
      >
        {{ pen.element ? pen.element.name : 'Eraser' }}
      </div>
      <div style="height: 200px; overflow-y: auto">
        <div
          v-for="(element, idx) in [null, ...elementsList]"
          :key="idx"
          :style="'background-color: ' + (element ? vec2RGB(element.color) : '#eee') + '; border-radius: 4px; margin: 1px; text-align: center; cursor: pointer'"
          @click="pen.element = element"
        >
          {{ element ? element.name : 'Eraser' }}
        </div>
      </div>
    </div>
    <div style="position: relative">
      <canvas
        id="c"
        :width="canvasWidth"
        :height="canvasHeight"
        style="margin-left: 10px; border:1px solid #000000"
        @click="drawMouseEvent($event)"
        @mousemove="pen.isDrawing ? drawMouseEvent($event) : null"
        @mousedown="pen.isDrawing = true"
        @mouseup="pen.isDrawing = false"
        @mouseleave="pen.isDrawing = false"
      />
      <!-- @mousedown="testDrag($event)" -->
      <div>
        <button
          style="background-color: #78f"
          @click="doTick()"
        >
          tick++
        </button>
        <button
          style="background-color: #f87"
          @click="resetScene()"
        >
          reset
        </button>
        <!-- <button
          style="background-color: #cb5"
          @click="printImgData()"
        >
          print
        </button> -->
      </div>
      <div>
        <button
          style="background-color: #7ce"
          @click="doAutoTick = !doAutoTick"
        >
          {{ doAutoTick ? 'Pause' : 'Run' }}
        </button>
      </div>
      <div>
        <button
          :style="'background-color: ' + (scene.isCeiling ? '#8ac' : '#468')"
          @click="scene.isCeiling = !scene.isCeiling"
        >
          Ceiling: {{ scene.isCeiling ? 'On' : 'Off' }}
        </button>
        <button
          :style="'background-color: ' + (scene.isFloor ? '#ca8' : '#864')"
          @click="scene.isFloor = !scene.isFloor"
        >
          Floor: {{ scene.isFloor ? 'On' : 'Off' }}
        </button>
      </div>
      <div>
        Tick: {{ scene.tick }}
      </div>
      <div class="mt-2 text-caption">
        Pen size:
      </div>
      <v-slider
        v-model="pen.size"
        step="1"
        min="1"
        max="20"
        tick
        thumb-label
        class="pb-1"
      />
      <!-- <div>
        <button
          style="background-color: #5bc"
          @click="renderScene()"
        >
          renderScene
        </button>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import tools from '@/utils/tools'

interface vec3 {
  x: number
  y: number
  z: number
}
interface Scene {
  image: vec3[][]
  particles: (Particle | null)[][]
  tick: number
  isCeiling: boolean
  isFloor: boolean
}
interface Pen {
  element: (Element | null)
  size: number
  isDrawing: boolean
}

interface Element {
  name: string
  color: vec3
  state: string // solid, sediment, liquid, gas
  density?: number // for determining buoyancy between gas-gas or liquid-liquid
  isActive: boolean
  reactions: Reaction[] // empty if !isActive
  decay: null | Decay
}
interface Reaction {
  reactee: string
  result: string
  isTransitive: boolean
  direction: number[]
  chance: number
}
interface Decay {
  startAge: number
  endAge: number
  result: string
}
interface Particle {
  material: Element
  birthTick: number
}

// let materialSand: Element = {
//   name: 'sand',
//   color: { x: 0.9, y: 0.8, z: 0.5 },
//   isStatic: false,
//   angleOfRepose: 34,
// }
// let materialWater: Element = {
//   name: 'water',
//   color: { x: 0, y: 0.3, z: 0.8 },
//   isStatic: false,
//   angleOfRepose: 0,
// }
// let materialStone: Element = {
//   name: 'stone',
//   color: { x: 0.6, y: 0.6, z: 0.6 },
//   isStatic: true,
//   angleOfRepose: 0,
// } /////////////////////////////////////////// transfer these to elements obj below
const msPerTick = 50

const elements: { [key: string]: Element } = {
  // //// passive
  // liquids
  'oil': {
    name: 'oil',
    state: 'liquid',
    density: 0.5,
    isActive: false,
    reactions: [] as Reaction[],
    color: { x: 0.7, y: 0.3, z: 0 },
  } as Element,
  // sediments
  'ash': {
    name: 'ash',
    state: 'sediment',
    isActive: false,
    reactions: [] as Reaction[],
    color: { x: 0.7, y: 0.7, z: 0.7 },
  } as Element,
  'dirt': {
    name: 'dirt',
    state: 'sediment',
    isActive: false,
    reactions: [] as Reaction[],
    color: { x: 0.4, y: 0.3, z: 0 },
  } as Element,
  'sand': {
    name: 'sand',
    state: 'sediment',
    isActive: false,
    reactions: [] as Reaction[],
    color: { x: 0.9, y: 0.8, z: 0.5 },
  } as Element,
  // solids
  'ice': {
    name: 'ice',
    state: 'solid',
    isActive: false,
    reactions: [] as Reaction[],
    color: { x: 0.6, y: 0.7, z: 1 },
  } as Element,
  'steel': {
    name: 'steel',
    state: 'solid',
    isActive: false,
    reactions: [] as Reaction[],
    color: { x: 0.85, y: 0.85, z: 0.85 },
  } as Element,
  'stone': {
    name: 'stone',
    state: 'solid',
    isActive: false,
    reactions: [] as Reaction[],
    color: { x: 0.6, y: 0.6, z: 0.6 },
  } as Element,
  'wire': {
    name: 'wire',
    state: 'solid',
    isActive: false,
    reactions: [] as Reaction[],
    color: { x: 0.6, y: 0.1, z: 0.6 },
  } as Element,
  'wood': {
    name: 'wood',
    state: 'solid',
    isActive: false,
    reactions: [] as Reaction[],
    color: { x: 0.6, y: 0.5, z: 0 },
  } as Element,
  // //// active
  // gases
  'fire': {
    name: 'fire',
    state: 'gas',
    isActive: true,
    reactions: [
      {
        reactee: 'oil',
        result: 'fire',
        isTransitive: true,
        chance: 1,
      } as Reaction,
      {
        reactee: 'ice',
        result: 'water',
        isTransitive: true,
        chance: 1,
      } as Reaction,
      {
        reactee: 'wood',
        result: 'ember',
        isTransitive: true,
        chance: 0.1,
      } as Reaction,
      {
        reactee: 'water',
        result: 'steam',
        isTransitive: false,
        chance: 1,
      } as Reaction,
    ] as Reaction[],
    color: { x: 1, y: 0.2, z: 0 },
    decay: {
      startAge: 5 * 1000 / msPerTick,
      endAge: 20 * 1000 / msPerTick,
      result: 'smoke',
    } as Decay,
  } as Element,
  'methane': {
    name: 'methane',
    state: 'gas',
    isActive: true,
    reactions: [
      {
        reactee: 'air',
        result: 'air',
        isTransitive: false,
        chance: 0.01,
      } as Reaction,
      {
        reactee: 'fire',
        result: 'fire',
        isTransitive: false,
        chance: 1,
      } as Reaction,
    ] as Reaction[],
    color: { x: 0.5, y: 0.4, z: 0.2 },
  } as Element,
  'smoke': {
    name: 'smoke',
    state: 'gas',
    isActive: true,
    reactions: [] as Reaction[],
    decay: {
      startAge: 2 * 1000 / msPerTick,
      endAge: 10 * 1000 / msPerTick,
      result: 'air',
    } as Decay,
    color: { x: 0.5, y: 0.4, z: 0.4 },
  } as Element,
  'steam': {
    name: 'steam',
    state: 'gas',
    isActive: true,
    reactions: [
      {
        reactee: 'air',
        result: 'air',
        isTransitive: false,
        chance: 0.01,
      } as Reaction,
      {
        reactee: 'ice',
        result: 'water',
        isTransitive: false,
        chance: 0.2,
      } as Reaction,
      {
        reactee: 'plant',
        result: 'plant',
        isTransitive: false,
        chance: 0.1,
      } as Reaction,
    ] as Reaction[],
    decay: {
      startAge: 15 * 1000 / msPerTick,
      endAge: 60 * 1000 / msPerTick,
      result: 'spark',
      // startAge: 10 * 1000 / msPerTick,
      // endAge: 30 * 1000 / msPerTick,
      // result: 'air',
    } as Decay,
    color: { x: 0.6, y: 0.8, z: 1 },
  } as Element,
  // liquids
  'water': {
    name: 'water',
    state: 'liquid',
    isActive: true,
    reactions: [
      {
        reactee: 'dirt',
        result: 'plant',
        isTransitive: false,
        chance: 0.001,
      } as Reaction,
      {
        reactee: 'steel',
        result: 'rust',
        isTransitive: true,
        chance: 0.01,
      } as Reaction,
      {
        reactee: 'fire',
        result: 'steam',
        isTransitive: false,
        chance: 1,
      } as Reaction,
      {
        reactee: 'plant',
        result: 'plant',
        isTransitive: false,
        chance: 0.6,
      } as Reaction,
    ] as Reaction[],
    color: { x: 0.2, y: 0.3, z: 1 },
  } as Element,
  // sediments
  'spark': {
    name: 'spark',
    state: 'sediment',
    isActive: true,
    reactions: [
      {
        reactee: 'oil',
        result: 'fire',
        isTransitive: true,
        chance: 1,
      } as Reaction,
    ] as Reaction[],
    decay: {
      startAge: 1 * 1000 / msPerTick,
      endAge: 5 * 1000 / msPerTick,
      result: 'air',
    } as Decay,
    color: { x: 0.9, y: 0.9, z: 0 },
  } as Element,
  // solids
  'ember': {
    name: 'ember',
    state: 'solid',
    isActive: true,
    reactions: [
      {
        reactee: 'air',
        result: 'fire',
        isTransitive: true,
        chance: 0.2,
      } as Reaction,
      {
        reactee: 'ice',
        result: 'water',
        isTransitive: true,
        chance: 0.1,
      } as Reaction,
      {
        reactee: 'wood',
        result: 'ember',
        isTransitive: true,
        chance: 0.01,
      } as Reaction,
      {
        reactee: 'water',
        result: 'ash',
        isTransitive: false,
        chance: 0.05,
      } as Reaction,
    ] as Reaction[],
    decay: {
      startAge: 5 * 1000 / msPerTick,
      endAge: 20 * 1000 / msPerTick,
      result: 'ash',
    } as Decay,
    color: { x: 0.3, y: 0.3, z: 0.3 },
  } as Element,
  'plant': {
    name: 'plant',
    state: 'solid',
    isActive: true,
    reactions: [
      {
        reactee: 'air',
        result: 'plant',
        isTransitive: true,
        chance: 0.01,
      } as Reaction,
      {
        reactee: 'ash',
        result: 'plant',
        isTransitive: true,
        chance: 0.001,
      } as Reaction,
      {
        reactee: 'dirt',
        result: 'wood',
        isTransitive: true,
        chance: 0.001,
      } as Reaction,
      {
        reactee: 'methane',
        result: 'humus',
        isTransitive: false,
        chance: 0.01,
      } as Reaction,
      {
        reactee: 'oil',
        result: 'humus',
        isTransitive: false,
        chance: 0.01,
      } as Reaction,
      {
        reactee: 'ice',
        result: 'humus',
        isTransitive: false,
        chance: 0.01,
      } as Reaction,
      {
        reactee: 'wood',
        result: 'wood',
        isTransitive: false,
        chance: 0.001,
      } as Reaction,
      {
        reactee: 'fire',
        result: 'fire',
        isTransitive: false,
        chance: 1,
      } as Reaction,
      {
        reactee: 'humus',
        result: 'humus',
        isTransitive: false,
        chance: 0.01,
      } as Reaction,
    ] as Reaction[],
    color: { x: 0.2, y: 0.8, z: 0.3 },
  } as Element,
  'humus': {
    name: 'humus',
    state: 'solid',
    isActive: true,
    reactions: [
      {
        reactee: 'air',
        result: 'methane',
        isTransitive: false,
        chance: 0.01,
      } as Reaction,
      {
        reactee: 'methane',
        result: 'methane',
        isTransitive: false,
        chance: 0.05,
      } as Reaction,
      {
        reactee: 'fire',
        result: 'fire',
        isTransitive: false,
        chance: 1,
      } as Reaction,
    ] as Reaction[],
    color: { x: 0.6, y: 0.9, z: 0.3 },
  } as Element,
  'rust': {
    name: 'rust',
    state: 'solid',
    isActive: true,
    reactions: [
      {
        reactee: 'oil',
        result: 'air',
        isTransitive: false,
        chance: 0.1,
      } as Reaction,
      {
        reactee: 'steel',
        result: 'rust',
        isTransitive: true,
        chance: 0.005,
      } as Reaction,
      {
        reactee: 'steel+',
        result: 'smoke',
        isTransitive: false,
        chance: 1,
      } as Reaction,
    ] as Reaction[],
    decay: {
      startAge: 10 * 1000 / msPerTick,
      endAge: 20 * 1000 / msPerTick,
      result: 'air',
    } as Decay,
    color: { x: 0.5, y: 0.3, z: 0 },
  } as Element,
  'steel+': {
    name: 'steel+',
    state: 'solid',
    isActive: true,
    reactions: [
      {
        reactee: 'air',
        result: 'spark',
        isTransitive: true,
        chance: 0.75,
      } as Reaction,
      {
        reactee: 'steel',
        result: 'steel+',
        isTransitive: true,
        chance: 1,
      } as Reaction,
    ] as Reaction[],
    decay: {
      startAge: 2, // 5 * 1000 / msPerTick,
      endAge: 2, // 20 * 1000 / msPerTick,
      result: 'steel',
    } as Decay,
    color: { x: 0.95, y: 0.95, z: 0.5 },
  } as Element,
  'wire+': {
    name: 'wire+',
    state: 'solid',
    isActive: true,
    reactions: [
      {
        reactee: 'wire',
        result: 'wire+',
        isTransitive: true,
        chance: 1,
      } as Reaction,
      {
        reactee: 'steel',
        result: 'steel+',
        isTransitive: true,
        chance: 1,
      } as Reaction,
    ] as Reaction[],
    decay: {
      startAge: 2, // 5 * 1000 / msPerTick,
      endAge: 2, // 20 * 1000 / msPerTick,
      result: 'wire',
    } as Decay,
    color: { x: 0.9, y: 0.3, z: 0.9 },
  } as Element,
  // sources
  'pump': {
    name: 'pump',
    state: 'solid',
    isActive: true,
    reactions: [
      {
        reactee: 'air',
        result: 'oil',
        isTransitive: true,
        chance: 0.5,
      } as Reaction,
    ] as Reaction[],
    color: { x: 0.8, y: 0.6, z: 0.3 },
  } as Element,
  'torch': {
    name: 'torch',
    state: 'solid',
    isActive: true,
    reactions: [
      {
        reactee: 'air',
        result: 'fire',
        isTransitive: true,
        chance: 0.5,
      } as Reaction,
    ] as Reaction[],
    color: { x: 0.5, y: 0.3, z: 0 },
  } as Element,
  'well': {
    name: 'well',
    state: 'solid',
    isActive: true,
    reactions: [
      {
        reactee: 'air',
        result: 'water',
        isTransitive: true,
        chance: 0.5,
      } as Reaction,
    ] as Reaction[],
    color: { x: 0, y: 0, z: 0.8 },
  } as Element,
}

export default {
  name: 'SandboxGame',
  // props: {
  //   value: {
  //     name: String,
  //     default: '',
  //   },
  // },
  data() {
    return {
      scene: {
        image: [],
        particles: [],
        tick: 0,
        isCeiling: true,
        isFloor: true,
      } as Scene,
      pen: {
        element: elements['sand'],
        size: 3,
        isDrawing: false,
      } as Pen,
      vueCanvas: {} as CanvasRenderingContext2D,
      imgRows: 50,
      imgCols: 50,
      canvasWidth: 250,
      canvasHeight: 250,
      interval: undefined as number | undefined,
      doAutoTick: false as boolean,
    }
  },
  computed: {
    backgroundImage(): vec3[][] {
      let blankA: vec3 = { x: 0.05, y: 0.05, z: 0.05 }
      // let blankA: vec3 = { x: 0.15, y: 0.15, z: 0.15 }
      let blankB: vec3 = { x: 0.15, y: 0.15, z: 0.15 }
      let background: vec3[][] = new Array(this.imgRows).fill(0).map(() => new Array(this.imgCols).fill(blankA))
      for (let row = 0; row < this.imgRows; row++) {
        for (let col = 0; col < this.imgCols; col++) {
          background[row][col] = ((row + col) % 2 === 0) ? blankA : blankB
        }
      }
      return background
    },
    elementsList(): Element[] {
      return Object.keys(elements).map(k => elements[k])
    },
    // particleCount(): number
  },
  created() {
    this.initializeScene()

    this.$nextTick(() => {
      // bind vueCanvas to canvas element
      let c = document.getElementById('c') as HTMLCanvasElement
      let ctx = c.getContext('2d')

      const handleTap = (e: TouchEvent) => {
        e.preventDefault()
        this.drawTouchEvent(e)
      }
      c.addEventListener('touchstart', handleTap, {passive: false});
      c.addEventListener('touchmove', this.drawTouchEvent);

      if (ctx !== null) {
        this.vueCanvas = ctx
        this.renderScene()
      }
    })

    this.interval = setInterval(() => {
      if (this.doAutoTick) {
        this.doTick()
      }
    }, msPerTick)
  },
  unmounted() {
    clearInterval(this.interval)
  },
  methods: {
    trimToLength(str: string, len: number): string {
      return str.substring(0, len) + (str.length < len ? ' '.repeat(len - str.length) : '')
    },
    vec2Str(v: vec3, decimals = 2): string {
      return '( ' + v.x.toFixed(decimals) + ', ' + v.y.toFixed(decimals) + ', ' + v.z.toFixed(decimals) + ' )'
    },
    particle2Str(p: Particle | null): string {
      return this.trimToLength(p === null ? ' - ' : p.material.name, 3)
    },
    particleRow2Str(row: (Particle | null)[]): string {
      let particleStrs: string[] = []
      row.forEach((p: Particle | null) => {
        particleStrs.push(this.particle2Str(p))
      })
      return '[ ' + particleStrs.join(', ') + ' ]'
    },
    imageRow2Str(row: vec3[]): string {
      let pixelStrs: string[] = []
      row.forEach((v: vec3) => {
        pixelStrs.push(this.trimToLength(this.vec2Str(v), 20))
      })
      return '[ ' + pixelStrs.join(', ') + ' ]'
    },
    printImgData() {
      console.log('Particles --------------')
      this.scene.particles.forEach((row: (Particle | null)[]) => {
        console.log(this.particleRow2Str(row))
      })
      // console.log('Image')
      // this.scene.image.forEach((row: vec3[]) => {
      //   console.log(this.imageRow2Str(row))
      // })
      console.log('--------------------')
    },
    testDrag(event: Event) {
      console.log('drag detected:')
      console.log(event)
    },
    vec2RGB(color: vec3): string {
      return 'rgb(' + (color.x * 256) + ', ' + (color.y * 256) + ', ' + (color.z * 256) + ')'
    },
    setParticle(row: number, col: number, element: (Element | null)) {
      if (element) {
        this.scene.particles[row][col] = {
          material: element,
          birthTick: this.scene.tick,
        }
      } else {
        this.scene.particles[row][col] = null
      }
    },
    drawMouseEvent(evt: MouseEvent) {
      let canvas = document.getElementById('c')
      let rect = canvas!.getBoundingClientRect()
      let x = evt.clientX - rect.left - 1
      let y = evt.clientY - rect.top - 1
      this.draw(x, y)
    },
    drawTouchEvent(evt: TouchEvent) {
      let canvas = document.getElementById('c')
      let rect = canvas!.getBoundingClientRect()
      let x = evt.touches[0].clientX - rect.left - 1
      let y = evt.touches[0].clientY - rect.top - 1
      this.draw(x, y)
    },
    draw(x: number, y: number) {
      let particleRow = Math.floor(y * this.imgRows / this.canvasHeight)
      let particleCol = Math.floor(x * this.imgCols / this.canvasWidth)
      let maxOffset = Math.floor(this.pen.size / 2) // /////////////////////////////////////////////////// pen sizing doesn't work
      // console.log('--------------------')
      // console.log('drawing at: [' + particleCol + ', ' + particleRow + ']')
      // console.log('particleRow: ' + particleRow)
      // console.log('maxOffset: ' + maxOffset)
      for (let rowOffset = particleRow - maxOffset; rowOffset <= particleRow + maxOffset; rowOffset++) {
        for (let colOffset = particleCol - maxOffset; colOffset <= particleCol + maxOffset; colOffset++) {
          // console.log('    ------------')
          // console.log('    rowOffset: ' + rowOffset)
          // console.log('    colOffset: ' + colOffset)
          if (colOffset >= 0 && colOffset < this.imgCols && rowOffset >= 0 && rowOffset < this.imgRows) {
            this.setParticle(rowOffset, colOffset, this.pen.element)
          }// else console.log('bad particle coords: [' + particleCol + ', ' + particleRow + ']')
        }
      }
      // console.log('end ----------------')

      this.renderScene()
    },
    initializeScene() {
      this.scene.image = tools.deepClone(this.backgroundImage)
      this.scene.particles = new Array(this.imgRows).fill(0).map(() => new Array(this.imgCols).fill(null))

      // create areas pre-filled with elements
      interface Fill {
        element: string
        startRow: number
        startCol: number
        height: number
        width: number
      }
      let fills: Fill[] = []
      // buoyancy test
      // fills.push({
      //   element: 'stone',
      //   startRow: 10,
      //   startCol: 20,
      //   height: 22,
      //   width: 10,
      // })
      // fills.push({
      //   element: 'sand',
      //   startRow: 11,
      //   startCol: 21,
      //   height: 4,
      //   width: 8,
      // })
      // fills.push({
      //   element: 'water',
      //   startRow: 15,
      //   startCol: 21,
      //   height: 4,
      //   width: 8,
      // })
      // fills.push({
      //   element: 'oil',
      //   startRow: 19,
      //   startCol: 21,
      //   height: 4,
      //   width: 8,
      // })
      // fills.push({
      //   element: 'methane',
      //   startRow: 23,
      //   startCol: 21,
      //   height: 4,
      //   width: 8,
      // })
      // fills.push({
      //   element: 'air',
      //   startRow: 27,
      //   startCol: 21,
      //   height: 4,
      //   width: 8,
      // })

      fills.forEach((f: Fill) => {
        for (let row = f.startRow; row < f.startRow + f.height; row++) {
          if (row >= 0 && row < this.imgRows) {
            for (let col = f.startCol; col < f.startCol + f.width; col++) {
              if (col >= 0 && col < this.imgCols) {
                this.setParticle(row, col, f.element === 'air' ? null : elements[f.element])
              }
            }
          }
        }
      })
    },
    resetScene() {
      this.scene.tick = 0
      this.initializeScene()
      this.renderScene()
    },
    doTick() {
      if (this.scene.tick % 2 === 0) {
        this.react()
      } else {
        this.move()
      }
      this.scene.tick++

      this.renderScene()
    },
    getNewParticle(name: string): Particle | null {
      if (name === 'air') {
        return null
      }
      return {
        material: elements[name],
        birthTick: this.scene.tick,
      } as Particle
    },
    isDenser(a: Particle, b: Particle): boolean {
      if (a.material.state === b.material.state) {
        let densityA = a.material.density === undefined ? 1 : a.material.density
        let densityB = b.material.density === undefined ? 1 : b.material.density
        return densityA > densityB
      } else {
        const densityMap: { [key: string]: number } = {
          'gas': 0,
          'liquid': 1,
          'sediment': 2,
        }
        return densityMap[a.material.state] > densityMap[b.material.state]
      }
    },
    doesChanceSucceed(chance: number): boolean {
      return Math.random() < chance
    },
    doesDecayOccur(p: Particle): boolean {
      if (p.material.decay) {
        let age = this.scene.tick - p.birthTick
        let chance = (age - p.material.decay.startAge) / (p.material.decay.endAge - p.material.decay.startAge)
        return this.doesChanceSucceed(chance)
      }
      return false
    },
    react() {
      /// TODO: copy constructors instead of deepClone
      /// !! or try structuredClone again once in Node 17+
      let nextScene: (Particle | null)[][] = tools.deepClone(this.scene.particles)
      let isUpdatedMask: boolean[][] = new Array(this.imgRows).fill(0).map(() => new Array(this.imgCols).fill(false))

      this.scene.particles.forEach((particleRow: (Particle | null)[], row: number) => {
        particleRow.forEach((p: Particle | null, col: number) => {
          // if (p !== null && p.material.isActive && !isUpdatedMask[row][col]) {
          if (p !== null && p.material.isActive) {
            // let doOut = p.material.name === 'torch'
            // if (doOut) console.log('----------------')

            // attempt decay, then reactions
            if (this.doesDecayOccur(p)) {
              let result = p.material.decay!.result
              nextScene[row][col] = this.getNewParticle(result)
              // this.setParticle(row, col, elements[result])
              // if (result === 'air') {
              //   nextScene[row][col] = null
              // } else {
              //   nextScene[row][col]!.material = elements[result]
              // }
              isUpdatedMask[row][col] = true
            } else {
              // determine possible reactions
              let potentialReactions = []
              // if (row > 0 && !isUpdatedMask[row - 1][col]) {
              if (row > 0) { // && !isUpdatedMask[row - 1][col]) {
                let potentialReactee = (this.scene.particles[row - 1][col] === null) ? 'air' : this.scene.particles[row - 1][col]!.material.name
                // if (doOut) console.log('looking up: potRxt = ' + potentialReactee)
                if (potentialReactee !== p.material.name) {
                  let reaction = p.material.reactions.find((r: Reaction) => r.reactee === potentialReactee)
                  // if (doOut) console.log('rxn:')
                  // if (doOut) console.log(reaction)
                  if (reaction !== undefined) {
                    let newReaction: Reaction = tools.deepClone(reaction)
                    newReaction.direction = [-1, 0]
                    potentialReactions.push(newReaction)
                  }
                }
              }
              // if (row < this.imgRows - 1 && !isUpdatedMask[row + 1][col]) {
              if (row < this.imgRows - 1) { // && !isUpdatedMask[row + 1][col]) {
                let potentialReactee = (this.scene.particles[row + 1][col] === null) ? 'air' : this.scene.particles[row + 1][col]!.material.name
                if (potentialReactee !== p.material.name) {
                  let reaction = p.material.reactions.find((r: Reaction) => r.reactee === potentialReactee)
                  if (reaction !== undefined) {
                    let newReaction: Reaction = tools.deepClone(reaction)
                    newReaction.direction = [1, 0]
                    potentialReactions.push(newReaction)
                  }
                }
              }
              // if (col > 0 && !isUpdatedMask[row][col - 1]) {
              if (col > 0) { // && !isUpdatedMask[row][col - 1]) {
                let potentialReactee = (this.scene.particles[row][col - 1] === null) ? 'air' : this.scene.particles[row][col - 1]!.material.name
                if (potentialReactee !== p.material.name) {
                  let reaction = p.material.reactions.find((r: Reaction) => r.reactee === potentialReactee)
                  if (reaction !== undefined) {
                    let newReaction: Reaction = tools.deepClone(reaction)
                    newReaction.direction = [0, -1]
                    potentialReactions.push(newReaction)
                  }
                }
              }
              // if (col < this.imgCols - 1 && !isUpdatedMask[row][col + 1]) {
              if (col < this.imgCols - 1) { // && !isUpdatedMask[row][col + 1]) {
                let potentialReactee = (this.scene.particles[row][col + 1] === null) ? 'air' : this.scene.particles[row][col + 1]!.material.name
                if (potentialReactee !== p.material.name) {
                  let reaction = p.material.reactions.find((r: Reaction) => r.reactee === potentialReactee)
                  if (reaction !== undefined) {
                    let newReaction: Reaction = tools.deepClone(reaction)
                    newReaction.direction = [0, 1]
                    potentialReactions.push(newReaction)
                  }
                }
              }
              potentialReactions.sort((a: Reaction, b: Reaction) => {
                // prioritize intransitivity, then chance
                return (a.isTransitive !== b.isTransitive)
                  ? (a.isTransitive ? 1 : -1)
                  : (b.chance - a.chance)
              })
              // if (doOut) console.log('potentialReactions:')
              // if (doOut) console.log(potentialReactions)

              // react
              // let didReactionOccur = false
              for (let i = 0; i < potentialReactions.length; i++) {
                let r = potentialReactions[i]
                if (this.doesChanceSucceed(r.chance)) {
                  // didReactionOccur = true
                  if (!r.isTransitive) {
                    // nextScene[row][col]!.material = elements[r.result]
                    nextScene[row][col] = this.getNewParticle(r.result)
                    isUpdatedMask[row][col] = true
                    break
                  } else {
                    nextScene[row + r.direction[0]][col + r.direction[1]] = this.getNewParticle(r.result) // elements[r.result]
                    isUpdatedMask[row + r.direction[0]][col + r.direction[1]] = true
                  }
                }
              }
            }
          }
        })
      })
      this.scene.particles = tools.deepClone(nextScene)
    },
    move() {
      let nextScene = tools.deepClone(this.scene.particles)
      let isUpdatedMask: boolean[][] = new Array(this.imgRows).fill(0).map(() => new Array(this.imgCols).fill(false))

      this.scene.particles.forEach((particleRow: (Particle | null)[], row: number) => {
        particleRow.forEach((p: Particle | null, col: number) => {
          if (p !== null && p.material.state !== 'solid') {
            let didMovement = false
            if (p.material.state === 'gas') {
              // try going straight up
              if (row > 0) {
                let positionAbove = this.scene.particles[row - 1][col]
                if (!isUpdatedMask[row - 1][col]) {
                  if (positionAbove === null) {
                    nextScene[row - 1][col] = p
                    isUpdatedMask[row - 1][col] = true
                    nextScene[row][col] = null
                    didMovement = true
                  } else if (this.isDenser(positionAbove, p)) {
                    nextScene[row - 1][col] = p
                    nextScene[row][col] = positionAbove
                    isUpdatedMask[row - 1][col] = true
                    isUpdatedMask[row][col] = true
                    didMovement = true
                  }
                }
              } else if (!this.scene.isCeiling) {
                nextScene[row][col] = null
                didMovement = true
              }
              if (!didMovement) {
                // "settle" - shift to left or right
                let isLeftOpen = col > 0 &&
                                 this.scene.particles[row][col - 1] == null &&
                                 !isUpdatedMask[row][col - 1]
                let isLeftUpOpen = isLeftOpen &&
                                   row > 0 &&
                                   this.scene.particles[row - 1][col - 1] == null &&
                                   !isUpdatedMask[row - 1][col - 1]
                let isRightOpen = col < this.imgCols - 1 &&
                                  this.scene.particles[row][col + 1] == null &&
                                  !isUpdatedMask[row][col + 1]
                let isRightUpOpen = isRightOpen &&
                                    row > 0 &&
                                    this.scene.particles[row - 1][col + 1] == null &&
                                    !isUpdatedMask[row - 1][col + 1]
                if (isLeftUpOpen || isRightUpOpen) {
                  let doLeft = (isLeftUpOpen && isRightUpOpen) ? this.doesChanceSucceed(0.5) : isLeftUpOpen
                  let idxShift = doLeft ? -1 : 1
                  nextScene[row - 1][col + idxShift] = p
                  isUpdatedMask[row - 1][col + idxShift] = true
                  nextScene[row][col] = null
                } else if (isLeftOpen || isRightOpen) {
                  if (this.doesChanceSucceed(0.5)) {
                    let doLeft = (isLeftOpen && isRightOpen) ? this.doesChanceSucceed(0.5) : isLeftOpen
                    let idxShift = doLeft ? -1 : 1
                    nextScene[row][col + idxShift] = p
                    isUpdatedMask[row][col + idxShift] = true
                    nextScene[row][col] = null
                  }
                }
              }
            } else {
              if (row < this.imgRows - 1) {
                let positionBelow = this.scene.particles[row + 1][col]
                if (!isUpdatedMask[row + 1][col]) {
                  if (positionBelow === null) {
                    nextScene[row + 1][col] = p
                    isUpdatedMask[row + 1][col] = true
                    nextScene[row][col] = null
                    didMovement = true
                  } else if (this.isDenser(p, positionBelow)) {
                    nextScene[row + 1][col] = p
                    nextScene[row][col] = positionBelow
                    isUpdatedMask[row + 1][col] = true
                    isUpdatedMask[row][col] = true
                    // nextScene[row][col] = null
                    didMovement = true
                  }
                }
              } else if (!this.scene.isFloor) {
                nextScene[row][col] = null
                didMovement = true
              }
              if (!didMovement) {
                // "settle" - shift to left or right
                let isLeftOpen = col > 0 &&
                                 this.scene.particles[row][col - 1] == null &&
                                 !isUpdatedMask[row][col - 1]
                let isLeftDownOpen = isLeftOpen &&
                                     row < this.imgRows - 1 &&
                                     this.scene.particles[row + 1][col - 1] == null &&
                                     !isUpdatedMask[row + 1][col - 1]
                let isRightOpen = col < this.imgCols - 1 &&
                                  this.scene.particles[row][col + 1] == null &&
                                  !isUpdatedMask[row][col + 1]
                let isRightDownOpen = isRightOpen &&
                                      row < this.imgRows - 1 &&
                                      this.scene.particles[row + 1][col + 1] == null &&
                                      !isUpdatedMask[row + 1][col + 1]
                if (isLeftDownOpen || isRightDownOpen) {
                  let doLeft = (isLeftDownOpen && isRightDownOpen) ? this.doesChanceSucceed(0.5) : isLeftDownOpen
                  let idxShift = doLeft ? -1 : 1
                  nextScene[row + 1][col + idxShift] = p
                  isUpdatedMask[row + 1][col + idxShift] = true
                  nextScene[row][col] = null
                } else if (p.material.state === 'liquid' && (isLeftOpen || isRightOpen)) {
                  if (this.doesChanceSucceed(0.5)) {
                    let doLeft = (isLeftOpen && isRightOpen) ? this.doesChanceSucceed(0.5) : isLeftOpen
                    let idxShift = doLeft ? -1 : 1
                    nextScene[row][col + idxShift] = p
                    isUpdatedMask[row][col + idxShift] = true
                    nextScene[row][col] = null
                  }
                }
              }
            }
          }
        })
      })
      this.scene.particles = tools.deepClone(nextScene)
    },
    // renderScene(doOut: boolean = false) {
    renderScene() {
      // if (doOut) console.log('renderScene() =====================')
      // if (doOut) this.printImgData()
      // let vm = this
      // if (doOut) console.log('starting loop...')
      this.scene.particles.forEach((particleRow: (Particle | null)[], row: number) => {
        // if (doOut) console.log('particleRow: ' + this.particleRow2Str(particleRow))
        // if (doOut) console.log('imageRow: ' + this.imageRow2Str(vm.scene.image[row]))
        particleRow.forEach((p: Particle | null, col: number) => {
          // if (doOut) console.log('        p: ' + this.particle2Str(p))
          // if (doOut) console.log('    - pixel original: ' + this.vec2Str(vm.scene.image[row][col]))
          if (p === null) {
            // if (doOut) console.log('    - null; setting to background image color: ' + this.vec2Str(this.backgroundImage[row][col]))
            this.scene.image[row][col] = this.backgroundImage[row][col]
          } else {
            // if (doOut) console.log('    - not null; setting to material color: ' + this.vec2Str(p.material.color))
            this.scene.image[row][col] = p.material.color
          }
          // if (doOut) console.log('    - pixel final: ' + this.vec2Str(vm.scene.image[row][col]))
        })
        // if (doOut) console.log('particleRow final: ' + this.particleRow2Str(particleRow))
        // if (doOut) console.log('imageRow final: ' + this.imageRow2Str(vm.scene.image[row]))
      })
      // if (doOut) console.log('Final state:')
      // if (doOut) this.printImgData()

      // if (doOut) console.log('Refreshing canvas...')
      this.refreshCanvas()
      // if (doOut) console.log('Done. =============================')
    },
    refreshCanvas() {
      let img = this.scene.image
      let imgPxRows = img.length
      let imgPxCols = img.length > 0 ? img[0].length : 0
      let pxWidth = this.canvasWidth / imgPxCols
      let pxHeight = this.canvasHeight / imgPxRows
      for (let row = 0; row < imgPxRows; row++) {
        for (let col = 0; col < imgPxCols; col++) {
          let colorString = 'rgb(' +
                            img[row][col].x * 256 + ',' +
                            img[row][col].y * 256 + ',' +
                            img[row][col].z * 256 + ')'
          this.vueCanvas.fillStyle = colorString
          this.vueCanvas.fillRect(col * pxWidth, row * pxHeight, pxWidth, pxHeight)
        }
      }
    },
  },
}
</script>

<style scoped>
/* body {
  user-select: none;
} */
button {
  color: #fff;
  border-radius: 3px;
  margin: 2px;
  padding: 2px 5px;
  box-shadow: inset 0 -3px #fff4;
}
</style>
