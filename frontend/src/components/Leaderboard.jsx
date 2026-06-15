import { getLeaderboard } from '../api/scores'
import styles from './Leaderboard.module.css'

export default function Leaderboard({ refresh }) {
  const entries = getLeaderboard()

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Ranking local</h2>
      {entries.length === 0 ? (
        <p className={styles.msg}>Sé el primero en aparecer aquí.</p>
      ) : (
        <ol className={styles.list}>
          {entries.map((e, i) => (
            <li key={e.id} className={`${styles.entry} ${i === 0 ? styles.first : ''}`}>
              <span className={styles.pos}>{i + 1}</span>
              <span className={styles.name}>{e.playerName}</span>
              <span className={styles.score}>{e.score} pts</span>
              <span className={styles.level}>Nv. {e.level}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
