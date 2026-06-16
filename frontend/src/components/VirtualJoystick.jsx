import styles from './VirtualJoystick.module.css'

export const JOYSTICK_RADIUS = 42
export const JOYSTICK_DEADZONE = 14

export function getDirectionFromDelta(dx, dy, deadzone = JOYSTICK_DEADZONE) {
  const dist = Math.hypot(dx, dy)
  if (dist < deadzone) return null
  return Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 })
    : (dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 })
}

export function clampToRadius(dx, dy, radius = JOYSTICK_RADIUS) {
  const dist = Math.hypot(dx, dy)
  if (dist <= radius) return { dx, dy }
  const ratio = radius / dist
  return { dx: dx * ratio, dy: dy * ratio }
}

export default function VirtualJoystick({ origin, knob }) {
  if (!origin) return null
  return (
    <div
      className={styles.base}
      style={{
        left: origin.x - JOYSTICK_RADIUS,
        top: origin.y - JOYSTICK_RADIUS,
        width: JOYSTICK_RADIUS * 2,
        height: JOYSTICK_RADIUS * 2,
      }}
    >
      <div
        className={styles.knob}
        style={{ transform: `translate(${knob.dx}px, ${knob.dy}px)` }}
      />
    </div>
  )
}
