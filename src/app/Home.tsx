import {type GameBananaData} from '@/type/game-banana';
import React, {useEffect, useState} from 'react';
import Layout from '@/components/Layout';
import ContentCard from '@/components/ContentCard';
import axios, {type AxiosResponse} from 'axios';
import {List, Progress} from '@material-tailwind/react';

export default function Home(): React.ReactElement {
	const [gameBananaMods, setGameBananaMods] = useState<GameBananaData>();
	useEffect(() => {
		const fetchData = async (pageNumber: string) => {
		  try {
			const response: AxiosResponse<GameBananaData> = await axios.get(
			  `https://gamebanana.com/apiv11/Game/9640/Subfeed?_nPage=${pageNumber}&_sSort=new&_csvModelInclusions=Mod`,
			);
	
			if (pageNumber === '1') {
			  setGameBananaMods(response.data);
			} else {
			  setGameBananaMods((prevState: GameBananaData | any) => ({
				...prevState,
				_aRecords: [...(prevState?._aRecords || []), ...(response.data._aRecords || [])],
			  }));
			}
			console.log(pageNumber)
		  } catch (error) {
			console.error('Error fetching data:', error);
		  }
		};
	
		const fetchSequentialData = async () => {
		  for (let i = 1; i <= 10; i++) {
			await fetchData(i.toString());
		  }
		};
	
		fetchSequentialData();
	  }, []);

	return (
		<Layout>
			<div className=''>
				<ul>
					<List placeholder='	' className='ContentGrid z-10 overflow-y-scroll'>
						{gameBananaMods && Object.keys(gameBananaMods._aRecords).length >= 150 && gameBananaMods._aRecords?.map(record => (
							<li key={record.idRow}>
								<ContentCard info={{
									name: record._sName,
									thumbnail: `${record._aPreviewMedia._aImages[0]._sBaseUrl}/220-90_${record._aPreviewMedia._aImages[0]._sFile}`,
									description: 'paficent is gay', // Implement Me!
									author: record._aSubmitter._sName,
									version: record._sVersion ? `(${record._sVersion})` : '',
								}}>

								</ContentCard>
							</li>
						))}
					</List>
				</ul>
			</div>
			
			{
				!gameBananaMods || typeof(gameBananaMods) !== 'undefined' && Object.keys(gameBananaMods._aRecords).length < 150 &&
				<div className='z-10'>
					<div className='app-loading-wrap'>
						<div className='square-loader-anim' />
					</div>
				</div>
			}
		</Layout>
	);
}
