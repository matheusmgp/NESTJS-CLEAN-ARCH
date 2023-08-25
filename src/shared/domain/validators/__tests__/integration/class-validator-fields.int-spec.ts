import { ClassValidatorFields } from '../../class-validator-fields';
import { MaxLength, IsNotEmpty, IsString, IsNumber } from 'class-validator';

class StubRules {
  @MaxLength(10)
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNumber()
  @IsNotEmpty()
  price: number;
  constructor(data: any) {
    Object.assign(this, data);
  }
}
class StubClassValidatorFields extends ClassValidatorFields<StubRules> {
  validate(data: any): boolean {
    return super.validate(new StubRules(data));
  }
}

describe('ClassValidatorFields integration tests ', () => {
  it('should validate with errors', () => {
    const sut = new StubClassValidatorFields();
    expect(sut.validate(null)).toBeFalsy();
    expect(sut.errors).toStrictEqual({
      name: [
        'name must be a string',
        'name should not be empty',
        'name must be shorter than or equal to 10 characters',
      ],
      price: [
        'price should not be empty',
        'price must be a number conforming to the specified constraints',
      ],
    });
    expect(sut.validatedData).toBeNull();
  });
  it('should validate without errors', () => {
    const sut = new StubClassValidatorFields();
    expect(sut.validate({ name: 'name', price: 1000 })).toBeTruthy();
    expect(sut.errors).toBeNull();
    expect(sut.validatedData).toStrictEqual(
      new StubRules({ name: 'name', price: 1000 }),
    );
  });
});
