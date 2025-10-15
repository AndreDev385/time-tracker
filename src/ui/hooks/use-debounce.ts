import React from "react";
import { UI_DEBOUNCE_DELAY } from "../lib/utils";

export function useDebounce<T>(value: T, delay = UI_DEBOUNCE_DELAY) {
	const [debouncedValue, setDebouncedValue] = React.useState(value);

	React.useEffect(() => {
		const id = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(id);
		};
	}, [value, delay]);

	return debouncedValue;
}
