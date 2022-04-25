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

    camera.x = Math.max(0, camera.x)
    camera.y = Math.max(0, camera.y)

    if(keys["1"]) {
        octaves -= 1
        octaves = Math.max(1, octaves)
        keys["1"] = false
        console.log(octaves, amplitude, roughness)
        range = {min: 9999, max: -9999}
    }

    if(keys["2"]) {
        octaves += 1
        octaves = Math.min(8, octaves)
        keys["2"] = false
        console.log(octaves, amplitude, roughness)
        range = {min: 9999, max: -9999}
    }

    if(keys["3"]) {
        amplitude -= 1
        amplitude = Math.max(1, amplitude)
        keys["3"] = false
        console.log(octaves, amplitude, roughness)
        range = {min: 9999, max: -9999}
    }

    if(keys["4"]) {
        amplitude += 1
        keys["4"] = false
        console.log(octaves, amplitude, roughness)
        range = {min: 9999, max: -9999}
    }

    if(keys["5"]) {
        roughness -= 0.05
        roughness = Math.max(0, roughness)
        keys["5"] = false
        console.log(octaves, amplitude, roughness)
        range = {min: 9999, max: -9999}
    }

    if(keys["6"]) {
        roughness += 0.05
        roughness = Math.min(1, roughness)
        keys["6"] = false
        console.log(octaves, amplitude, roughness)
        range = {min: 9999, max: -9999}
    }

    let dataCopy = [...data]
    context.clearRect(0,0,bounds.w, bounds.h)

    let imageData = context.createImageData(bounds.w, bounds.h) 
    for(let i = 0, j=0; i < imageData.data.length; i+=4, j++){
        if(!isNaN(dataCopy[j])) {
            range.min = Math.min(range.min, dataCopy[j])
            range.max = Math.max(range.max, dataCopy[j])
        }
        //weird normalization since I can't tell what the proper perlin range is
        let pixel = (dataCopy[j] -range.min) / (range.max - range.min)
        let rgbColor = hslToRgb(pixel, 1, 0.5)
        // let rgbColor = [pixel, pixel, pixel]
        imageData.data[i] = 256 * rgbColor[0]
        imageData.data[i+1] = 256 * rgbColor[1]
        imageData.data[i+2] = 256 * rgbColor[2]
        imageData.data[i+3] = 255
    }
    context.putImageData(imageData, 0, 0)

    console.log(`resulting range - min: ${range.min} max ${range.max}`)
    requestAnimationFrame(animate)
}

async function processFrame() {
    for(let i = 0; i < data.length; i++) {
        let position = {x:camera.x + (i % bounds.w),y:camera.y + Math.floor(i / bounds.w)}
        let noiseResult = getPerlinNoise(position)
        data[i] = noiseResult
    }
}

window.addEventListener('keydown', e => {keys[e.key] = true})
window.addEventListener('keyup', e => {keys[e.key] = false})

setInterval(processFrame, 32)
requestAnimationFrame(animate)
