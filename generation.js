
let seedFunc = xmur3(`bananas`)
let seed = seedFunc()
console.log(`seed: ${seed}`)
let nextRandom = mulberry32(seed)

function getPerlinNoise(position) {
    let total = 0
    let d = Math.pow(2, octaves - 1)
    for(let i = 0; i < octaves; i++) {
        let frequencyStep = Math.pow(2, i) / d
        let amplitudeStep = Math.pow(roughness, i) * amplitude
        total += interpolatedNoise({x: position.x * frequencyStep, y: position.y * frequencyStep}) * amplitudeStep
    }

    return total
}

function interpolatedNoise(position) {
     //pull out the fractional bits of the position to use
     let integerPosition = {x:parseInt(position.x), y: parseInt(position.y)}
     let fractionalPosition = {x: position.x - integerPosition.x, y: position.y - integerPosition.y}
 
     //first get the corners of each integer pixel
     let topLeft = {x:integerPosition.x, y:integerPosition.y}
     let topRight = {x:integerPosition.x+1, y:integerPosition.y}
     let bottomLeft = {x:integerPosition.x, y:integerPosition.y+1}
     let bottomRight = {x:integerPosition.x+1, y:integerPosition.y+1}

     let a = getSmoothNoise(topLeft)
     let b = getSmoothNoise(topRight)
     let c = getSmoothNoise(bottomLeft)
     let d = getSmoothNoise(bottomRight)

     let topInterpolated = cosineInterpolate(a, b, fractionalPosition.x)
     let bottomInterpolated = cosineInterpolate(c, d, fractionalPosition.x)

     return cosineInterpolate(topInterpolated, bottomInterpolated, fractionalPosition.y)
}

function getSmoothNoise(position) {
    let corners = (
        getPositionRand({x: position.x - 1, y: position.y - 1}) +
        getPositionRand({x: position.x + 1, y: position.y - 1}) +
        getPositionRand({x: position.x - 1, y: position.y + 1}) +
        getPositionRand({x: position.x + 1, y: position.y + 1})
    )/16.0

    let sides = (
        getPositionRand({x:position.x - 1, y:position.y})+
        getPositionRand({x:position.x + 1, y:position.y})+
        getPositionRand({x:position.x, y:position.y-1})+
        getPositionRand({x:position.x, y:position.y+1})
    )/8.0

    let center = getPositionRand(position) / 4.0

    return corners + sides + center
}

function getPositionRand(position) {
    let positionSeed = xmur3(`${position.x} ${position.y} ${seed}`)
    let rand = mulberry32(positionSeed())
    return rand()
}

function cosineInterpolate(a, b, blend) {
    let theta = blend * Math.PI
    let semicircleHalfway = 1 - Math.cos(theta) * 0.5
    return (1.0 - semicircleHalfway) * a + semicircleHalfway * b
}

https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    } return function() {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function cosineInterpolate(a, b, t) {
    let c = 1 - Math.cos(t * Math.PI) * 0.5
    return (1.0 - c) * a + c * b
}

https://gist.github.com/mjackson/5311256
function hslToRgb(h, s, l) {
    var r, g, b;
  
    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
  
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
  
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
  
    return [ r, g, b ];
  }
