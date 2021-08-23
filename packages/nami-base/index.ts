import type { AxiosRequestConfig, AxiosInstance } from 'axios'
import axios from 'axios'
import type { Context } from 'koa'
import { MESSAGE, CODE } from '../../common/constants'
import type { IParams, IRequestOption, IResponseWrap, IThriftOption } from '../../typings/common.d'

export class BaseCirculationError extends Error {
  code: CODE
  redirectUrl?: string
  constructor ({ code, message, redirectUrl }: IParams) {
    super(message)
    this.code = code
    this.redirectUrl = redirectUrl
  }
}

// 响应体包裹函数，构造函数私有，使用静态方法 success 和 error
export class BaseWrap<T> implements IResponseWrap<T> {
  // data 结构体包裹，保证 data 为对象
  public data: T
  public message: string = MESSAGE.SUCCESS
  public code: number = CODE.SUCCESS
  public redirectUrl?: string
  private constructor (data: T, code: CODE, message: string, redirectUrl?: string) {
    this.data = data
    this.code = code
    this.message = message
    this.redirectUrl = redirectUrl
  }

  // 成功响应的响应体包装
  static success <U> (data: U): BaseWrap<U> {
    return new BaseWrap(data, CODE.SUCCESS, MESSAGE.SUCCESS)
  }

  // 失败响应的响应体包装
  // 将和服务的各种异常 code 和 message 通过远端配置的方式进行匹配处理，
  static error (error: unknown): BaseWrap<{}> {
    if (error instanceof BaseCirculationError) {
      return new BaseWrap(
        {},
        error?.code ?? CODE.UNKNOW_FAIL,
        error?.message ?? MESSAGE.UNKNOW_FAIL,
        error?.redirectUrl
      )
    }
    if (error instanceof Error) {
      return new BaseWrap({}, CODE.UNKNOW_FAIL, error?.message ?? MESSAGE.UNKNOW_FAIL)
    }
    return new BaseWrap({}, CODE.UNKNOW_FAIL, MESSAGE.UNKNOW_FAIL)
  }
}

export class BaseController {}

export class BaseHTTPService {
  private readonly http: AxiosInstance
  private readonly appkey: string

  constructor (appkey: string, option: AxiosRequestConfig = {}) {
    this.appkey = appkey
    this.http = axios.create(Object.assign({ timeout: 3000 }, option))
  }

  async get <T, U>(path: string, params?: T, option?: AxiosRequestConfig): Promise<U> {
    const response = await this.http.get(path, { params, ...option })
    return response.data
  }

  async post <T, U>(path: string, params?: T, option?: AxiosRequestConfig): Promise<U> {
    const response = await this.http.post(path, params, option)
    return response.data
  }

  protected injectContext = (ctx: Context, option: AxiosRequestConfig = {}): AxiosRequestConfig => ({
    timeout: ctx.state.action === 'render' ? 300 : 30000,
    headers: {
      'M-APPKEY': this.appkey,
      'M-TRACEID': ctx.traceId
    },
    ...option
  })
}

export class BaseThriftService<T> {
  protected thrift: T

  constructor (Thriftless: new (option: IThriftOption) => T, thriftOption: IThriftOption) {
    this.thrift = new Thriftless(thriftOption)
  }

  protected injectContext = (ctx: Context): IRequestOption => ({
    timeout: ctx.state.action === 'render' ? 300 : 30000,
    retry: 0,
    header: {
      traceId: ctx.traceId
    }
  })
}
