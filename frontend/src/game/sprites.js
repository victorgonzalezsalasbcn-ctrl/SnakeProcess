import { drawBlocks, drawBlocksOutlined, frame } from './pixel'

// ---------- enemies (24x24 grid, side view) ----------

function turtle(t) {
  const legUp = frame(t, 220) === 0
  return [
    [5, 12, 14, 1, '#1a4452'],
    [4, 8, 16, 5, '#2f7d8a'],
    [5, 7, 14, 1, '#2f7d8a'],
    [7, 6, 10, 1, '#2f7d8a'],
    [9, 5, 6, 1, '#2f7d8a'],
    [5, 10, 14, 3, '#2f7d8a', '#1a4452'],
    [7, 9, 11, 3, '#4faec4'],
    [9, 8, 7, 1, '#4faec4'],
    [8, 9, 4, 2, '#9ce4dc'],
    [16, 10, 7, 7, '#6fc2c8'],
    [19, 10, 4, 2, '#4faec4'],
    [20, 12, 2, 2, '#1a1325'],
    [4, legUp ? 15 : 16, 3, 4, '#3f9aa0'],
    [9, legUp ? 16 : 15, 3, 4, '#3f9aa0'],
    [14, legUp ? 15 : 16, 3, 4, '#3f9aa0'],
    [4, 13, 16, 1, '#1a4452'],
  ]
}

function fox(t) {
  const tailUp = frame(t, 260) === 0
  const blocks = [
    [3, 11, 13, 8, '#f0883a'],
    [3, 16, 13, 3, '#f0883a', '#c46a28'],
    [4, 13, 9, 5, '#fff3e0'],
    [3, 10, 13, 1, '#c46a28'],
    [13, 6, 9, 8, '#f0883a'],
    [14, 11, 6, 3, '#fff3e0'],
    [13, 4, 3, 4, '#f0883a'],
    [19, 4, 3, 4, '#f0883a'],
    [14, 5, 1, 2, '#c46a28'],
    [20, 5, 1, 2, '#c46a28'],
    [20, 10, 4, 3, '#fff3e0'],
    [16, 9, 2, 2, '#1a1325'],
    [3, 19, 13, 1, '#c46a28'],
  ]
  if (tailUp) blocks.push([0, 6, 4, 8, '#f0883a'], [0, 6, 3, 3, '#fff'])
  else blocks.push([0, 10, 4, 8, '#f0883a'], [0, 15, 3, 3, '#fff'])
  return blocks
}

function rabbit(t) {
  const earBack = frame(t, 150) === 0
  const blocks = [
    [3, 12, 14, 9, '#e8e4f0'],
    [3, 17, 14, 3, '#e8e4f0', '#c9ccd6'],
    [3, 19, 14, 1, '#c9ccd6'],
    [13, 7, 9, 9, '#e8e4f0'],
    [20, 10, 4, 3, '#fff'],
    [16, 10, 2, 2, '#1a1325'],
    [0, 13, 3, 1, 'rgba(255,255,255,0.45)'],
    [0, 16, 4, 1, 'rgba(255,255,255,0.3)'],
    [0, 19, 5, 1, 'rgba(255,255,255,0.2)'],
  ]
  if (earBack) {
    blocks.push([13, 0, 3, 9, '#e8e4f0'], [18, 0, 3, 9, '#e8e4f0'])
    blocks.push([14, 1, 1, 6, '#f7a8c4'], [19, 1, 1, 6, '#f7a8c4'])
  } else {
    blocks.push([12, 0, 3, 9, '#e8e4f0'], [19, 0, 3, 9, '#e8e4f0'])
    blocks.push([13, 1, 1, 6, '#f7a8c4'], [20, 1, 1, 6, '#f7a8c4'])
  }
  return blocks
}

function ghost(t) {
  const dy = frame(t, 300)
  return [
    [4, 4 + dy, 16, 13, 'rgba(230,230,255,0.92)'],
    [4, 17 + dy, 3, 3, 'rgba(230,230,255,0.92)'],
    [10, 17 + dy, 3, 3, 'rgba(230,230,255,0.92)'],
    [16, 17 + dy, 3, 3, 'rgba(230,230,255,0.92)'],
    [7, 9 + dy, 2, 1, 'rgba(255,255,255,0.5)'],
    [7, 6 + dy, 2, 4, '#2a2540'],
    [15, 6 + dy, 2, 4, '#2a2540'],
    [9, 13 + dy, 6, 1, 'rgba(120,110,180,0.4)'],
  ]
}

