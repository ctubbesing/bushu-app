<template>
  <div>
    <div>
      <!-- <v-number-input
        label="Scene"
        v-model="mainSceneIdx"
        control-variant="split"
      /> -->
      <!-- {{ `mainSceneIdx ${printInfo(mainSceneIdx)}` }}<br> -->
      <!-- {{ `loading ${printInfo(loading)}` }}<br> -->
      <!-- {{ `captureTimes ${printInfo(captureTimes)}` }}<br> -->
      <!-- {{ `vueCanvas ${printInfo(vueCanvas)}` }}<br> -->
      <!-- <v-btn @click="refreshCanvas">refreshCanvas</v-btn> -->
      <v-btn-toggle
        v-model="mainSceneIdx"
        color="app-header"
        group
        mandatory
        variant="outlined"
        divided
        @update:model-value="generateCanvasImage()"
      >
        <v-btn
          v-for="n in 5"
          :key="n"
          :value="n - 1"
        >
          Scene {{ n - 1 }}
        </v-btn>
        <!-- //////////////////// prolly start from basics to figure out how to get it to draw stuff /////////////////////////// -->
        <!-- <v-btn value="1">
          Small
        </v-btn>
        <v-btn value="2">
          Large
        </v-btn> -->
      </v-btn-toggle>
      <!-- <b-form-spinbutton
        v-model="mainSceneIdx"
        min="0"
        max="4"
        wrap
        inline
        @change="generateCanvasImage()"
        style="margin:10px auto; width:200px"
      /> -->
    </div>
    <div class="ma-3">
      <!-- <b style="margin-right:10px">Size:</b> -->
      <!-- {{canvasSettingsControl.size}} -->
      <v-btn-toggle
        v-model="canvasSettingsControl.size"
        color="app-header"
        group
        mandatory
        variant="outlined"
        @update:model-value="generateCanvasImage()"
      >
        <!-- divided -->
        <v-btn :value="1">
          Small
        </v-btn>
        <v-btn :value="2">
          Large
        </v-btn>
      </v-btn-toggle>
      <!-- <b-form-radio-group
        v-model="canvasSettingsControl.size"
        :options="[
          { text: 'Small', value: 1 },
          { text: 'Large', value: 2 },
        ]"
        buttons
        @change="generateCanvasImage()"
        style="margin:10px auto; width:200px"
      /> -->
    </div>
    <div style="overflow-x: auto">
      <canvas
        id="c"
        :width="canvasWidth"
        :height="canvasHeight"
        :style="getWidthInfo + 'border:1px solid #000000'"
        @click="look($event)"
      />
    </div>
    <!-- <div>
      <span
        v-if="!isKeydownListenerCreated"
        @click="createKeydownListener()"
      >
        Click to enable movement
      </span>
      <span v-else>
        Movement enabled
      </span>
    </div> -->
    <div v-if="false">
      <!-- TODO: fix loading status -->
      <BaseLoader />
    </div>
    <div v-else>
      <div>
        {{ allScenes[mainSceneIdx].items.length }} items
      </div>
      <div v-if="subSceneCount != null">
        {{ subSceneCount }} sub scenes
      </div>
    </div>
    <br>
    <!-- <div v-if="startTime">
      Start: {{ startTime.format('h:mm:ss') }}
    </div>
    <div v-if="endTime">
      End: {{ endTime.format('h:mm:ss') }}
    </div>
    <div v-if="totalRuntime">
      {{ totalRuntime }} seconds total
    </div> -->
    <div
      v-for="(data, idx) in captureTimes"
      :key="idx"
      style="margin-left: 10px"
    >
      Scene {{ data.sceneIdx }}:
      {{ data.sceneSettings.pxRows }}x{{ data.sceneSettings.pxCols }},
      {{ data.sceneSettings.reflectLimit }} ref,
      {{ data.sceneSettings.superSampleLvl }}xSS
      <!-- <b>{{ getRuntime(data.start, data.end) }} s</b> -->
    </div>
  </div>
</template>

<script lang="ts">
import BaseLoader from '../utils/BaseLoader.vue'

// import Vue from 'vue'
// import moment from 'moment'

interface vec3 {
  x: number
  y: number
  z: number
}

interface PhongColor {
  color: vec3
  ka: number
  kd: number
  ks: number
  n: number
  reflectivity: number
  opacity: number

  image?: null | vec3[][]
  imgSrcSceneIdx?: null | number
}

interface Item {
  type: string
  material: PhongColor
  nullVolumes?: Item[]
}
interface Sphere extends Item {
  c: vec3
  r: number
}
interface Tube extends Item {
  p: vec3
  d: vec3
  r: number
}
interface Cylinder extends Item {
  p0: vec3
  p1: vec3
  r: number
}
interface Plane extends Item {
  p: vec3
  n: vec3
}
interface Triangle extends Item {
  v0: vec3
  v1: vec3
  v2: vec3
}
interface Circle extends Item {
  c: vec3
  n: vec3
  r: number
}
interface Parallelogram extends Item {
  p: vec3
  u: vec3
  v: vec3
}

interface Polygon extends Item {
  vertices: vec3[]
}
interface SmoothPolygon extends Item {
  vertices: vec3[]
  r: number
}

interface Light {
  p: vec3
  // color: vec3
  C: number
}

interface Ray {
  o: vec3
  dir: vec3
  reflectLvl: number
  refractLvl: number
}

interface ImageSettings {
  pxRows: number
  pxCols: number
  reflectLimit: number
  refractLimit: number
  superSampleLvl: number
}

interface Camera {
  pos: vec3
  dir: vec3
  up: vec3
  fov: number[]
  image: vec3[][]
  settings: ImageSettings
}

interface Scene {
  camera: Camera
  A: number
  voidColor?: vec3
  items: Item[]
  compoundItems: Item[]
  lights: Light[]
}

interface TimingData {
  sceneIdx: number,
  sceneSettings: ImageSettings,
  // start: moment.Moment,
  // end: moment.Moment,
}


