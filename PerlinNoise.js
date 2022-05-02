'use strict';
//https://github.com/joeiddon/perlin
export class PerlinNoise {

    constructor(seed, easing = this.easeInOutQuad) {
        this.perlinSeed = seed
        this.easing = easing
        this.gradients = {}
    }

    get seed() {return this.perlinSeed}

    randomPositionVector(x, y) {
        let positionSeed = this.xmur3(`${x} ${y} ${this.perlinSeed}`)
        let rand = this.mulberry32(positionSeed())
        let angle = (2 * Math.PI) * rand() - Math.PI
        return { x: Math.cos(angle), y: Math.sin(angle) };
    }

    dot_prod_grid(x, y, vx, vy) {
        let g_vect;
        let d_vect = { x: x - vx, y: y - vy };
        if (this.gradients[[vx, vy]]) {
            g_vect = this.gradients[[vx, vy]];
        } else {
            g_vect = this.randomPositionVector(x, y);
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    }

    easeInOutQuad(x) {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    interpolate(x, a, b) {
        return a + this.easing(x) * (b - a);
    }

    get(x, y) {
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid(x, y, xf, yf);
        let tr = this.dot_prod_grid(x, y, xf + 1, yf);
        let bl = this.dot_prod_grid(x, y, xf, yf + 1);
        let br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
        let xt = this.interpolate(x - xf, tl, tr);
        let xb = this.interpolate(x - xf, bl, br);
        let v = this.interpolate(y - yf, xt, xb);
        return v;
    }

    //https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    xmur3(str) {
        for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = h << 13 | h >>> 19;
        } return function () {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }
    }

    mulberry32(a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }
}
