import type { Middleware, Context } from 'koa'
import { CODE } from '../../common/constants'
import type { BaseWrap } from 'nami-base'
import compose from 'koa-compose'
import Router from '@koa/router'
import type { IMPARouteConfig, TRender, IThriftOption } from '../../typings/common.d'
import fs from 'fs'
import path from 'path'

type LowerMethod = 'get' | 'post'

interface IRoute {
  readonly controller: Middleware
  readonly method: LowerMethod
  readonly path: string
}

interface IRoutes {
  readonly prefix: string
  readonly routes: IRoute[]
}

export const restfulRouteHandler = (confs: IRoutes[]): Middleware => {
  const routes = confs?.map(
    conf => conf?.routes?.reduce?.<Router>(
      (router, confItem: IRoute) => router?.[confItem.method ?? 'all']?.(confItem?.path, confItem?.controller),
      new Router({ prefix: conf?.prefix })
    )
  )
  return compose([
    ...routes?.map((r: Router) => r?.routes()),
    ...routes?.map((r: Router) => r?.allowedMethods())
  ]) as Middleware
}

// 异常包裹中间件
export const errorHandler = () => async (
  ctx: Context,
  next: () => Promise<undefined>
): Promise<void> => {
  try {
    await next()
  } catch (e) {
    ctx.status = e?.status ?? 500
    ctx.body = e?.message
    // TODO 打点 日志
  }
}

export const requestHandler = (apiPrefix: string) => async (
  ctx: Context,
  next: () => Promise<undefined>
): Promise<void> => {
  const type = ctx.path.startsWith(apiPrefix) ? 'server' : 'render'
  // const monitor = createTransaction(ctx, type, `${ctx.method} ${ctx.path}`)
  // ctx.state.swimlane = getSwimlaneSync()
  ctx.state.action = type
  ctx.state.uuid = ctx.cookies.get('uuid') ?? ctx?.query?.uuid ?? 'unknow'
  ctx.state.token =
    ctx.cookies.get('mt_c_token') ??
    ctx.cookies.get('token') ??
    ctx?.query?.token
  ctx.state.traceId = ctx.traceId
  // logger(ctx, 'trace', { apiName: 'requestHandler' })
  await next()
  const isSuccess = ctx.status === 200 && (
    type === 'server'
      ? (ctx.body as BaseWrap<unknown>).code === CODE.SUCCESS
      : true
  )
  // logger(ctx, isSuccess ? 'info' : 'warn', {
  //   apiName: 'requestHandler',
  //   content: ctx.state,
  //   result: ctx.body
  // })
  // monitor?.(isSuccess)
}

export const renderHandler = (mpaConfig: IMPARouteConfig[]): Middleware => {
  const router = new Router()

  mpaConfig.forEach(conf => {
    router.all(conf.path, async ctx => {
      const url = ctx.originalUrl
      const template = fs.readFileSync(
        path.resolve(process.cwd(), `dist/client/template/${conf.name}.html`),
        'utf-8'
      )
      try {
        const serverPath = path.resolve(process.cwd(), `dist/server/${conf.name}.js`)
        const render: TRender = require(serverPath).render
        // eval('require')(serverPath).render // eslint-disable-line
        const { html, data } = await render(url, ctx)
        const page = template
          .replace('<!--app-html-->', html)
          .replace(
            '<!--app-init-state-->',
            `<script>window.__INITIAL_STATE__=${JSON.stringify(data)};</script>`
          )
        ctx.status = 200
        ctx.set('Content-Type', 'text/html')
        ctx.body = page
      } catch (e) {
        // logger(ctx, 'warn', {
        //   apiName: 'renderer',
        //   summary: e
        // })
        ctx.status = 200
        ctx.body = template
      }
    })
  })
  return compose([router?.routes(), router?.allowedMethods()]) as Middleware
}
