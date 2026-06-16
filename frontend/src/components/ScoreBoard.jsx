import { useEffect, useRef, useState } from 'react'
import { drawLayeredScene } from '../game/sprites'
import PixelIcon from './PixelIcon'
import styles from './ScoreBoard.module.css'

const WORLD_SPRITE = {
  Bosque: 'grass',
  Desierto: 'cactus',
  Hielo: 'ice',
  Lava: 'fire',
  'Noche Cósmica': 'star',
  Caos: 'party',
  Dimensión: 'portal',
}

function SceneBackground({ icon, bg }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const loop = () => {
      drawLayeredScene(ctx, canvas.width, canvas.height, Date.now(), bg, icon)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [icon, bg])

  return <canvas ref={canvasRef} width={640} height={120} className={styles.sceneCanvas} />
}

function useTweenedNumber(target, durationMs = 350) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    const start = performance.now()
    cancelAnimationFrame(rafRef.current)

    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, durationMs])

  return value
}

function EffectBadge({ effect, now }) {
  const remaining = effect.expiresAt ? Math.max(0, effect.expiresAt - now) : 0
  const pct = effect.duration ? Math.max(0, Math.min(1, remaining / effect.duration)) : 1
  const deg = pct * 360
  return (
    <div
      className={styles.effectBadge}
      title={effect.label}
      style={{
        '--effect-color': effect.color,
        background: `conic-gradient(${effect.color} ${deg}deg, rgba(255,255,255,0.12) ${deg}deg)`,
      }}
    >
      <span className={styles.effectIcon}>{effect.icon}</span>
    </div>
  )
}

export default function ScoreBoard({ hud }) {
  const { score, best, stage, shield, activeEffects, streak, stageFlashKey } = hud
  const displayScore = useTweenedNumber(score)
  const [bump, setBump] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const prevScoreRef = useRef(score)

  useEffect(() => {
    if (score > prevScoreRef.current) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 280)
      prevScoreRef.current = score
      return () => clearTimeout(t)
    }
    prevScoreRef.current = score
  }, [score])

  useEffect(() => {
    if (!activeEffects.length) return
    const id = setInterval(() => setNow(Date.now()), 150)
    return () => clearInterval(id)
  }, [activeEffects.length])

  const delta = score - best

  return (
    <div className={styles.wrap} style={{ '--accent': stage.accent }}>
      <SceneBackground icon={WORLD_SPRITE[stage.name] || 'star'} bg={stage.bg} />
      <div className={styles.scrim} />
      <div className={styles.content}>
        <div key={stageFlashKey} className={styles.worldBadge}>
          <PixelIcon name={WORLD_SPRITE[stage.name] || 'star'} className={styles.worldIconCanvas} />
          <span className={styles.stageName}>{stage.name}</span>
        </div>

        <div className={styles.scoreBlock}>
          <span className={`${styles.score} ${bump ? styles.scoreBump : ''}`}>{displayScore}</span>
          {score > 0 && (
            <span className={`${styles.delta} ${delta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
              {delta >= 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>

        <div className={styles.bestPill}>
          <span className={styles.bestLabel}>Mejor</span>
          <span className={styles.bestValue}>{best}</span>
        </div>

        <div className={styles.statusCol}>
          <div className={styles.statusRow}>
            {streak >= 3 && <span className={styles.streak}>🔥 Racha x{streak}</span>}
            {shield && <span className={styles.shield}>🛡️ Escudo activo</span>}
          </div>
          {activeEffects.length > 0 && (
            <div className={styles.effects}>
              {activeEffects.map(e => <EffectBadge key={e.id} effect={e} now={now} />)}
            </div>
          )}
        </div>
      </div>

      <div key={`flash-${stageFlashKey}`} className={styles.stageFlash}>
        <PixelIcon name={WORLD_SPRITE[stage.name] || 'star'} size={36} />
        <span>{stage.name}</span>
      </div>
    </div>
  )
}
