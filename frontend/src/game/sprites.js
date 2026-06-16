import { drawBlocks, frame } from './pixel'

// ---------- enemies (16x16 grid, side view) ----------

function turtle(t) {
  const legUp = frame(t, 220) === 0
  return [
    [2, 5, 10, 6, '#2f7d4a'],
    [3, 4, 8, 1, '#2f7d4a'],
    [4, 6, 6, 2, '#4fae6a'],
    [2, 10, 10, 1, '#1f5c35'],
    [11, 7, 4, 4, '#6fc285'],
    [13, 8, 1, 1, '#1a1325'],
    [3, legUp ? 10 : 11, 2, 3, '#3f9450'],
    [10, legUp ? 11 : 10, 2, 3, '#3f9450'],
    [6, legUp ? 11 : 10, 2, 3, '#3f9450'],
  ]
}

function fox(t) {
  const tailUp = frame(t, 260) === 0
  return [
    [2, 7, 9, 6, '#f0883a'],
    [3, 9, 5, 3, '#fff3e0'],
    [9, 4, 6, 6, '#f0883a'],
    [9, 2, 2, 3, '#f0883a'],
    [13, 2, 2, 3, '#f0883a'],
    [13, 7, 3, 2, '#fff3e0'],
    [11, 6, 1, 1, '#1a1325'],
    tailUp ? [0, 4, 3, 5, '#f0883a'] : [0, 6, 3, 5, '#f0883a'],
    tailUp ? [0, 4, 2, 2, '#fff'] : [0, 9, 2, 2, '#fff'],
  ]
}

function rabbit(t) {
  const earBack = frame(t, 150) === 0
  return [
    [2, 8, 9, 6, '#e8e4f0'],
    [9, 5, 6, 6, '#e8e4f0'],
    [13, 7, 3, 2, '#fff'],
    [11, 7, 1, 1, '#1a1325'],
    earBack ? [9, 0, 2, 6, '#e8e4f0'] : [8, 0, 2, 6, '#e8e4f0'],
    earBack ? [12, 0, 2, 6, '#e8e4f0'] : [13, 0, 2, 6, '#e8e4f0'],
    earBack ? [9, 1, 1, 4, '#f7a8c4'] : [8, 1, 1, 4, '#f7a8c4'],
    earBack ? [12, 1, 1, 4, '#f7a8c4'] : [13, 1, 1, 4, '#f7a8c4'],
    [0, 9, 2, 1, 'rgba(255,255,255,0.4)'],
    [0, 11, 3, 1, 'rgba(255,255,255,0.3)'],
  ]
}

function ghost(t) {
  const dy = frame(t, 300)
  return [
    [3, 3 + dy, 10, 8, 'rgba(230,230,255,0.92)'],
    [3, 11 + dy, 2, 2, 'rgba(230,230,255,0.92)'],
    [7, 11 + dy, 2, 2, 'rgba(230,230,255,0.92)'],
    [11, 11 + dy, 2, 2, 'rgba(230,230,255,0.92)'],
    [5, 5 + dy, 1, 2, '#2a2540'],
    [10, 5 + dy, 1, 2, '#2a2540'],
  ]
}

function bee(t) {
  const wingUp = frame(t, 90) === 0
  return [
    wingUp ? [1, 3, 5, 3, 'rgba(255,255,255,0.6)'] : [1, 5, 5, 2, 'rgba(255,255,255,0.6)'],
    wingUp ? [10, 3, 5, 3, 'rgba(255,255,255,0.6)'] : [10, 5, 5, 2, 'rgba(255,255,255,0.6)'],
    [4, 6, 8, 7, '#ffce3a'],
    [4, 8, 8, 1, '#262220'],
    [4, 11, 8, 1, '#262220'],
    [11, 6, 2, 3, '#262220'],
    [12, 6, 1, 1, '#1a1325'],
  ]
}

// ---------- power-ups (original blocky shapes) ----------

