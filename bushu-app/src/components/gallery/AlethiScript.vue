<template>
  <svg
    viewBox="0 0 80 12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="#888"
    /> -->
    <path
      :d="generatedPath"
      stroke="black"
      stroke-width="0.3"
      fill="none"
    />
    <!-- <path
      :d="
        'M 0 6 l 1 0' +
          getDiamond('s') +
          getDiamond('m') +
          getDiamond('l') +
          getRod('s') +
          getRod('m') +
          getRod('l') +
          getCrab('s') +
          getCrab('m') +
          getCrab('l') +
          getTick()
      "
      stroke="black"
      stroke-width="0.3"
      fill="none"
    /> -->
    <!-- getDiamond1('s') +
    getDiamond1('m') +
    getDiamond1('l') + -->
    <!-- <path
      d="
        M 0 6
        l 1 0

        c 3 0
          5 -4
          6 -6
        c -1 2
          -3 6
          0 6
        c -3 0
          -5 4
          -6 6
        c 1 -2
          3 -6
          0 -6
        l 6 0

        c 1 0
          3 -4
          4 -6
        l -6 12
        c 1 -2
          3 -6
          4 -6

        l 4 0
        c -3 0
          -1 -4
          0 -6
        l -6 12
        c 1 -2
          3 -6
          6 -6

        c 3 0
          5 -4
          6 -6
        l -6 12
        c 1 -2
          3 -6
          0 -6
        l 4 0

        c 2 0
          3 -2
          4 -4
        c -1.5 3
          2 0
          3 -2
        l -6 12
        c 1 -2
          0.5 -5
          -1 -2
        c 1 -2
          2 -4
          0 -4
        l 5 0

        c 0.16667 0
          0.5 -0.66667
          0.66667 -1
        l -1 2
        c 0.16667 -0.33333
          0.5 -1
          0.66667 -1

        l 2 0
      "
      stroke="black"
      stroke-width="0.3"
      fill="none"
    /> -->
  </svg>
</template>

<script lang="ts">
import Vue from 'vue'

const spacer = 0.5

const diamond = {
  W: [ 0, 0 ],
  w: [ 3, 0 ],
  N: [ 5, -6 ],
  n: [ 4.75, -5.25 ],
  E: [ 6, 0 ],
  e: [ 3, 0 ],
  S: [ 1, 6 ],
  s: [ 1.25, 5.25 ],
  span: [ 6, 0 ],
}

const arrow = {
  ...diamond,
  span: [ 3, 0 ],
}

const rod = {
  Start: [ 0, 0 ],
  start: [ 0.5, 0 ],
  N: [ 2.5, -6 ],
  n: [ 1, -1.5 ],
  S: [ -1.5, 6 ],
  s: [ 0, 1.5 ],
  End: [ 1, 0 ],
  end: [ 0.5, 0 ],
}

const crab = {
  Start: [ 0, 0 ],
  start: [ 1.5, 0 ],
  Up1: [ 2.66667, -3.5 ],
  up1: [ 2, -1.5 ],
  Up2: [ 5.5, -6 ],
  up2: [ 4.5, -3 ],
  Down2: [ 1.5, 6 ],
  down2: [ 2.5, 3 ],
  Down1: [ 0.33333, 3.5 ],
  down1: [ 1, 1.5 ],
  span: [ 4, 0 ],
}

