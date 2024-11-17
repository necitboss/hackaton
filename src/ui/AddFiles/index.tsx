import React, {useState} from 'react';
import styles from "./AddFiles.module.scss"
import InputFile from "../../components/InputFile";
import {Paths} from "../../interfaces/paths.ts";
import Button from "../../components/Button";

interface Props {
	onClick: () => void;
	isRun: boolean;
	onChangePaths: (other_paths: Paths) => void;
}

const AddFiles: React.FC<Props> = ({onClick, isRun, onChangePaths}) => {
	const [sprintPath, setSprintPath] = useState<FileList | null>(null);
	const [entitiesPath, setEntitiesPath] = useState<FileList | null>(null);
	const [historyPath, setHistoryPath] = useState<FileList | null>(null);
	const handleSprint = (path: FileList | null) => {
		setSprintPath(path);
	}
	const handleEntities = (path: FileList | null) => {
		setEntitiesPath(path);
	}
	const handleHistory = (path: FileList | null) => {
		setHistoryPath(path);
	}
	return (
		<section className={styles.add_files}>
			<div className="container">
				<div className={styles.add_files__inner + " " + (isRun ? styles.hide : "")}>
					<h3 className="title">Загрузите 3 csv файла</h3>
					<div className={styles.add_files__block}>
						<InputFile title={"файл спринтов (sprints)"} id="sprints" onChangePaths={handleSprint}/>
						<InputFile title={"файл задач (enitities)"} id="entities" onChangePaths={handleEntities}/>
						<InputFile title={"файл истории (history)"} id="history" onChangePaths={handleHistory}/>
					</div>
				</div>
				<div className={styles.add_files__center}>
					<Button onClick={() => {
						onClick();
						if (!isRun) {
							onChangePaths({
								sprints: sprintPath,
								entities: entitiesPath,
								history: historyPath
							})
						}
					}} text={isRun ? "Изменить": "Запустить"}></Button>
				</div>
			</div>
		</section>
	);
};

export default AddFiles;