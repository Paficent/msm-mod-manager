import React from 'react';
import {
	Button,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Typography,
} from '@material-tailwind/react';

type NotificationArgs =
	{
		title: string;
		body: string;
	};

const Notification = () => {
	const [open, setOpen] = React.useState(false);
	const [info, setInfo] = React.useState({
		title: 'An Error Occured',
		body: 'hehe',
	});

	window.ipcRenderer.on('openNotification', (event: Electron.IpcRendererEvent, args: NotificationArgs) => {
		console.log(args);
		setInfo(args);
		handleOpen();
	});

	const handleOpen = () => {
		setOpen(!open);
	};

	return (
		<>
			<Dialog open={open} handler={handleOpen} placeholder='' size='xs' className='bg-neutral-900'>
				<DialogHeader placeholder='' className='grid place-items-center  text-neutral-100'>
					<Typography variant='h5' placeholder=''>
						{info.title}
					</Typography>
				</DialogHeader>
				<DialogBody placeholder='' divider className='grid place-items-left gap-4  text-neutral-200'>
					<Typography placeholder='' className='text-left font-normal'>
						{info.body}
					</Typography>
				</DialogBody>
				<DialogFooter placeholder='' className='space-x-2'>
					<Button placeholder='' variant='text' className='text-neutral-200' onClick={async () => {
						await navigator.clipboard.writeText(info.body);
						handleOpen();
					}}>
						Copy
					</Button>
					<Button placeholder='' variant='gradient' onClick={handleOpen}>
						Okay
					</Button>
				</DialogFooter>
			</Dialog>
		</>
	);
};

export default Notification;
