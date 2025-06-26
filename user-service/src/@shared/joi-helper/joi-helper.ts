import Joi from '@hapi/joi';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * A helper class to simplify the creation of Joi validation schemas with reusable patterns,
 * including ObjectId, strings, numbers, arrays, enums, booleans, and dates.
 *
 * Each method returns a Joi schema that can be used directly in DTO validation schemas.
 */
export class JoiHelper {
  /**
   * Validates an array of MongoDB ObjectId strings.
   *
   * @param required - Whether the field is required.
   * @param minItems - Minimum number of items in the array.
   * @param maxItems - Maximum number of items in the array.
   * @returns Joi schema for an array of ObjectId strings.
   */
  static ArrayObjectIdScm(
    required: boolean,
    minItems?: number,
    maxItems?: number,
  ) {
    let schema = Joi.array().items(this.ObjectIdScm(true)); // Ensuring each item is a valid ObjectId

    if (typeof minItems === 'number') schema = schema.min(minItems);
    if (typeof maxItems === 'number' && Number.isFinite(maxItems))
      schema = schema.max(maxItems);
    if (required) schema = schema.required();

    return schema;
  }

  /**
   * Validates a MongoDB ObjectId string.
   *
   * @param required - Whether the field is required.
   * @returns Joi schema for ObjectId string.
   */
  static ObjectIdScm(required: boolean) {
    let schema = Joi.string().pattern(objectIdRegex).messages({
      'string.pattern.base': 'ID must be a valid ObjectId',
    });
    if (required) schema = schema.required();
    return schema;
  }

  /**
   * Validates a boolean value.
   *
   * @param required - Whether the field is required.
   * @returns Joi schema for boolean.
   */
  static BooleanScm(required: boolean) {
    let schema = Joi.bool();
    if (required) schema = schema.required();
    return schema;
  }

  /**
   * Validates a number, with options for integer, min, and max.
   *
   * @param required - Whether the field is required.
   * @param integer - Whether the number must be an integer.
   * @param min - Minimum value allowed.
   * @param max - Maximum value allowed.
   * @returns Joi schema for number.
   */
  static NumberScm(
    required: boolean,
    integer: boolean,
    min?: number,
    max?: number,
  ) {
    let schema = Joi.number();
    if (integer) schema = schema.integer();
    if (typeof min === 'number') schema = schema.min(min);
    if (typeof max === 'number' && Number.isFinite(max))
      schema = schema.max(max);
    if (required) schema = schema.required();
    return schema;
  }

  /**
   * Validates a string that must match one of the provided enum values.
   *
   * @param required - Whether the field is required.
   * @param enumValues - Array of valid string values.
   * @returns Joi schema for enum.
   */
  static EnumScm(required: boolean, enumValues: string[]) {
    let schema = Joi.string().valid(...enumValues);
    if (required) schema = schema.required();
    return schema;
  }

  /**
   * Validates a string with optional constraints like alphanumeric, min and max length.
   *
   * @param required - Whether the field is required.
   * @param alphanum - Whether the string must be alphanumeric.
   * @param min - Minimum string length (default: 1).
   * @param max - Maximum string length (default: 255).
   * @returns Joi schema for string.
   */
  static StringScm(
    required: boolean,
    alphanum: boolean = false,
    min: number = 1,
    max: number = 255,
  ) {
    let schema = Joi.string();
    if (alphanum) schema.alphanum();
    if (typeof min === 'number') schema = schema.min(min);
    if (typeof max === 'number' && Number.isFinite(max))
      schema = schema.max(max);
    if (required) schema = schema.required();
    else schema = schema.optional().allow('');

    return schema;
  }

  /**
   * Validates a string in email format.
   *
   * @param required - Whether the field is required.
   * @returns Joi schema for email string.
   */
  static EmailScm(required: boolean) {
    let schema = Joi.string().email();
    if (required) schema = schema.required();
    return schema;
  }

  /**
   * Validates an array of items based on a given Joi schema.
   *
   * @param itemSchema - Joi schema for array elements.
   * @param required - Whether the field is required.
   * @param min - Minimum number of items.
   * @param max - Maximum number of items.
   * @returns Joi schema for array.
   */
  static ArrayScm(
    itemSchema: Joi.Schema,
    required: boolean,
    min?: number,
    max?: number,
  ) {
    let schema = Joi.array().items(itemSchema);
    if (typeof min === 'number') schema = schema.min(min);
    if (typeof max === 'number' && Number.isFinite(max))
      schema = schema.max(max);
    if (required) schema = schema.required();
    return schema;
  }

  /**
   * Validates an array of strings limited to a specific set of enum values.
   *
   * @param enumValues - Array of allowed enum strings.
   * @param required - Whether the field is required.
   * @param min - Minimum number of items.
   * @param max - Maximum number of items.
   * @returns Joi schema for enum string array.
   */
  static ArrayEnumScm(
    enumValues: string[],
    required: boolean,
    min?: number,
    max?: number,
  ) {
    let schema = Joi.array().items(Joi.string().valid(...enumValues));
    if (typeof min === 'number') schema = schema.min(min);
    if (typeof max === 'number' && Number.isFinite(max))
      schema = schema.max(max);
    if (required) schema = schema.required();
    return schema;
  }

  /**
   * Validates an array of strings with individual string length constraints.
   *
   * @param required - Whether the field is required.
   * @param minLength - Minimum string length for each item.
   * @param maxLength - Maximum string length for each item.
   * @param minItems - Minimum number of items in the array.
   * @param maxItems - Maximum number of items in the array.
   * @returns Joi schema for string array.
   */
  static ArrayStringScm(
    required: boolean,
    minLength?: number,
    maxLength?: number,
    minItems?: number,
    maxItems?: number,
  ) {
    let stringSchema = Joi.string();

    if (typeof minLength === 'number') {
      stringSchema = stringSchema.min(minLength);
    }

    if (typeof maxLength === 'number' && Number.isFinite(maxLength)) {
      stringSchema = stringSchema.max(maxLength);
    }

    let schema = Joi.array().items(stringSchema);

    if (typeof minItems === 'number') schema = schema.min(minItems);
    if (typeof maxItems === 'number' && Number.isFinite(maxItems))
      schema = schema.max(maxItems);
    if (required) schema = schema.required();
    return schema;
  }

  /**
   * Validates a string in ISO 8601 date format.
   *
   * @param required - Whether the field is required.
   * @returns Joi schema for ISO date string.
   */
  static DateStringScm(required: boolean) {
    let schema = Joi.string()
      .isoDate()
      .messages({ 'string.isoDate': 'Date must be in ISO 8601 format' });

    if (required) schema = schema.required();

    return schema;
  }
}
