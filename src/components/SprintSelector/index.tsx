import React from 'react';
import styles from './SprintSelector.module.scss';

interface Props {
  items: string[];
  onChange?: (selectedItem: string) => void;
}

const SprintSelector: React.FC<Props> = ({ items, onChange }) => {
  const [selected, setSelected] = React.useState<string>('');

  const handleChange = (item: string) => {
    setSelected(item);
    onChange && onChange(item);
  };

  return (
    <div className="sprint-selector">
      {items.map((item, index) => (
        <label key={index} className="sprint-option">
          <span className={`option-label ${selected === item ? 'active' : ''}`}>{item}</span>
          <input
            type="radio"
            name="sprint"
            value={item}
            checked={selected === item}
            onChange={() => handleChange(item)}
          />
        </label>
      ))}
    </div>
  );
};

export default SprintSelector;