function bee(t) {
  const wingUp = frame(t, 90) === 0
  const wings = wingUp
    ? [[1, 4, 7, 5, 'rgba(255,255,255,0.6)'], [16, 4, 7, 5, 'rgba(255,255,255,0.6)']]
    : [[1, 7, 7, 3, 'rgba(255,255,255,0.6)'], [16, 7, 7, 3, 'rgba(255,255,255,0.6)']]
  return [
    ...wings,
    [6, 9, 12, 11, '#ffce3a'],
    [6, 12, 12, 2, '#262220'],
    [6, 16, 12, 2, '#262220'],
    [16, 9, 4, 5, '#262220'],
    [18, 10, 2, 2, '#1a1325'],
    [8, 19, 8, 1, '#c98f1a'],
    [16, 5, 1, 4, '#262220'],
    [19, 5, 1, 4, '#262220'],
  ]
}

// ---------- sand worm (desert exclusive) ----------

function mound(t) {
  const puff = frame(t, 400)
  const blocks = [
    [4, 17, 16, 4, '#d8b878'],
    [6, 14, 12, 4, '#e0c488'],
    [9, 12, 6, 3, '#ecd49c'],
  ]
  if (puff === 0) blocks.push([10, 8, 2, 2, 'rgba(236,212,156,0.5)'], [14, 6, 2, 2, 'rgba(236,212,156,0.3)'])
  else blocks.push([8, 7, 2, 2, 'rgba(236,212,156,0.4)'], [15, 9, 2, 2, 'rgba(236,212,156,0.3)'])
  return blocks
}

function sandworm(t) {
  const f = frame(t, 200)
  return [
    [4, 16, 17, 5, '#c4915a'],
    [4, 18, 17, 3, '#c4915a', '#8a5f33'],
    [4, 19, 17, 1, '#8a5f33'],
    [6, 13, 13, 4, '#d6a868'],
    [8, 10, 9, 4, '#d6a868'],
    [10, 7, 5, 4, '#e0bb80'],
    [f === 0 ? 11 : 13, 5, 3, 3, '#8a1f2a'],
    [9, 8, 1, 6, '#8a5f33'],
    [15, 8, 1, 6, '#8a5f33'],
    [9, 14, 1, 4, '#8a5f33'],
    [16, 14, 1, 4, '#8a5f33'],
    [11, 5, 2, 1, '#fff3d0'],
    [14, 5, 2, 1, '#fff3d0'],
  ]
}

// ---------- power-ups (original blocky shapes) ----------

function zap() {
  return [
    [13, 1, 4, 5, '#ffd23a'],
    [10, 6, 5, 4, '#ffd23a'],
    [13, 6, 6, 3, '#ffd23a'],
    [7, 10, 6, 4, '#ffd23a'],
    [12, 10, 5, 3, '#c98f1a'],
    [9, 14, 6, 4, '#ffd23a'],
    [13, 13, 5, 5, '#ffd23a'],
    [11, 17, 4, 4, '#ffd23a'],
  ]
}

function shield(t) {
  const shineX = frame(t, 250) === 0 ? 6 : 14
  return [
    [4, 3, 16, 4, '#7ed4e0'],
    [3, 7, 18, 8, '#7ed4e0'],
    [4, 15, 16, 5, '#4a9eae'],
    [7, 20, 10, 2, '#4a9eae'],
    [5, 4, 14, 2, '#a8e8f0'],
    [shineX, 4, 3, 14, 'rgba(255,255,255,0.55)'],
  ]
}

function sparkles(t) {
  const f = frame(t, 260)
  return [
    [10, 1, 4, 8, '#ff5da0'],
    [10, 15, 4, 8, '#ff5da0'],
    [1, 10, 8, 4, '#ff5da0'],
    [15, 10, 8, 4, '#ff5da0'],
    [10, 10, 4, 4, '#fff0f6'],
    f === 0 ? [4, 4, 2, 2, '#fff'] : [18, 18, 2, 2, '#fff'],
    f === 0 ? [18, 18, 2, 2, '#fff'] : [4, 4, 2, 2, '#fff'],
    f === 0 ? [18, 4, 1, 1, '#fff'] : [4, 18, 1, 1, '#fff'],
  ]
}

