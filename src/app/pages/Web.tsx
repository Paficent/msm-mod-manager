import React, {useEffect, useState, useRef} from 'react';
import {type GameBananaData, type GameBananaObject} from '@/types/game-banana';
import ContentCard from '@/components/ContentCard';
import {List} from '@material-tailwind/react';

export default function Web(): React.ReactElement {
	const [items, setItems] = useState<any[] | GameBananaData>([]);
	const [page, setPage] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	let isComplete = false;

	const fetchData = async () => {
		setIsLoading(true);

		try {
			const response: Response = await fetch(
				`https://gamebanana.com/apiv11/Game/9640/Subfeed?_nPage=${page}&_sSort=new&_csvModelInclusions=Mod`,
			);
			const data = (await response.json()) as {_aRecords: GameBananaData; _aMetadata: {
				_nRecordCount: number;
				_nPerpage: number;
				_bIsComplete: boolean;
			};};

			isComplete = data._aMetadata._bIsComplete;

			if (page === 1) {
				setItems(data._aRecords);
				console.log(data._aMetadata);
			} else {
				setItems(prevData => [...prevData, ...data._aRecords]);
			}

			setPage(prevPage => prevPage + 1);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleScroll = () => {
		const container = containerRef.current;
		if (container) {
			const {scrollTop, scrollHeight, clientHeight} = container;
			const scrollBottom = scrollHeight - scrollTop - clientHeight;

			const scrollThreshold = 75 * page;

			if (scrollBottom < scrollThreshold && !isLoading && !isComplete) {
				void fetchData();
			}
		}
	};

	useEffect(() => {
		void fetchData();
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (container) {
			container.addEventListener('scroll', handleScroll);
		}

		return () => {
			if (container) {
				container.removeEventListener('scroll', handleScroll);
			}
		};
	}, [handleScroll]);

	return (
		<div className='h-full w-full overflow-hidden'>
			<div ref={containerRef} className='h-full overflow-y-scroll overflow-x-hidden'>
				<ul>
					<List placeholder='' className='ContentGrid z-10'>
						{items.map((record: GameBananaObject) => (
							<li key={record._idRow}>
								<ContentCard
									info={{
										name: record._sName,
										thumbnail: `${record._aPreviewMedia._aImages[0]._sBaseUrl}/220-90_${record._aPreviewMedia._aImages[0]._sFile}`,
										description: 'Description',
										author: record._aSubmitter._sName,
										version: record._sVersion ? `(${record._sVersion})` : '',
										id: record._idRow,
									}}
								></ContentCard>
							</li>
						))}
					</List>
				</ul>
			</div>
		</div>
	);
}
