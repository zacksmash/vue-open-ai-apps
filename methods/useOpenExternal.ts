export function useOpenExternal() {
	const openExternal = (href: string): void => {
		window.openai?.openExternal({ href });
	};

	return openExternal;
}
