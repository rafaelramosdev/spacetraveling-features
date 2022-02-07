import styles from './styles.module.scss';

export default function ExitPreviewMode(): JSX.Element {
  return (
    <button type="button" className={styles.exitPreviewModeButton}>
      Sair do modo Preview
    </button>
  );
}
