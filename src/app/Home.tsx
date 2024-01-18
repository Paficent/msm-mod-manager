import {type GameBananaData} from '@/type/game-banana';
import React, {useEffect, useState} from 'react';
import Layout from '@/components/Layout';
import ModCard from '@/components/ModCard';
import axios, {type AxiosResponse} from 'axios';

export default function Home(): React.ReactElement {
	const [modData, setModData] = useState<GameBananaData | undefined>(undefined);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response: AxiosResponse<GameBananaData> = await axios.get(
					'https://gamebanana.com/apiv11/Game/9640/Subfeed?_nPage=1&_sSort=new&_csvModelInclusions=Mod',
				);
				setModData(response.data);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		void fetchData();
	}, []);

	useEffect(() => {
		console.log('modData changed:', modData);
	}, [modData]); // Log whenever modData changes

	return (
		<Layout>
			<div className='grid items-center gap-4 overflow-y-scroll overflow-show font-content ss:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
				{modData?._aRecords?.map(record => (
					<ModCard key={record.idRow} mod={{
						name: record._sName,
						thumbnail: `${record._aPreviewMedia._aImages[0]._sBaseUrl}/${record._aPreviewMedia._aImages[0]._sFile}`,
						description: '',
						author: record._aSubmitter._sName,
						version: record._sVersion || '???',
					}}>

					</ModCard>
					// <p key={record.idRow}>{record._sName}</p>
				))}
				{!modData?._aMetadata && <p>Loading...</p>}
			</div>
		</Layout>
	);
}
