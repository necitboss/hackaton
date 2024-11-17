import React, {ChangeEvent, useRef, useState} from 'react';
import styles from "./InputFile.module.scss";
import {Paths} from "../../interfaces/paths.ts";

interface Props {
	title: string;
	// state: React.Dispatch<React.SetStateAction<string>>;
	id: string;
	onChangePaths: (path: FileList | null) => void;
}

const InputFile: React.FC<Props> = ({title, id, onChangePaths}) => {
	const chooseFile = "Выберите .csv файл";
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [fileName, setFileName] = useState<string>(chooseFile)
	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = fileInputRef.current?.files;
		if (file) {
			setFileName(file[0].name);
			onChangePaths(file);
		}else {
			setFileName(chooseFile);
			onChangePaths(null);
		}
	}
	return (
		<div className={styles.input_file}>
			<div className={styles.input_file__title}>{title}</div>
			<input
				ref={fileInputRef}
				type="file"
				accept=".csv"
				className={styles.input_file__input}
				onChange={handleFileChange}
			/>
			<label
				onClick={() => fileInputRef.current?.click()}
				className={styles.input_file__label}
			>{fileName}</label>
		</div>
	);
};

export default InputFile;