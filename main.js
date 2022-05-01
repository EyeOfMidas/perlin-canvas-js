let bounds = {w: 64, h: 64}
let data = new Array(bounds.w * bounds.h)
let wrapAround = true
let movement = 0

let camera = {x: 512, y: 512, speed: 2}
let keys = {}

let range = {min: 9999, max: -9999}

let octaves = 5
let amplitude = 30
let roughness = 0.60

