import React, {useState} from 'react';
import styles from "./AddFiles.module.scss"
import InputFile from "../../components/InputFile";
import {Paths} from "../../interfaces/paths.ts";

interface Props {
	onClick: () => void;
	isRun: boolean;
	onChangePaths: (other_paths: Paths) => void;
}

const AddFiles: React.FC<Props> = ({onClick, isRun, onChangePaths}) => {
	const [sprintPath, setSprintPath] = useState("");
	const [entitiesPath, setEntitiesPath] = useState("");
	const [historyPath, setHistoryPath] = useState("");
	const handleSprint = (path: string) => {
		setSprintPath(path);
	}
	const handleEntities = (path: string) => {
		setEntitiesPath(path);
	}
	const handleHistory = (path: string) => {
		setHistoryPath(path);
	}
	return (
		<section className={styles.add_files}>
			<div className="container">
				<div className={styles.add_files__inner + " " + (isRun ? styles.hide : "")}>
					<div className={styles.add_files__title}>Загрузите 3 csv файла</div>
					<div className={styles.add_files__block}>
						<InputFile title={"файл спринтов (sprints)"} id="sprints" onChangePaths={handleSprint}/>
						<InputFile title={"файл задач (enitities)"} id="entities" onChangePaths={handleEntities}/>
						<InputFile title={"файл истории (history)"} id="history" onChangePaths={handleHistory}/>
					</div>
				</div>
				<div className={styles.add_files__center}>
					<button onClick={() => {
						onClick();
						if (!isRun) {
							onChangePaths({
								sprints: sprintPath,
								entities: entitiesPath,
								history: historyPath
							})
						}
					}} className={styles.add_files__btn}>{isRun ? "Изменить": "Запустить"}</button>
				</div>
			</div>
		</section>
	);
};

export default AddFiles;