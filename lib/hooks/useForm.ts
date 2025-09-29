import { useState } from "react";

export function useForm<T>(initial: T) {
	const [values, setValues] = useState(initial);

	const onChange = (key: keyof T, value: any) => {
		setValues((prev) => ({ ...prev, [key]: value }));
	};
	const reset = () => setValues(initial);

	return { values, onChange, setValues, reset };
}