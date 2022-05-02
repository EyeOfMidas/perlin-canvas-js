import { PerlinNoise } from "./PerlinNoise.js";
import { TileManager } from "./TileManager.js";
let canvas;
let context;
let needsUpdate = true;
let needsUrlUpdate = true;

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

let noise;
let tileManager;
let fillIndex = parseInt(params.fill) || 0;
let pixelFills = [
	v => [...hslToRgb(v, 1, 0.5).map(c => 256 * c), 255], //rainbow
	v => [256 * v, 256 * v, 256 * v, 255], //grayscale
	v => [255, 255, 255, 256 * v], //transparent
	v => { //terrain
		if(v > 0.6) return [255, 255, 255, 255]
		if(v > 0.5) return [120, 120, 120, 255]
		if(v > 0.1) return [40, 240, 20, 255]
		if(v > 0.0) return [180, 180, 20, 255]
		return [20, 40, 230, 255]
	},
];
let camera = { x: parseInt(params.x) || 0, y: parseInt(params.y) || 0, speed: 2, zoom: 1 };
let keys = {};
let mousePosition = {x: 0, y: 0}
let mouseDown = false

function init() {
	let bounds = canvas.getBoundingClientRect();
	canvas.width = bounds.width;
	canvas.height = bounds.height;
	context = canvas.getContext("2d");
}

function update() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.save();
	context.translate(-0.5, -0.5);
	drawNoise(canvas, context);
	context.restore();
}

document.addEventListener("DOMContentLoaded", () => {
	canvas = document.createElement("canvas");
	document.body.appendChild(canvas);
	noise = new PerlinNoise(params.seed || "octopus");
	tileManager = new TileManager({ width: 64, height: 64 }, noise);
	init();
	setTimeout(() => {needsUpdate = true}, 300)
	needsUpdate = true
	requestAnimationFrame(tick);
});

function drawNoise(canvas, context) {
	let bounds = canvas.getBoundingClientRect();

	let tilesPerScreen = Math.max(Math.ceil((bounds.width / tileManager.width) / 2), Math.ceil((bounds.height / tileManager.height) / 2)) + 1
	let cameraCenter = {x: bounds.width / 2, y: bounds.height / 2}
	let gridPosition = {
		x: Math.floor((camera.x / tileManager.width)),
		y: Math.floor((camera.y / tileManager.height)),
	};
	context.save()
	context.translate(cameraCenter.x - (tileManager.width/2) - camera.x, cameraCenter.y - (tileManager.height / 2)- camera.y)
	let neighbors = tileManager.getNeighbors(gridPosition.x, gridPosition.y, tilesPerScreen);
	neighbors.forEach(tile => {
		let image = tileManager.renderTile(tile.x, tile.y, pixelFills[fillIndex]);
		context.drawImage(image, tileManager.width * tile.x, tileManager.height * tile.y);
	});
	context.restore()
}

function tick() {
	if (keys["w"] || keys["ArrowUp"]) {
		camera.y -= camera.speed
		needsUpdate = true
		needsUrlUpdate = true
	}
	if (keys["a"] || keys["ArrowLeft"]) {
		camera.x -= camera.speed
		needsUpdate = true
		needsUrlUpdate = true
	}
	if (keys["s"] || keys["ArrowDown"]) {
		camera.y += camera.speed
		needsUpdate = true
		needsUrlUpdate = true
	}
	if (keys["d"] || keys["ArrowRight"]) {
		camera.x += camera.speed
		needsUpdate = true
		needsUrlUpdate = true
	}
	if (needsUpdate) {
		update()
		needsUpdate = false
	}
	requestAnimationFrame(tick);
}

setInterval(() => {
	if(!needsUrlUpdate) {
		return
	}
	var stateObj = { title: "Perlin", url: window.location.href.split( "?" )[0] + `?seed=${noise.seed}&fill=${fillIndex}&x=${camera.x}&y=${camera.y}`}
	window.history.replaceState(stateObj, stateObj.title, stateObj.url)
	needsUrlUpdate = false
}, 1000)

window.addEventListener("resize", () => {
	init();
	needsUpdate = true
});

window.addEventListener("keydown", event => {
	keys[event.key] = true;
});
window.addEventListener("keyup", event => {
	keys[event.key] = false;
});

window.addEventListener("mousedown", e => {
	mousePosition = {
		x: e.clientX,
		y: e.clientY,
	}
	mouseDown = true;
});

window.addEventListener("mouseup", e => {
	mouseDown = false
});

window.addEventListener("mousemove", e => {
	if(e.button == 0 && mouseDown) {
		let currentPosition = {
			x: e.clientX,
			y: e.clientY,
		}

		let deltaPosition = {
			x:mousePosition.x - currentPosition.x,
			y: mousePosition.y- currentPosition.y,
		}

		camera.x += deltaPosition.x
		camera.y += deltaPosition.y

		mousePosition = {
			x: currentPosition.x,
			y: currentPosition.y,
		}
		needsUpdate = true
	}
});


window.addEventListener("touchstart", e => {
	mousePosition = {
		x: e.touches[0].clientX,
		y: e.touches[0].clientY,
	}
});

window.addEventListener("touchmove", e => {
	if(e.touches.length == 1) {
		let currentPosition = {
			x: e.touches[0].clientX,
			y: e.touches[0].clientY,
		}

		let deltaPosition = {
			x:mousePosition.x - currentPosition.x,
			y: mousePosition.y- currentPosition.y,
		}

		camera.x += deltaPosition.x
		camera.y += deltaPosition.y

		mousePosition = {
			x: currentPosition.x,
			y: currentPosition.y,
		}
		needsUpdate = true
	}
});

window.addEventListener("contextmenu", e => {
	e.preventDefault();
	fillIndex = (fillIndex + 1) % pixelFills.length;
	needsUpdate = true;
});

window.addEventListener("touchend", e => {
	e.preventDefault();
	if (e.changedTouches.length == 2) {
		fillIndex = (fillIndex + 1) % pixelFills.length;
		needsUpdate = true;
	}
});

//https://gist.github.com/mjackson/5311256
function hslToRgb(h, s, l) {
	var r, g, b;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [r, g, b];
}
