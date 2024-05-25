import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Add this import statement
import App from './App';

test('should match snapshot', () => {
	const { baseElement } = render(
		<BrowserRouter>
			<App />
		</BrowserRouter>
	);
	expect(baseElement).toMatchSnapshot();
})
