// Draws a 16x16 logical-grid pixel-art sprite described as a list of
// rectangular blocks [gx, gy, gw, gh, color] (grid units 0-15).
export function drawBlocks(ctx, blocks, cx, cy, size) {
  const px = size / 16
  const ox = cx - size / 2
  const oy = cy - size / 2
  blocks.forEach(([gx, gy, gw, gh, color]) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + gx * px, oy + gy * px, gw * px, gh * px)
  })
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
