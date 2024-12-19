import { ReactElement, useEffect, useState } from "react"
import CreatableSelect from "react-select/creatable"
import { db } from "../db";

export interface Option {
	readonly label: string;
	readonly value: string;
}

const createOption = (label: string): Option => ({
	label,
	value: label.toLowerCase().replace(/\W/g, ''),
});

const categoriesTable = db.table('categories')

interface Props {
	readonly showErrorStyle: boolean;
	readonly resetValue: boolean;
	readonly onChange: (value: Option | null) => void;
	readonly id: string;
}

export const CustomSelect = ({
	showErrorStyle,
	resetValue,
	id,
	onChange,
}: Props): ReactElement => {
	const [options, setOptions] = useState<Option[]>([]);
	const [value, setValue] = useState<Option | null>();

	const handleCreate = (inputValue: string): void => {
		const newOption = createOption(inputValue.charAt(0).toUpperCase() + inputValue.slice(1));
		categoriesTable.add({ name: newOption.label });
		setOptions((prev) => [...prev, newOption]);
		setValue(newOption);
		onChange(newOption);
	}

	useEffect(() => {
		categoriesTable.toArray().then((categories) => {
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
			inputId={id}
			isClearable
			onChange={(newValue: Option | null): void => {
				setValue(newValue);
				onChange(newValue);
			}}
			formatCreateLabel={(inputValue: string) => `Crea categoria "${inputValue}"`}
			onCreateOption={handleCreate}
			options={options}
			value={value}
			placeholder="Seleziona o crea una categoria"
		/>
	)
}