function magnet(t) {
  const f = frame(t, 300)
  return [
    [4, 3, 4, 14, '#c79bff'],
    [16, 3, 4, 14, '#c79bff'],
    [4, 14, 16, 5, '#c79bff'],
    [6, 16, 12, 3, '#1a1325'],
    [4, 17, 4, 4, '#e0394a'],
    [16, 17, 4, 4, '#3a6fe0'],
    f === 0 ? [1, 0, 2, 3, 'rgba(255,255,255,0.5)'] : [21, 0, 2, 3, 'rgba(255,255,255,0.5)'],
  ]
}

function snowflake(t) {
  const blocks = [
    [11, 1, 2, 22, '#bdfbff'],
    [1, 11, 22, 2, '#bdfbff'],
    [5, 5, 3, 3, '#bdfbff'], [16, 5, 3, 3, '#bdfbff'],
    [5, 16, 3, 3, '#bdfbff'], [16, 16, 3, 3, '#bdfbff'],
    [10, 10, 4, 4, '#fff'],
  ]
  if (frame(t, 260) === 1) blocks.push([7, 7, 2, 2, '#fff'], [15, 15, 2, 2, '#fff'], [15, 7, 2, 2, '#fff'], [7, 15, 2, 2, '#fff'])
  return blocks
}

function gem(t) {
  const shineX = frame(t, 300) === 0 ? 9 : 14
  return [
    [8, 2, 8, 4, '#5dffb0'],
    [5, 6, 14, 6, '#5dffb0'],
    [6, 12, 12, 5, '#3fd690'],
    [9, 17, 6, 3, '#3fd690'],
    [9, 3, 6, 2, '#bdffe0'],
    [shineX, 4, 3, 11, 'rgba(255,255,255,0.6)'],
  ]
}

function purge(t) {
  const f = frame(t, 220)
  const p = f === 0 ? 3 : 7
  return [
    [10, 2, 3, 12, '#c4915a'],
    [7, 13, 9, 6, '#ffe27a'],
    [6, 18, 11, 3, '#ffe27a'],
    [7, 14, 9, 1, '#c9a23a'],
    [Math.min(20, 14 + p), 13, 2, 2, '#ff8aa8'],
    [Math.min(21, 17 + p), 16, 2, 2, '#ff8aa8'],
  ]
}

function portal(t) {
  const f = frame(t, 200)
  return [
    [1, 1, 22, 22, 'rgba(199,155,255,0.12)'],
    [4, 4, 16, 16, f === 0 ? '#c79bff' : 'rgba(199,155,255,0.25)'],
    [7, 7, 10, 10, f === 1 ? '#ff9ec2' : 'rgba(255,158,194,0.3)'],
    [10, 10, 4, 4, '#8fe4ff'],
  ]
}

// ---------- run perks (permanent upgrades, picked every 10 apples) ----------

function thickSkin() {
  return [
    [6, 4, 12, 8, '#9a9aa0'],
    [6, 4, 12, 3, '#9a9aa0', '#b8b8be'],
    [8, 12, 8, 6, '#84848a'],
    [9, 18, 6, 3, '#6e6e76'],
    [9, 7, 2, 2, '#3a3a40'],
    [13, 7, 2, 2, '#3a3a40'],
    [10, 14, 2, 2, '#3a3a40'],
    [13, 15, 2, 2, '#3a3a40'],
  ]
}

function shortTail() {
  return [
    [2, 9, 10, 6, '#3f9450'],
    [2, 9, 10, 2, '#3f9450', '#2a6e38'],
    [3, 10, 7, 1, '#5bc46f'],
    [13, 11, 6, 2, '#c4c4cc'],
    [17, 5, 2, 6, '#c4c4cc'],
    [17, 13, 2, 6, '#c4c4cc'],
    [16, 3, 3, 3, '#e8e8ee'],
    [16, 16, 3, 3, '#e8e8ee'],
    [19, 11, 3, 2, '#e8e8ee'],
  ]
}

function reflexes() {
  return [
    [5, 5, 14, 10, '#c08fd6'],
    [5, 5, 14, 4, '#c08fd6', '#a868c4'],
    [7, 15, 10, 4, '#a868c4'],
    [8, 7, 2, 2, '#7a3a94'],
    [14, 7, 2, 2, '#7a3a94'],
    [10, 11, 2, 2, '#7a3a94'],
    [16, 11, 2, 2, '#7a3a94'],
  ]
}

