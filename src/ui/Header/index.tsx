import React from 'react';
import styles from "./Header.module.scss"

const Header = () => {
	return (
		<header className={styles.header}>
			<div className="container">
				<div className={styles.header__inner}>
					<h1 className={styles.header__title}>Pulse</h1>
				</div>
			</div>
		</header>
	);
};

export default Header;