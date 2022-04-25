let bounds = {w: 64, h: 64}
let data = new Array(bounds.w * bounds.h)
let wrapAround = true
let movement = 0

let camera = {x: 0, y: 0, speed: 4}
let keys = {}


let octaves = 8
let amplitude = 360
let roughness = 0.3

let seedFunc = xmur3(`bananas`)
let seed = seedFunc()
console.log(`seed: ${seed}`)
let nextRandom = mulberry32(seed)

let canvas = document.getElementsByTagName('canvas')[0]
canvas.width = bounds.w
canvas.height = bounds.h
let context = canvas.getContext('2d')
context.width = bounds.w
context.height = bounds.h
function animate() {
    if(keys["w"] || keys["ArrowUp"]) {
        camera.y -= camera.speed
    }
    if(keys["a"] || keys["ArrowLeft"]) {
        camera.x -= camera.speed
    }
    if(keys["s"] || keys["ArrowDown"]) {
        camera.y += camera.speed
    }
    if(keys["d"] || keys["ArrowRight"]) {
        camera.x += camera.speed
    }

    if(keys["1"]) {
        octaves -= 1
        octaves = Math.max(1, octaves)
        keys["1"] = false
    }

    if(keys["2"]) {
        octaves += 1
        octaves = Math.min(8, octaves)
        keys["2"] = false
    }

    if(keys["3"]) {
        amplitude -= 1
        amplitude = Math.max(1, amplitude)
        keys["3"] = false
    }

    if(keys["4"]) {
        amplitude += 1
        keys["4"] = false
    }

    if(keys["5"]) {
        roughness -= 0.05
        roughness = Math.max(0, roughness)
        keys["5"] = false
    }

    if(keys["6"]) {
        roughness += 0.05
        roughness = Math.min(1, roughness)
        keys["6"] = false
    }
    let dataCopy = [...data]
    context.clearRect(0,0,bounds.w, bounds.h)
    // let imageData = context.createImageData(bounds.w, bounds.h)
    // for(let i = 0, j=0; i < imageData.length; i+=4, j++){
    //     let rgbColor = hslToRgb(360*dataCopy[j], 100, 50)
    //     imageData[i] = rgbColor[0]
    //     imageData[i+1] = rgbColor[1]
    //     imageData[i+2] = rgbColor[2]
    //     imageData[i+3] = 1
    // }
    // context.putImageData(imageData, 0, 0)


    for(let i = 0; i < dataCopy.length; i++){
        let pixel = dataCopy[i]
        let position = {x:i % bounds.w,y:Math.floor(i / bounds.w)}
        context.fillStyle = `hsla(${360 * pixel},${100}%,${50}%,${1})`
        // context.fillStyle = `rgba(${256 * pixel},${256 * pixel},${256 * pixel},${1})`
        context.beginPath()
        context.rect(position.x,position.y, 1,1)
        context.fill()
    }
    requestAnimationFrame(animate)
}

async function processFrame() {
    console.log(octaves, amplitude, roughness)
    for(let i = 0; i < data.length; i++) {
        let position = {x:camera.x + i % bounds.w,y:camera.y + Math.floor(i / bounds.w)}
        let noiseResult = getPerlinNoise(position)
        data[i] = noiseResult
    }
}

window.addEventListener('keydown', e => {console.log(e.key);keys[e.key] = true})
window.addEventListener('keyup', e => {keys[e.key] = false})

setInterval(processFrame, 32)
requestAnimationFrame(animate)

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
    let positionSeed = xmur3(`${position.x * 49632 * position.y * 325176 + seed}`)
    let rand = mulberry32(positionSeed())
    return rand()
}

function cosineInterpolate(a, b, blend) {
    let theta = blend * Math.PI
    let semicircleHalfway = 1 - Math.cos(theta) * 0.5
    return (1.0 - semicircleHalfway) * a + semicircleHalfway * b
}


function perlinNoise(position, bounds) {
    let r = 0
    let amplitude = 128
    let octaves = 6
    let smoothness = 128
    let persistance = 0.6
    for(let i = 0; i < octaves; i++) {
        let frequencyStep = Math.pow(2, i)
        let amplitudeStep = Math.pow(persistance, i)
        let modifiedPosition = {x: position.x * frequencyStep / smoothness, y: position.y * frequencyStep / smoothness}
        r += noise(modifiedPosition, bounds) * amplitudeStep
    }
    let result = ((r / 2 + 1) * amplitude) / 256
    return Math.min(1, Math.max(0, result))
}

function noise(position, bounds){
    //pull out the fractional bits of the position to use
    let integerPosition = {x:parseInt(position.x), y: parseInt(position.y)}
    let fractionalPosition = {x: position.x - integerPosition.x, y: position.y - integerPosition.y}

    //first get the corners of each integer pixel
    let topLeft = {x:integerPosition.x, y:integerPosition.y}
    let topRight = {x:integerPosition.x+1, y:integerPosition.y}
    let bottomLeft = {x:integerPosition.x, y:integerPosition.y+1}
    let bottomRight = {x:integerPosition.x+1, y:integerPosition.y+1}
    
    if(wrapAround) {
        if(topRight.x == bounds.w) {
            topRight.x = 0
        }
        if(bottomLeft.y == bounds.h) {
            bottomLeft.y = 0
        }
        if(bottomRight.x == bounds.w) {
            bottomRight.x = 0
        }
        if(bottomRight.y == bounds.h) {
            bottomRight.y = 0
        }
    }

    let a = getNoise(topLeft, bounds)
    let b = getNoise(topRight, bounds)
    let c = getNoise(bottomLeft, bounds)
    let d = getNoise(bottomRight, bounds)

    let topInterpolated = cosineInterpolate(a, b, fractionalPosition.x)
    let bottomInterpolated = cosineInterpolate(c, d, fractionalPosition.y)

    return cosineInterpolate(topInterpolated, bottomInterpolated, fractionalPosition.y)
    
}

function getNoise(position, bounds, seed = "bananas"){
    // let xSeed = xmur3(`${position.x}`)
    // let ySeed = xmur3(`${position.y}`)
    // let boundSeed = xmur3(`${bounds.w}`)
    // let timeSeed = xmur3(`${new Date().getTime()}`)
    // return sfc32(timeSeed(),xSeed(), ySeed(), boundSeed(), )()

    let positionSeed = xmur3(`${position.x + position.y * bounds.w}${seed}`)
    return mulberry32(positionSeed())()
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
  
    return [ r * 255, g * 255, b * 255 ];
  }

