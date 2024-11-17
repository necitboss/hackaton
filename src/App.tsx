import { useState } from "react";
import "./scss/style.scss";
import Main from "./ui/Main";
import AddFiles from "./ui/AddFiles";
import Header from "./ui/Header";
import { Paths } from "./interfaces/paths.ts";
import { CheckboxOption } from "./interfaces/checkbox_option.ts";
import { NameValue } from "./interfaces/name_value.ts";
import { SprintStats } from "./interfaces/sprint_stats.ts";

import Papa from "papaparse";
import alasql from "alasql";

function parseField(value: string): any {
  const arrayPattern = /^\{([\d\s,]+)\}$/; // Шаблон для поиска чисел в фигурных скобках
  const match = value.match(arrayPattern);

  if (match) {
    return match[1]
      .split(",")
      .map((num) => parseFloat(num.trim()))
      .filter((num) => !isNaN(num));
  }

  return value;
}

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        resolve(content);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };

    reader.onerror = (_event) => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(file);
  });
};

async function parse_file(file: File): Promise<any> {
  const reader = new FileReader();
  const data = readFileAsText(file);

  const result = Papa.parse(data, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    delimiter: ";",
    transform: (value: string) => parseField(value),
  });

  if (result.errors.length > 0) {
    throw new Error(
      `Ошибка при парсинге CSV: ${
        result.errors.map((error: Error) => error.message).join(", ")
      }`,
    );
  }

  return result.data;
}

