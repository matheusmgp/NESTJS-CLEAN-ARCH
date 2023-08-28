export interface IUseCase<Input, OutPut> {
  execute(input: Input): Promise<OutPut> | OutPut;
}
