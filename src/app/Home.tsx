import React, {type ReactElement} from 'react';
import Layout from '@/components/Layout';
import ModCard from '@/components/ModCard';

const currentMods = [
	{
		name: 'Mod Name',
		thumbnail:
      'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		author: 'Author',
		version: '0.0.0',
		description: 'This is a test description',
		id: 'mod_0',
	},
	{
		name: 'Hi2',
		thumbnail:
      'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		author: 'Paficent',
		version: '2.0',
		description: 'hello',
		id: 'mod_1',
	},
	{
		name: 'Hi3',
		thumbnail:
      'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		author: 'Paficent',
		version: '2.0',
		description: 'hello',
		id: 'mod_2',
	},
	{
		name: 'Hi4',
		thumbnail:
      'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		author: 'Paficent',
		version: '2.0',
		description: 'hello',
		id: 'mod_3',
	},
	{
		name: 'Hi5',
		thumbnail:
      'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		author: 'Paficent',
		version: '2.0',
		description: 'hello',
		id: 'mod_4',
	},
	{
		name: 'Hi7',
		thumbnail:
      'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		author: 'Paficent',
		version: '2.0',
		description: 'hello',
		id: 'mod_5',
	},
];

export default function Home(): ReactElement {
	return (
		<Layout>
			<div className='grid items-center gap-4 overflow-y-scroll overflow-show font-content ss:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
				{currentMods.map(currentMod => (
					<ModCard mod={currentMod} key={currentMod.id}></ModCard>
				))}
			</div>
		</Layout>
	);
}
