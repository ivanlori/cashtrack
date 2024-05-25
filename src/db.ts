import Dexie from 'dexie'

const db = new Dexie('Budget');

db.version(1).stores({
	expenses: "++id,value,date,category",
	categories: "++id,name"
})

export {
	db
}
