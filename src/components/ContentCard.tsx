import React, {useState, type ReactElement} from 'react';
import {
	Card,
	CardHeader,
	CardBody,
	Typography,
	Button,
	CardFooter,
} from '@material-tailwind/react';

const ContentCard = function (props: {
	info: {
		name: string;
		thumbnail: string;
		description: string;
		author: string;
		version: string;
		id: number;
	};
}): ReactElement {
	const {info} = props;
	const [isChecked, setIsChecked] = useState(false);

	const updateCheckbox = (checkboxKey: string, checkboxState: boolean): void => {
		void window.ipcRenderer.invoke('checkboxChanged', {
			key: checkboxKey,
			state: checkboxState,
		});
	};

	return (
		<Card
			className='w-50 z-10 h-[400px]'
			placeholder={''}
			color='gray'
			key={`mod_card_${info.name}`}
		>
			<CardHeader
				floated={false}
				className='h-65 text-center'
				color='gray'
				placeholder={''}
			>
				<div className='relative h-32'>
					<img
						src={info.thumbnail}
						alt='Mod Thumbnail'
						className='w-full h-full block object-fill'
					/>
				</div>
			</CardHeader>
			<CardBody className='flex flex-col justify-between' placeholder={''}>
				<Typography
					variant='h5'
					color='white'
					className='mb-2'
					placeholder={'Unknown Mod'}
				>
					{info.name}
				</Typography>
				<Typography color='white' className='mb-2' placeholder={''}>
			By {info.author} {info.version}<br/>{info.description}
				</Typography>
			</CardBody>
			<CardFooter placeholder='' className='mt-auto self-center'>
				<div>
					<Button variant='gradient' placeholder='' color='blue-gray' onClick={() => {
						console.log(info.id);
						void window.ipcRenderer.invoke('clickInstall', info);
					}}>
						Install
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
};

export default ContentCard;