function parse_sprint(
  name: string,
  entitys: any,
  sprints: any,
  _history: any,
): SprintStats {
  const sqlEntityIdsForSprintName = alasql(
    `SELECT entity_ids FROM ? WHERE sprint_name = '${name}'`,
    [sprints],
  );
  const sqlSprintStartDate = alasql(
    `SELECT sprint_start_date FROM ? WHERE sprint_name = '${name}'`,
    [sprints],
  )[0]?.sprint_start_date;
  const sqlSprintEndDate = alasql(
    `SELECT sprint_end_date FROM ? WHERE sprint_name = '${name}'`,
    [sprints],
  )[0]?.sprint_end_date;

  const sqlSprintStartDate2 = new Date(sqlSprintStartDate);
  sqlSprintStartDate2.setDate(sqlSprintStartDate2.getDate() + 2);

  const stats: SprintStats = {
    executed: 0, // К выполнению
    work: 0, // В работе
    done: 0, // Сделано
    remove: 0, // Снято
    backlog: 0, // Бэклог
    backlog1: 0, // Бэклог1
    backlog2: 0, // Бэклог2
    block: 0, // Заблокировано задач в Ч/Д
  };

  const exclude = [];
  const excludeCount = [];
  const adde = [];
  const addeCount = [];

  const item = sqlEntityIdsForSprintName[0]?.entity_ids;

  const currentDate = new Date(sqlSprintStartDate);
  const endDate = new Date(sqlSprintEndDate);

  while (currentDate <= endDate) {
    exclude.push(0);
    excludeCount.push(0);
    adde.push(0);
    addeCount.push(0);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  let update = false;
  for (let i = 0; i < sqlEntityIdsForSprintName[0]?.entity_ids.length; i++) {
    update = false;

    const sqlExecuted = alasql(
      `SELECT estimation FROM ? WHERE entity_id = '${
        item[i]
      }' AND status = 'Создано'`,
      [entitys],
    );
    const sqlDone = alasql(
      `SELECT estimation FROM ? WHERE entity_id = '${
        item[i]
      }' AND (status = 'Закрыто' OR status = 'Выполнено')`,
      [entitys],
    );
    const sqlRemove = alasql(
      `SELECT estimation FROM ? WHERE entity_id = '${
        item[i]
      }' AND ((status = 'Закрыто' OR status = 'Выполнено') AND (resolution = 'Отклонено' OR resolution = 'Отменено инициатором' OR resolution = 'Дубликат') OR (status = 'Отклонен исполнителем' AND type = 'Дефект'))`,
      [entitys],
    );
    const sqlBacklog = alasql(
      `SELECT estimation FROM ? WHERE entity_id = '${
        item[i]
      }' AND type != 'Дефект' AND update_date < '${sqlSprintStartDate2}'`,
      [entitys],
    );
    const sqlBacklog2 = alasql(
      `SELECT estimation FROM ? WHERE entity_id = '${
        item[i]
      }' AND type != 'Дефект' AND update_date > '${sqlSprintStartDate}' AND update_date < '${sqlSprintStartDate2}'`,
      [entitys],
    );
    const sqlParentTicketId = alasql(
      `SELECT parent_ticket_id FROM ? WHERE entity_id = '${
        item[i]
      }' AND type = 'Закрыто' AND resolution = 'Готово'`,
      [entitys],
    );

    if (!isNaN(Number(sqlExecuted[0]?.estimation))) {
      stats.executed += Number(sqlExecuted[0]?.estimation);
      update = true;
    }

    if (!isNaN(Number(sqlDone[0]?.estimation))) {
      stats.done += Number(sqlDone[0]?.estimation);
      update = true;
    }

    if (!isNaN(Number(sqlRemove[0]?.estimation))) {
      stats.remove += Number(sqlRemove[0]?.estimation);
      update = true;
    }

    if (!update) {
      const sqlWork = alasql(
        `SELECT estimation FROM ? WHERE entity_id = '${item[i]}'`,
        [entitys],
      );
      if (!isNaN(Number(sqlWork[0]?.estimation))) {
        stats.work += Number(sqlWork[0]?.estimation);
      }
    }

    if (!isNaN(Number(sqlBacklog[0]?.estimation))) {
      stats.backlog1 += Number(sqlBacklog[0]?.estimation);
    }

    if (!isNaN(Number(sqlBacklog2[0]?.estimation))) {
      stats.backlog2 += Number(sqlBacklog2[0]?.estimation);
    }

    if (!isNaN(Number(sqlParentTicketId[0]?.parent_ticket_id))) {
      const sqlBlock = alasql(
        `SELECT estimation FROM ? WHERE entity_id = '${
          item[i]
        }' AND type = 'Закрыто' AND resolution = 'Готово'`,
        [entitys],
      );
      stats.block += Number(sqlParentTicketId[0]?.parent_ticket_id);
    }
  }

  stats.executed = stats.executed / 3600;
  stats.executed = Math.round(stats.executed * 10) / 10;

  stats.work = stats.work / 3600;
  stats.work = Math.round(stats.work * 10) / 10;

  stats.done = stats.done / 3600;
  stats.done = Math.round(stats.done * 10) / 10;

  stats.remove = stats.remove / 3600;
  stats.remove = Math.round(stats.remove * 10) / 10;

  stats.backlog1 = stats.backlog1 / 3600;
  //stats.backlog = Math.round(stats.backlog * 10) / 10;
  stats.backlog2 = stats.backlog2 / 3600;
  //stats.backlog2 = Math.round(stats.backlog2 * 10) / 10;

  stats.backlog = stats.backlog2 / stats.backlog1 * 100;
  stats.backlog = Math.round(stats.backlog * 10) / 10;

  stats.block = stats.block / 3600;
  stats.block = Math.round(stats.backlog * 10) / 10;

  //let sql_entity = alasql('SELECT * FROM ? LIMIT 10', [history]);
  //let sql_sprint = alasql(`SELECT * FROM ? WHERE sprint_start_date = 2024-07-03-19:00:00.000000`, [sprints]);
  //console.log(sql_sprint);
  //let SQL1 = alasql('SELECT history_property_name FROM ? WHERE history_version = 1', [sprints]);
  //console.log(SQL1);
  //console.log(sprints);  // Выводим результат
  return stats;
}

function App() {
  const [sprintLength, setSprintLength] = useState(14);

  const [names, setNames] = useState<string[]>([
    "sprint 1",
    "sprint 2",
    "sprint 3",
  ]);
  const [paths, setPaths] = useState<Paths | null>(null);

  const [sprints, setSprints] = useState<SprintStats>({
    executed: 0,
    work: 0,
    done: 0,
    remove: 0,
    backlog: 0,
    backlog1: 0,
    backlog2: 0,
    block: 0,
  });
  const [entities, setEntities] = useState<SprintStats>({
    executed: 0,
    work: 0,
    done: 0,
    remove: 0,
    backlog: 0,
    backlog1: 0,
    backlog2: 0,
    block: 0,
  });
  const [history, setHistory] = useState<SprintStats>({
    executed: 0,
    work: 0,
    done: 0,
    remove: 0,
    backlog: 0,
    backlog1: 0,
    backlog2: 0,
    block: 0,
  });

  const [statuses, setStatuses] = useState<NameValue[]>([{
    name: "В работе",
    value: 15,
  }, {
    name: "Сделано",
    value: 50,
  }, {
    name: "К выполнению",
    value: 30,
  }, {
    name: "Снято",
    value: 5,
  }, {
    name: "Бэклог",
    value: 99,
  }, {
    name: "Заблокированно в Ч/Д",
    value: 0,
  }]);
  const [isRun, setRun] = useState(false);

  const handleGetChecked = (values: CheckboxOption[]) => {
    console.log(values);
    // Если необходимо поменять статус на основе предыдущего, можно сделать так:
    const checked = values.filter((obj) => obj.checked === true);

    const total_stats: SprintStats = {
      executed: 0,
      work: 0,
      done: 0,
      remove: 0,
      backlog: 0,
      backlog1: 0,
      backlog2: 0,
      block: 0,
    };
    for (
      const result of checked.map((name) => {
        return parse_sprint(name.label, entities, sprints, history);
      })
    ) {
      total_stats.executed += result.executed;
      total_stats.work += result.work;
      total_stats.done += result.done;
      total_stats.remove += result.remove;
      total_stats.backlog += result.backlog;
      total_stats.backlog1 += result.backlog1;
      total_stats.backlog2 += result.backlog2;
      total_stats.block += result.block;
    }

    setStatuses([{
      name: "В работе",
      value: total_stats.work,
    }, {
      name: "Сделано",
      value: total_stats.done,
    }, {
      name: "К выполнению",
      value: total_stats.executed,
    }, {
      name: "Снято",
      value: total_stats.remove,
    }, {
      name: "Бэклог",
      value: total_stats.backlog,
    }, {
      name: "Заблокированно в Ч/Д",
      value: total_stats.block,
    }]);
  };

  const onChangePaths = (new_paths: Paths) => {
    console.log(new_paths);

    setPaths(new_paths);
  };

  const handleRunClick = async (paths: Paths) => {
    setRun((prevState: boolean) => !prevState);

    setEntities(await parse_file(paths.entities));
    setSprints(await parse_file(paths.sprints));
    setHistory(await parse_file(paths.history));

    setNames(alasql(`SELECT sprint_name FROM ?`, [sprints]));

    const result = parse_sprint(names[0], entities, sprints, history);

    setStatuses([{
      name: "В работе",
      value: result.work,
    }, {
      name: "Сделано",
      value: result.done,
    }, {
      name: "К выполнению",
      value: result.executed,
    }, {
      name: "Снято",
      value: result.remove,
    }, {
      name: "Бэклог",
      value: result.backlog,
    }, {
      name: "Заблокированно в Ч/Д",
      value: result.block,
    }]);
  };

  const handleAnalyzeDay = (value: number) => {
    console.log(value);
  };

  return (
    <>
      <Header />
      <AddFiles
        onChangePaths={onChangePaths}
        onClick={handleRunClick}
        isRun={isRun}
      />
      {isRun && (
        <Main
          statuses={statuses}
          names={names}
          onGetChecked={handleGetChecked}
          onAnalyzeClick={handleAnalyzeDay}
          sprintLength={sprintLength}
        />
      )}
    </>
  );
}

export default App;
