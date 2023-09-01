import { of } from 'rxjs';
import { WrapperDataInterceptor } from '../../wrapper.interceptor';

describe('WrapperDataInterceptor unit test', () => {
  let sut: WrapperDataInterceptor;
  let props: any;
  beforeEach(() => {
    sut = new WrapperDataInterceptor();
    props = {
      name: 'TestName',
      email: 'a@a.com',
      password: '1234',
    };
  });
  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should wrappe with data key', () => {
    const obs$ = sut.intercept({} as any, { handle: () => of(props) });

    obs$.subscribe({
      next: value => {
        expect(value).toEqual({ data: props });
      },
    });
  });
  it('should not wrappe with data key when meta is present', () => {
    const result = {
      data: [props],
      meta: {
        total: 1,
      },
    };
    const obs$ = sut.intercept({} as any, { handle: () => of(result) });

    obs$.subscribe({
      next: value => {
        expect(value).toEqual(result);
      },
    });
  });
  it('should not wrappe with data key when body is null', () => {
    const obs$ = sut.intercept({} as any, { handle: () => of(null) });

    obs$.subscribe({
      next: value => {
        expect(value).toEqual(null);
      },
    });
  });
  it('should not wrappe with data key when body is empty', () => {
    const obs$ = sut.intercept({} as any, { handle: () => of('') });

    obs$.subscribe({
      next: value => {
        expect(value).toEqual('');
      },
    });
  });
});