function voracious(t) {
  const flick = frame(t, 200)
  return [
    [8, 14, 8, 8, '#c4364a'],
    [8, 14, 8, 3, '#c4364a', '#9a1f30'],
    [9, 21, 6, 1, '#7a1525'],
    [10, flick === 0 ? 6 : 7, 4, 8, '#ff8a3a'],
    [9, flick === 0 ? 9 : 10, 2, 4, '#ffce3a'],
    [13, flick === 0 ? 9 : 10, 2, 4, '#ffce3a'],
    [11, 4, 2, 3, '#ffe27a'],
  ]
}

function lightStep() {
  return [
    [3, 19, 2, 2, 'rgba(189,251,255,0.9)'],
    [6, 16, 2, 2, 'rgba(189,251,255,0.8)'],
    [9, 13, 2, 2, '#bdfbff'],
    [12, 10, 2, 2, '#bdfbff'],
    [15, 7, 2, 2, '#fff'],
    [18, 4, 2, 2, '#fff'],
    [17, 2, 1, 1, '#fff'],
    [20, 3, 1, 1, '#fff'],
  ]
}

function enemySlower() {
  return [
    [4, 4, 16, 16, '#e0394a'],
    [6, 6, 12, 12, '#fff'],
    [9, 9, 6, 6, '#e0394a'],
    [11, 11, 2, 2, '#fff'],
    [10, 0, 4, 3, '#1a1325'],
    [10, 21, 4, 3, '#1a1325'],
    [0, 10, 3, 4, '#1a1325'],
    [21, 10, 3, 4, '#1a1325'],
  ]
}

function greed(t) {
  const f = frame(t, 280)
  return [
    [4, 12, 9, 9, '#e0a82a'],
    [4, 12, 9, 4, '#e0a82a', '#c98f1a'],
    [7, 15, 3, 3, '#a8741a'],
    [9, 8, 9, 9, '#ffce3a'],
    [9, 8, 9, 4, '#ffce3a', '#e0a82a'],
    [12, 11, 3, 3, '#c98f1a'],
    f === 0 ? [3, 4, 2, 2, '#fff'] : [19, 6, 2, 2, '#fff'],
    f === 0 ? [19, 6, 1, 1, '#fff'] : [3, 4, 1, 1, '#fff'],
  ]
}

// ---------- scenery ----------

function grass(t) {
  const lean = frame(t, 500)
  return [
    [2 + lean, 12, 3, 12, '#3f9450'],
    [7 - lean, 8, 3, 16, '#4fae6a'],
    [12 + lean, 11, 3, 13, '#3f9450'],
    [16 - lean, 9, 3, 15, '#4fae6a'],
    [9 - lean, 14, 2, 10, '#2a6e38'],
  ]
}

function cactus() {
  return [
    [9, 4, 6, 18, '#3f9450'],
    [9, 14, 6, 8, '#3f9450', '#2a6e38'],
    [3, 10, 6, 6, '#3f9450'],
    [15, 7, 6, 6, '#3f9450'],
    [11, 5, 1, 16, '#2a6e38'],
    [4, 11, 1, 4, '#2a6e38'],
    [16, 8, 1, 4, '#2a6e38'],
    [10, 2, 4, 3, '#5bc46f'],
  ]
}

function rock(t) {
  const f = frame(t, 600)
  return [
    [3, 12, 18, 9, '#8a8a96'],
    [3, 17, 18, 4, '#8a8a96', '#6e6e78'],
    [6, 7, 12, 6, '#8a8a96'],
    f === 0 ? [7, 9, 5, 3, '#b0b0ba'] : [12, 14, 5, 3, '#b0b0ba'],
    [3, 20, 18, 1, '#6e6e78'],
    [3, 12, 18, 1, '#6e6e78'],
  ]
}

function ice(t) {
  const blocks = [
    [6, 4, 12, 15, 'rgba(180,230,255,0.85)'],
    [9, 1, 6, 6, 'rgba(180,230,255,0.85)'],
    [6, 19, 12, 1, 'rgba(140,200,235,0.7)'],
  ]
  if (frame(t, 260) === 0) blocks.push([9, 7, 3, 3, '#fff'])
  else blocks.push([13, 12, 3, 3, '#fff'])
  return blocks
}

function volcano(t) {
  const tall = frame(t, 220) === 0
  return [
    [1, 14, 22, 9, '#5a3a3a'],
    [6, 8, 12, 7, '#5a3a3a'],
    [9, 6, 6, 3, '#5a3a3a'],
    tall ? [9, 1, 6, 6, '#ff7a3a'] : [9, 0, 6, 7, '#ff7a3a'],
    [11, 3, 3, 3, '#ffe27a'],
    [1, 22, 22, 1, '#3a2424'],
  ]
}

