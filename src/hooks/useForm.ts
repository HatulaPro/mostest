import { createSignal, createMemo } from 'solid-js';
import { z } from 'zod';

function createFormState<TField extends string>(fields: Record<TField, z.ZodString>) {
	const entries = Object.entries(fields) as [TField, z.ZodString][];
	const mapped = entries.map(([fieldName, parser]) => [fieldName, { parser, touched: false, value: '', error: null }]);
	const result = Object.fromEntries(mapped);
	return result as Record<TField, { parser: z.ZodString; touched: boolean; value: string; error: string | null }>;
}

export function useForm<TField extends string>(fields: Record<TField, z.ZodString>) {
	const [formState, setFormState] = createSignal(createFormState(fields));

	const getError = (field: TField) => {
		return formState()[field].error;
	};

	const getValue = (field: TField) => {
		return formState()[field].value;
	};

	const setValue = (field: TField, newValue: string) => {
		setFormState((p) => {
			const parsed = p[field].parser.safeParse(newValue);
			p[field] = { ...p[field], value: newValue, error: parsed.success ? null : parsed.error.flatten().formErrors.join('. '), touched: true };
			return { ...p };
		});
	};
	const isValid = createMemo(() => {
		for (const k in formState()) {
			const key = k as TField;
			const parsed = formState()[key].parser.safeParse(getValue(key));
			if (!parsed.success) {
				return false;
			}
		}
		return true;
	});

	const data = () => {
		const entries = Object.entries(formState()) as [TField, { parser: z.ZodString; touched: boolean; value: string; error: string | null }][];
		const mapped = entries.map(([fieldName, value]) => [fieldName, value.value]);
		const result = Object.fromEntries(mapped);
		return result as Record<TField, string>;
	};

	return { getError, getValue, setValue, isValid, data, formState: formState() };
}