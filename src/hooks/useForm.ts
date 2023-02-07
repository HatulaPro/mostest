import { createStore } from 'solid-js/store';
import { createMemo } from 'solid-js';
import type { z } from 'zod';

type Data = {
	parser: z.ZodString;
	touched: boolean;
	value: string;
	error: string | null;
};
type Field = {
	parser: z.ZodString;
	defaultValue?: string;
};
function createFormState<TField extends string>(fields: Record<TField, Field>) {
	const entries = Object.entries(fields) as [TField, Field][];
	const mapped = entries.map(([fieldName, field]) => [fieldName, { parser: field.parser, touched: false, value: field.defaultValue ?? '', error: null }] as const);
	const result = Object.fromEntries(mapped);
	return result as Record<TField, Data>;
}

export function useForm<TField extends string>(fields: Record<TField, Field>) {
	const [formState, setFormState] = createStore(createFormState(fields));

	const getError = (field: TField) => {
		return formState[field].error;
	};

	const getValue = (field: TField) => {
		return formState[field].value;
	};

	const setValue = (field: TField, newValue: string) => {
		// eslint-disable-next-line
		setFormState(field as any, (p) => {
			const parsed = p.parser.safeParse(newValue);
			return { ...p, value: newValue, error: parsed.success ? null : parsed.error.flatten().formErrors.join('. '), touched: true };
		});
	};
	const isValid = createMemo(() => {
		for (const k in formState) {
			const key = k as TField;
			const parsed = formState[key].parser.safeParse(getValue(key));
			if (!parsed.success) {
				return false;
			}
		}
		return true;
	});

	const data = () => {
		const entries = Object.entries(formState) as [TField, { parser: z.ZodString; touched: boolean; value: string; error: string | null }][];
		const mapped = entries.map(([fieldName, value]) => [fieldName, value.value]);
		const result = Object.fromEntries(mapped);
		return result as Record<TField, string>;
	};

	return { getError, getValue, setValue, isValid, data, formState };
}
