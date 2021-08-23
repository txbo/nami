import 'reflect-metadata'
import type { Context, Middleware } from 'koa'
import { get } from 'lodash'
import Mockjs from 'mockjs'
import { CODE, ENV, MESSAGE, MOCK } from '../../common/constants'
import { BaseWrap, BaseCirculationError } from 'nami-base'

const METHOD = '__method'
const PREFIX = '__prefix'
const PATH = '__path'
const PARAMS = '__params'

interface IParamsItem {
  index: number
  required?: (arg: unknown) => boolean
  getterPath?: string
  parser?: (arg: unknown) => unknown
}

declare interface IValidatorResult {
  isSuccess: boolean
  stack: string[]
}

type LowerMethod = 'get' | 'post'

// 用于 controller 中具体路由方法装饰器，构造 koa Middleware
const generatorMiddleware = (type: LowerMethod, path: string): MethodDecorator => {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const fn = descriptor?.value
    const metaArgs = (Reflect.getOwnMetadata(PARAMS, target, propertyKey) as IParamsItem[])?.reduce?.<IParamsItem[]>((spare, curr) => {
      spare[curr?.index] = curr
      return spare
    }, [])
    descriptor.value = async function <T> (ctx: Context) {
      const validate: IValidatorResult = { isSuccess: true, stack: [] }
      const args = metaArgs?.map?.(it => {
        const getValue = get(ctx, it?.getterPath ?? '')
        const value = it?.parser?.(getValue) ?? getValue
        if (it?.required != null && !it?.required?.(value)) {
          validate.isSuccess = false
          validate.stack.push(`${
            it?.getterPath ?? 'nil'
          } must pass the parser function check, got ${
            Object.prototype.toString.call(value)
          } type.`)
        }
        return value
      })
      if (validate?.isSuccess) {
        ctx.body = await fn?.call?.(this, ...args ?? [])
          .then((res: T) => BaseWrap.success(res))
          .catch((err: unknown) => BaseWrap.error(err))
      } else {
        ctx.body = BaseWrap.error(new BaseCirculationError({
          code: CODE.PARAMS_FAIL,
          message: MESSAGE.PARAMS_FAIL
        }))
      }
    }
    Reflect.defineMetadata(PATH, path ?? '/', target, propertyKey)
    Reflect.defineMetadata(METHOD, type, target, propertyKey)
  }
}
// 路由前缀，主要给 controller 用
export const Controller = (routePrefix: string): ClassDecorator => constrcutor => {
  Reflect.defineMetadata(PREFIX, routePrefix, constrcutor)
}

export const Get = (path: string): MethodDecorator => {
  return generatorMiddleware('get', path)
}
export const Post = (path: string): MethodDecorator => {
  return generatorMiddleware('post', path)
}

// 将参数收集并写入元数据，用于参数解析装饰器
const setRequestParamsToMetadata = (fn: (item: IParamsItem) => IParamsItem): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    const paramsList: IParamsItem[] = Reflect.getOwnMetadata(PARAMS, target, propertyKey) ?? []
    const index: number = paramsList?.findIndex?.(it => it?.index === parameterIndex)
    const item = fn?.(paramsList?.[index] ?? { index: parameterIndex })
    if (~index !== 0) paramsList[index] = item
    else paramsList?.push?.(item)
    Reflect.defineMetadata(PARAMS, paramsList, target, propertyKey)
  }
}
// 将字符串拼接为 get 可用参数
const concatPath = (prefix: string, path: string): string => `${prefix}${path[0] === '[' ? '' : '.'}${path}`

export const Query = (key: string): ParameterDecorator => {
  return setRequestParamsToMetadata((item: IParamsItem) => {
    item.getterPath = concatPath('query', key)
    return item
  })
}
export const Body = (key: string): ParameterDecorator => {
  return setRequestParamsToMetadata((item: IParamsItem) => {
    item.getterPath = concatPath('request.body', key)
    return item
  })
}
export const State = (key: string): ParameterDecorator => {
  return setRequestParamsToMetadata((item: IParamsItem) => {
    item.getterPath = concatPath('state', key)
    return item
  })
}

export const Parser = (fn: (arg: unknown) => unknown): ParameterDecorator => {
  return setRequestParamsToMetadata((item: IParamsItem) => {
    item.parser = fn
    return item
  })
}
export const Required = <T>(fn: (arg: T) => boolean): ParameterDecorator => {
  return setRequestParamsToMetadata((item: IParamsItem) => {
    item.required = fn as (arg: unknown) => boolean
    return item
  })
}

const sleep = async (timing: number): Promise<NodeJS.Timeout> => await new Promise(resolve => {
  const timer = setTimeout(() => {
    resolve(timer)
  }, timing)
})

export const Mock = (template: object | string, timing?: number): MethodDecorator => (target, propertyKey, descriptor: PropertyDescriptor) => {
  if (process.env.NODE_ENV === ENV.DEV && process.env.NODE_MOCK === MOCK) {
    try {
      const data = Mockjs.mock(template)
      descriptor.value = async (ctx: Context, ...args: any[]) => {
        if (timing) {
          const timer = await sleep(timing)
          clearTimeout(timer)
        }
        return data
      }
    } catch (e) {
      console.error(e)
    }
  }
}

interface IRoute {
  readonly controller: Middleware
  readonly method: LowerMethod
  readonly path: string
}

interface IRoutes {
  readonly prefix: string
  readonly routes: IRoute[]
}

// 路由转换映射 controller
export const mapRoute = <T extends {}> (controllerInstance: T): IRoutes => {
  const property = Object.getPrototypeOf(controllerInstance)
  return {
    prefix: Reflect.getOwnMetadata(PREFIX, property?.constructor),
    routes: Object.getOwnPropertyNames(property)
      ?.filter?.(name => Reflect.hasMetadata(METHOD, property, name) && Reflect.hasMetadata(PATH, property, name))
      ?.map?.(name => ({
        path: Reflect.getOwnMetadata(PATH, property, name),
        method: Reflect.getOwnMetadata(METHOD, property, name) as LowerMethod,
        controller: property?.[name]?.bind?.(controllerInstance) as Middleware
      }))
  }
}
