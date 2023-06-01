import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

/**
 * Custom validator constraint for validating CSV format.
 */
@ValidatorConstraint({ name: 'isValidCsv', async: false })
class IsValidCsvConstraint implements ValidatorConstraintInterface {
  /**
   * Validates if the provided value is a valid CSV format.
   * @param value - The value to validate.
   * @returns A boolean indicating if the value is a valid CSV.
   */
  validate(value: any) {
    // Check if the value is not a string
    if (typeof value !== 'string') {
      return false;
    }

    const validValues = ['late', 'absent', 'present', 'unmark'];
    const values = value.split(',');

    for (const val of values) {
      // Check if the trimmed value is not in the validValues array
      if (!validValues.includes(val.trim())) {
        return false;
      }
    }

    return true;
  }

  /**
   * Default error message for invalid CSV.
   */
  defaultMessage() {
    return 'Invalid CSV format or contains invalid CSV parameter.';
  }
}

/**
 * Custom decorator for validating CSV format.
 * @param validationOptions - The validation options.
 * @returns A decorator function.
 */
export function IsValidCsv(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidCsv',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidCsvConstraint,
    });
  };
}