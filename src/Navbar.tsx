import { ReactElement, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CiSettings, CiSquareChevLeft } from "react-icons/ci";
import cn from 'classnames'
import './App.css'

interface Props {
  withBack?: boolean
}

export const Navbar = ({
  withBack = false
}: Props): ReactElement => {
  const [showBorder, setShowBorder] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlNavbar = useCallback(() => {
    if (window.scrollY > lastScrollY) { // if scroll down hide the navbar
      setShowBorder(true);
    } else { // if scroll up show the navbar
      setShowBorder(false);
    }

    // remember current page location to use in the next move
    setLastScrollY(window.scrollY);
  }, [lastScrollY])

  useEffect(() => {
    window.addEventListener('scroll', controlNavbar);

    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY, controlNavbar]);

  return (
    <header className={cn("sticky top-0 mb-6 z-50", {
      "border-b-2 border-b-gray-200": showBorder
    })}>
      <div className="mx-auto w-11/12 bg-white rounded-xl">
        <div className="p-4 flex justify-between">
          <div className="flex justify-center items-center gap-2">
            {withBack && (
              <Link
                to="/"
                role="button"
                className=""
              >
                <CiSquareChevLeft size={50} />
              </Link>
            )}
            <span className="my-0 flex text-dark font-semibold text-[1.35rem]/[1.2] flex-col justify-center">
              Budget
            </span>
          </div>
          {
            !withBack && (
              <div className="flex items-center">
                <div className="relative flex items-center gap-3">
                  <Link
                    to="/settings"
                    className="action-button"
                    role="button"
                  >
                    <CiSettings size={25} />
                  </Link>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </header>
  )
}