function zap() {
  return [
    [9, 1, 3, 3, '#ffd23a'],
    [7, 4, 3, 3, '#ffd23a'],
    [9, 4, 4, 2, '#ffd23a'],
    [5, 7, 4, 3, '#ffd23a'],
    [8, 7, 3, 2, '#c98f1a'],
    [6, 10, 4, 3, '#ffd23a'],
    [9, 9, 3, 3, '#ffd23a'],
  ]
}

function shield(t) {
  const shineX = frame(t, 250) === 0 ? 4 : 9
  return [
    [3, 2, 10, 3, '#7ed4e0'],
    [2, 5, 12, 5, '#7ed4e0'],
    [3, 10, 10, 3, '#4a9eae'],
    [5, 13, 6, 1, '#4a9eae'],
    [shineX, 3, 2, 9, 'rgba(255,255,255,0.55)'],
  ]
}

function sparkles(t) {
  const f = frame(t, 260)
  return [
    [7, 1, 2, 5, '#ff5da0'],
    [7, 10, 2, 5, '#ff5da0'],
    [1, 7, 5, 2, '#ff5da0'],
    [10, 7, 5, 2, '#ff5da0'],
    [7, 7, 2, 2, '#ff5da0'],
    f === 0 ? [3, 3, 1, 1, '#fff'] : [12, 12, 1, 1, '#fff'],
    f === 0 ? [12, 12, 1, 1, '#fff'] : [3, 3, 1, 1, '#fff'],
  ]
}

function magnet(t) {
  const f = frame(t, 300)
  return [
    [3, 2, 3, 9, '#c79bff'],
    [10, 2, 3, 9, '#c79bff'],
    [3, 9, 10, 3, '#c79bff'],
    [3, 11, 3, 3, '#e0394a'],
    [10, 11, 3, 3, '#3a6fe0'],
    f === 0 ? [1, 0, 1, 2, 'rgba(255,255,255,0.5)'] : [14, 0, 1, 2, 'rgba(255,255,255,0.5)'],
  ]
}

function snowflake(t) {
  const blocks = [
    [7, 1, 2, 14, '#bdfbff'],
    [1, 7, 14, 2, '#bdfbff'],
    [3, 3, 2, 2, '#bdfbff'], [11, 3, 2, 2, '#bdfbff'],
    [3, 11, 2, 2, '#bdfbff'], [11, 11, 2, 2, '#bdfbff'],
    [7, 7, 2, 2, '#fff'],
  ]
  if (frame(t, 260) === 1) blocks.push([5, 5, 1, 1, '#fff'], [10, 10, 1, 1, '#fff'])
  return blocks
}

function gem(t) {
  const shineX = frame(t, 300) === 0 ? 6 : 9
  return [
    [5, 2, 6, 3, '#5dffb0'],
    [3, 5, 10, 4, '#5dffb0'],
    [4, 9, 8, 3, '#3fd690'],
    [6, 12, 4, 2, '#3fd690'],
    [shineX, 3, 2, 7, 'rgba(255,255,255,0.6)'],
  ]
}

function purge(t) {
  const f = frame(t, 220)
  const p = f === 0 ? 2 : 5
  return [
    [7, 2, 2, 8, '#c4915a'],
    [5, 9, 6, 4, '#ffe27a'],
    [4, 12, 8, 2, '#ffe27a'],
    [10 + p, 9, 1, 1, '#ff8aa8'],
    [12 + p > 15 ? 15 : 12 + p, 11, 1, 1, '#ff8aa8'],
  ]
}

function portal(t) {
  const f = frame(t, 200)
  return [
    [1, 1, 14, 14, 'rgba(199,155,255,0.15)'],
    [3, 3, 10, 10, f === 0 ? '#c79bff' : 'rgba(199,155,255,0.25)'],
    [5, 5, 6, 6, f === 1 ? '#ff9ec2' : 'rgba(255,158,194,0.3)'],
    [7, 7, 2, 2, '#8fe4ff'],
  ]
}

// ---------- scenery ----------

