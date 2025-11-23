export function useSendFollowUpMessage() {
	const sendFollowUpMessage = async (prompt: string): Promise<void> => {
		await window.openai?.sendFollowUpMessage({ prompt });
	};

	return sendFollowUpMessage;
}
