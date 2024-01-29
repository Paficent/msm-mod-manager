type GameBananaData = [
	{
		_idRow: number;
		_sModelName: string;
		_sSingularTitle: string;
		_sIconClasses: string;
		_sName: string;
		_sProfileUrl: string;
		_tsDateAdded: number;
		_tsDateModified: number;
		_bHasFiles: boolean;
		_aPreviewMedia: {
			_aImages: [
				{
					_hFile100: number;
					_hFile220: number;
					_hFile530: number;
					_sBaseUrl: string;
					_sFile: string;
					_sFile100: string;
					_sFile220: string;
					_sFile530: string;
					_sType: string;
					_wFile100: 100;
					_wFile220: 220;
					_wFile530: 530;
				},
			];
		};
		_aSubmitter: {
			_idRow: number;
			_sName: string;
			_bIsOnline: boolean;
			_bHasRipe: boolean;
			_sProfileUrl: string;
			_sAvatarUrl: string;
		};
		_aRootCategory: {
			_sName: string;
			_sProfileUrl: string;
			_sIconUrl: string;
		};
		_sVersion: string;
		_bIsObsolete: boolean;
		_sInitialVisibility: string;
		_bHasContentRatings: boolean;
		_nLikeCount: number;
		_bWasFeatured: boolean;
		_nViewCount: number;
		_bIsOwnedByAccessor: boolean;
	},
];

type FirstItem<T extends any[]> = T extends [infer FirstItem, ...infer RestItems] ? FirstItem : never;
type GameBananaObject = FirstItem<GameBananaData>;

export type {GameBananaData, GameBananaObject};
