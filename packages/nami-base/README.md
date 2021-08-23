# `nami-base`

> Nami 的基础类集合，包含了 Nami 遵循接口规范的的成功响应包装类，失败响应的包装类，Controller 父类，HTTP service 父类，THRIFT 父类，Nami 异常流转类

## Install

```bash
mnpm i nami-base -S
```

## Usage

### BaseController

用于 controller 内继承类，提供 controller 类通用方法，目前是一个空类

#### Example Usage


```ts
@Controller(`${PREFIX}/v1/home`)
export default class HomeController extends BaseController {
  private readonly homeService = new HomeService()

  @Get('/topics')
  async topics (ctx: Context): Promise<any> {
    return await this.homeService.cnode(ctx)
  }
}
```

### BaseHTTPService

用于连接后端 http 服务的 service 继承类，提供 http service 通用方法

#### Type Signature

```ts
export declare class BaseHTTPService {
    private readonly http;
    private readonly appkey;
    constructor(appkey: string, option?: AxiosRequestConfig);
    get<T, U>(path: string, params?: T, option?: AxiosRequestConfig): Promise<U>;
    post<T, U>(path: string, params?: T, option?: AxiosRequestConfig): Promise<U>;
    protected injectContext: (ctx: Context, option?: AxiosRequestConfig) => AxiosRequestConfig;
}
```

#### Example Usage

```ts
export class HomeService extends BaseHTTPService {
  constructor () {
    super(APPKEY_SELF, { baseURL: 'https://cnodejs.org/api/v1' })
  }

  @Mock('mock/home/topics.json', 5000)
  public async cnode (ctx: Context): Promise<unknown> {
    return this.get('topics', this.injectContext(ctx))
  }
}
```

### BaseThriftService

用于连接后端 thrift 服务的 service 继承类，提供 thrift service 通用方法

#### Type Signature

```ts
export declare class BaseThriftService<T> {
  protected thrift: T;
  constructor(Thriftless: new (option: IThriftOption) => T, thriftOption: IThriftOption);
  protected injectContext: (ctx: Context) => IRequestOption;
}
```

#### Example Usage

```ts
export class HomeService extends BaseThriftService<ISomeService> {
  constructor () {
    super(ISomeService, {
      appkey: SELF_APPKEY,
      thriftOptions: {
        enableAuth: true,
        timeout: RESTFUL_RPC_TIMEOUT
      }
    })
  }
  // 获取数据
  public async getData (ctx: Context, request: ISomeService.SomeReq): Promise<ISomeService.Rep> {
    return this.thrift.getData({ request }, this.injectContext(ctx))
  }
}
```

### BaseWrap

用于按照接口规范标准化的请求响应包裹，此类为一个私有类

#### Type Signature

```ts
export declare class BaseWrap<T> implements IResponseWrap<T> {
  data: T;
  message: string;
  code: number;
  redirectUrl?: string;
  private constructor();
  static success<U>(data: U): BaseWrap<U>;
  static error(error: unknown): BaseWrap<{}>;
}
```

#### Example Usage

```ts
export class HomeService extends BaseThriftService<ISomeService> {
  constructor () {
    super(ISomeService, {
      appkey: SELF_APPKEY,
      thriftOptions: {
        enableAuth: true,
        timeout: RESTFUL_RPC_TIMEOUT
      }
    })
  }
  // 获取数据
  public async getData (ctx: Context, request: ISomeService.SomeReq): Promise<ISomeService.Rep> {
    return this.thrift.getData({ request }, this.injectContext(ctx))
  }
}
```

### BaseCirculationError

用于标准的异常流转基础数据结构，一般情况下不会用到

#### Type Signature

```ts
export declare class BaseCirculationError extends Error {
  code: CODE;
  redirectUrl?: string;
  constructor({ code, message, redirectUrl }: IParams);
}
```

#### Example Usage

```ts
ctx.body = BaseWrap.error(new BaseCirculationError({
  code: CODE.PARAMS_FAIL,
  message: MESSAGE.PARAMS_FAIL
}))
```
