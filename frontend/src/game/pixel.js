export const GRID = 24

// Fills a rect with a 2px checkerboard of two colors — classic pixel-art
// dithering used to fake a mid-tone shade out of only two flat colors.
export function fillDithered(ctx, x, y, w, h, colorA, colorB) {
  const cell = 2
  for (let yy = 0; yy < h; yy += cell) {
    for (let xx = 0; xx < w; xx += cell) {
      const checker = (Math.floor((x + xx) / cell) + Math.floor((y + yy) / cell)) % 2 === 0
      ctx.fillStyle = checker ? colorA : colorB
      ctx.fillRect(x + xx, y + yy, Math.min(cell, w - xx), Math.min(cell, h - yy))
    }
  }
}

// Draws a 24x24 logical-grid pixel-art sprite described as a list of
// rectangular blocks [gx, gy, gw, gh, color] (grid units 0-23). A block
// with a second color [gx, gy, gw, gh, colorA, colorB] is dithered
// between the two instead of filled flat — a cheap way to fake shading.
export function drawBlocks(ctx, blocks, cx, cy, size) {
  const px = size / GRID
  const ox = cx - size / 2
  const oy = cy - size / 2
  blocks.forEach(([gx, gy, gw, gh, colorA, colorB]) => {
    const x = ox + gx * px, y = oy + gy * px, w = gw * px, h = gh * px
    if (colorB) fillDithered(ctx, x, y, w, h, colorA, colorB)
    else { ctx.fillStyle = colorA; ctx.fillRect(x, y, w, h) }
  })
}

// Same as drawBlocks but stamps a solid silhouette offset 1px in each
// direction first, producing a crisp dark outline around the sprite
// instead of a blurred glow.
export function drawBlocksOutlined(ctx, blocks, cx, cy, size, outlineColor = '#0a0612') {
  const px = size / GRID
  const ox = cx - size / 2
  const oy = cy - size / 2
  const offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  ctx.fillStyle = outlineColor
  offsets.forEach(([dx, dy]) => {
    blocks.forEach(([gx, gy, gw, gh]) => {
      ctx.fillRect(ox + gx * px + dx, oy + gy * px + dy, gw * px, gh * px)
    })
  })
  drawBlocks(ctx, blocks, cx, cy, size)
}

// Soft dark ellipse under a sprite so it reads as resting on the ground
// instead of floating.
export function drawContactShadow(ctx, cx, cy, w, h, alpha = 0.32) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function frame(t, ms) {
  return Math.floor(t / ms) % 2
}

// Builds a small repeatable tile texture on an offscreen canvas and
// returns a CanvasPattern, so the whole board can be filled in one call.
export function buildTilePattern(ctx, paintFn, tileSize = 32) {
  const c = document.createElement('canvas')
  c.width = tileSize
  c.height = tileSize
  paintFn(c.getContext('2d'), tileSize)
  return ctx.createPattern(c, 'repeat')
}
