type Storage = {
	token: string | null;
	user: JWTTokenData | null;
	journey: { startAt: Journey["startAt"]; id: Journey["id"] } | null;
	currTask: Task | OtherTask | null;
	createTaskInfo: CreateTaskInfo | null;
};

function getItem<Key extends keyof Storage>(key: Key): Storage[Key] {
	const item = window.localStorage.getItem(key);
	if (!item) return null;
	return JSON.parse(item);
}

function setItem<Key extends keyof Storage>(key: Key, value: Storage[Key]) {
	window.localStorage.setItem(key, JSON.stringify(value));
}

function removeItem(key: keyof Storage) {
	window.localStorage.removeItem(key);
}

function clear() {
	window.localStorage.clear();
}

export function LocalStorage() {
	return {
		getItem,
		setItem,
		removeItem,
		clear,
	};
}
