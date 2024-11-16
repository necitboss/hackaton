import React from 'react';
import styles from "./Button.module.scss"
interface Props {
	onClick?: () => void;
	text: string;
}

const Button: React.FC<Props> = ({onClick, text}) => {
	return (
		<button className={styles.button} onClick={onClick}>{text}</button>
	);
};

export default Button;