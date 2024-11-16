import { useState } from 'react'
import "./scss/style.scss"
import InputFile from "./components/InputFile";
import AddFiles from "./ui/AddFiles";
import Header from "./ui/Header";
import {Paths} from "./interfaces/paths.ts";



function App() {
  const paths = {
    sprints: "",
    entities: "",
    history: ""
  }
  const onChangePaths = (other_paths: Paths) => {
    paths.sprints = other_paths.sprints;
    paths.entities = other_paths.entities;
    paths.history = other_paths.history;
    console.log(paths);
  }
  const [isRun, setRun] = useState(false);
  const handleRunClick = () => {
    setRun(prevState => !prevState);
    // Добавить дальше логику в глобальной части приложения (в том числе, проверку и прочее)
  }
  return (
    <>
      <Header />
      <AddFiles onChangePaths={onChangePaths} onClick={handleRunClick} isRun={isRun} />
    </>
  )
}

export default App
