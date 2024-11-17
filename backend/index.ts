
//import fs from 'fs'; // Для работы с файловой системой

import Papa from 'papaparse';
import fs from 'fs'; // Для работы с файловой системой
import alasql from 'alasql';

// Функция для парсинга полей вида {num1, num2, num3, ...} в массивы чисел
function parseField(value: string): any {
    // Проверяем, соответствует ли значение формату {num1, num2, ...}
    const arrayPattern = /^\{([\d\s,]+)\}$/; // Шаблон для поиска чисел в фигурных скобках
    const match = value.match(arrayPattern);

    if (match) {
        // Преобразуем строку "num1, num2, ..." в массив чисел
        return match[1]
            .split(',')
            .map(num => parseFloat(num.trim()))
            .filter(num => !isNaN(num)); // Исключаем некорректные значения
    }

    // Если значение не соответствует формату, возвращаем его как есть
    return value;
}

// Функция для парсинга CSV-файла
function parse(csvFilePath: string): any[] {
    // Синхронное чтение файла
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');

    // Используем Papa.parse для парсинга данных
    const result = Papa.parse(csvData, {
        header: true,           // Первая строка будет использована как заголовки
        skipEmptyLines: true,   // Пропускать пустые строки
        dynamicTyping: false,   // Отключаем автоматическое преобразование типов
        delimiter: ';',
        transform: (value: string) => parseField(value) // Преобразуем каждое поле с помощью `parseField`
    });

    // Проверка на наличие ошибок в парсинге
    if (result.errors.length > 0) {
        throw new Error(`Ошибка при парсинге CSV: ${result.errors.map(error => error.message).join(', ')}`);
    }

    // Возвращаем массив данных, полученный из CSV
    return result.data;
}

const sprintName = '2024.3.1.NPP Shared Sprint'; // Пример имени для запроса

// Пример использования функции
const entitys = parse('entitys.csv');
//const history = parse('history.csv')
const sprints = parse('sprints.csv');

const sqlSprintsNames = alasql(`SELECT sprint_name FROM ?`, [sprints]); // Получение всех спринтов
console.log(sqlSprintsNames);

const sqlEntityIdsForSprintName = alasql(`SELECT entity_ids FROM ? WHERE sprint_name = '${sprintName}'`, [sprints]); // Получение "задач" для спринта с именем sprintName
//console.log(sqlEntityIdsForSprintName[0]?.entity_ids.length); // Количество "задач" у спринта

const sqlSprintStartDate = alasql(`SELECT sprint_start_date FROM ? WHERE sprint_name = '${sprintName}'`, [sprints])[0]?.sprint_start_date;
const sqlSprintEndDate = alasql(`SELECT sprint_end_date FROM ? WHERE sprint_name = '${sprintName}'`, [sprints])[0]?.sprint_end_date;

const sqlSprintStartDate2 = new Date(sqlSprintStartDate);
sqlSprintStartDate2.setDate(sqlSprintStartDate2.getDate() + 2);


let executed = 0; // К выполнению
let work = 0; // В работе
let done = 0; // Сделано
let remove = 0; // Снято
let backlog = 0; // Бэклог
let backlog1 = 0; // Бэклог1
let backlog2 = 0; // Бэклог2
let block = 0; // Заблокировано задач в Ч/Д

let exclude = [];
let excludeCount = [];
let adde = [];
let addeCount = [];

console.log("Start: " + sqlSprintStartDate); // Дата и Время начала спринта
console.log("End: " + sqlSprintEndDate); // Дата и Время окончания спринта
console.log("Start2: " + sqlSprintStartDate2); // Дата и Время начала спринта + 2 дня

const item = sqlEntityIdsForSprintName[0]?.entity_ids;

let currentDate = new Date(sqlSprintStartDate);
let endDate = new Date(sqlSprintEndDate);

while (currentDate <= endDate){
    exclude.push(0);
    excludeCount.push(0);
    adde.push(0);
    addeCount.push(0);

    currentDate.setDate(currentDate.getDate() + 1);
}

