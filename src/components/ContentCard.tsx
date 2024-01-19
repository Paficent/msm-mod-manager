import React, {useState, type ReactElement} from 'react';
import {
	Card,
	CardHeader,
	CardBody,
	Typography,
	Checkbox,
} from '@material-tailwind/react';

const ContentCard = function (props: {
	info: {
		name: string;
		thumbnail: string;
		description: string;
		author: string;
		version: string;
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
			className='w-50 z-10'
			placeholder={''}
			color='gray'
			key={`mod_card_${info.name}`}
			style={{height: '350px'}}
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
				<div className='flex justify-left'>
					<Checkbox
						key={`mod_checkbox_${info.name}`}
						color='blue'
						label='Select'
						crossOrigin={''}
						checked={isChecked}
						onChange={ () => {
							setIsChecked(!isChecked);
							updateCheckbox(`mod_checkbox_${info.name}`, !isChecked);
						}}
					></Checkbox>
				</div>
			</CardBody>
		</Card>
	);
};

export default ContentCard;
