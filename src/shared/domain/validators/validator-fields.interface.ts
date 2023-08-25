export type FieldsErrors = {
  [field: string]: string[];
};

export interface IValidatorFields<Props> {
  errors: FieldsErrors;
  validatedData: Props;
  validate(data: any): boolean;
}
