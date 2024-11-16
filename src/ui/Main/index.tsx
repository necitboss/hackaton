import React, {useState} from 'react';
import styles from "./Main.module.scss"
import Button from "../../components/Button";
import {CheckboxOption} from "../../interfaces/checkbox_option.ts";
import {NameValue} from "../../interfaces/name_value.ts";

interface Props {
  names: string[];
  onGetChecked: (value:CheckboxOption[]) => void;
  statuses: NameValue[];
  onAnalyzeClick: (value: number) => void;
  sprintLength: number;
}



const Main: React.FC<Props> = ({names, onGetChecked, statuses, onAnalyzeClick, sprintLength}) => {
  const [rangeValue, setRangeValue] = useState(sprintLength);
  const [checkboxes, setCheckboxes] = useState<CheckboxOption[]>(names.map(name => {
    return {
      id: name,
      label: name,
      checked: false
    }
  }))

  const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRangeValue(Number(event.target.value));
  }

  const handleCheckboxChange = (id: string) => {
    setCheckboxes((prev) => prev.map((checkbox) => {
      return checkbox.id === id ? {...checkbox, checked: !checkbox.checked} : checkbox
    }))
  }

  return (
    <section className={styles.main}>
      <div className="container">
        <h3 className="title">Здоровье спринта (спринтов)</h3>
        <div className={styles.main__inner}>
          <div className={styles.main__sprints}>
            <h5 className={styles.main__subtitle}>У Вас несколько спринтов.
              Выберите один или несколько</h5>
            {checkboxes.map(checkbox => {
              return (
                <label className={styles.main__sprint} key={checkbox.id}>
                  {checkbox.label}
                  <input
                    type="checkbox"
                    checked={checkbox.checked}
                    onChange={() => handleCheckboxChange(checkbox.id)}
                  />
                </label>
              )
            })}
            <Button
              text={"Анализировать"}
              onClick={() => {
                onGetChecked(checkboxes);
              }}
            />
          </div>
          <div className={styles.main__slider_place}>
            <h5 className={styles.main__subtitle}>Выберите день, до которого идет просмотр текущего
            положения дел (по умолчанию, указывается последний, то есть, по итогам спринта)</h5>
            <label className={styles.main__slider}>
              <input
                type="range"
                min={1}
                max={sprintLength}
                step={1}
                value={rangeValue}
                onChange={handleRangeChange}
              />
              День: {rangeValue}
            </label>
            <Button
              onClick={() => {
                onAnalyzeClick(rangeValue);
              }}
              text={"Анализировать с учетом дня"}
            />
          </div>
          <div className={styles.main__statuses}>
            <h5 className={styles.main__subtitle}>Состояние задач:</h5>
            {statuses.map((status) => {
              return (
                <div key={status.name} className={styles.main__status}>{status.name}: <span>{status.value}</span></div>
              )
            })}
          </div>
        </div>

      </div>
    </section>

  );
};

export default Main;
