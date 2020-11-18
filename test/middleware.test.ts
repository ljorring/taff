import { Context } from '@azure/functions';
import * as taff from '../src/index'

describe('middleware', () => {
  it('authenticates user', async () => {
    // Arrange
    let authMiddleware = taff.lift(async (context, next) => {
      return c => { c }
    })

    // @ts-ignore
    let context: Context = {
      res: {}
    }

    // Act
    await pipeline(context, handler)

    // Assert
    expect(context.res?.status).toBe(HttpStatusCode.OK)
  });
});
