export default {
  dec2hex(dec: number): string {
    return ('0' + dec.toString(16)).substr(-2)
  },
  generateRandomHexString(): string {
    const array = new Uint32Array(32)
    window.crypto.getRandomValues(array)
    return Array.from(array, this.dec2hex).join('')
  },
  hexToBase64(hexStr: string): string {
    const hexPairs = hexStr.match(/\w{2}/g)
    if (hexPairs !== null) {
      return btoa(hexPairs.map((a) => {
        return String.fromCharCode(parseInt(a, 16))
      }).join(''))
    }
    return ''
  },
  base64URLEncode(b64str: string): string {
    return b64str.replace(/\+/g, '-')
                 .replace(/\//g, '_')
                 .replace(/=/g, '')
  },
  generateCodeVerifier(): string {
    return this.base64URLEncode(this.hexToBase64(this.generateRandomHexString()))
  },
  async sha256(str: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const buf = await window.crypto.subtle.digest('SHA-256', data)
    const bytes = new Uint8Array(buf)
    const len = bytes.byteLength
    let resultStr = ''
    for (let i = 0; i < len; i++) {
      resultStr += String.fromCharCode(bytes[i])
    }
    return this.base64URLEncode(btoa(resultStr))
  },
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  },
  pluralFormat(val: number, unit: string): string {
    return `${val} ${unit}${val === 1 ? '' : 's'}`
  },
  getGUID(): string {
    return (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, c => {
      const cInt = parseInt(c)
      return (cInt ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> cInt / 4).toString(16)
    })
  },
  getTimestamp(): string {
    return (new Date()).toISOString()
  },
  getFormattedDate(timestamp: string): string {
    return (new Date(timestamp)).toLocaleDateString()
  },
}