import '@/app/globals.css';
import {ThemeProvider} from '@material-tailwind/react';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from '@/app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ThemeProvider>
			<App />
		</ThemeProvider>
	</React.StrictMode>,
);

postMessage({payload: 'removeLoading'}, '*');
