import { useState } from "react";

import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient();


export function useForm<T>(initial: T) {
	const [values, setValues] = useState(initial);

	const onChange = (key: keyof T, value: any) => {
		setValues((prev) => ({ ...prev, [key]: value }));
	};
	const reset = () => setValues(initial);

	return { values, onChange, setValues, reset };
}