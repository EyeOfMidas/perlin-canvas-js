'use strict';
export class TileManager {
	constructor(tileBounds, noise){
		this.tileBounds = tileBounds
		this.tileDataCache = []
		this.noise = noise
	}

	get width() { return this.tileBounds.width}
	get height() { return this.tileBounds.height}

	addTile(gridX, gridY) {
		let tile = []
		for(let y=0; y < this.height; y++) {
			tile[y] = []
			for(let x=0; x < this.width; x++) {
				tile[y][x] = this.noise.get(gridX+(x/this.width), gridY + (y/this.height));
			}
		}
		if(!this.tileDataCache[gridY]) {this.tileDataCache[gridY] = []}
		this.tileDataCache[gridY][gridX] = {x:gridX, y:gridY, data:tile}
		return this.tileDataCache[gridY][gridX]
	}

	getTile(gridX, gridY) {
		if(!this.tileDataCache[gridY]) return;
		return this.tileDataCache[gridY][gridX]
	}

	getOrAddTile(gridX, gridY) {
		let tile = this.getTile(gridX, gridY)
		if(tile) {
			return tile
		}
		return this.addTile(gridX, gridY)
	}

	getNeighbors(gridX, gridY, radius = 1) {
		let offsetMatrix = []
		for(let y = -radius; y <= radius; y++) {
			for(let x = -radius; x <= radius; x++) {
				offsetMatrix.push([y,x])
			}
		}
		return offsetMatrix.map(value => this.getOrAddTile(gridX+value[1], gridY+value[0]))
	}

	renderTileData(tile, context, fillCallback) {
		let imageData = context.createImageData(this.width, this.height);
		for(let i = 0; i < imageData.data.length; i += 4) {
			let x = ((i/4) % this.width)
			let y = Math.floor((i/4) / this.width)
			let rgbColor = fillCallback(tile.data[y][x]);			
			imageData.data[i] = rgbColor[0];
			imageData.data[i + 1] = rgbColor[1];
			imageData.data[i + 2] = rgbColor[2];
			imageData.data[i + 3] = rgbColor[3];	
		}

		context.putImageData(imageData, 0, 0);
	}

	renderTile(gridX, gridY, fillCallback) {
		let image = document.getElementById(`tile-${gridY},${gridX}`)
		if(image) {
			return image
		}
		let tileCanvas = document.createElement("canvas");
		tileCanvas.width = this.width;
		tileCanvas.height = this.height;

		this.renderTileData(this.getOrAddTile(gridX, gridY), tileCanvas.getContext("2d"), fillCallback)
		
		let img = document.createElement('img')
		img.src = tileCanvas.toDataURL()
		img.id = `tile-${gridY},${gridX}`
		img.classList.add("image-cache")
		document.body.appendChild(img)
		return img
	}
}