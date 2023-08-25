import { validateSync } from 'class-validator';
import { FieldsErrors, IValidatorFields } from './validator-fields.interface';

export abstract class ClassValidatorFields<Props>
  implements IValidatorFields<Props>
{
  errors: FieldsErrors = null;
  validatedData: Props = null;

  validate(data: any): boolean {
    const errors = validateSync(data);
    if (errors.length) {
      this.errors = {};
      for (const err of errors) {
        const field = err.property;
        this.errors[field] = Object.values(err.constraints);
      }
    } else {
      this.validatedData = data;
    }
    return !errors.length;
  }
}