export default Vue.extend({
  name: 'AlethiScript',
  props: {
    text: {
      type: String,
      default: 'stormlight',
    },
  },
  computed: {
    generatedPath(): string {
      let path = 'M 0 6 l 2 0'
      this.text.toLowerCase().split('').forEach((char: string) => {
        let charPath = this.charMap[char]
        if (charPath !== undefined) {
          path += charPath // + 'l ' + spacer + ' 0'
        }
      })
      path += 'l 2 0'
      return path
    },
    charMap(): { [ key: string]: string } {
      let blank = 'l 5 0'
      let tick = this.getTick()
      return {
        a: this.getRod('m'),
        b: this.getDiamond('m'),
        // c: replaced by k & s
        d: this.getLeftArrow('m'),
        e: this.getRod('l'),
        f: this.getDiamond('m') + tick + tick,
        g: this.getCrab('m'),
        h: this.getRightArrow('s') + tick,
        i: this.getRod('s') + tick,
        j: this.getCrab('m') + tick,
        k: this.getCrab('l'),
        l: this.getLeftArrow('s') + tick,
        m: this.getDiamond('s'),
        n: this.getRightArrow('s'),
        o: this.getRod('s'),
        p: this.getDiamond('l'),
        q: blank, // haven't seen one yet
        r: this.getLeftArrow('s'),
        s: this.getRightArrow('l'),
        t: this.getLeftArrow('l'),
        u: this.getRod('m') + tick + tick, // same as w
        v: this.getDiamond('s') + tick,
        w: this.getRod('m') + tick + tick, // same as u
        x: blank, // haven't seen one yet
        y: this.getCrab('s'),
        z: blank, // haven't seen one yet
        c: this.getCrab('m') + tick + tick, // ch
        7: this.getLeftArrow('m') + tick + tick, // th
        $: this.getRightArrow('m') + tick + tick, // sh
        ' ': 'l ' + spacer * 4 + ' 0',
      }
    },
  },
  methods: {
    vSub(a: number[], b: number[]): number[] {
      return [ a[0] - b[0], a[1] - b[1] ]
    },
    getScale(size: string): number {
      switch (size.toLowerCase()) {
        case ('s'):
          return 1.4 / 3
        case ('m'):
          return 2.2 / 3
        case ('l'):
          return 1
        case 'tick':
          return 1 / 6
        default:
          return 1
      }
    },
    getScaledCoords(coords: number[], size: string): string {
      let scale = this.getScale(size)
      return coords.map((n) => n * scale).join(' ')
    },
    getDiamond(size: string = 'l'): string {
      let arc1 = [
        this.vSub(diamond.w, diamond.W),
        this.vSub(diamond.n, diamond.W),
        this.vSub(diamond.N, diamond.W),
      ].flat()
      let arc2 = [
        this.vSub(diamond.n, diamond.N),
        this.vSub(diamond.e, diamond.N),
        this.vSub(diamond.E, diamond.N),
      ].flat()
      let arc3 = [
        this.vSub(diamond.e, diamond.E),
        this.vSub(diamond.s, diamond.E),
        this.vSub(diamond.S, diamond.E),
      ].flat()
      let arc4 = [
        this.vSub(diamond.s, diamond.S),
        this.vSub(diamond.w, diamond.S),
        this.vSub(diamond.W, diamond.S),
      ].flat()
      let line = this.vSub(diamond.E, diamond.W)

      return 'c ' + this.getScaledCoords(arc1, size) +
             'c ' + this.getScaledCoords(arc2, size) +
             'c ' + this.getScaledCoords(arc3, size) +
             'c ' + this.getScaledCoords(arc4, size) +
             'l ' + this.getScaledCoords(line, size)
    },
    getRightArrow(size: string = 'l'): string {
      let line1 = arrow.span
      let arc1 = [
        this.vSub(arrow.e, arrow.E),
        this.vSub(arrow.n, arrow.E),
        this.vSub(arrow.N, arrow.E),
      ].flat()
      let line2 = this.vSub(arrow.S, arrow.N)
      let arc2 = [
        this.vSub(arrow.s, arrow.S),
        this.vSub(arrow.e, arrow.S),
        this.vSub(arrow.E, arrow.S),
      ].flat()

      return 'l ' + spacer + ' 0' +
             'l ' + this.getScaledCoords(line1, size) +
             'c ' + this.getScaledCoords(arc1, size) +
             'l ' + this.getScaledCoords(line2, size) +
             'c ' + this.getScaledCoords(arc2, size)
    },
    getLeftArrow(size: string = 'l'): string {
      let arc1 = [
        this.vSub(arrow.w, arrow.W),
        this.vSub(arrow.n, arrow.W),
        this.vSub(arrow.N, arrow.W),
      ].flat()
      let line1 = this.vSub(arrow.S, arrow.N)
      let arc2 = [
        this.vSub(arrow.s, arrow.S),
        this.vSub(arrow.w, arrow.S),
        this.vSub(arrow.W, arrow.S),
      ].flat()
      let line2 = arrow.span

      return 'c ' + this.getScaledCoords(arc1, size) +
             'l ' + this.getScaledCoords(line1, size) +
             'c ' + this.getScaledCoords(arc2, size) +
             'l ' + this.getScaledCoords(line2, size) +
             'l ' + spacer + ' 0'
    },
    getRod(size: string = 'l'): string {
      let arc1 = [
        this.vSub(rod.start, rod.Start),
        this.vSub(rod.n, rod.Start),
        this.vSub(rod.N, rod.Start),
      ].flat()
      let line = this.vSub(rod.S, rod.N)
      let arc2 = [
        this.vSub(rod.s, rod.S),
        this.vSub(rod.end, rod.S),
        this.vSub(rod.End, rod.S),
      ].flat()

      return 'l ' + spacer + ' 0' +
             'c ' + this.getScaledCoords(arc1, size) +
             'l ' + this.getScaledCoords(line, size) +
             'c ' + this.getScaledCoords(arc2, size) +
             (size === 'tick' ? '' : 'l ' + spacer + ' 0')
    },
    getCrab(size: string = 'l'): string {
      let arc1 = [
        this.vSub(crab.start, crab.Start),
        this.vSub(crab.up1, crab.Start),
        this.vSub(crab.Up1, crab.Start),
      ].flat()
      let arc2 = [
        this.vSub(crab.up1, crab.Up1),
        this.vSub(crab.up2, crab.Up1),
        this.vSub(crab.Up2, crab.Up1),
      ].flat()
      let line1 = this.vSub(crab.Down2, crab.Up2)
      let arc3 = [
        this.vSub(crab.down2, crab.Down2),
        this.vSub(crab.down1, crab.Down2),
        this.vSub(crab.Down1, crab.Down2),
      ].flat()
      let arc4 = [
        this.vSub(crab.down1, crab.Down1),
        this.vSub(crab.start, crab.Down1),
        this.vSub(crab.Start, crab.Down1),
      ].flat()
      let line2 = this.vSub(crab.span, crab.Start)

      return 'c ' + this.getScaledCoords(arc1, size) +
             'c ' + this.getScaledCoords(arc2, size) +
             'l ' + this.getScaledCoords(line1, size) +
             'c ' + this.getScaledCoords(arc3, size) +
             'c ' + this.getScaledCoords(arc4, size) +
             'l ' + this.getScaledCoords(line2, size) +
             'l ' + spacer + ' 0'
    },
    getTick(): string {
      return this.getRod('tick') // +
      //  'l ' + spacer + ' 0'
    },
  },
})
</script>
