import { Context } from 'koa'

export interface IMPARouteConfig {
  name: string
  serverEntry: string
  clientEntry: string
  title: string
  path: string | RegExp | Array<string | RegExp>
  iconfont: string
}

export type TRender = (
  url: string,
  context: Context
) => Promise<{
  html: string
  data?: unknown
}>

export interface IResponseWrap<T> {
  data: T
  code: number
  message: string
  redirectUrl?: string
}

export interface IParams {
  code: number
  message: string
  redirectUrl?: string
}

export interface IRequestOption {
  timeout?: number
  retry?: number
  header?: {
    traceId?: string
    localContext?: {
      [key: string]: string
    }
    globalContext?: {
      [key: string]: string
    }
  }
  serviceList?: Array<{
    ip: string
    port: number
  }>
  ports?: number[]
  enableAuth?: boolean
  extra?: unknown
}

export interface IThriftOption {
  appkey: string
  client?: any
  thriftOptions?: {
    localAppKey?: string
    remoteAppKey?: string
    retry?: number
    timeout?: number
    header?: {
      localContext?: {
        [key: string]: string
      }
      globalContext?: {
        [key: string]: string
      }
    }
    checksum?: boolean
    compress?: 0 | 2
    serviceList?: [{
      ip: string
      port: number
    }]
    ports?: number[]
    mock?: any
    enableAuth?: boolean
  }
  request?: (config: {
    appkey: string
    name: string
    serviceName: string
    params: any
    options: any
  }, next: (opts?: IRequestOption) => Promise<any>) => Promise<any>
  mock?: any
}
