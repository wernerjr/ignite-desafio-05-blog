import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.headerContainer}>
      <img src="./Logo.png" alt="" />
    </div>
  );
}