function grass(t) {
  const lean = frame(t, 500)
  return [
    [1 + lean, 8, 2, 8, '#3f9450'],
    [5 - lean, 6, 2, 10, '#4fae6a'],
    [9 + lean, 8, 2, 8, '#3f9450'],
    [12 - lean, 7, 2, 9, '#4fae6a'],
  ]
}

function cactus() {
  return [
    [6, 3, 4, 12, '#3f9450'],
    [2, 7, 4, 4, '#3f9450'],
    [10, 5, 4, 4, '#3f9450'],
    [7, 4, 1, 10, '#2a6e38'],
    [3, 8, 1, 2, '#2a6e38'],
    [11, 6, 1, 2, '#2a6e38'],
  ]
}

function rock(t) {
  const f = frame(t, 600)
  return [
    [2, 8, 12, 6, '#8a8a96'],
    [4, 5, 8, 4, '#8a8a96'],
    f === 0 ? [5, 6, 3, 2, '#b0b0ba'] : [8, 9, 3, 2, '#b0b0ba'],
    [2, 13, 12, 1, '#6e6e78'],
  ]
}

function ice(t) {
  const blocks = [
    [4, 3, 8, 10, 'rgba(180,230,255,0.85)'],
    [6, 1, 4, 4, 'rgba(180,230,255,0.85)'],
  ]
  if (frame(t, 260) === 0) blocks.push([6, 5, 2, 2, '#fff'])
  else blocks.push([9, 8, 2, 2, '#fff'])
  return blocks
}

function volcano(t) {
  const tall = frame(t, 220) === 0
  return [
    [1, 9, 14, 6, '#5a3a3a'],
    [4, 5, 8, 5, '#5a3a3a'],
    [6, 4, 4, 2, '#5a3a3a'],
    tall ? [6, 1, 4, 4, '#ff7a3a'] : [6, 0, 4, 5, '#ff7a3a'],
    [7, 2, 2, 2, '#ffe27a'],
  ]
}

function fire(t) {
  const tall = frame(t, 150) === 0
  return [
    tall ? [5, 1, 6, 14, '#ff8a3a'] : [5, 3, 6, 12, '#ff8a3a'],
    tall ? [6, 7, 4, 8, '#ffe27a'] : [6, 9, 4, 6, '#ffe27a'],
  ]
}

function star(t) {
  const c = frame(t, 260) === 0 ? '#fff7c8' : '#ffe9a0'
  return [
    [7, 1, 2, 5, c], [7, 10, 2, 5, c], [1, 7, 5, 2, c], [10, 7, 5, 2, c],
    [6, 6, 4, 4, '#fff'],
  ]
}

function galaxy(t) {
  const f = frame(t, 300)
  return [
    [6, 6, 4, 4, '#fff'],
    [3, 3, 10, 1, 'rgba(199,155,255,0.45)'],
    [3, 12, 10, 1, 'rgba(199,155,255,0.45)'],
    [3, 3, 1, 10, 'rgba(199,155,255,0.3)'],
    [12, 3, 1, 10, 'rgba(199,155,255,0.3)'],
    f === 0 ? [1, 7, 2, 2, '#ff9ec2'] : [13, 7, 2, 2, '#ff9ec2'],
  ]
}

function party(t) {
  const f = frame(t, 200)
  const colors = ['#ff5da0', '#ffd23a', '#5dffb0', '#8fe4ff']
  const pts = [[2, 2], [12, 3], [3, 11], [11, 12], [7, 1], [1, 8], [14, 8], [7, 14]]
  return pts.map(([x, y], i) => [x, (y + f) % 15, 2, 2, colors[i % colors.length]])
}

const SPRITES = {
  turtle, fox, rabbit, ghost, bee,
  zap, shield, sparkles, magnet, snowflake, gem, purge, portal,
  grass, cactus, rock, ice, volcano, fire, star, galaxy, party,
}

export const ENEMY_SPRITES = {
  wanderer: 'turtle', hunter: 'fox', sprinter: 'rabbit', phantom: 'ghost', swarm: 'bee',
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
