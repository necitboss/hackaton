import React, {useRef, useState} from 'react';
import styles from "./InputFile.module.scss";

interface Props {
	title: string;
}

const InputFile: React.FC<Props> = ({title}) => {
	const chooseFile = "Выберите .csv файл";
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [fileName, setFileName] = useState<string>(chooseFile)
	const handleFileChange = () => {
		const file = fileInputRef.current?.files?.[0];
		if (file) {
			setFileName(file.name);
		}else {
			setFileName(chooseFile);
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