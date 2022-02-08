import Link from 'next/link';

import styles from './styles.module.scss';

export default function ExitPreviewMode(): JSX.Element {
  return (
    <Link href="/api/exit-preview">
      <a className={styles.exitPreviewModeButton}>Sair do modo Preview</a>
    </Link>
  );
}
