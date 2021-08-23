import Koa from 'koa'
import { errorHandler, requestHandler } from 'nami-middleware'
import bodyParser from 'koa-bodyparser'

export class Nami extends Koa {
  constructor (options: {
    appkey: string
    apiPrefix?: string
  }) {
    super()
    this.proxy = true
    const apiPrefix = options.apiPrefix ?? '/api'
    ;[
      errorHandler(),
      // tracer(options.appkey),
      requestHandler(apiPrefix),
      bodyParser({ enableTypes: ['json', 'form', 'text'] })
    ].reduce((app, middleware) => {
      app.use(middleware)
      return app
    }, this)
  }
}
