"use strict";
/*import Papa from 'papaparse';
import fs from 'fs'; // Для работы с файловой системой
import alasql from 'alasql';

// Функция для парсинга CSV-файла
function parse(csvFilePath: string): any[] {
    // Синхронное чтение файла
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');
    // Используем Papa.parse для парсинга данных
    const result = Papa.parse(csvData, {
        header: true,           // Первая строка будет использована как заголовки
        skipEmptyLines: true,   // Пропускать пустые строки
        dynamicTyping: true,    // Преобразование чисел и булевых значений автоматически
    });
    // Проверка на наличие ошибок в парсинге
    if (result.errors.length > 0) {
        throw new Error(`Ошибка при парсинге CSV: ${result.errors.map(error => error.message).join(', ')}`);
    }
    // Возвращаем массив данных, полученный из CSV
    return result.data;
}*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", { value: true });
const papaparse_1 = __importDefault(require("papaparse"));
const fs_1 = __importDefault(require("fs")); // Для работы с файловой системой
const alasql_1 = __importDefault(require("alasql"));
// Функция для парсинга полей вида {num1, num2, num3, ...} в массивы чисел
function parseField(value) {
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
function parse(csvFilePath) {
    // Синхронное чтение файла
    const csvData = fs_1.default.readFileSync(csvFilePath, 'utf-8');
    // Используем Papa.parse для парсинга данных
    const result = papaparse_1.default.parse(csvData, {
        header: true, // Первая строка будет использована как заголовки
        skipEmptyLines: true, // Пропускать пустые строки
        dynamicTyping: false, // Отключаем автоматическое преобразование типов
        delimiter: ';',
        transform: (value) => parseField(value) // Преобразуем каждое поле с помощью `parseField`
    });
    // Проверка на наличие ошибок в парсинге
    if (result.errors.length > 0) {
        throw new Error(`Ошибка при парсинге CSV: ${result.errors.map(error => error.message).join(', ')}`);
    }
    // Возвращаем массив данных, полученный из CSV
    return result.data;
}
const sprintName = '2024.3.5.NPP Shared Sprint'; // Пример имени для запроса
// Пример использования функции
const entitys = parse('entitys.csv');
//const history = parse('history.csv')
const sprints = parse('sprints.csv');
const sqlSprintsNames = (0, alasql_1.default)(`SELECT sprint_name FROM ?`, [sprints]); // Получение всех спринтов
console.log(sqlSprintsNames);
const sqlEntityIdsForSprintName = (0, alasql_1.default)(`SELECT entity_ids FROM ? WHERE sprint_name = '${sprintName}'`, [sprints]); // Получение "задач" для спринта с именем sprintName
//console.log(sqlEntityIdsForSprintName[0]?.entity_ids.length); // Количество "задач" у спринта
const sqlSprintStartDate = (_a = (0, alasql_1.default)(`SELECT sprint_start_date FROM ? WHERE sprint_name = '${sprintName}'`, [sprints])[0]) === null || _a === void 0 ? void 0 : _a.sprint_start_date;
const sqlSprintEndDate = (_b = (0, alasql_1.default)(`SELECT sprint_end_date FROM ? WHERE sprint_name = '${sprintName}'`, [sprints])[0]) === null || _b === void 0 ? void 0 : _b.sprint_end_date;
const sqlSprintStartDate2 = new Date(sqlSprintStartDate);
sqlSprintStartDate2.setDate(sqlSprintStartDate2.getDate() + 2);
let executed = 0; // К выполнению
let work = 0; // В работе
let done = 0; // Сделано
let remove = 0; // Снято
let backlog = 0; // Бэклог
let backlog1 = 0; // Бэклог1
let backlog2 = 0; // Бэклог2
console.log("Start: " + sqlSprintStartDate); // Дата и Время начала спринта
console.log("End: " + sqlSprintEndDate); // Дата и Время окончания спринта
console.log("Start2: " + sqlSprintStartDate2); // Дата и Время начала спринта + 2 дня
let update = false;
for (let i = 0; i < ((_c = sqlEntityIdsForSprintName[0]) === null || _c === void 0 ? void 0 : _c.entity_ids.length); i++) {
    update = false;
    const item = (_d = sqlEntityIdsForSprintName[0]) === null || _d === void 0 ? void 0 : _d.entity_ids;
    console.log("biba: " + item[i]);
    const sqlExecuted = (0, alasql_1.default)(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND status = 'Создано'`, [entitys]);
    const sqlDone = (0, alasql_1.default)(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND (status = 'Закрыто' OR status = 'Выполнено')`, [entitys]);
    const sqlRemove = (0, alasql_1.default)(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND ((status = 'Закрыто' OR status = 'Выполнено') AND (resolution = 'Отклонено' OR resolution = 'Отменено инициатором' OR resolution = 'Дубликат') OR (status = 'Отклонен исполнителем' AND type = 'Дефект'))`, [entitys]);
    const sqlBacklog = (0, alasql_1.default)(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND type != 'Дефект' AND update_date < '${sqlSprintStartDate2}'`, [entitys]);
    const sqlBacklog2 = (0, alasql_1.default)(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}' AND type != 'Дефект' AND update_date > '${sqlSprintStartDate}' AND update_date < '${sqlSprintStartDate2}'`, [entitys]);
    if (!isNaN(Number((_e = sqlExecuted[0]) === null || _e === void 0 ? void 0 : _e.estimation))) {
        executed += Number((_f = sqlExecuted[0]) === null || _f === void 0 ? void 0 : _f.estimation);
        update = true;
    }
    if (!isNaN(Number((_g = sqlDone[0]) === null || _g === void 0 ? void 0 : _g.estimation))) {
        done += Number((_h = sqlDone[0]) === null || _h === void 0 ? void 0 : _h.estimation);
        update = true;
    }
    if (!isNaN(Number((_j = sqlRemove[0]) === null || _j === void 0 ? void 0 : _j.estimation))) {
        remove += Number((_k = sqlRemove[0]) === null || _k === void 0 ? void 0 : _k.estimation);
        update = true;
    }
    if (!update) {
        let sqlWork = (0, alasql_1.default)(`SELECT estimation FROM ? WHERE entity_id = '${item[i]}'`, [entity]);
        if (!isNaN(Number((_l = sqlWork[0]) === null || _l === void 0 ? void 0 : _l.estimation))) {
            work += Number((_m = sqlWork[0]) === null || _m === void 0 ? void 0 : _m.estimation);
        }
    }
    if (!isNaN(Number((_o = sqlBacklog[0]) === null || _o === void 0 ? void 0 : _o.estimation))) {
        backlog1 += Number((_p = sqlBacklog[0]) === null || _p === void 0 ? void 0 : _p.estimation);
    }
    if (!isNaN(Number((_q = sqlBacklog2[0]) === null || _q === void 0 ? void 0 : _q.estimation))) {
        backlog2 += Number((_r = sqlBacklog2[0]) === null || _r === void 0 ? void 0 : _r.estimation);
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
console.log("К выполнению: " + executed); // Вывод значения показателя "К выполнению"
console.log("В работе: " + work); // Вывод значения показателя "В работе"
console.log("Сделано: " + done); // Вывод значения показателя "Сделано"
console.log("Снято: " + remove); // Вывод значения показателя "Снято"
console.log("Бэклог: " + backlog); // Вывод значения "Бэклог"
console.log("Бэклог1: " + backlog1); // Вывод "значения" "бэклог"
console.log("Бэклог2: " + backlog2); // Вывод "значения" "бэклог2"
//let sql_entity = alasql('SELECT * FROM ? LIMIT 10', [history]);
//let sql_sprint = alasql(`SELECT * FROM ? WHERE sprint_start_date = 2024-07-03-19:00:00.000000`, [sprints]);
//console.log(sql_sprint);
//let SQL1 = alasql('SELECT history_property_name FROM ? WHERE history_version = 1', [sprints]);
//console.log(SQL1);
//console.log(sprints);  // Выводим результат
