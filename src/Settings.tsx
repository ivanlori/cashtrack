import { ChangeEvent, ReactElement, useState } from 'react'
import { Navbar } from './Navbar'
import { BsDownload } from "react-icons/bs";
import { db } from './db'
import cn from 'classnames'
import Dexie from 'dexie';
import { useNavigate } from 'react-router-dom'
import packageJson from '../package.json'

const onExport = async (): Promise<void> => {
	try {

		// Fetch data from IndexedDB
		const jsonData = await db.export({
			prettyJson: true
		})

		// Convert data to JSON and create a Blob
		const jsonBlob = new Blob([jsonData], { type: 'application/json' });

		// Create a download link and click it programmatically to download the JSON file
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(jsonBlob);
		downloadLink.download = 'indexedDB_data.json';
		downloadLink.click();
	} catch (error) {
		alert("Error exporting database.")
	}
}

export const SettingsPage = (): ReactElement => {
	const [isLoading, setIsLoading] = useState(false)
	const [isHalfLoading, setIsHalfLoading] = useState(false)
	const [isOneThirdLoading, setIsOneThirdLoading] = useState(false)
	const [file, setFile] = useState<File | null>(null)
	const navigate = useNavigate()

	const onUpload = async (): Promise<void> => {
		if (file?.type === 'application/json') {
			try {
				await db.delete()
				await Dexie.import(file, {
					progressCallback: ({ totalRows, completedRows }) => {
						setIsLoading(true)

						if (totalRows && completedRows) {
							const oneThird = totalRows && totalRows / 3
							const half = totalRows && totalRows / 2

							if (oneThird === totalRows) {
								setIsOneThirdLoading(true)
								setIsHalfLoading(false)
							} else if (half === totalRows) {
								setIsOneThirdLoading(false)
								setIsHalfLoading(true)
							} else {
								setIsLoading(false)
								navigate(0)
							}
						}

						return false
					}
				})
			} catch (error) {
				alert('Error import database.')
			}
		} else {
			alert('Please drop a JSON file.');
		}
	}

	return (
		<>
			<Navbar withBack />
			<main className="px-10">
				<ul>
					<li className='mb-5'>
						<button
							onClick={onExport}
							className="bg-white flex w-full justify-center items-center gap-2 rounded-lg text-xl border-gray-600 border-2 text-gray-600 text-center px-5 py-3 transition duration-300 ease-in-out"
						>
							Export Database
							<BsDownload />
						</button>
					</li>
					<li>
						<div
							className="border border-gray-400 rounded-lg p-4 text-center"
						>
							<input
								type="file"
								className="text-lg flex items-center gap-2"
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									setFile(e.target.files && e.target.files[0])
								}}
								placeholder="Scelgi un file JSON"
								accept="application/json"
							/>
							<button
								onClick={onUpload}
								className="bg-white mt-2 flex w-full justify-center items-center gap-2 rounded-lg text-xl border-gray-600 border-2 text-gray-600 text-center px-5 py-3 transition duration-300 ease-in-out"
							>
								Upload
							</button>
							{isLoading && (
								<div className="w-full h-2 bg-blue-200 rounded-full">
									<div className={cn("h-full text-center text-xs text-white bg-blue-600 rounded-full", {
										"w-2/3": isHalfLoading,
										"w-1/3": isOneThirdLoading
									})}>
									</div>
								</div>
							)}
						</div>
					</li>
				</ul>
			</main>
			<div className="fixed bottom-0 p-3 w-full text-center">
				<p>Versione: {packageJson.version}</p>
			</div>
		</>
	)
}
