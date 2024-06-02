import { ReactElement, useMemo, useState } from 'react';
import styles from './App.module.css';
import { useLiveQuery } from "dexie-react-hooks";
import moment from 'moment';
import cn from 'classnames';
import {
	LeadingActions,
	SwipeableList,
	SwipeableListItem,
	SwipeAction,
	TrailingActions,
	Type,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { CiCircleMinus, CiEdit } from "react-icons/ci";
import { GoChevronRight, GoChevronDown } from "react-icons/go";
import "dexie-export-import";
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Navbar } from './Navbar';
import { db } from './db';
import { CustomSelect, Option } from './components/Select';
import classNames from 'classnames';

type FormValues = {
	expense: string
	category: string
}

type IDataSaved = {
	id: string,
	value: string,
	date: Date,
	category: string
}

type ICategoryExpense = {
	category: string,
	total: number
}

const months = [
	'Gennaio',
	'Febbraio',
	'Marzo',
	'Aprile',
	'Maggio',
	'Giugno',
	'Luglio',
	'Agosto',
	'Settembre',
	'Ottobre',
	'Novembre',
	'Dicembre'
]

const App = (): ReactElement => {
	const defaultValues: FormValues = useMemo(() => ({
		expense: '',
		category: ''
	}), [])

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: {
			errors
		},
	} = useForm<FormValues>({ defaultValues })
	const expenseTable = db.table('expenses')
	const [isLoadingList, setLoadingList] = useState(true)
	const [isLoadingPreviousTotal, setIsLoadingPreviousTotal] = useState(true)
	const [isLoadingCurrentTotal, setIsLoadingCurrentTotal] = useState(true)
	const [selectedCategory, setSelectedCategory] = useState<string>('')
	const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)
	const [showExpensesDetails, setShowExpensesDetails] = useState<boolean>(false)

	const onSubmit: SubmitHandler<FormValues> = async (data): Promise<void> => {
		await expenseTable.add({
			value: data.expense,
			date: new Date(),
			category: selectedCategory
		})
		setHasSubmitted(true)

		// works only for the expense field
		reset()
	}

	const allExpenses = useLiveQuery(async (): Promise<IDataSaved[]> => {
		setLoadingList(true)
		return await expenseTable
			.orderBy('date')
			.reverse()
			.toArray()
			.finally(() => setLoadingList(false))
	}, []);

	const currentMonthExpenses = useLiveQuery(async (): Promise<IDataSaved[]> => {
		const currentMonth = new Date().getMonth() + 1

		return await expenseTable
			.filter((row) => new Date(row.date).getMonth() + 1 === currentMonth)
			.toArray()
	}, [])

	const totalPreviousMonthExpenses = useLiveQuery(async (): Promise<number> => {
		setIsLoadingPreviousTotal(true)
		const previousMonth = new Date().getMonth()
		let total = 0

		return await expenseTable
			.filter((row) => new Date(row.date).getMonth() + 1 === previousMonth)
			.each((item: IDataSaved) => total += Number(item.value))
			.then(() => Number(total.toFixed(2)))
			.finally(() => setIsLoadingPreviousTotal(false))
	}, [])

	const totalCurrentMonthExpenses = useLiveQuery(async (): Promise<number> => {
		setIsLoadingCurrentTotal(true)
		const currentMonth = new Date().getMonth() + 1
		let total = 0

		return await expenseTable
			.filter((row) => new Date(row.date).getMonth() + 1 === currentMonth)
			.each((item: IDataSaved) => total += Number(item.value))
			.then(() => Number(total.toFixed(2)))
			.finally(() => setIsLoadingCurrentTotal(false))
	}, []);

	const deleteItem = (id: string): void => {
		expenseTable.delete(id)
	}

	const showEditInput = (id: string, valueToEdit: string): void => {
		const newValue = prompt('Inserisci il nuovo valore', valueToEdit)
		if (newValue) {
			expenseTable.update(id, { value: newValue })
		}
	}

	const getFormattedTotal = (total: number | undefined): string => (
		total ? `${total > 0 ? '-' : ''}${total}€` : 'N/D'
	)

	const renderLoading = (width: string): ReactElement => (
		<span className={`${width} block h-6 bg-gray-300 rounded animate-pulse`} />
	)

	const totalsPerCategory = useMemo((): ICategoryExpense[] => {
		if (currentMonthExpenses && currentMonthExpenses.length > 0) {
			return currentMonthExpenses.reduce<ICategoryExpense[]>((acc, { category, value }) => {
				const existingCategory = acc.find(itemFound => itemFound.category.toLowerCase() === category.toLowerCase());
				if (existingCategory) {
					return acc.map((item: ICategoryExpense) => {
						if (item.category.toLowerCase() === category.toLowerCase()) {
							return {
								category,
								total: Number(item.total) + Number(value)
							}
						}
						return item
					})
				} else {
					return [...acc, { category, total: Number(value) }];
				}
			}, [])
		} else {
			return []
		}
	}, [currentMonthExpenses])

	return (
		<div className="App">
			<Navbar />
			<main>
				<div className="mx-10 mb-3">
					<div className="previous-month flex items-center gap-2">
						<span className="text-md text-gray-400">
							{months[new Date().getMonth() - 1]}:
						</span>
						{' '}
						{isLoadingPreviousTotal ? renderLoading('w-14') : (
							<span className="text-xl text-red-400">
								{getFormattedTotal(totalPreviousMonthExpenses)}
							</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<div
							className="current-month gap-2 flex items-center cursor-pointer"
							onClick={() => {
								totalsPerCategory.length > 0 && setShowExpensesDetails(!showExpensesDetails)
							}}
						>
							<span className="text-xl text-gray-600">Mese corrente:</span>
							{isLoadingCurrentTotal ? renderLoading('w-14') : (
								<span className="text-2xl text-red-600">
									{getFormattedTotal(totalCurrentMonthExpenses)}
								</span>
							)}
							{
								totalsPerCategory.length > 0 && (
									<>
										<GoChevronRight
											className={classNames({
												"block": !showExpensesDetails,
												"hidden": showExpensesDetails
											})}
											size={22}
										/>
										<GoChevronDown
											className={classNames({
												"block": showExpensesDetails,
												"hidden": !showExpensesDetails
											})}
											size={22}
										/>
									</>
								)
							}
						</div>
					</div>

					<div className={classNames("transition-all duration-300 ease-in-out", {
						"max-h-0 invisible": !showExpensesDetails,
						"max-h-screen visible": showExpensesDetails
					})}>
						<ul className="flex flex-wrap gap-4 p-3">
							{totalsPerCategory.map((item, index) => {
								return (
									<li
										key={index}
										className="flex gap-3"
									>
										<span className="text-gray-600">
											{item.category}:
										</span>
										<span className="text-red-600">
											{getFormattedTotal(item.total)}
										</span>
									</li>
								)
							})}
						</ul>
					</div>
				</div>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="h-60 mx-10"
				>
					<div className="flex flex-col gap-3">
						<div className="flex relative items-center">
							<input
								className={cn(styles.Input, {
									"border-red-600": errors.expense?.message
								})}
								type="number"
								step=".01"
								placeholder="0"
								{...register('expense', {
									onChange: () => setHasSubmitted(false),
									pattern: {
										value: /^\d+(?:[.,]\d+)*$/,
										message: 'Valore non valido'
									},
									required: {
										value: true,
										message: 'Inserisci la spesa'
									}
								})}
							/>
							<span className="absolute right-0 mr-3 text-xl">€</span>
						</div>
						<Controller
							control={control}
							name="category"
							rules={{
								required: {
									value: true,
									message: 'Inserisci la categoria'
								},
							}}
							render={({ field: { onChange } }): ReactElement => (
								<CustomSelect
									showErrorStyle={errors.category?.message !== undefined}
									resetValue={hasSubmitted}
									onChange={(newValue: Option | null): void => {
										setSelectedCategory(newValue?.label || '')
										setHasSubmitted(false)
										onChange(newValue?.value)
									}}
								/>
							)}
						/>
					</div>
					<button
						type="submit"
						className="bg-blue-500 rounded-lg text-xl mt-3 w-full text-white text-center px-5 py-3 transition duration-300 ease-in-out hover:bg-blue-600"
					>
						Aggiungi
					</button>
					<span className="text-red-600 mt-2 block">
						{errors.expense?.message}
						<br />
						{errors.category?.message}
					</span>
				</form>
				<SwipeableList className="mt-5 mx-auto" Tag="ul" type={Type.IOS}>
					{allExpenses?.map((item: IDataSaved) => {
						return (
							<SwipeableListItem
								key={item.id}
								maxSwipe={0.5}
								leadingActions={
									(<LeadingActions>
										<SwipeAction
											onClick={() => showEditInput(item.id, item.value)}
										>
											<CiEdit />
										</SwipeAction>
									</LeadingActions>)
								}
								trailingActions={
									(<TrailingActions>
										<SwipeAction
											onClick={() => deleteItem(item.id)}
										>
											<CiCircleMinus />
										</SwipeAction>
									</TrailingActions>)
								}
								className={styles.Item}
							>
								<div className="flex flex-col items-end gap mx-10 py-2">
									<div>
										{
											isLoadingList ? renderLoading('w-40') : (
												<>
													<span className="text-gray-600 text-xl">
														{item.category}
													</span>
													{' '}
													<span className="text-red-600">
														{`-${item.value}€`}
													</span>
												</>
											)
										}
									</div>
									{isLoadingList ? renderLoading('w-40') : (
										<span className="text-base text-gray-600">
											{moment(item.date).format('LLL')}
										</span>
									)}
								</div>
							</SwipeableListItem>
						)
					})}
				</SwipeableList>
			</main>
		</div>
	);
}

export default App;
