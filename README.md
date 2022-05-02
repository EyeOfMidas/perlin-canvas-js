# perlin-canvas-js
A learning attempt to implement perlin noise for a canvas texture.
Cobbling together examples from https://github.com/joeiddon/perlin, https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript, https://gist.github.com/mjackson/5311256

See it online [here](https://eyeofmidas.github.io/perlin-canvas-js/)!

## Description

Draws the tiles centered on the screen using camera offset logic. Support for touch, mouse and keyboard panning. Query params enable changing draw styles, seed and location linking

### Examples
* [HSL Octopus Origin](https://eyeofmidas.github.io/perlin-canvas-js/?seed=octopus&fill=0&x=0&y=0)
* [Grayscale Ladybug Offset](https://eyeofmidas.github.io/perlin-canvas-js/?seed=ladybug&fill=1&x=1940&y=1444)
* [Terrain Treefrog Mountain](https://eyeofmidas.github.io/perlin-canvas-js/?seed=treefrog&fill=3&x=-276&y=-576)


## TODO
* async generation/drawing of tiles


