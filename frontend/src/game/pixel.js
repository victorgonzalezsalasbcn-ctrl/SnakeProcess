export const GRID = 24

// Draws a 24x24 logical-grid pixel-art sprite described as a list of
// rectangular blocks [gx, gy, gw, gh, color] (grid units 0-23).
export function drawBlocks(ctx, blocks, cx, cy, size) {
  const px = size / GRID
  const ox = cx - size / 2
  const oy = cy - size / 2
  blocks.forEach(([gx, gy, gw, gh, color]) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + gx * px, oy + gy * px, gw * px, gh * px)
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