export default {
  name: 'CanvasTest',
  components: {
    BaseLoader,
  },
  data() {
    return {
      vueCanvas: {} as CanvasRenderingContext2D,
      canvasSettingsControl: {
        size: 1,
        reflectLimit: 3 as number,
        // refractLimit: 3 as number,
        superSampleLvl: 1 as number,
      },
      cMat: [] as number[][][], /////////////////// outdated

      doOut: false,
      // startTime: null as null | moment.Moment,
      // endTime: null as null | moment.Moment,
      captureTimes: [] as TimingData[],
      subSceneCount: null as null | number,

      allScenes: [] as Scene[],
      mainSceneIdx: 4 as number,
      doGlobalCameraSettings: true as boolean,
    }
  },
  created() {
    this.createKeydownListener()

    let imgA = [
      [
        { x: 0.75, y: 0, z: 0 } as vec3,
        { x: 0, y: 0.75, z: 0 } as vec3,
        { x: 0, y: 0.5, z: 0 } as vec3,
      ],
      [
        { x: 0, y: 0, z: 0.75 } as vec3,
        { x: 0.75, y: 0, z: 0.75 } as vec3,
        { x: 0.5, y: 0, z: 0.75 } as vec3,
      ],
      [
        { x: 0, y: 0.75, z: 0.75 } as vec3,
        { x: 0.75, y: 0.75, z: 0 } as vec3,
        { x: 0.75, y: 0.5, z: 0 } as vec3,
      ],
    ] as vec3[][]
    let imgB = [] as vec3[][]
    let darkColor = { x: 0.4, y: 0.3, z: 0 } as vec3
    let lightColor = { x: 0.8, y: 0.8, z: 0.7 } as vec3
    imgB.push(new Array(8).fill({}).map((item, idx) => idx % 2 === 1 ? this.vSubtract(lightColor, darkColor) : this.vScale(darkColor, 0)))
    for (let i = 0; i < 7; i++) {
      let row = [] as vec3[]
      for (let j = 0; j < 8; j++) {
        row.push(i % 2 === j % 2 ? lightColor : darkColor)
      }
      imgB.push(row)
    }

    let sampleMaterialA = {
      color: { x: 0.6, y: 0.8, z: 1 } as vec3,
    } as PhongColor
    let sampleMaterialB = {
      color: { x: 0.6, y: 1, z: 0.8 } as vec3,
    } as PhongColor
    let sampleMaterialC = {
      color: { x: 0.8, y: 1, z: 0.6 } as vec3,
    } as PhongColor
    let matteA = {
      color: { x: 0.9, y: 0.9, z: 1 } as vec3,
      n: 5,
      reflectivity: 0
    } as PhongColor
    let matteB = {
      color: { x: 0.6, y: 0.5, z: 0.8 } as vec3,
      n: 5,
      reflectivity: 0,
      image: imgA,
    } as PhongColor
    let matteC = {
      color: { x: 0.3, y: 0.3, z: 0.6 } as vec3,
      n: 5,
      reflectivity: 0
    } as PhongColor
    let matteD = {
      color: { x: 0.8, y: 0.3, z: 0.35 } as vec3,
      n: 5,
      reflectivity: 0
    } as PhongColor
    let mirrorA = {
      color: { x: 0.5, y: 0.8, z: 0.8 } as vec3,
      reflectivity: 0.5,
    } as PhongColor
    let mirrorSphere = {
      color: { x: 1, y: 1, z: 1 } as vec3,
      ka: 0.25,
      kd: 0.05,
      n: 300,
      reflectivity: 0.8,
    } as PhongColor
    let glassSphere = {
      color: { x: 1, y: 1, z: 1 } as vec3,
      ka: 0.25,
      kd: 0.05,
      n: 300,
      reflectivity: 0.8,
      // opacity: 0/////////////////////////
    } as PhongColor
    let textureScene0 = {
      color: { x: 1, y: 0, z: 1 } as vec3,
      ka: 0.65,
      // reflectivity: 0.25,
      imgSrcSceneIdx: 0,
    } as PhongColor
    let textureScene1 = {
      color: { x: 1, y: 0, z: 1 } as vec3,
      ka: 0.75,
      // reflectivity: 0.25,
      imgSrcSceneIdx: 3,
    } as PhongColor

    let pgScale = 2
    let pgP = { x: -0.75, y: 1, z: -1 } as vec3
    let pgU = { x: 2, y: 1, z: 0 } as vec3
    pgU = this.vScale(this.norm(pgU), 2 * pgScale)
    let pgV = { x: -0.5, y: 1, z: 3.5 } as vec3
    pgV = this.vScale(this.norm(pgV), 1 * pgScale)

    let pgP2 = { x: 3.5, y: 2.5, z: -1 } as vec3
    let pgU2 = { x: 2, y: -0.5, z: 0 } as vec3
    pgU2 = this.vScale(this.norm(pgU2), 2 * pgScale)
    let pgV2 = { x: 0.5, y: 0.5, z: 3 } as vec3
    pgV2 = this.vScale(this.norm(pgV2), 1 * pgScale)

    let fastSettings = {
      pxCols: 30,
      pxRows: 15,
      reflectLimit: 2,
      superSampleLvl: 1,
    } as ImageSettings

    this.allScenes = [
      // 0: original shape scene
      {
        camera: {
          // cylinder bug view
          // pos: { x: 1, y: 0.5, z: 0 } as vec3,
          // dir: this.norm({ x: 0.4, y: 0.9, z: -0.3 } as vec3),
          // main view
          pos: { x: 2, y: -0.5, z: 0 } as vec3,
          dir: { x: 0, y: 1, z: 0 } as vec3,
          up: { x: 0, y: 0, z: 1 } as vec3,
          fov: [Math.PI / 3.4, Math.PI / 6] as number[],
          settings: fastSettings
          // {
          //   // pxCols: 300,
          //   // pxRows: 150,
          //   // // reflectLimit: 0,
          //   // superSampleLvl: 1,
          // } as ImageSettings,
        } as Camera,
        A: 0.5,
        items: [
          {
            type: 'sphere',
            c: { x: 2, y: 3.5, z: 0.5 } as vec3,
            r: 0.5 as number,
            material: {
              color: { x: 0, y: 0, z: 1 } as vec3,
            } as PhongColor,
          } as Sphere,
          {
            type: 'sphere',
            c: { x: 3, y: 2, z: 0 } as vec3,
            r: 1 as number,
            material: {
              color: { x: 0, y: 0.8, z: 1 } as vec3,
              kd: 0.2,
              // n: 100
            } as PhongColor,
          } as Sphere,
          {
            type: 'sphere',
            c: { x: 1, y: 3, z: -1 } as vec3,
            r: 0.75 as number,
            material: {
              color: { x: 0, y: 0.4, z: 0.1 } as vec3,
            } as PhongColor,
          } as Sphere,
          {
            type: 'sphere',
            c: { x: 0, y: 3, z: 1 } as vec3,
            r: 0.4 as number,
            material: {
              color: { x: 1, y: 0.4, z: 0.1 } as vec3,
            } as PhongColor,
          } as Sphere,
          {
            type: 'plane',
            p: { x: 0, y: 0, z: -1 } as vec3,
            n: { x: 0, y: 0, z: 1 } as vec3,
            material: {
              color: { x: 1, y: 1, z: 1 } as vec3,
              kd: 0.1,
              reflectivity: 0.5,
            } as PhongColor,
          } as Plane,
          {
            type: 'plane',
            p: { x: 4, y: 0, z: 0 } as vec3,
            n: { x: -1, y: 0, z: 0 } as vec3,
            material: {
              color: { x: 0, y: 1, z: 0 } as vec3,
              reflectivity: 0,
            } as PhongColor,
          } as Plane,
          {
            type: 'plane',
            p: { x: -4, y: 0, z: 0 } as vec3,
            n: this.norm({ x: 1, y: 0, z: 1 } as vec3),
            material: {
              color: { x: 0, y: 1, z: 0.6 } as vec3,
              reflectivity: 0,
            } as PhongColor,
          } as Plane,
          {
            type: 'plane',
            p: { x: 0, y: 10, z: 0 } as vec3,
            n: { x: 0, y: -1, z: 0 } as vec3,
            material: {
              color: { x: 0.5, y: 0.7, z: 0.8 } as vec3,
              reflectivity: 0,
            } as PhongColor,
          } as Plane,
          {
            type: 'triangle',
            material: {
              color: { x: 1, y: 0, z: 0 } as vec3,
            } as PhongColor,
            v0: { x: 1, y: 2, z: -1 } as vec3,
            v1: { x: 0, y: 2, z: -0.5 } as vec3,
            v2: { x: 1, y: 1.5, z: -1 } as vec3,
          } as Triangle,
          {
            type: 'triangle',
            material: {
              color: { x: 1, y: 0, z: 0 } as vec3,
            } as PhongColor,
            v0: { x: 1, y: 1.5, z: -1 } as vec3,
            v1: { x: 0, y: 2, z: -0.5 } as vec3,
            v2: { x: 0, y: 1.5, z: -0.5 } as vec3,
          } as Triangle,
          {
            type: 'triangle',
            material: {
              color: { x: 1, y: 0, z: 0 } as vec3,
            } as PhongColor,
            v0: { x: 1, y: 1.5, z: -1 } as vec3,
            v1: { x: 0, y: 1.5, z: -0.5 } as vec3,
            v2: { x: 0, y: 1.5, z: -1 } as vec3,
          } as Triangle,
          {
            type: 'triangle',
            material: {
              color: { x: 1, y: 0, z: 0 } as vec3,
            } as PhongColor,
            v0: { x: 1, y: 2, z: -1 } as vec3,
            v1: { x: 0, y: 2, z: -0.5 } as vec3,
            v2: { x: 0, y: 2, z: -1 } as vec3,
          } as Triangle,
          {
            type: 'tube',
            material: {
              color: { x: 1, y: 1, z: 0 } as vec3,
            } as PhongColor,
            p: { x: -1.5, y: 3, z: -1 } as vec3,
            d: this.norm({ x: 2, y: 1.5, z: 2 } as vec3),
            r: 0.4,
          } as Tube,
          {
            type: 'cylinder',
            material: {
              color: { x: 0.4, y: 0.8, z: 0.6 } as vec3,
            } as PhongColor,
            p0: { x: 1.85, y: 1.6, z: -0.53 } as vec3,
            p1: { x: 1.75, y: 1.5, z: -0.48 } as vec3,
            r: 0.5,
          } as Cylinder,
        ] as Item[],
        compoundItems: [] as Item[],
        lights: [
          {
            p: { x: 1.5, y: 1, z: 2.5 } as vec3,
            C: 30
          } as Light,
          {
            p: { x: 3, y: 0.5, z: -0.9 } as vec3,
            C: 0.75
          } as Light,
          // {
          //   p: { x: 0, y: 0, z: 5 } as vec3,
          //   C: 100
          // } as Light,
        ] as Light[],
      },
      // 1: ball on raft
      {
        camera: {
          pos: { x: 0.25, y: -1, z: 0 } as vec3,
          dir: this.norm({ x: 2, y: 5, z: -0.5 } as vec3),
          up: { x: 0, y: 0, z: 1 } as vec3,
          fov: [Math.PI / 3.4, Math.PI / 6] as number[],
          settings: fastSettings,// this.canvasSettings,
        } as Camera,
        A: 0.5,
        items: [
          {
            type: 'sphere',
            c: { x: 3, y: 2.5, z: -0.2 } as vec3,
            r: 0.6,
            material: mirrorSphere,
          } as Sphere,
          {
            type: 'plane',
            p: { x: 0, y: 0, z: -1 } as vec3,
            n: { x: 0, y: 0, z: 1 } as vec3,
            material: mirrorA,
          } as Plane,
          {
            type: 'plane',
            p: { x: 0, y: 8, z: 0 } as vec3,
            n: { x: 0, y: -1, z: 0 } as vec3,
            material: matteA,
          } as Plane,
          {
            type: 'plane',
            p: { x: 9, y: 0, z: 0 } as vec3,
            n: { x: -1, y: 0, z: 0 } as vec3,
            material: matteB,
          } as Plane,
        ] as Item[],
        compoundItems: [
          {
            type: 'smoothPolygon',
            material: sampleMaterialB,
            vertices: [
              { x: 0.2, y: 4.8, z: -1 } as vec3,
              { x: 1.8, y: 4.8, z: -1 } as vec3,
              { x: 1.8, y: 2.2, z: -1 } as vec3,
              { x: 0.2, y: 2.2, z: -1 } as vec3,
            ],
            r: 0.2,
          } as SmoothPolygon,
          {
            type: 'smoothPolygon',
            material: sampleMaterialA,
            vertices: [
              { x: 2.2, y: 4.8, z: -1 } as vec3,
              { x: 4.8, y: 4.8, z: -1 } as vec3,
              { x: 4.8, y: 2.2, z: -1 } as vec3,
              { x: 2.2, y: 2.2, z: -1 } as vec3,
            ],
            r: 0.2,
          } as SmoothPolygon,
          {
            type: 'smoothPolygon',
            material: sampleMaterialC,
            vertices: [
              { x: 0.2, y: 1.8, z: -1 } as vec3,
              { x: 4.8, y: 1.8, z: -1 } as vec3,
              { x: 4.8, y: 1.2, z: -1 } as vec3,
              { x: 0.2, y: 1.2, z: -1 } as vec3,
            ],
            r: 0.2,
          } as SmoothPolygon,
        ] as Item[],
        lights: [
          {
            p: { x: 0, y: 0, z: 5 } as vec3,
            C: 100
          } as Light,
        ] as Light[],
      },
      // 2: picture frames RD (w/ everything else commented)
      {
        camera: {
          // pos: { x: 2, y: -4, z: 1.5 } as vec3,//origin
          pos: { x: 2.5, y: -2.5, z: 0.5 } as vec3,//origin
          // pos: { x: 3, y: -2, z: 0.5 } as vec3,//sceneB
          dir: this.norm({ x: 0, y: 1, z: 0 } as vec3),
          // pos: { x: 0.25, y: -1, z: 0 } as vec3,//sceneA
          // dir: this.norm({ x: 2, y: 5, z: -0.5 } as vec3),
          // pos: { x: 2, y: -0.5, z: 0 } as vec3,
          // dir: { x: 0, y: 1, z: 0 } as vec3,
          // pos: { x: 1, y: -1, z: -0.5 } as vec3,
          // dir: this.norm({ x: 0.3, y: 2, z: 0.4 } as vec3),
          up: { x: 0, y: 0, z: 1 } as vec3,
          fov: [Math.PI / 3.4, Math.PI / 6] as number[],
          settings: this.canvasSettings,
        } as Camera,
        A: 0.5,
        items: [
          // {
          //   type: 'sphere',
          //   c: { x: 3, y: 2.5, z: -0.2 } as vec3,
          //   r: 0.6,
          //   material: {
          //     color: { x: 0.7, y: 0.7, z: 0.7 } as vec3,
          //     reflectivity: 0.8,
          //   } as PhongColor,
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   c: pgP,
          //   r: 0.1,
          //   material: {
          //     color: { x: 0.7, y: 0.7, z: 0.7 } as vec3,
          //     reflectivity: 0,
          //   } as PhongColor,
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   c: this.vAdd(pgP, pgU),
          //   r: 0.1,
          //   material: {
          //     color: { x: 0.7, y: 0.7, z: 0.7 } as vec3,
          //     reflectivity: 0,
          //   } as PhongColor,
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   c: this.vAdd(pgP, pgV),
          //   r: 0.1,
          //   material: {
          //     color: { x: 0.7, y: 0.7, z: 0.7 } as vec3,
          //     reflectivity: 0,
          //   } as PhongColor,
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   c: { x: 4.5, y: 1, z: -0.3 } as vec3,
          //   r: 0.7,
          //   material: {
          //     color: { x: 0.7, y: 0.7, z: 0.7 } as vec3,
          //     reflectivity: 0.7,
          //   } as PhongColor,
          // } as Sphere,
          {
            type: 'parallelogram',
            material: textureScene0,
            p: pgP,
            // p: { x: 0.5, y: 2, z: -1 } as vec3,
            u: pgU,
            v: pgV,
          } as Parallelogram,
          {
            type: 'parallelogram',
            material: textureScene1,
            p: pgP2,
            // p: { x: 0.5, y: 2, z: -1 } as vec3,
            u: pgU2,
            v: pgV2,
          } as Parallelogram,
          // {
          //   type: 'parallelogram',
          //   material: matteB,
          //   p: { x: 0, y: 0, z: 0 } as vec3,
          //   // p: { x: 0.5, y: 2, z: -1 } as vec3,
          //   u: { x: 2, y: 1, z: 0 } as vec3,
          //   v: { x: -0.5, y: 1, z: 3.5 } as vec3,
          // } as Parallelogram,
          // {
          //   type: 'parallelogram',
          //   material: matteB,
          //   p: { x: 0, y: -1, z: 0 } as vec3,
          //   // p: { x: 0.5, y: 2, z: -1 } as vec3,
          //   u: { x: 2, y: 1, z: 0 } as vec3,
          //   v: { x: 1, y: 2, z: 1 } as vec3,
          // } as Parallelogram,
          {
            type: 'plane',
            p: { x: 0, y: 0, z: -1 } as vec3,
            n: { x: 0, y: 0, z: 1 } as vec3,
            material: mirrorA,
          } as Plane,
          {
            type: 'plane',
            p: { x: 0, y: 8, z: 0 } as vec3,
            n: { x: 0, y: -1, z: 0 } as vec3,
            material: matteA,
          } as Plane,
          {
            type: 'plane',
            p: { x: 9, y: 0, z: 0 } as vec3,
            n: { x: -1, y: 0, z: 0 } as vec3,
            material: matteB,
          } as Plane,
          // {
          //   type: 'tube',
          //   material: matteC,
          //   p: { x: 8, y: 8.5, z: -1 } as vec3,
          //   d: this.norm({ x: -1, y: 0, z: 1 } as vec3),
          //   r: 1,
          // } as Tube,
          // {
          //   type: 'tube',
          //   material: matteC,
          //   p: { x: 2, y: 8.5, z: -1 } as vec3,
          //   d: this.norm({ x: -1, y: 0, z: 1 } as vec3),
          //   r: 1,
          // } as Tube,
          // {
          //   type: 'tube',
          //   material: matteC,
          //   p: { x: -4, y: 8.5, z: -1 } as vec3,
          //   d: this.norm({ x: -1, y: 0, z: 1 } as vec3),
          //   r: 1,
          // } as Tube,
          // {
          //   type: 'sphere',
          //   c: { x: 1, y: 3, z: -0.8 } as vec3,
          //   r: 0.2,
          //   material: sampleMaterialA,
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   c: { x: 3, y: 3, z: -0.8 } as vec3,
          //   r: 0.2 as number,
          //   material: sampleMaterialA,
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   c: { x: 3, y: 3, z: 0.8 } as vec3,
          //   r: 0.2 as number,
          //   material: sampleMaterialA,
          // } as Sphere,
          // {
          //   type: 'cylinder',
          //   material: sampleMaterialA,
          //   p0: { x: 1, y: 3, z: -0.8 } as vec3,
          //   p1: { x: 3, y: 3, z: -0.8 } as vec3,
          //   r: 0.2,
          // } as Cylinder,
          // {
          //   type: 'cylinder',
          //   material: sampleMaterialA,
          //   p0: { x: 3, y: 3, z: -0.8 } as vec3,
          //   p1: { x: 3, y: 3, z: 0.8 } as vec3,
          //   r: 0.2,
          // } as Cylinder,
          // {
          //   type: 'cylinder',
          //   material: sampleMaterialA,
          //   p0: { x: 1, y: 3, z: -0.8 } as vec3,
          //   p1: { x: 3, y: 3, z: 0.8 } as vec3,
          //   r: 0.2,
          // } as Cylinder,
          // {
          //   type: 'triangle',
          //   material: sampleMaterialA,
          //   v0: { x: 1, y: 2.8, z: -0.8 } as vec3,
          //   v1: { x: 3, y: 2.8, z: -0.8 } as vec3,
          //   v2: { x: 3, y: 2.8, z: 0.8 } as vec3,
          // } as Triangle,
          // {
          //   type: 'sphere',
          //   c: { x: 2, y: 3.5, z: 0.5 } as vec3,
          //   r: 0.5 as number,
          //   material: {
          //     color: { x: 0, y: 0, z: 1 } as vec3,
          //   } as PhongColor,
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   c: { x: 3, y: 2, z: 0 } as vec3,
          //   r: 1 as number,
          //   material: {
          //     color: { x: 0, y: 0.8, z: 1 } as vec3,
          //     kd: 0.2,
          //     // n: 100
          //   } as PhongColor,
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   c: { x: 1, y: 3, z: -1 } as vec3,
          //   r: 0.75 as number,
          //   material: {
          //     color: { x: 0, y: 0.4, z: 0.1 } as vec3,
          //   } as PhongColor,
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   c: { x: 0, y: 3, z: 1 } as vec3,
          //   r: 0.4 as number,
          //   material: {
          //     color: { x: 1, y: 0.4, z: 0.1 } as vec3,
          //   } as PhongColor,
          // } as Sphere,
          // {
          //   type: 'plane',
          //   p: { x: 0, y: 0, z: -1 } as vec3,
          //   n: { x: 0, y: 0, z: 1 } as vec3,
          //   material: {
          //     color: { x: 1, y: 1, z: 1 } as vec3,
          //     kd: 0.1,
          //     reflectivity: 0.5,
          //   } as PhongColor,
          // } as Plane,
          // {
          //   type: 'plane',
          //   p: { x: 4, y: 0, z: 0 } as vec3,
          //   n: { x: -1, y: 0, z: 0 } as vec3,
          //   material: {
          //     color: { x: 0, y: 1, z: 0 } as vec3,
          //     reflectivity: 0,
          //   } as PhongColor,
          // } as Plane,
          // {
          //   type: 'plane',
          //   p: { x: -4, y: 0, z: 0 } as vec3,
          //   n: this.norm({ x: 1, y: 0, z: 1 } as vec3),
          //   material: {
          //     color: { x: 0, y: 1, z: 0.6 } as vec3,
          //     reflectivity: 0,
          //   } as PhongColor,
          // } as Plane,
          // {
          //   type: 'plane',
          //   p: { x: 0, y: 10, z: 0 } as vec3,
          //   n: { x: 0, y: -1, z: 0 } as vec3,
          //   material: {
          //     color: { x: 0.5, y: 0.7, z: 0.8 } as vec3,
          //     reflectivity: 0,
          //   } as PhongColor,
          // } as Plane,
          // {
          //   type: 'triangle',
          //   material: {
          //     color: { x: 1, y: 0, z: 0 } as vec3,
          //   } as PhongColor,
          //   v0: { x: 1, y: 2, z: -1 } as vec3,
          //   v1: { x: 0, y: 2, z: -0.5 } as vec3,
          //   v2: { x: 1, y: 1.5, z: -1 } as vec3,
          // } as Triangle,
          // {
          //   type: 'triangle',
          //   material: {
          //     color: { x: 1, y: 0, z: 0 } as vec3,
          //   } as PhongColor,
          //   v0: { x: 1, y: 1.5, z: -1 } as vec3,
          //   v1: { x: 0, y: 2, z: -0.5 } as vec3,
          //   v2: { x: 0, y: 1.5, z: -0.5 } as vec3,
          // } as Triangle,
          // {
          //   type: 'triangle',
          //   material: {
          //     color: { x: 1, y: 0, z: 0 } as vec3,
          //   } as PhongColor,
          //   v0: { x: 1, y: 1.5, z: -1 } as vec3,
          //   v1: { x: 0, y: 1.5, z: -0.5 } as vec3,
          //   v2: { x: 0, y: 1.5, z: -1 } as vec3,
          // } as Triangle,
          // {
          //   type: 'triangle',
          //   material: {
          //     color: { x: 1, y: 0, z: 0 } as vec3,
          //   } as PhongColor,
          //   v0: { x: 1, y: 2, z: -1 } as vec3,
          //   v1: { x: 0, y: 2, z: -0.5 } as vec3,
          //   v2: { x: 0, y: 2, z: -1 } as vec3,
          // } as Triangle,
          // {
          //   type: 'tube',
          //   material: {
          //     color: { x: 1, y: 1, z: 0 } as vec3,
          //   } as PhongColor,
          //   p: { x: -1.5, y: 3, z: -1 } as vec3,
          //   d: this.norm({ x: 2, y: 1.5, z: 2 } as vec3),
          //   r: 0.4,
          // } as Tube,
          // {
          //   type: 'cylinder',
          //   material: {
          //     color: { x: 0.4, y: 0.8, z: 0.6 } as vec3,
          //   } as PhongColor,
          //   p0: { x: 1.85, y: 1.6, z: -0.53 } as vec3,
          //   p1: { x: 1.75, y: 1.5, z: -0.48 } as vec3,
          //   r: 0.5,
          // } as Cylinder,
        ] as Item[],
        compoundItems: [
          // {
          //   type: 'polygon',
          //   material: matteA,
          //   vertices: [
          //     { x: 3.5, y: 2.5, z: -1 } as vec3,
          //     { x: 5.5, y: 2, z: -1 } as vec3,
          //     { x: 6, y: 2.5, z: 2 } as vec3,
          //     { x: 4, y: 3, z: 2 } as vec3,
          //   ]
          // } as Polygon,
          // {
          //   type: 'polygon',
          //   material: matteA,
          //   vertices: [
          //     { x: -1, y: 7, z: -1 } as vec3,
          //     { x: 7, y: 7, z: -1 } as vec3,
          //     { x: 7, y: 7, z: 4 } as vec3,
          //     { x: -1, y: 7, z: 4 } as vec3,
          //   ]
          // } as Polygon,
          // {
          //   type: 'polygon',
          //   material: matteA,
          //   vertices: [
          //     { x: 7, y: 7, z: -1 } as vec3,
          //     { x: 7, y: 0, z: -1 } as vec3,
          //     { x: 7, y: 0, z: 4 } as vec3,
          //     { x: 7, y: 7, z: 4 } as vec3,
          //   ]
          // } as Polygon,
          // {
          //   type: 'smoothPolygon',
          //   material: sampleMaterialB,
          //   vertices: [
          //     { x: 0.2, y: 4.8, z: -1 } as vec3,
          //     { x: 1.8, y: 4.8, z: -1 } as vec3,
          //     { x: 1.8, y: 2.2, z: -1 } as vec3,
          //     { x: 0.2, y: 2.2, z: -1 } as vec3,
          //   ],
          //   r: 0.2,
          // } as SmoothPolygon,
          // {
          //   type: 'smoothPolygon',
          //   material: sampleMaterialA,
          //   vertices: [
          //     { x: 2.2, y: 4.8, z: -1 } as vec3,
          //     { x: 4.8, y: 4.8, z: -1 } as vec3,
          //     { x: 4.8, y: 2.2, z: -1 } as vec3,
          //     { x: 2.2, y: 2.2, z: -1 } as vec3,
          //   ],
          //   r: 0.2,
          // } as SmoothPolygon,
          // {
          //   type: 'smoothPolygon',
          //   material: sampleMaterialC,
          //   vertices: [
          //     { x: 0.2, y: 1.8, z: -1 } as vec3,
          //     { x: 4.8, y: 1.8, z: -1 } as vec3,
          //     { x: 4.8, y: 1.2, z: -1 } as vec3,
          //     { x: 0.2, y: 1.2, z: -1 } as vec3,
          //   ],
          //   r: 0.2,
          // } as SmoothPolygon,
        ] as Item[],
        lights: [
          // {
          //   p: { x: 1.5, y: 1, z: 2.5 } as vec3,
          //   C: 30
          // } as Light,
          // {
          //   p: { x: 3, y: 0.5, z: -0.9 } as vec3,
          //   C: 0.75
          // } as Light,
          {
            p: { x: 0, y: 0, z: 5 } as vec3,
            C: 100
          } as Light,
          {
            p: { x: 5, y: 0, z: 3 } as vec3,
            C: 30
          } as Light,
        ] as Light[],
      },
      // 3: checkerboard & sphere
      {
        camera: {
          pos: { x: 2, y: 0.45, z: 1 } as vec3,//origin
          dir: this.norm({ x: 0, y: 1, z: -0.25 } as vec3),
          up: { x: 0, y: 0, z: 1 } as vec3,
          fov: [Math.PI / 3.4, Math.PI / 6] as number[],
          settings: this.canvasSettings,
        } as Camera,
        A: 0.5,
        voidColor: { x: 0.7, y: 0.8, z: 1 } as vec3,
        items: [
          {
            type: 'parallelogram',
            material: {
              color: { x: 1, y: 0, z: 1 } as vec3,
              reflectivity: 0.1,
              image: imgB,
            } as PhongColor,
            p: { x: 0, y: 2, z: 0 } as vec3,
            u: { x: 4, y: 0, z: 0 } as vec3,
            v: { x: 0, y: 4, z: 0 } as vec3,
          } as Parallelogram,
          {
            type: 'parallelogram',
            material: {
              color: { x: 0.4, y: 0.3, z: 0 } as vec3,
              kd: 0.4,
              reflectivity: 0.1,
            } as PhongColor,
            p: { x: 0, y: 2, z: -1 } as vec3,
            u: { x: 4, y: 0, z: 0 } as vec3,
            v: { x: 0, y: 0, z: 1 } as vec3,
          } as Parallelogram,
          {
            type: 'sphere',
            material: glassSphere,
            c: { x: 1.25, y: 2.75, z: 0.4 } as vec3,
            r: 0.4
          } as Sphere,
          {
            type: 'cylinder',
            material: matteC,
            p0: { x: 3.25, y: 2.25, z: 0.6 } as vec3,
            p1: { x: 3.25, y: 2.25, z: 0 } as vec3,
            r: 0.15
          } as Cylinder,
        ] as Item[],
        compoundItems: [] as Item[],
        lights: [
          {
            p: { x: -0.5, y: 0.5, z: 8 } as vec3,
            C: 300
          } as Light,
        ] as Light[],
      },
      // 4: null volumes practice
      {
        camera: {
          // main cylinder
          pos: { x: 3, y: -0.75, z: 1.75 } as vec3,
          dir: this.norm({ x: -0.75, y: 1.5, z: -1.5 } as vec3),
          // cylinders front
          // pos: { x: 2, y: -1.65, z: 0.75 } as vec3,
          // dir: this.norm({ x: 0, y: 1, z: 0 } as vec3),
          // cylinders back
          // pos: { x: 4.24, y: 4.76, z: 2 } as vec3,
          // dir: this.norm({ x: -0.72, y: -0.83, z: -0.51 } as vec3),
          // cylinder end bug view
          // pos: { x: 2.24, y: 2.76, z: 0.78 } as vec3,
          // dir: this.norm({ x: -0.52, y: -0.83, z: -0.21 } as vec3),
          up: { x: 0, y: 0, z: 1 } as vec3,
          fov: [Math.PI / 3.4, Math.PI / 6] as number[],
          settings: this.canvasSettings,
        } as Camera,
        A: 0.5,
        voidColor: { x: 0.7, y: 0.8, z: 1 } as vec3,
        items: [
          {
            type: 'parallelogram',
            material: {
              color: { x: 1, y: 0, z: 1 } as vec3,
              reflectivity: 0.1,
              image: imgB,
            } as PhongColor,
            p: { x: 0, y: 0, z: 0 } as vec3,
            u: { x: 4, y: 0, z: 0 } as vec3,
            v: { x: 0, y: 4, z: 0 } as vec3,
          } as Parallelogram,
          {
            type: 'parallelogram',
            material: {
              color: { x: 0.4, y: 0.3, z: 0 } as vec3,
              kd: 0.4,
              reflectivity: 0.1,
            } as PhongColor,
            p: { x: 0, y: 0, z: -3 } as vec3,
            u: { x: 4, y: 0, z: 0 } as vec3,
            v: { x: 0, y: 0, z: 3 } as vec3,
          } as Parallelogram,
          // {
          //   type: 'cylinder',
          //   material: sampleMaterialB,
          //   p0: { x: 0, y: 0.5, z: 0.25 } as vec3,
          //   p1: { x: 0, y: 1.5, z: 0.25 } as vec3,
          //   r: 0.25
          // } as Cylinder,
          // {
          //   type: 'cylinder',
          //   material: sampleMaterialB,
          //   p0: { x: 2, y: 0.5, z: 0.5 } as vec3,
          //   p1: { x: 2, y: 1.5, z: 0.5 } as vec3,
          //   r: 0.5
          // } as Cylinder,
          // {
          //   type: 'cylinder',
          //   material: sampleMaterialB,
          //   p0: { x: 4, y: 0.5, z: 0.75 } as vec3,
          //   p1: { x: 4, y: 1.5, z: 0.75 } as vec3,
          //   r: 0.75
          // } as Cylinder,
          // {
          //   type: 'sphere',
          //   material: matteD,
          //   c: { x: 0, y: 1.5, z: 0.25 } as vec3,
          //   r: 0.2
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   material: matteD,
          //   c: { x: 2, y: 1.5, z: 0.5 } as vec3,
          //   r: 0.2
          // } as Sphere,
          // {
          //   type: 'sphere',
          //   material: matteD,
          //   c: { x: 4, y: 1.5, z: 0.75 } as vec3,
          //   r: 0.2
          // } as Sphere,
          // {
          //   type: 'tube',
          //   material: matteC,
          //   p: { x: 0, y: 3, z: 0 } as vec3,
          //   d: { x: 1, y: 0, z: 0 } as vec3,
          //   r: 0.25
          // } as Tube,
          // {// cylinder null volume
          //   type: 'sphere',
          //   material: matteD,
          //   c: { x: 2, y: 0.75, z: 1 } as vec3,
          //   r: 0.4
          // } as Sphere,
          {
            type: 'cylinder',
            material: sampleMaterialB,
            p0: { x: 2, y: 0.75, z: 0 } as vec3,
            p1: { x: 2, y: 0.75, z: 1 } as vec3,
            r: 0.6,
            nullVolumes: [
              {
                type: 'sphere',
                material: matteD,
                c: { x: 2, y: 0.75, z: 1 } as vec3,
                r: 0.4
              } as Sphere,
              {
                type: 'tube',
                material: matteD,
                p: { x: 2, y: 0.75, z: 0.5 } as vec3,
                d: { x: 0, y: 1, z: 0 } as vec3,
                r: 0.3
              } as Tube,
            ]
          } as Cylinder,
        ] as Item[],
        compoundItems: [] as Item[],
        lights: [
          {
            p: { x: 0.5, y: -1, z: 8 } as vec3,
            C: 300
          } as Light,
        ] as Light[],
      },
    ]

    this.allScenes.forEach((scene: Scene, idx: number) => scene.compoundItems.forEach((i: Item) => this.unpackCompound(i, idx)))

    this.allScenes.forEach((scene: Scene) => {
      // set default camera settings
      if (this.doGlobalCameraSettings || scene.camera.settings.pxRows === undefined) {
        scene.camera.settings.pxRows = this.canvasSettings.pxRows
      }
      if (this.doGlobalCameraSettings || scene.camera.settings.pxCols === undefined) {
        scene.camera.settings.pxCols = this.canvasSettings.pxCols
      }
      if (this.doGlobalCameraSettings || scene.camera.settings.reflectLimit === undefined) {
        scene.camera.settings.reflectLimit = this.canvasSettings.reflectLimit
      }
      if (this.doGlobalCameraSettings || scene.camera.settings.refractLimit === undefined) {
        scene.camera.settings.refractLimit = this.canvasSettings.refractLimit
      }
      if (this.doGlobalCameraSettings || scene.camera.settings.superSampleLvl === undefined) {
        scene.camera.settings.superSampleLvl = this.canvasSettings.superSampleLvl
      }

      scene.camera.image = [[{ x: 1, y: 1, z: 0 } as vec3]]

      // set default material values
      scene.items.forEach((i: Item) => {
        if (i.material.ka === undefined) {
          i.material.ka = 0.5
        }
        if (i.material.kd === undefined) {
          i.material.kd = 0.2
        }
        if (i.material.ks === undefined) {
          i.material.ks = 0.1
        }
        if (i.material.n === undefined) {
          i.material.n = 50
        }
        if (i.material.reflectivity === undefined) {
          i.material.reflectivity = 0.1
        }
      })
    })

    this.$nextTick(() => {
      // bind vueCanvas to canvas element
      let c = document.getElementById("c") as HTMLCanvasElement
      let ctx = c.getContext("2d");
      if (ctx !== null) {
        this.vueCanvas = ctx;
        this.generateCanvasImage()
      }
    })
  },
  computed: {
    // totalRuntime() : null | string {
    //   return this.getRuntime(this.startTime, this.endTime)
    // },
    getWidthInfo() : string {
      return window.innerWidth < this.canvasWidth ? 'max-width:' + this.canvasWidth + 'px;' : ''
    },
    canvasWidth() : number {
      return this.canvasSettingsControl.size * 300
    },
    canvasHeight() : number {
      return this.canvasSettingsControl.size * 150
    },
    canvasSettings() : ImageSettings {
      return {
        pxRows: this.canvasHeight,
        pxCols: this.canvasWidth,
        reflectLimit: 3,
        // refractLimit: 3,
        superSampleLvl: 1,
      } as ImageSettings
    },
    // loading() : boolean {
    //   console.log('loading aaa')
    //   if (this.captureTimes.length === 0) {
    //     return true
    //   }
    //   let currentSceneShown = this.captureTimes[this.captureTimes.length - 1] as TimingData
    //   console.log('loading zzz')
    //   return this.mainSceneIdx !== currentSceneShown.sceneIdx
    // },
  },
  beforeRouteLeave() {
    console.log('leaving route; removing keyboard listener')
    window.removeEventListener('keydown', this.keyboardResponder)
  },
  methods: {
    // getRuntime(start: null | moment.Moment, end: null | moment.Moment) : null | string {
    //   return (start && end) ? end.diff(start, 'seconds', true).toFixed(1) : null
    // },
    keyboardResponder(e: KeyboardEvent) {
      if (e.key === 'W') {
        this.move('up')
      }
      else if (e.key === 'S') {
        this.move('down')
      }
      else if (e.key === 'w') {
        this.move('forward')
      }
      else if (e.key === 's') {
        this.move('back')
      }
      else if (e.key === 'a') {
        this.move('left')
      }
      else if (e.key === 'd') {
        this.move('right')
      }
      else if (e.key === 'l') {
        let scene = this.allScenes[this.mainSceneIdx]
        console.log('Camera pos: ' + this.vec3ToStr(scene.camera.pos))
        console.log('Camera dir: ' + this.vec3ToStr(scene.camera.dir))
      }
      // else if (e.key === 'b') {
      //   this.blurCross()
      // }
      // else if (e.key === 'g') {
      //   this.cMat = this.get3dFrom2d(this.getGrayscale(this.cMat))
      //   this.refreshCanvas()
      // }
      // else if (e.key === 'e') {
      //   this.cMat = this.get3dFrom2d(this.getEdgeMap(this.cMat))
      //   this.refreshCanvas()
      // }
      // else if (e.key === 'B') {
      //   this.blurCross(this.getEdgeMap(this.cMat))
      // }
      // else if (e.key === 'c') {
      //   console.log('Capturing...')
      //   this.generateCanvasImage()
      //   console.log('Done.')
      // }
    },
    createKeydownListener() {
      // create keydown event listener (removing the  old one doesn't work rn :/)
      window.removeEventListener('keydown', this.keyboardResponder)
      window.addEventListener('keydown', this.keyboardResponder)
    },
    move(dir: string) {
      console.log('Moving ' + dir)
      let scene = this.allScenes[this.mainSceneIdx]
      if (dir === 'forward') {
        this.allScenes[this.mainSceneIdx].camera.pos = this.vAdd(scene.camera.pos, scene.camera.dir)
      }
      else if (dir === 'back') {
        this.allScenes[this.mainSceneIdx].camera.pos = this.vSubtract(scene.camera.pos, scene.camera.dir)
      }
      else if (dir === 'left') {
        this.allScenes[this.mainSceneIdx].camera.pos = this.vAdd(
          scene.camera.pos,
          this.vCross(scene.camera.up, scene.camera.dir)
        )
      }
      else if (dir === 'right') {
        this.allScenes[this.mainSceneIdx].camera.pos = this.vSubtract(
          scene.camera.pos,
          this.vCross(scene.camera.up, scene.camera.dir)
        )
      }
      else if (dir === 'up') {
        this.allScenes[this.mainSceneIdx].camera.pos = this.vAdd(scene.camera.pos, scene.camera.up)
      }
      else if (dir === 'down') {
        this.allScenes[this.mainSceneIdx].camera.pos = this.vSubtract(scene.camera.pos, scene.camera.up)
      }
      this.generateCanvasImage()
    },
    look(evt: MouseEvent) {
      let canvas = document.getElementById("c")
      if (canvas) {
        let rect = canvas.getBoundingClientRect()
        let x = evt.clientX - rect.left - 1
        let y = evt.clientY - rect.top - 1
        if (x >= 0 && x < this.canvasWidth && y >= 0 && y < this.canvasHeight) {
          let scene = this.allScenes[this.mainSceneIdx]
          let cameraLeft = this.vCross(scene.camera.up, scene.camera.dir)
          let screenWidth = 2 * Math.tan(scene.camera.fov[0])
          let screenHeight = 2 * Math.tan(scene.camera.fov[1])
          let pxWidth = screenWidth / this.canvasWidth
          let pxHeight = screenHeight / this.canvasHeight
          let pxYaw = pxWidth * (this.canvasWidth / 2 - x - 0.5)
          let pxPitch = pxHeight * (this.canvasHeight / 2 - y - 0.5)

          let targetDir = this.norm(
            this.vAdd(
              scene.camera.dir,
              this.vScale(scene.camera.up, pxPitch),
              this.vScale(cameraLeft, pxYaw)
            )
          )
          scene.camera.dir = targetDir
          // console.log(`zzz capturing ${this.mainSceneIdx}`)
          this.capture(this.mainSceneIdx)
          this.refreshCanvas()
        }
      }
    },
    vScale(v: vec3, n: number) : vec3 {
      return {
        x: n * v.x,
        y: n * v.y,
        z: n * v.z
      } as vec3
    },
    vAdd(...allVecs: vec3[]) : vec3 {
      return allVecs.reduce((prev: vec3, curr: vec3) : vec3 => {
        return {
          x: prev.x + curr.x,
          y: prev.y + curr.y,
          z: prev.z + curr.z
        } as vec3
      })
    },
    vSubtract(a: vec3, b: vec3) : vec3 {
      return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
      } as vec3
    },
    vDot(a: vec3, b: vec3) : number {
      return (a.x * b.x) + (a.y * b.y) + (a.z * b.z)
    },
    vCross(a: vec3, b: vec3) : vec3 {
      return {
        x: (a.y * b.z) - (b.y * a.z),
        y: (b.x * a.z) - (a.x * b.z),
        z: (a.x * b.y) - (b.x * a.y),
      } as vec3
    },
    magnitude(v: vec3) : number {
      return Math.sqrt(this.vDot(v, v))
    },
    norm(v: vec3) : vec3 {
      let mag = this.magnitude(v)
      return this.vScale(v, 1 / mag)
    },
    refreshCanvas() {
      let img = this.allScenes[this.mainSceneIdx].camera.image
      let imgPxRows = img.length
      let imgPxCols = img.length > 0 ? img[0].length : 0
      // console.log(`img:`)
      // console.log(img)
      // let imgPxRows = this.cMat.length
      // let imgPxCols = this.cMat.length > 0 ? this.cMat[0].length : 0
      let pxWidth = this.canvasWidth / imgPxCols
      let pxHeight = this.canvasHeight / imgPxRows
      // console.log(`imgPxRows: ${imgPxRows}`)
      // console.log(`imgPxCols: ${imgPxCols}`)
      // console.log(`pxWidth: ${pxWidth}`)
      // console.log(`pxHeight: ${pxHeight}`)
      // console.log(this.vueCanvas)
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
      // console.log(this.vueCanvas)
    },
    getAvgColor(colors: vec3[]) : vec3 {
      return this.vScale(
        this.vAdd(...colors),
        1 / colors.length
      )
    },
    solveQuadratic(a: number, b: number, c: number) : number[] {
      let a2 = a * 2
      let determinant = b * b - 2 * a2 * c
      if (determinant >= 0) {
        let sqDet = Math.sqrt(determinant)
        return [(-b + sqDet) / a2, (-b - sqDet) / a2]
      }
      else {
        return []
      }
    },
    getUV(pg: Parallelogram, p: vec3) : number[] {
      p = this.vSubtract(p, pg.p)

      // decide which dimension to drop in calculations
      let noX = pg.u.x === 0 && pg.v.x === 0
      let noY = pg.u.y === 0 && pg.v.y === 0

      let a = noX ? pg.u.y : pg.u.x
      let b = noX ? pg.v.y : pg.v.x
      let c = (noX || noY) ? pg.u.z : pg.u.y
      let d = (noX || noY) ? pg.v.z : pg.v.y
      let p1 = noX ? p.y : p.x
      let p2 = (noX || noY) ? p.z : p.y

      // calculate u & v coefficients
      let invDet = 1 / (a * d - b * c)
      let alpha = (d * p1 - b * p2) * invDet
      let beta = (a * p2 - c * p1) * invDet

      return [alpha, beta]
    },
    getRayPoint(ray: Ray, t: number) : vec3 {
      return this.vAdd(
        ray.o,
        this.vScale(ray.dir, t)
      )
    },
    getNormal(item: Item, p: vec3 = { x: 0, y: 0, z: 0 }) : vec3 {
      let n = { x: 0, y: 0, z: 0 } as vec3
      if (item.type === 'plane') {
        let plane = item as Plane
        n = plane.n
      }
      else if (item.type === 'triangle') {
        let triangle = item as Triangle
        n = this.norm(this.vCross(
          this.vSubtract(triangle.v1, triangle.v0),
          this.vSubtract(triangle.v2, triangle.v0)
        ))
      }
      else if (item.type === 'circle') {
        let circle = item as Circle
        n = circle.n
      }
      else if (item.type === 'parallelogram') {
        let pg = item as Parallelogram
        n = this.norm(this.vCross(pg.u, pg.v))
      }
      else if (item.type === 'sphere') {
        let sphere = item as Sphere
        n = this.norm(this.vSubtract(p, sphere.c))
      }
      else if (item.type === 'tube') {
        let tube = item as Tube
        n = this.norm(
          this.vSubtract(
            p,
            this.vAdd(
              tube.p,
              this.vScale(
                tube.d,
                this.vDot(
                  tube.d,
                  this.vSubtract(p, tube.p)
                )
              )
            )
          )
        )
      }
      else if (item.type === 'cylinder') {
        let cylinder = item as Cylinder
        let d = this.norm(this.vSubtract(cylinder.p1, cylinder.p0))
        let qp = this.vAdd(
          cylinder.p0,
          this.vScale(
            d,
            this.vDot(
              d,
              this.vSubtract(p, cylinder.p0)
            )
          )
        )
        let p0QpDotD = this.vDot(
          this.vSubtract(qp, cylinder.p0),
          d
        )
        if (Math.abs(p0QpDotD) < 0.00001) {
          n = this.vScale(d, -1)
        }
        else {
          let p1QpDotNegD = this.vDot(
            this.vSubtract(qp, cylinder.p1),
            this.vScale(d, -1)
          )
          if (Math.abs(p1QpDotNegD) < 0.00001) {
            n = d
          }
          else {
            n = this.norm(this.vSubtract(p, qp))
          }
        }
      }
      return n
    },
    isInside(p: vec3, item: Item) : boolean {
      if (item.type === 'sphere') {
        let sphere = item as Sphere
        let dist = this.vSubtract(sphere.c, p)
        return this.magnitude(dist) <= sphere.r
        // return this.vDot(dist, dist) <= sphere.r * sphere.r//////////////////////////prolly use this tho it won't matter on this small a scale
      }
      else if (item.type === 'tube') {
        // asdf
      }
      return false
    },
    intersect(ray: Ray, item: Item, isNullVolume = false) : null | number {
      // let t = null as null | number
      let ts = [] as number[]////////////////////////////////////////////////////////////////maybe make this just number[]?

      if (item.type === 'plane') {
        let plane = item as Plane
        let bottom = this.vDot(plane.n, ray.dir)
        if (bottom !== 0){
          let initialT = this.vDot(plane.n, this.vSubtract(plane.p, ray.o)) / bottom
          // t = initialT > 0 ? initialT : null////////////////////////////////////////////////do this for each shape
          ts = initialT > 0 ? [ initialT ] : []
        }
      }
      else if (item.type === 'triangle') {
        let triangle = item as Triangle
        let n = this.getNormal(item)
        let initialT = this.intersect(ray, { type: 'plane', p: triangle.v0, n: n } as Plane)
        if (initialT !== null) {
          let p = this.getRayPoint(ray, initialT)

          // determine if point is inside triangle
          let v0v1 = this.vSubtract(triangle.v1, triangle.v0)
          let v1v2 = this.vSubtract(triangle.v2, triangle.v1)
          let v2v0 = this.vSubtract(triangle.v0, triangle.v2)
          let v0v1Xv0p = this.vCross(
            v0v1,
            this.vSubtract(p, triangle.v0)
          )
          let v1v2Xv1p = this.vCross(
            v1v2,
            this.vSubtract(p, triangle.v1)
          )
          let v2v0Xv2p = this.vCross(
            v2v0,
            this.vSubtract(p, triangle.v2)
          )
          let isInside = this.vDot(n, v0v1Xv0p) >= 0 &&
                         this.vDot(n, v1v2Xv1p) >= 0 &&
                         this.vDot(n, v2v0Xv2p) >= 0
          
          // t = isInside ? initialT : null
          ts = isInside ? [ initialT ] : []
        }
      }
      else if (item.type === 'circle') {
        let circle = item as Circle
        // get intersection with plane
        let initialT = this.intersect(ray, { type: 'plane', p: circle.c, n: circle.n } as Plane)
        if (initialT !== null) {
          let p2c = this.vSubtract(this.getRayPoint(ray, initialT), circle.c)
          // t = this.vDot(p2c, p2c) <= circle.r * circle.r ? initialT : null
          ts = this.vDot(p2c, p2c) <= circle.r * circle.r ? [ initialT ] : []
        }
      }
      else if (item.type === 'parallelogram') {
        let pg = item as Parallelogram
        let n = this.getNormal(item)
        let initialT = this.intersect(ray, { type: 'plane', p: pg.p, n: n } as Plane)
        if (initialT !== null) {
          let p = this.getRayPoint(ray, initialT)

          // determine if point is inside parallelogram
          let uvCoeffs = this.getUV(pg, p)
          let alpha = uvCoeffs[0]
          let beta = uvCoeffs[1]

          let isInside = alpha >= 0 &&
                         alpha <= 1 &&
                         beta >= 0 &&
                         beta <= 1
          
          // t = isInside ? initialT : null
          ts = isInside ? [ initialT ] : []
        }
      }
      else if (item.type === 'sphere') {
        let sphere = item as Sphere
        let a = this.vDot(ray.dir, ray.dir)
        let b = 2 * this.vDot(
          ray.dir,
          this.vSubtract(ray.o, sphere.c)
        )
        let c = this.vDot(ray.o, ray.o) +
                this.vDot(sphere.c, sphere.c) -
                2 * this.vDot(ray.o, sphere.c) -
                sphere.r * sphere.r

        // let ts = this.solveQuadratic(a, b, c)
        ts = this.solveQuadratic(a, b, c)
        // if (ts !== null) {
        //   t = Math.min(...ts.filter(t => t > 0))
        // }
      }
      else if (item.type === 'tube') {
        let tube = item as Tube
        let alpha = this.vSubtract(
          ray.dir,
          this.vScale(
            tube.d,
            this.vDot(tube.d, ray.dir)
          )
        )
        let deltaO = this.vSubtract(ray.o, tube.p)
        let beta = this.vSubtract(
          deltaO,
          this.vScale(
            tube.d,
            this.vDot(tube.d, deltaO)
          )
        )
        let a = this.vDot(alpha, alpha)
        let b = 2 * this.vDot(alpha, beta)
        let c = this.vDot(beta, beta) - tube.r * tube.r

        // let ts = this.solveQuadratic(a, b, c)
        ts = this.solveQuadratic(a, b, c)
        // if (ts !== null) {
        //   t = Math.min(...ts.filter(t => t > 0))
        // }
      }
      else if (item.type === 'cylinder') {
        let cylinder = item as Cylinder
        let d = this.norm(this.vSubtract(cylinder.p1, cylinder.p0))

        // let potentialTs = [] as number[]
        ts = []/////////////////////////////////////////////////////////////////////////////////////////////////don't need this if ts: number[]
        let tubeT = this.intersect(ray, { type: 'tube', p: cylinder.p0, d: d, r: cylinder.r } as Tube)
        if (tubeT && tubeT > 0) {
          let p = this.vAdd(ray.o, this.vScale(ray.dir, tubeT))
          let qp = this.vAdd(
            cylinder.p0,
            this.vScale(
              d,
              this.vDot(
                d,
                this.vSubtract(p, cylinder.p0)
              )
            )
          )
          let p0QpDotD = this.vDot(
            this.vSubtract(qp, cylinder.p0),
            d
          )
          let p1QpDotNegD = this.vDot(
            this.vSubtract(qp, cylinder.p1),
            this.vScale(d, -1)
          )
          if (p0QpDotD >= 0 && p1QpDotNegD >= 0) {
            // ray is hitting side of cylinder
            // potentialTs.push(tubeT)
            ts.push(tubeT)
          }

          // check each end
          let end0 = {
            type: 'circle',
            c: cylinder.p0,
            n: this.vScale(d, -1),
            r: cylinder.r
          } as Circle
          let end1 = {
            type: 'circle',
            c: cylinder.p1,
            n: d,
            r: cylinder.r
          } as Circle
          let end0T = this.intersect(ray, end0)
          let end1T = this.intersect(ray, end1)
          if (end0T) {
            ts.push(end0T)
          }
          if (end1T) {
            ts.push(end1T)
          }
        }

        // if (potentialTs.length > 0) {
        //   t = Math.min(...potentialTs.filter((potentialT: number) => potentialT > 0))
        // }
      }

      // determine which t value is closest
      let t = null as null | number
      // if (ts !== null) {
      //   t = Math.min(...ts.filter(t => t > 0))
      // }
      ts = ts.filter(t => t > 0)
      if (ts.length === 0) {
        // no intersection
        return null
      }
      else if (!item.nullVolumes || item.nullVolumes.length === 0) {
        // normal intersection
        t = isNullVolume ? Math.max(...ts) : Math.min(...ts)
      }
      else {
        // intersection with null volumes
        if(this.doOut)console.log('Beginning NV check.')
        ts.sort()
        t = ts[0]
        let nullVolumes = item.nullVolumes as Item[]
        let doNullVolCheck = true as boolean
        while (doNullVolCheck) {
          if(this.doOut)console.log('Starting while loop')
          let p = this.getRayPoint(ray, t)
          if(this.doOut)console.log('t: ' + t.toFixed(2))
          if(this.doOut)console.log('p: ' + this.vec3ToStr(p))
          let maxNullVolT = null as null | number
          let maxNullVolIdx = null as null | number
          nullVolumes.forEach((nv: Item, idx: number) => {
            if(this.doOut)console.log('Testing NV ' + idx + ':')
            if(this.doOut)console.log(nv)
            if (this.isInside(p, nv)) {
              if(this.doOut)console.log('p is inside nv.')
              let nullVolT = this.intersect(ray, nv, true)
              if (nullVolT !== null) {
                if(this.doOut)console.log('nvT: ' + nullVolT.toFixed(2))
                ts = ts.filter(t => t > nullVolT!)
                if (ts.length === 0) {
                  return null
                }
                else if (maxNullVolT === null || maxNullVolT < nullVolT) {
                  if(this.doOut)console.log('asdf')
                  maxNullVolT = nullVolT
                  maxNullVolIdx = idx
                }
                if(this.doOut)console.log('asdf2')
              }
              else {if(this.doOut)console.log('!!! shouldn\'t be here')}
            }
          })
          if (ts.length > 0 && maxNullVolT !== null && maxNullVolIdx !== null) {
            if(this.doOut)console.log('setting t to ' + maxNullVolT)
            t = maxNullVolT
            nullVolumes.splice(maxNullVolIdx, 1)
            doNullVolCheck = (nullVolumes.length > 0)
          }
          else {
            if(this.doOut)console.log('No new nv intersections found')
            doNullVolCheck = false
          }
        }
        if(this.doOut)console.log('Final t = ' + t.toFixed(2))
      }

      return t ? (isFinite(t) ? t : null) : null
    },
    getColor(ray: Ray, sceneIdx = -1) : vec3 {
      sceneIdx = (sceneIdx === -1) ? this.mainSceneIdx : sceneIdx
      let scene = this.allScenes[sceneIdx]
      // cast into scene
      let minT = null as null | number
      let itemIdx = -1
      // let tMap = [] as { t: number, itemIdx: number }[]
      scene.items.forEach((item: Item, idx: number) => {
        // if (!item.isNullVolume) {
          let t = this.intersect(ray, item)
          if (t != null) {
            // tMap.push({ t: t, itemIdx: idx })
            if (minT === null || t < minT) {
              minT = t
              itemIdx = idx
            }
          }
        // }
      })
      // if (minT !== null) {
      //   tMap.sort((a, b) => b.t - a.t)/////////////////////////////////////////////// can use this to avoid looping thru all shapes again
      //   let potentialP = this.getRayPoint(ray, minT * 1.0001)
      //   scene.items.forEach((nullVol: Item, idx: number) => {
      //     if (nullVol.isNullVolume) {
      //       /////////////////////////////////////////////////// rn assuming no null volume overlap
      //       if (this.isInside(potentialP, nullVol)) {
      //         let continuedRay = ray
      //         continuedRay.o = potentialP
      //         let nullVolT = this.intersect(continuedRay, nullVol)
      //         let itemT = this.intersect(continuedRay, scene.items[itemIdx])
      //         if (nullVolT && itemT) {
      //           if (nullVolT <= itemT) {
      //             potentialP = this.getRayPoint(continuedRay, nullVolT)
      //           }
      //           else {

      //           }
      //         }
      //       }
      //     }
      //   })
      // }
      // scene.lights.forEach((light: Light) => {
      //   let lightShape = {
      //     type: 'sphere',
      //     c: light.p,
      //     r: 0.5
      //   } as Sphere
      //   let t = this.intersect(ray, lightShape)
      //   if (t != null && (minT === null || t < minT)) {
      //     minT = t
      //     itemIdx = -2
      //   }
      // })

      // get color
      let color = (itemIdx === -2 ? { x: 1, y: 1, z: 1 } : (scene.voidColor ? scene.voidColor : { x: 0, y: 0, z: 0 })) as vec3
      if (itemIdx >= 0 && minT !== null) {
        let p = this.getRayPoint(ray, minT)
        let item = scene.items[itemIdx]
        let N = this.getNormal(item, p)
        let E = this.norm(this.vSubtract(scene.camera.pos, p))

        //////////////////////////////////////////////////////////////////////////////////////////////////////
        // if(this.doOut && ray.reflectLvl === 0) {
        //   // console.log('reflectLvl: ' + ray.reflectLvl)
        //   console.log('p: ' + this.vec3ToStr(p))
        //   console.log('N: ' + this.vec3ToStr(N))
        // }
        //////////////////////////////////////////////////////////////////////////////////////////////////////

        // let I = Math.max(Math.abs(this.vDot(ray.dir, n)), 0.2)

        // ambient: ka*A
        let I = item.material.ka * scene.A
        
        let shadowP = this.getRayPoint(ray, minT * 0.9999)
        scene.lights.forEach((light: Light) => {
          // determine light or shadow
          let doLightCalculation = true
          let shadowP2L = this.vSubtract(light.p, shadowP)
          let shadowT = this.magnitude(shadowP2L)
          let shadowRay = {
            o: shadowP,
            dir: this.vScale(shadowP2L, 1 / shadowT)
          } as Ray

          for (let i = 0; i < scene.items.length; i++) {
            let shadowItem = scene.items[i]
            let itemT = this.intersect(shadowRay, shadowItem)
            if (itemT != null && itemT < shadowT) {
              doLightCalculation = false
              break
            }
          }
          
          if (doLightCalculation) {
            // diffuse: C*kd*max(0, dot(L, N))
            let p2L = this.vSubtract(light.p, p)
            let L = this.norm(p2L)
            let diffAndSpec= light.C * item.material.kd * Math.max(0, this.vDot(L, N))

            // specular: C*ks*max(0, dot(R, E)^n)
            let R = this.vSubtract(
              this.vScale(N, 2 * this.vDot(L, N)),
              L
            )
            diffAndSpec += light.C * item.material.ks * Math.max(0, this.vDot(R, E) ** item.material.n)

            // light falloff: 1/r^2
            I += diffAndSpec / (this.vDot(p2L, p2L))
          }
        })

        // color = scene.items[itemIdx].material.color // flat color
        // apply image pixel color if available
        let itemColor = item.material.color
        if (item.type === 'parallelogram' && (item.material.image || item.material.imgSrcSceneIdx != null)) {
          let img = item.material.imgSrcSceneIdx != null
                      ? this.allScenes[item.material.imgSrcSceneIdx].camera.image
                      : item.material.image ? item.material.image : [[{ x: 0, y: 1, z: 1 } as vec3]]
          let imgRows = img.length
          let imgCols = img[0].length
          let uvCoeffs = this.getUV(item as Parallelogram, p)
          let rowIdx = Math.min(Math.floor((1 - uvCoeffs[1]) * imgRows), imgRows - 1)
          let colIdx = Math.min(Math.floor(uvCoeffs[0] * imgCols), imgCols - 1)
          itemColor = img[rowIdx][colIdx]
        }
        let rayColor = this.vScale(itemColor, I)

        // get reflection
        let reflectedColor = rayColor
        if (ray.reflectLvl < scene.camera.settings.reflectLimit && item.material.reflectivity > 0) {
          // get color of reflected ray
          let reflectDir = this.vSubtract(
            this.vScale(N, 2 * this.vDot(E, N)),
            E
          )
          let newRay = {
            o: shadowP,
            dir: reflectDir,
            reflectLvl: ray.reflectLvl + 1,
            refractLvl: ray.refractLvl
          } as Ray

          reflectedColor = this.getColor(newRay, sceneIdx)
        }
        color = this.vAdd(
          this.vScale(rayColor, 1 - item.material.reflectivity),
          this.vScale(reflectedColor, item.material.reflectivity),
        )

        // get refraction////////////////////////////////////////////////////////////////////////////////// may want to not avg in rayColor at all?
        /////////////////////////////////////////////////////////////////////////////////////////////////// so if material.opacity < 1, color = avg(refl, refr)?
        /////////////////////////////////////////////////////////////////////////////////////////////////// for now, just avging refr in second for priority
        // if (ray.refractLvl < scene.camera.settings.refractLimit && item.material.opacity < 1) {
        //   // get color of refracted ray
        //   let refractDir = { x: 0, y: 0, z: -1 } as vec3///////////////////////////////////////// gotta figure out this formmula
        //   let newRay = {
        //     o: this.getRayPoint(ray, minT * 1.0001),
        //     dir: refractDir,
        //     reflectLvl: ray.reflectLvl,
        //     refractLvl: ray.refractLvl + 1
        //   } as Ray

        //   let refractedColor = this.getColor(newRay, sceneIdx)
        //   color = this.vAdd(
        //     this.vScale(color, item.material.opacity),
        //     this.vScale(refractedColor, 1 - item.material.opacity),
        //   )
        // }
      }

      return color
    },
    ///////////////////////////////////
    // printInfo(data: any): string {
    //   return `[${typeof(data)}] ${JSON.stringify(data)}`
    // },
    ///////////////////////////////////
    async generateCanvasImage() {
      // this.startTime = moment()

      // console.log('aaa')

      // first generate any images used by main scene
      let mainScene = this.allScenes[this.mainSceneIdx]
      let scenesNeeded = new Set<number>()
      mainScene.items.forEach((item: Item, idx) => {
        // console.log('bbb ' + idx)
        if (item.type === 'parallelogram' && item.material.imgSrcSceneIdx != null) {
          scenesNeeded.add(item.material.imgSrcSceneIdx)
        }
      })
      // console.log('ccc')
      this.subSceneCount = scenesNeeded.size
      scenesNeeded.forEach((sceneIdx: number) => {
        // console.log(`yyy${sceneIdx} capturing ${sceneIdx}`)
        this.capture(sceneIdx)
      })

      // console.log('ddd')

      // capture main scene
      // console.log(`xxx capturing ${this.mainSceneIdx}`)
      this.capture(this.mainSceneIdx)

      // console.log('eee')

      this.refreshCanvas()
      // this.endTime = moment()
      // console.log('fff')
    },
    capture(sceneIdx: number) {
      // console.log(`capture ${sceneIdx}: Start.`)
      let timingData = {} as TimingData
      // timingData.start = moment()
      // this.startTime = moment()
      // sceneIdx = (sceneIdx === -1) ? this.mainSceneIdx : sceneIdx
      let scene = this.allScenes[sceneIdx]
      if (this.doGlobalCameraSettings) {
        scene.camera.settings = this.canvasSettings
      }
      let scenePxRows = scene.camera.settings.pxRows
      let scenePxCols = scene.camera.settings.pxCols
      scene.camera.image = new Array(scenePxRows).fill(0).map(() => new Array(scenePxCols).fill({ x: 0, y: 1, z: 1 } as vec3)) as vec3[][];

      let camLeft = this.vCross(scene.camera.up, scene.camera.dir)
      let screenWidth = 2 * Math.tan(scene.camera.fov[0])
      let screenHeight = 2 * Math.tan(scene.camera.fov[1])
      let pxWidth = screenWidth / scenePxCols
      let pxHeight = screenHeight / scenePxRows
      for (let row = 0; row < scenePxRows; row++) {
        let pxPitch = pxHeight * (scenePxRows / 2 - row - 0.5)
        for (let col = 0; col < scenePxCols; col++) {
          ///////////////////////////////////////////////////////////
          // this.doOut = row === Math.floor(scenePxRows * 1 / 5) - 0 && col === Math.floor(scenePxCols * 7 / 16) - 0
          // if(this.doOut)console.log('row ' + row + ', col ' + col)
          ///////////////////////////////////////////////////////////

          let pxYaw = pxWidth * (scenePxCols / 2 - col - 0.5)
          let ssColors = [] as vec3[]
          // do supersampling to get cleaner image
          let ssLvl = scene.camera.settings.superSampleLvl
          for (let ssRow = 0; ssRow < ssLvl; ssRow++) {
            let ssPitch = (pxHeight / ssLvl) * (ssLvl / 2 - ssRow - 0.5)
            for (let ssCol = 0; ssCol < ssLvl; ssCol++) {
              let ssYaw = (pxWidth / ssLvl) * (ssLvl / 2 - ssCol - 0.5)

              // get ray
              let targetDir = this.norm(
                this.vAdd(
                  scene.camera.dir,
                  this.vScale(scene.camera.up, pxPitch + ssPitch),
                  this.vScale(camLeft, pxYaw + ssYaw)
                )
              )
              let ray = {
                o: scene.camera.pos,
                dir: targetDir,
                reflectLvl: 0,
                refractLvl: 0
              } as Ray

              // get color
              ssColors.push(this.getColor(ray, sceneIdx))
            }
          }

          // get average of color samples
          let color = this.getAvgColor(ssColors)

          if (this.doOut) {
            color = { x: 1, y: 0, z: 0 } as vec3
          }

          scene.camera.image[row][col] = color

          // this.cMat[row][col][0] = color.x
          // this.cMat[row][col][1] = color.y
          // this.cMat[row][col][2] = color.z
        }
      }

      // this.refreshCanvas()
      // this.endTime = moment()
      // timingData.end = moment()
      timingData.sceneIdx = sceneIdx
      timingData.sceneSettings = scene.camera.settings
      this.captureTimes.push(timingData)
      // console.log(`capture ${sceneIdx}: End.`)
    },
    unpackCompound(item: Item, sceneIdx = -1) {
      sceneIdx = (sceneIdx === -1) ? this.mainSceneIdx : sceneIdx
      if (item.type === 'polygon') {
        let polygon = item as Polygon
        let vertexCount = polygon.vertices.length
        for (let i = 2; i < vertexCount; i++) {
          // build face from triangles
          this.allScenes[sceneIdx].items.push({
            type: 'triangle',
            material: polygon.material,
            v0: polygon.vertices[0],
            v1: polygon.vertices[i - 1],
            v2: polygon.vertices[i],
          } as Triangle)
        }
      }
      else if (item.type === 'smoothPolygon') {
        let polygon = item as SmoothPolygon
        let vertexCount = polygon.vertices.length
        for (let i = 0; i < vertexCount; i++) {
          // vertices are spheres
          this.allScenes[sceneIdx].items.push({
            type: 'sphere',
            material: polygon.material,
            c: polygon.vertices[i],
            r: polygon.r,
          } as Sphere)

          // edges are cylinders
          this.allScenes[sceneIdx].items.push({
            type: 'cylinder',
            material: polygon.material,
            p0: polygon.vertices[i],
            p1: polygon.vertices[(i + 1 > vertexCount - 1) ? 0 : i + 1],
            r: polygon.r,
          } as Cylinder)

          // faces are multiple triangles
          if (i > 1) {
            let pair = [
              {
                type: 'triangle',
                material: polygon.material,
                v0: polygon.vertices[0],
                v1: polygon.vertices[i],
                v2: polygon.vertices[i - 1],
              } as Triangle,
              {
                type: 'triangle',
                material: polygon.material,
                v0: polygon.vertices[0],
                v1: polygon.vertices[i - 1],
                v2: polygon.vertices[i],
              } as Triangle
            ]
            for (let j = 0; j < 2; j++) {
              let shift = this.vScale(
                this.norm(
                  this.vCross(
                    this.vSubtract(pair[j].v2, pair[j].v0),
                    this.vSubtract(pair[j].v1, pair[j].v0)
                  )
                ),
                -polygon.r
              )
              pair[j].v0 = this.vAdd(pair[j].v0, shift)
              pair[j].v1 = this.vAdd(pair[j].v1, shift)
              pair[j].v2 = this.vAdd(pair[j].v2, shift)
              this.allScenes[sceneIdx].items.push(pair[j])
            }
          }
        }
      }
    },
    aAdd(a: number[], b: number[]) : number[] {
      return a.map((n: number, i: number) => n + b[i])
    },
    aScale(a: number[], b: number) : number[] {
      return a.map((n: number) => n * b)
    },
    getGrayscale(img: number[][][]) : number[][] {
      return img.map((row: number[][]) => {
        return row.map((px: number[]) => {
          return px[0] * 0.299 + px[1] * 0.587 + px[2] * 0.114
        })
      })
    },
    getEdgeMap(img: number[][][]) : number[][] {
      let grayImg = this.getGrayscale(img)
      let imgPxRows = grayImg.length
      let imgPxCols = grayImg.length > 0 ? grayImg[0].length : 0
      let edgeMap = new Array(imgPxRows).fill(0).map(() => new Array(imgPxCols).fill(0)) as number[][];
      for (let row = 0; row < imgPxRows; row++) {
        for (let col = 0; col < imgPxCols; col++) {
          let px = grayImg[row][col]
          let neighbors = [] as number[]
          // let isEdge = false
          if (row > 0) {
            neighbors.push(grayImg[row - 1][col])
          }
          if (row < imgPxRows - 1) {
            neighbors.push(grayImg[row + 1][col])
          }
          if (col > 0) {
            neighbors.push(grayImg[row][col - 1])
          }
          if (col < imgPxCols - 1) {
            neighbors.push(grayImg[row][col + 1])
          }

          neighbors.forEach((neighborPx: number) => {
            // edgeMap[row][col] += Math.abs(px - neighborPx) / neighbors.length
            // edgeMap[row][col] = Math.max(edgeMap[row][col], Math.abs(px - neighborPx))
            if (Math.abs(px - neighborPx) > 0.1) {
              edgeMap[row][col] = 1
            }
          })
        }
      }
      return edgeMap
    },
    blurCross(pxMask: null | number[][] = null) { ///////////////cMat is outdated
      let imgPxRows = this.cMat.length
      let imgPxCols = this.cMat.length > 0 ? this.cMat[0].length : 0
      for (let row = 0; row < imgPxRows; row++) {
        for (let col = 0; col < imgPxCols; col++) {
          if (pxMask === null || pxMask[row][col] === 1) {
            let pxCount = 3
            let colorSum = this.aScale(this.cMat[row][col], 3)
            if (row > 0) {
              colorSum = this.aAdd(colorSum, this.cMat[row - 1][col])
              pxCount++
            }
            if (row < imgPxRows - 1) {
              colorSum = this.aAdd(colorSum, this.cMat[row + 1][col])
              pxCount++
            }
            if (col > 0) {
              colorSum = this.aAdd(colorSum, this.cMat[row][col - 1])
              pxCount++
            }
            if (col < imgPxCols - 1) {
              colorSum = this.aAdd(colorSum, this.cMat[row][col + 1])
              pxCount++
            }

            let color = this.aScale(colorSum, 1 / pxCount)
            this.cMat[row][col] = color
          }
        }
      }

      this.refreshCanvas()
    },
    get3dFrom2d(grayImg: number[][]) : number[][][] {
      return grayImg.map((row: number[]) => {
        return row.map((px: number) => [px, px, px])
      })
    },
    vec3ToStr(v: vec3) : string {
      return '{ ' + v.x.toFixed(2) + ', ' + v.y.toFixed(2) + ', ' + v.z.toFixed(2) + ' }'
    },
  },
}
</script>

<style scoped>
</style>