let update = false;
for (let i = 0; i < sqlEntityIdsForSprintName[0]?.entity_ids.length; i++){



    update = false;

    const sqlExecuted = alasql(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND status = 'Создано'`, [entitys]);
    const sqlDone = alasql(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND (status = 'Закрыто' OR status = 'Выполнено')`, [entitys]);
    const sqlRemove = alasql(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND ((status = 'Закрыто' OR status = 'Выполнено') AND (resolution = 'Отклонено' OR resolution = 'Отменено инициатором' OR resolution = 'Дубликат') OR (status = 'Отклонен исполнителем' AND type = 'Дефект'))`, [entitys]);
    const sqlBacklog = alasql(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND type != 'Дефект' AND update_date < '${sqlSprintStartDate2}'`, [entitys]);
    const sqlBacklog2 = alasql(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND type != 'Дефект' AND update_date > '${sqlSprintStartDate}' AND update_date < '${sqlSprintStartDate2}'`, [entitys]);
    const sqlParentTicketId = alasql(`SELECT parent_ticket_id FROM ? WHERE entity_id = '${item[i]}' AND type = 'Закрыто' AND resolution = 'Готово'`, [entitys]);


    if (!isNaN(Number(sqlExecuted[0]?.estimation))){
        executed += Number(sqlExecuted[0]?.estimation);
        update = true;
    }

    if (!isNaN(Number(sqlDone[0]?.estimation))){
        done += Number(sqlDone[0]?.estimation);
        update = true;
    }

    if (!isNaN(Number(sqlRemove[0]?.estimation))){
        remove += Number(sqlRemove[0]?.estimation);
        update = true;
    }

    if (!update){
        let sqlWork = alasql(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}'`, [entitys]);
        if (!isNaN(Number(sqlWork[0]?.estimation))){
            work += Number(sqlWork[0]?.estimation);
        }
    }

    if (!isNaN(Number(sqlBacklog[0]?.estimation))){
        backlog1 += Number(sqlBacklog[0]?.estimation);
    }

    if (!isNaN(Number(sqlBacklog2[0]?.estimation))){
        backlog2 += Number(sqlBacklog2[0]?.estimation);
    }

    if (!isNaN(Number(sqlParentTicketId[0]?.parent_ticket_id))){
        const sqlBlock = alasql(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND type = 'Закрыто' AND resolution = 'Готово'`, [entitys]);
        block += Number(sqlParentTicketId[0]?.parent_ticket_id);
    }
}

executed = executed / 3600;
executed = Math.round(executed * 10) / 10;

work = work / 3600;
work = Math.round(work * 10) / 10;

done = done / 3600;
done = Math.round(done * 10) / 10;

remove = remove / 3600;
remove = Math.round(remove * 10) / 10;

backlog1 = backlog1 / 3600;
//backlog = Math.round(backlog * 10) / 10;

backlog2 = backlog2 / 3600;
//backlog2 = Math.round(backlog2 * 10) / 10;

backlog = backlog2 / backlog1 * 100;
backlog = Math.round(backlog * 10) / 10;

block = block / 3600;
block = Math.round(backlog * 10) / 10;

console.log("К выполнению: " + executed); // Вывод значения показателя "К выполнению"
console.log("В работе: " + work); // Вывод значения показателя "В работе"
console.log("Сделано: " + done); // Вывод значения показателя "Сделано"
console.log("Снято: " + remove); // Вывод значения показателя "Снято"
console.log("Бэклог: " + backlog) // Вывод значения "Бэклог"
console.log("Бэклог1: " + backlog1); // Вывод "значения" "бэклог"
console.log("Бэклог2: " + backlog2); // Вывод "значения" "бэклог2"
console.log("Заблокировано задач в Ч/Д: " + block); // Вывод значения Заблокировано задач в Ч/Д

for (let it = 0; it < adde.length; it++){
    console.log("Значение: " + adde[it]);
}

//let sql_entity = alasql('SELECT * FROM ? LIMIT 10', [history]);
//let sql_sprint = alasql(`SELECT * FROM ? WHERE sprint_start_date = 2024-07-03-19:00:00.000000`, [sprints]);
//console.log(sql_sprint);
//let SQL1 = alasql('SELECT history_property_name FROM ? WHERE history_version = 1', [sprints]);
//console.log(SQL1);
//console.log(sprints);  // Выводим результат