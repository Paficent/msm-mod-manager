import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from '@/app/Home';

import {ThemeProvider} from '@material-tailwind/react';

import '@/app/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ThemeProvider>
			<Home />
		</ThemeProvider>
	</React.StrictMode>,
);

postMessage({payload: 'removeLoading'}, '*');
