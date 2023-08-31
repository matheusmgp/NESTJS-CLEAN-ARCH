import { UserPresenter } from '../../user.presenter';
import { instanceToPlain } from 'class-transformer';
describe('UserPreseter unit test', () => {
  let sut: UserPresenter;
  const createdAt = new Date();
  const props = {
    id: '9493d827-e914-447d-bec7-767cffd246db',
    name: 'test name',
    email: 'e@e.com',
    password: '1234',
    createdAt,
  };
  beforeEach(() => {
    sut = new UserPresenter(props);
  });
  describe('Constructor unit test', () => {
    it('should define all fields', () => {
      expect(sut.id).toEqual(props.id);
      expect(sut.name).toEqual(props.name);
      expect(sut.email).toEqual(props.email);
      expect(sut.createdAt).toEqual(props.createdAt);
    });
  });

  it('should presente the data', () => {
    const output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      id: '9493d827-e914-447d-bec7-767cffd246db',
      name: 'test name',
      email: 'e@e.com',
      createdAt: createdAt.toISOString(),
    });
  });
});
