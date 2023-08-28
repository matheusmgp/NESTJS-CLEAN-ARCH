/* eslint-disable @typescript-eslint/no-namespace */
export namespace SignupUseCase {
  export type Input = {
    name: string;
    email: string;
    password: string;
  };
  export type Output = {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
  };
  export class UseCase {
    async execute(input: Input): Promise<Output> {
      return {
        id: 'string',
        name: 'string',
        email: 'string',
        password: 'string',
        createdAt: new Date(),
      };
    }
  }
}