function fire(t) {
  const tall = frame(t, 150) === 0
  return [
    tall ? [7, 2, 10, 21, '#ff8a3a'] : [7, 5, 10, 18, '#ff8a3a'],
    tall ? [9, 10, 6, 13, '#ffe27a'] : [9, 13, 6, 10, '#ffe27a'],
    [10, 18, 4, 5, '#fff3c0'],
  ]
}

function star(t) {
  const c = frame(t, 260) === 0 ? '#fff7c8' : '#ffe9a0'
  return [
    [10, 1, 4, 8, c], [10, 15, 4, 8, c], [1, 10, 8, 4, c], [15, 10, 8, 4, c],
    [9, 9, 6, 6, '#fff'],
  ]
}

function galaxy(t) {
  const f = frame(t, 300)
  return [
    [9, 9, 6, 6, '#fff'],
    [4, 4, 16, 2, 'rgba(199,155,255,0.45)'],
    [4, 18, 16, 2, 'rgba(199,155,255,0.45)'],
    [4, 4, 2, 16, 'rgba(199,155,255,0.3)'],
    [18, 4, 2, 16, 'rgba(199,155,255,0.3)'],
    f === 0 ? [1, 10, 3, 3, '#ff9ec2'] : [20, 10, 3, 3, '#ff9ec2'],
  ]
}

function party(t) {
  const f = frame(t, 200)
  const colors = ['#ff5da0', '#ffd23a', '#5dffb0', '#8fe4ff']
  const pts = [[3, 3], [18, 4], [4, 17], [17, 18], [10, 1], [1, 12], [21, 12], [10, 21]]
  return pts.map(([x, y], i) => [x, (y + f * 2) % 22, 3, 3, colors[i % colors.length]])
}

const SPRITES = {
  turtle, fox, rabbit, ghost, bee, mound, sandworm,
  zap, shield, sparkles, magnet, snowflake, gem, purge, portal,
  grass, cactus, rock, ice, volcano, fire, star, galaxy, party,
  thickSkin, shortTail, reflexes, voracious, lightStep, enemySlower, greed,
}

export const ENEMY_SPRITES = {
  wanderer: 'turtle', hunter: 'fox', sprinter: 'rabbit', phantom: 'ghost', swarm: 'bee', sandworm: 'sandworm',
}

export const POWERUP_SPRITES = {
  speed: 'zap', shield: 'shield', multiplier: 'sparkles', magnet: 'magnet',
  freeze: 'snowflake', gem: 'gem', purge: 'purge',
}

export function drawSprite(ctx, name, cx, cy, size, time) {
  const fn = SPRITES[name]
  if (!fn) return
  drawBlocks(ctx, fn(time), cx, cy, size)
}

export function drawSpriteOutlined(ctx, name, cx, cy, size, time, outlineColor) {
  const fn = SPRITES[name]
  if (!fn) return
  drawBlocksOutlined(ctx, fn(time), cx, cy, size, outlineColor)
}

// Full-bleed parallax backdrop for the world banner: a soft sky tint over
// the stage color, with 3 depth layers of the world's own scenery sprite
// (small/faint/slow in back, big/opaque/lively up front).
export function drawLayeredScene(ctx, w, h, time, bgColor, sceneryIcon) {
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, w, h)
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, 'rgba(255,255,255,0.10)')
  sky.addColorStop(1, 'rgba(0,0,0,0.18)')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  const layers = [
    { count: 5, scale: 0.55, yFrac: 0.4, alpha: 0.3, speed: 0.12 },
    { count: 4, scale: 0.8, yFrac: 0.62, alpha: 0.55, speed: 0.22 },
    { count: 3, scale: 1.15, yFrac: 0.88, alpha: 0.95, speed: 0.4 },
  ]
  layers.forEach((layer, li) => {
    const spacing = w / layer.count
    for (let i = 0; i < layer.count; i++) {
      const sway = Math.sin(time / 1000 * layer.speed + i * 1.7 + li) * 3
      const x = spacing * i + spacing / 2 + sway
      const y = h * layer.yFrac
      const size = h * layer.scale
      ctx.globalAlpha = layer.alpha
      drawSprite(ctx, sceneryIcon, x, y, size, time + i * 300 + li * 150)
    }
  })
  ctx.globalAlpha = 1
}
