let bounds = {w: 128, h: 128}
let data = new Array(bounds.w * bounds.h)

let canvas = document.getElementsByTagName('canvas')[0]
canvas.width = bounds.w
canvas.height = bounds.h
let context = canvas.getContext('2d')
context.width = bounds.w
context.height = bounds.h
requestAnimationFrame(animate)
function animate() {

    for(let i = 0; i < data.length; i++) {
        let position = {x:i % bounds.w,y:Math.floor(i / bounds.w)}
        let noiseResult = bounds.w * noise(position)
        data[i] = [noiseResult, noiseResult, noiseResult, 1]
    }

    context.clearRect(0,0,bounds.w, bounds.h)
    for(let i = 0; i < data.length; i++){
        let pixel = data[i]
        let position = {x:i % bounds.w,y:Math.floor(i / bounds.w)}
        context.fillStyle = `rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`
        context.beginPath()
        context.rect(position.x,position.y, 1,1)
        context.fill()
    }
    requestAnimationFrame(animate)
}


function noise(position){
    //pull out the fractional bits of the position to use
    let integerPosition = {x:parseInt(position.x), y: parseInt(position.y)}
    let fractionalPosition = {x: position.x - integerPosition.x, y: position.y - integerPosition.y}

    //first get the corners of each integer pixel
    let topLeft = {x:integerPosition.x, y:integerPosition.y}
    let topRight = {x:integerPosition.x+1, y:integerPosition.y}
    let bottomLeft = {x:integerPosition.x, y:integerPosition.y+1}
    let bottomRight = {x:integerPosition.x+1, y:integerPosition.y+1}

    let a = getNoise(topLeft, bounds)
    let b = getNoise(topRight, bounds)
    let c = getNoise(bottomLeft, bounds)
    let d = getNoise(bottomRight, bounds)

    let topInterpolated = cosineInterpolate(a, b, fractionalPosition.x)
    let bottomInterpolated = cosineInterpolate(c, d, fractionalPosition.y)

    return cosineInterpolate(topInterpolated, bottomInterpolated, fractionalPosition.x)
    
}

function getNoise(position, bounds){
    // let xSeed = xmur3(`${position.x}`)
    // let ySeed = xmur3(`${position.y}`)
    // let boundSeed = xmur3(`${bounds.w}`)
    // let timeSeed = xmur3(`${new Date().getTime()}`)
    // return sfc32(timeSeed(),xSeed(), ySeed(), boundSeed(), )()

    let positionSeed = xmur3(`${position.x + position.y * bounds.w}`)
    return mulberry32(positionSeed() + new Date().getTime())()
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
    return (1 - c) * a + c * b
}

