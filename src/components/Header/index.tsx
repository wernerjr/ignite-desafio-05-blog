import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.headerContainer}>
      <Link href="/">
        <a>
          <img src="../Logo.png" alt="logo" />
        </a>
      </Link>
    </div>
  );
}
