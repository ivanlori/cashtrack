import { ReactElement, useEffect, useState } from "react"
import CreatableSelect from "react-select/creatable"
import { db } from "../db";

export interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label.toLowerCase().replace(/\W/g, ''),
});

interface Props {
  readonly showErrorStyle: boolean;
  readonly resetValue: boolean;
  readonly onChange: (value: Option | null) => void;
}

export const CustomSelect = ({
  showErrorStyle,
  resetValue,
  onChange,
}: Props): ReactElement => {
  const [options, setOptions] = useState<Option[]>([]);
  const [value, setValue] = useState<Option | null>();

  const handleCreate = (inputValue: string) => {
    const newOption = createOption(inputValue.charAt(0).toUpperCase() + inputValue.slice(1));
    db.table('categories').add({ name: newOption.label });
    setOptions((prev) => [...prev, newOption]);
    setValue(newOption);
  }

  useEffect(() => {
    db.table('categories').toArray().then((categories) => {
      setOptions(categories.map(({ name }) => createOption(name)));
    });
  }, [])

  useEffect(() => {
    if (resetValue) {
      setValue(null);
    }
  }, [resetValue])

  return (
    <CreatableSelect
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          padding: 8,
          borderColor: showErrorStyle ? 'red' : 'inherit',
          borderRadius: 6,
        }),
      }}
      isClearable
      onChange={(newValue) => {
        setValue(newValue);
        onChange(newValue);
      }}
      onCreateOption={handleCreate}
      options={options}
      value={value}
      placeholder="Seleziona o crea una categoria"
    />
  )
}