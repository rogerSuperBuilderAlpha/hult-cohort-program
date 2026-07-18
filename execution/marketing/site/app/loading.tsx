import styles from './page.module.css';

export default function GlobalLoading() {
  return (
    <main className={styles.main}>
      <div className={styles.overview} style={{ paddingTop: 80 }}>
        <p className={styles.eyebrow}>Loading</p>
        <h1 className={styles.sectionTitle}>One moment…</h1>
        <p className={styles.overviewLead}>Loading the Hult Cohort platform.</p>
      </div>
    </main>
  );
}
