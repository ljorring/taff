// import { Context } from '@azure/functions';

// import { HttpStatusCode, makeRequestPipeline, RequestHandler } from '../src/index'

// describe('pipeline', () => {
//   it('can be constructed', async () => {
//     // Arrange
//     let pipeline = makeRequestPipeline([]),
//         handler: RequestHandler<any> = () => Promise.resolve(HttpStatusCode.OK)

//     // @ts-ignore
//     let context: Context = {
//       res: {}
//     }

//     // Act
//     await pipeline(context, handler)

//     // Assert
//     expect(context.res?.status).toBe(HttpStatusCode.OK)
//   });
// });
