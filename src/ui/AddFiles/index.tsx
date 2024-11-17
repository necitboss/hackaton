import React, { useState } from "react";
import styles from "./AddFiles.module.scss";
import InputFile from "../../components/InputFile";
import { Paths } from "../../interfaces/paths.ts";
import Button from "../../components/Button";

interface Props {
  onClick: (paths: Paths) => void;
  isRun: boolean;
  onChangePaths: (other_paths: Paths) => void;
}

const AddFiles: React.FC<Props> = ({ onClick, isRun, onChangePaths }) => {
  const [sprint, setSprint] = useState<File | null>(null);
  const [entities, setEntities] = useState<File | null>(null);
  const [history, setHistory] = useState<File | null>(null);
  const handleSprint = (path: File | null) => {
    setSprint(path);
  };
  const handleEntities = (path: File | null) => {
    setEntities(path);
  };
  const handleHistory = (path: File | null) => {
    setHistory(path);
  };
  return (
    <section className={styles.add_files}>
      <div className="container">
        <div
          className={styles.add_files__inner + " " + (isRun ? styles.hide : "")}
        >
          <h3 className="title">Загрузите 3 csv файла</h3>
          <div className={styles.add_files__block}>
            <InputFile
              title={"файл спринтов (sprints)"}
              id="sprints"
              onChangePaths={handleSprint}
            />
            <InputFile
              title={"файл задач (enitities)"}
              id="entities"
              onChangePaths={handleEntities}
            />
            <InputFile
              title={"файл истории (history)"}
              id="history"
              onChangePaths={handleHistory}
            />
          </div>
        </div>
        <div className={styles.add_files__center}>
          <Button
            onClick={() => {
              if (!isRun) {
                sprint && entities && history && onChangePaths({
                  sprints: sprint,
                  entities: entities,
                  history: history,
                });
              }
              onClick({
                sprints: sprint,
                entities: entities,
                history: history,
              });
            }}
            text={isRun ? "Изменить" : "Запустить"}
          >
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AddFiles;

