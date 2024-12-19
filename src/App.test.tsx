import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import selectEvent from 'react-select-event';
import App from './App';

// Polyfill for structuredClone
if (typeof structuredClone === 'undefined') {
	global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

test('should add a price item', async () => {
	render(
		<BrowserRouter>
			<App />
		</BrowserRouter>
	);
	const input = screen.getByTestId('expense-input')
	const categorySelect = screen.getByLabelText('Seleziona o crea una categoria')
	const addBtn = screen.getByText('Aggiungi')

	await userEvent.type(input, '100')
	await waitFor(() => {
		selectEvent.create(categorySelect, 'Food')
	})
	await waitFor(() => {
		selectEvent.select(categorySelect, 'Crea categoria "Food"')
	})
	await userEvent.click(addBtn)

	await waitFor(() => {
		expect(screen.getByTestId('expense-item')).toHaveTextContent('Food -100€')
	})
})
