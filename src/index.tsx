import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {
	createBrowserRouter,
	RouterProvider,
} from "react-router-dom";
import { SettingsPage } from './Settings';

const router = createBrowserRouter([
	{
		path: '/settings',
		element: <SettingsPage />,
	},
	{
		path: "*",
		element: <App />,
		index: true,
	},
], { basename: process.env.NODE_ENV === 'production' ? '/cashtrack' : '/' });

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
