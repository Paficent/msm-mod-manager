import React, {type ReactElement} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {Home, Web, Tools, Console, Info, Settings} from '@/app/pages';

import Layout from '@/components/Layout';

const route = (path: string, element: ReactElement): ReactElement => (
	<Route path={path} element={<Layout>
		{element}
	</Layout>}/>
);
const App = () => (
	<Router>
		<Routes>
			{route('/', <Home/>)}
			{route('/web', <Web/>)}
			{route('/tools', <Tools/>)}
			{route('/console', <Console/>)}
			{route('/info', <Info/>)}
			{route('/settings', <Settings/>)}
		</Routes>
	</Router>
);

export default App;
