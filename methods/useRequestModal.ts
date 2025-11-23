import type { RequestModal } from "../types";

export function useRequestModal() {
	const requestModal: RequestModal = (title: string) => {
		return window.openai?.requestModal(title);
	};

	return requestModal;
}
