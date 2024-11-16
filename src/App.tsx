import { useState } from 'react'
import "./scss/style.scss"
import InputFile from "./components/InputFile";
import SprintSelector from "./components/SprintSelector";
import AddFiles from "./ui/AddFiles";
import Header from "./ui/Header";

function App() {
  const [isRun, setRun] = useState(false);
  const handleRunClick = () => {
    setRun(prevState => !prevState);
    // Добавить дальше логику в глобальной части приложения (в том числе, проверку и прочее)
  }
  return (
    <>
      <Header />
      <AddFiles onClick={handleRunClick} isRun={isRun} />

      <SprintSelector items={["test1", "test2"]} />
    </>
  )
}

export default App
