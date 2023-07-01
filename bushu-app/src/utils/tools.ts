export default {
  dec2hex(dec: number): string {
    return ('0' + dec.toString(16)).substr(-2)
  },
  generateRandomHexString() {
    const array = new Uint32Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, this.dec2hex).join('');
  },
  hexToBase64(hexStr: string): string {
    const hexPairs = hexStr.match(/\w{2}/g)
    if (hexPairs !== null) {
      return btoa(hexPairs.map((a) => {
        return String.fromCharCode(parseInt(a, 16));
      }).join(''))
    }
    return ''
  },
  base64URLEncode(b64str: string): string {
    return b64str.replace(/\+/g, '-')
                 .replace(/\//g, '_')
                 .replace(/=/g, '')
  },
  generateCodeVerifier() {
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
  deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj))
  },
}