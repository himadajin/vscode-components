import { isComposingKeyboardEvent } from '../../hooks/useImeGuard';
import type { ItemSchema, ObjectSettingSchema } from '../../types/json-schema';
import { Checkbox } from '../Checkbox';
import { Select } from '../Select';
import { TextInput } from '../TextInput';

export function getDefaultItemValue<T>(
  schema?: ItemSchema,
  options?: { preferEnum?: boolean },
): T {
  if (schema?.default !== undefined) {
    return schema.default as T;
  }
  if (schema?.type === 'boolean') {
    return false as T;
  }
  if (schema?.type === 'number' || schema?.type === 'integer') {
    return 0 as T;
  }
  if (options?.preferEnum && schema?.type === 'string' && schema.enum?.[0]) {
    return schema.enum[0] as T;
  }
  return '' as T;
}

export function getObjectValueSchema(
  schema: ObjectSettingSchema | undefined,
  key: string,
): ItemSchema | undefined {
  if (!schema) {
    return undefined;
  }

  return (
    schema.properties?.[key] ??
    (typeof schema.additionalProperties === 'object'
      ? schema.additionalProperties
      : undefined)
  );
}

export function getDefaultObjectEntry<T>(
  schema?: ObjectSettingSchema,
): [string, T] {
  const firstKey = Object.keys(schema?.properties ?? {})[0] ?? '';
  const itemSchema = firstKey ? schema?.properties?.[firstKey] : undefined;

  return [firstKey, getDefaultItemValue<T>(itemSchema)];
}

export function getUniqueObjectKey<T>(
  value: Record<string, T>,
  schema: ObjectSettingSchema | undefined,
  preferredKey: string,
): string {
  if (preferredKey && value[preferredKey] === undefined) {
    return preferredKey;
  }

  const schemaKeys = Object.keys(schema?.properties ?? {});
  const nextSchemaKey = schemaKeys.find((key) => value[key] === undefined);
  if (nextSchemaKey) {
    return nextSchemaKey;
  }

  let index = Object.keys(value).length + 1;
  let fallbackKey = `key${index}`;

  while (value[fallbackKey] !== undefined) {
    index += 1;
    fallbackKey = `key${index}`;
  }

  return fallbackKey;
}

function parseItemValue(rawValue: string, schema?: ItemSchema): unknown {
  if (!schema || schema.type === 'string') {
    return rawValue;
  }
  if (schema.type === 'boolean') {
    return rawValue === 'true';
  }
  return rawValue === '' ? '' : Number(rawValue);
}

export function handleEditorKeyDown(
  event: React.KeyboardEvent<HTMLElement>,
  onCommit: () => void,
  onCancel: () => void,
) {
  if (isComposingKeyboardEvent(event)) {
    return;
  }
  if (event.key === 'Enter') {
    onCommit();
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    onCancel();
  }
}

interface SchemaValueInputProps {
  schema: ItemSchema | undefined;
  value: unknown;
  onChange: (value: unknown) => void;
  selectClassName?: string;
  textInputClassName?: string;
  includeStringValidation?: boolean;
}

export function SchemaValueInput({
  schema,
  value,
  onChange,
  selectClassName,
  textInputClassName,
  includeStringValidation = false,
}: SchemaValueInputProps) {
  const stringSchema =
    includeStringValidation && schema?.type === 'string' ? schema : undefined;
  const inputType: 'string' | 'number' | 'integer' =
    schema?.type === 'number' || schema?.type === 'integer'
      ? schema.type
      : 'string';

  if (schema?.type === 'boolean') {
    return (
      <Checkbox
        checked={Boolean(value)}
        onChange={onChange as (nextValue: boolean) => void}
      />
    );
  }

  if (schema?.type === 'string' && schema.enum?.length) {
    return (
      <Select
        className={selectClassName}
        value={String(value ?? '')}
        enum={schema.enum}
        enumDescriptions={schema.enumDescriptions}
        enumItemLabels={schema.enumItemLabels}
        onChange={onChange as (nextValue: string) => void}
      />
    );
  }

  return (
    <TextInput
      className={textInputClassName}
      value={value as string | number | undefined}
      type={inputType}
      pattern={stringSchema?.pattern}
      maxLength={stringSchema?.maxLength}
      minLength={stringSchema?.minLength}
      onChange={(nextValue) => onChange(parseItemValue(nextValue, schema))}
    />
  );
}
