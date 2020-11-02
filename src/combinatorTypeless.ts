import { Context } from '@azure/functions';
import { MiddlewareFunction } from './types';

export type HandlerResult = (context: Context) => Promise<void>

export interface IMiddlewareFunction {
    (context: Context, next: () => Promise<Response>): Promise<Response>
}

export let combine = (m1: MiddlewareFunction, m2: MiddlewareFunction): MiddlewareFunction =>
    (context, next) => m1(context, () => m2(context, next))

