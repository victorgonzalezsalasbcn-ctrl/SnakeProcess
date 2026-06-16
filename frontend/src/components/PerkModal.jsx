import PixelIcon from './PixelIcon'
import styles from './PerkModal.module.css'

export default function PerkModal({ stage, perks, onPick }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.kicker}>Etapa {stage.index + 1} · {stage.icon} {stage.name}</p>
        <h2 className={styles.title}>Elige una mejora</h2>
        <div className={styles.options}>
          {perks.map(perk => (
            <button
              key={perk.id}
              className={styles.option}
              onClick={() => onPick(perk)}
            >
              <PixelIcon name={perk.id} size={32} className={styles.icon} />
              <span className={styles.name}>{perk.name}</span>
              <span className={styles.desc}>{perk.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
