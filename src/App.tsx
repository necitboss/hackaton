import { useState } from 'react'
import "./scss/style.scss"
import InputFile from "./components/InputFile";
import Main from "./ui/Main";
import AddFiles from "./ui/AddFiles";
import Header from "./ui/Header";
import {Paths} from "./interfaces/paths.ts";
import {CheckboxOption} from "./interfaces/checkbox_option.ts";
import {NameValue} from "./interfaces/name_value.ts";



function App() {
  // Поменяете на то, что в файлах находится. Все делать, конечно же, через
  const [sprintLength, setSprintLength] = useState(14);

  const [names, setNames] = useState<string[]>([
    "sprint 1",
    "sprint 2",
    "sprint 3",
  ])
  const [paths, setPaths] = useState<Paths>( {
    sprints: "",
    entities: "",
    history: ""
  })
  const [statuses, setStatuses] = useState<NameValue[]>([{
    name: "В работе",
    value: 15
  },{
    name: "Сделано",
    value: 50
  },{
    name: "К выполнению",
    value: 30
  },{
    name: "Снято",
    value: 5
  }])
  // Поменять на нужное, но в таком формате
  const [isRun, setRun] = useState(false);

  const onChangePaths = (other_paths: Paths) => {
    paths.sprints = other_paths.sprints;
    paths.entities = other_paths.entities;
    paths.history = other_paths.history;
    console.log(paths);
  }
  const handleGetChecked = (value: CheckboxOption[]) => {
    console.log(value);
    // Если необходимо поменять статус на основе предыдущего, можно сделать так:
    // setStatuses((prevState) => {
    //   return prevState.map(prev => {
    //     if (prev.name === "Снято"){
    //       prev.value = 3;
    //     }
    //     return prev;
    //   })
    // })
  }
  const handleRunClick = () => {
    setRun(prevState => !prevState);
    // Добавить дальше логику в глобальной части приложения (в том числе, проверку и прочее)
    // В paths после нажатия кнопки "Запустить" будут храниться пути к файлам
  }
  const handleAnalyzeDay = (value: number) => {
    console.log(value);
  }

  //
  return (
    <>
      <Header />      
      <AddFiles onChangePaths={onChangePaths} onClick={handleRunClick} isRun={isRun} />
      {/* Если надо, то можно сделать отображение после того, как будут загружены 3 файла. Это делается так:
      {isRun &&
        <Main statuses={statuses} names={names} onGetChecked={handleGetChecked} onAnalyzeClick={handleAnalyzeDay} sprintLength={sprintLength}/>
      }
       */}
      <Main statuses={statuses} names={names} onGetChecked={handleGetChecked} onAnalyzeClick={handleAnalyzeDay} sprintLength={sprintLength}/>

    </>
  )
}

export default App
