export type JSONPrimitive = string | number | boolean;

export interface BaseSchema {
  title?: string;
  description?: string;
  default?: unknown;
}

export interface StringItemSchema extends BaseSchema {
  type: 'string';
  enum?: string[];
  enumDescriptions?: string[];
  enumItemLabels?: string[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface NumberItemSchema extends BaseSchema {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
}

export interface BooleanItemSchema extends BaseSchema {
  type: 'boolean';
}

export type ItemSchema =
  | StringItemSchema
  | NumberItemSchema
  | BooleanItemSchema;

export interface ObjectSettingSchema extends BaseSchema {
  type?: 'object';
  properties?: Record<string, ItemSchema>;
  additionalProperties?: ItemSchema | boolean;
}

export type ListChangeEventType =
  | 'add'
  | 'change'
  | 'remove'
  | 'move'
  | 'reset';
export type ObjectChangeEventType = 'add' | 'change' | 'remove' | 'reset';

export interface ListChangeEvent<T> {
  type: ListChangeEventType;
  value: T[];
  index?: number;
  previousIndex?: number;
  item?: T;
}

export interface ObjectChangeEvent<T> {
  type: ObjectChangeEventType;
  value: Record<string, T>;
  key?: string;
  previousKey?: string;
  item?: T;
}
