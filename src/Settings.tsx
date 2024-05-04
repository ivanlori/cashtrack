import { ReactElement, DragEvent, useState } from 'react'
import { Navbar } from './Navbar'
import { BsDownload, BsUpload } from "react-icons/bs";
import { db } from './db'
import cn from 'classnames'
import Dexie from 'dexie';
import { useNavigate } from 'react-router-dom'

const onExport = async () => {
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
    console.error('Error exporting data:', error);
  }
}

export const SettingsPage = (): ReactElement => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false)
  const [isHalfLoading, setIsHalfLoading] = useState(false)
  const [isOneThirdLoading, setIsOneThirdLoading] = useState(false)
  const navigate = useNavigate()

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onUpload = async (blob: Blob) => {
    try {
      await db.delete()
      await Dexie.import(blob, {
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
      console.error('Error importing db:', error);
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file.type === 'application/json') {
      onUpload(file)
    } else {
      alert('Please drop a JSON file.');
    }
  };

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
              className={`border-2 border-dashed border-gray-400 rounded-lg p-4 text-center ${isDragging ? 'bg-gray-200' : ''
                }`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="text-lg flex items-center gap-2">
                <BsUpload /> Drag & drop your DB as JSON file here,<br />or click to select
              </p>
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
    </>
  )
}