import { ChangeEvent, useState } from 'react';
import './App.css';
import { useLiveQuery } from "dexie-react-hooks";
import moment from 'moment'
import cn from 'classnames'
import { useSpring, animated, SpringValue } from '@react-spring/web';
import { CiCircleMinus, CiEdit } from "react-icons/ci";
import "dexie-export-import";
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDrag } from '@use-gesture/react';
import { Navbar } from './Navbar';
import { db } from './db'

type FormValues = {
  expense: string
}

type IDataSaved = {
  id: string,
  value: string,
  date: Date
  category: number
}

const categories = [
  'Cibo',
  'Abbigliamento',
  'Telefonia',
  'Affitto'
]

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

const App = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors
    }
  } = useForm<FormValues>()
  const expenseTable = db.table('expenses')
  const [isSwiped, setSwiped] = useState(false);
  const [category, setCategory] = useState('')

  const [{ x }, api] = useSpring<{ x: SpringValue<number> }>(() => ({
    x: 0,
    onRest: () => {
      if (!isSwiped) {
        api.start({ x: 0 });
      }
    },
  }));

  const bind = useDrag(({ down, movement: [mx], cancel }) => {
    if (mx > 80) cancel();

    api.start({ x: down ? mx : 0 });

    if (mx < -80) setSwiped(true);

    if (mx > 10) setSwiped(false);
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await expenseTable.add({
      value: data.expense,
      date: new Date(),
      category
    })
    reset()
  }

  const allExpenses = useLiveQuery(async (): Promise<IDataSaved[]> => {
    return await expenseTable
      .orderBy('date')
      .reverse()
      .toArray()
  }, []);

  const totalPreviousMonthExpenses = useLiveQuery(async (): Promise<number> => {
    const previousMonth = new Date().getMonth()
    let total = 0

    return await expenseTable
      .filter((row) => new Date(row.date).getMonth() + 1 === previousMonth)
      .each((item: IDataSaved, _) => total += Number(item.value))
      .then(() => Number(total.toFixed(2)))
  }, [])

  const totalCurrentMonthExpenses = useLiveQuery(async (): Promise<number> => {
    const currentMonth = new Date().getMonth() + 1
    let total = 0

    return await expenseTable
      .filter((row) => new Date(row.date).getMonth() + 1 === currentMonth)
      .each((item: IDataSaved, _) => total += Number(item.value))
      .then(() => Number(total.toFixed(2)))
  }, [])

  const deleteItem = (id: string): void => {
    expenseTable.delete(id)
  }

  const getFormattedTotal = (total: number | undefined): string => (
    total ? `${total > 0 ? '-' : ''}${total}€` : 'N/D'
  )

  return (
    <div className="App">
      <Navbar />
      <main className="mx-10">
        <div className="mb-3 flex justify-between items-center">
          <div className="previous-month">
            <span className="text-md text-gray-400">
              {months[new Date().getMonth() - 1]}:
            </span>
            {' '}
            <span className="text-xl text-red-400">
              {getFormattedTotal(totalPreviousMonthExpenses)}
            </span>
          </div>
          <div className="current-month">
            <span className="text-xl text-gray-600">Mese corrente:</span>
            {' '}
            <span className="text-2xl text-red-600">
              {getFormattedTotal(totalCurrentMonthExpenses)}
            </span>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-40"
        >
          <div className="flex gap-3 items-center">
            <div className="flex relative items-center w-2/4">
              <input
                className={cn("p-3 border text-xl rounded-lg w-full", {
                  "border-red-600": errors.expense?.message
                })}
                type="number"
                step=".01"
                placeholder="0"
                {...register('expense', {
                  pattern: {
                    value: /^\d+(?:[.,]\d+)*$/,
                    message: 'Valore non valido'
                  },
                  required: {
                    value: true,
                    message: 'Il campo non deve essere vuoto'
                  }
                })}
              />
              <span className="absolute right-0 mr-3 text-xl">€</span>
            </div>
            <div className="w-2/4">
              <select
                id="categories"
                className="border border-gray-200 text-xl rounded-lg block w-full p-3 text-gray-600"
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
              >
                <option selected>Categoria</option>
                {categories.map((item, index) => (
                  <option value={index}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-500 rounded-lg text-xl mt-3 w-full text-white text-center px-5 py-3 transition duration-300 ease-in-out hover:bg-blue-600"
          >
            Aggiungi
          </button>
          <span className="text-red-600 mt-2 block">
            {errors.expense?.message}
          </span>
        </form>
        <ul className="mt-5 mx-auto">
          {allExpenses?.map((item: IDataSaved) => {
            return (
              <animated.li
                {...bind(item.id)}
                key={item.id}
                className="text-2xl text-right py-2 border-t border-gray-200"
                style={{
                  transform: x.to(x => `translate3d(${x}px,0,0)`),
                  willChange: 'transform',
                  position: 'relative',
                }}
              >
                <div className={cn("flex flex-col", {
                  "-translate-x-36": isSwiped
                })}>
                  <div>
                    <span className="text-gray-600 text-xl">
                      {categories[item.category]}
                    </span>
                    {' '}
                    <span className="text-red-600">
                      {`-${item.value}€`}
                    </span>
                  </div>
                  <span className="text-base text-gray-600">
                    {moment(item.date).format('LLL')}
                  </span>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: 10,
                    opacity: isSwiped ? 1 : 0,
                    transform: isSwiped ? 'translateX(0)' : 'translateX(100%)'
                  }}
                >
                  <button
                    className="flex items-center justify-center w-12 h-12 transition-colors duration-150 ease-in-out bg-transparent border border-solid shadow-none cursor-pointer rounded-2xl border-stone-300 hover:bg-slate-100 focus:bg-slate-100 mr-4"
                  >
                    <CiEdit />
                  </button>
                  <button
                    className="flex items-center justify-center w-12 h-12 transition-colors duration-150 ease-in-out bg-transparent border border-solid shadow-none cursor-pointer rounded-2xl border-stone-300 hover:bg-slate-100 focus:bg-slate-100"
                    onClick={() => deleteItem(item.id)}
                  >
                    <CiCircleMinus />
                  </button>
                </div>
              </animated.li>
            )
          })}
        </ul>
      </main>
    </div>
  );
}

export default App;
