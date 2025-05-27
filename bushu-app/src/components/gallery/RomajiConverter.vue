<template>
  <div>
    <div style="font-size: 16px; text-align: right !important">
      <input type="number" v-model="unicodeVal"/>
      <br>
      <br>
      <h3 style="display: inline-block" v-html="'&' + '#' + unicodeVal + ';'"></h3>
      <!-- 12353 -->
    </div>
    <div style="font-size: 14px; text-align: right !important; margin-top: 20px">
      <input v-model="inputStr" @input="updateString()"/>
      <br>
      <br>
      <h3 style="display: inline-block">{{ inputStr }}</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RomajiConverter',
  props: {
    title: {
      type: String,
      default: 'Tab'
    }
  },
  data () {
    return {
      unicodeVal: 12353,
      inputStr: '',
      hgMap: {},
      romajiVals: [
        '_a',
        'a',
        '_i',
        'i',
        '_u',
        'u',
        '_e',
        'e',
        '_o',
        'o',
        'ka',
        'ga',
        'ki',
        'gi',
        'ku',
        'gu',
        'ke',
        'ge',
        'ko',
        'go',
        'sa',
        'za',
        'shi',
        'ji',
        'su',
        'zu',
        'se',
        'ze',
        'so',
        'zo',
        'ta',
        'da',
        'chi',
        'di',
        'xtu',
        'tsu',
        'du',
        'te',
        'de',
        'to',
        'do',
        'na',
        'ni',
        'nu',
        'ne',
        'no',
        'ha',
        'ba',
        'pa',
        'hi',
        'bi',
        'pi',
        'fu',
        'bu',
        'pu',
        'he',
        'be',
        'pe',
        'ho',
        'bo',
        'po',
        'ma',
        'mi',
        'mu',
        'me',
        'mo',
        '_ya',
        'ya',
        '_yu',
        'yu',
        '_yo',
        'yo',
        'ra',
        'ri',
        'ru',
        're',
        'ro',
        '_wa',
        'wa',
        'wi',
        'wu',
        'wo',
        'nn',
        'v_',
        '_ka',
        '_ke'
      ]
    }
  },
  created () {
    let unicode = this.unicodeVal
    this.romajiVals.forEach(s => {
      this.hgMap[s] = unicode
      unicode++
    })
    this.hgMap['-'] = 12540
    this.hgMap['!'] = 65281
    this.hgMap['?'] = 65311
    this.hgMap['.'] = 12290
    this.hgMap[','] = 12289

    this.hgMap['tu'] = this.hgMap['tsu']
  },
  methods: {
    isMatch (str, regex) {
      return str.search(regex) !== -1
    },
    updateString () {
      let idx = 0
      let maxKeyLen = 3
      while (idx < this.inputStr.length) {
        let didUpdate = false
        for (let j = 0; j < maxKeyLen + 1 && idx + j < this.inputStr.length; j++) {
          let rawSubStr = this.inputStr.substring(idx, idx + j + 1)
          let subStr = rawSubStr.toLowerCase().replace('l', 'r')
          let isValidStr = true
          let charCodes = []

          if (this.isMatch(subStr, /^(([kgnhbpmr]y)|([sc]h)|j)[auo]$/)) {
            // small ya/yu/yo
            charCodes = [this.hgMap[subStr[0] + (subStr[1] === 'h' ? 'h' : '') + 'i'], this.hgMap['_y' + subStr[j]]]
          } else if (j > 1 && (subStr[0] === subStr[1]) && (this.hgMap[subStr.substring(1)] || this.isMatch(subStr, /^[sc]{2}h[auo]$/))) {
            // small tsu
            charCodes = [this.hgMap['xtu']]
            if (this.isMatch(subStr, /^[sc]{2}h[auo]$/)) {
              charCodes.push(this.hgMap[subStr[0] + 'hi'], this.hgMap['_y' + subStr[3]])
            } else {
              charCodes.push(this.hgMap[subStr.substring(1)])
            }
          } else if (this.isMatch(subStr, /^n[^y]$/) && !this.hgMap[subStr]) {
            // n
            j = 0
            charCodes = [this.hgMap['nn']]
          } else if (this.isMatch(subStr, /^f[aieo]|di$/)) {
            // f[aieo] / di
            charCodes = [this.hgMap[subStr[0] === 'f' ? 'fu' : 'de'], this.hgMap['_' + subStr[1]]]
          } else if (this.isMatch(subStr, /^"$/)) {
            // quotes
            let openQuote = String.fromCodePoint(12300)
            let closeQuote = String.fromCodePoint(12301)
            charCodes = [(this.inputStr.lastIndexOf(openQuote) > this.inputStr.lastIndexOf(closeQuote)) ? 12301 : 12300]
          } else {
            charCodes = [this.hgMap[subStr]]
            isValidStr = charCodes[0] !== undefined
          }

          if (isValidStr) {
            let doKatakana = rawSubStr.replace('l', 'r') !== subStr
            let chars = String.fromCodePoint(...charCodes.map(c => c + (doKatakana ? 96 : 0)))
            let newStr = this.inputStr.substring(0, idx) + chars + this.inputStr.substring(idx + j + 1)
            this.inputStr = newStr
            idx = 0
            didUpdate = true
            break
          }
        }
        if (!didUpdate) {
          idx++
        }
      }
    }
  }
}
</script>

<style lang="css">
</style>
