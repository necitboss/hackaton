import React, {useState} from 'react';
import styles from "./AddFiles.module.scss"
import InputFile from "../../components/InputFile";

interface Props {
	onClick: () => void;
	isRun: boolean;
}

const AddFiles: React.FC<Props> = ({onClick, isRun}) => {

	return (
		<section className={styles.add_files}>
			<div className="container">
				<div className={styles.add_files__inner + " " + (isRun ? styles.hide : "")}>
					<div className={styles.add_files__title}>Загрузите 3 csv файла</div>
					<div className={styles.add_files__block}>
						<InputFile title={"файл спринтов (sprints)"}/>
						<InputFile title={"файл задач (enitities)"}/>
						<InputFile title={"файл истории (history)"}/>
					</div>
				</div>
				<div className={styles.add_files__center}>
					<button onClick={onClick} className={styles.add_files__btn}>{isRun ? "Изменить": "Запустить"}</button>
				</div>
			</div>
		</section>
	);
};

export default AddFiles;