# `nami-decorator`

> Nami AOP 装饰器实现，提供 Nami 服务端接口装饰能力

## Install

```bash
mnpm i nami-decorator -S
```

## Usage

### Controller

Nami api 必须，装饰 Controller 类，注册当前 controller 的路由元信息，并将 controller 转换成中间件

#### Type Signature

```ts
export declare const Controller: (routePrefix: string) => ClassDecorator;
```

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
### Get | Post

Nami api 必须，装饰 Controller 类中的方法，注册当前方法的路由私有方法与私有路径元信息

#### Type Signature

```ts
export declare const Get: (path: string) => MethodDecorator;
export declare const Post: (path: string) => MethodDecorator;
```

#### Example Usage

```ts
@Controller(`${PREFIX}/v1/home`)
export default class HomeController extends BaseController {
  private readonly homeService = new HomeService()

  @Get('/topics')
  async topics (ctx: Context): Promise<any> {
    return await this.homeService.cnode(ctx)
  }
  @Post('/upload')
  async upload (ctx: Context): Promise<any> {
    return await this.homeService.add(ctx)
  }
}
```
### Query | Body

Nami api 可选，装饰 Controller 类方法中的参数，从上下文获取请求参数

#### Type Signature

```ts
export declare const Query: (key: string) => ParameterDecorator;
export declare const Body: (key: string) => ParameterDecorator;
```

#### Example Usage

```ts
@Controller(`${PREFIX}/v1/home`)
export default class HomeController extends BaseController {
  private readonly homeService = new HomeService()

  @Get('/topics')
  async topics (
    ctx: Context,
    @Query('user') user = ''
  ): Promise<any> {
    return await this.homeService.cnode(ctx, user)
  }
  @Post('/upload')
  async upload (
    ctx: Context,
    @Body('user') user = ''
  ): Promise<any> {
    return await this.homeService.add(ctx, user)
  }
}
```
### Parser

Nami api 可选，装饰 Controller 类方法中的参数，将参数解析成正确的数据类型

#### Type Signature

```ts
export declare const Parser: (fn: (arg: unknown) => unknown) => ParameterDecorator;
```

#### Example Usage

```ts
import toString from 'lodash/toString'

@Controller(`${PREFIX}/v1/home`)
export default class HomeController extends BaseController {
  private readonly homeService = new HomeService()

  @Get('/topics')
  async topics (
    ctx: Context,
    @Query('user') @Parser(toString) user = ''
  ): Promise<any> {
    return await this.homeService.cnode(ctx, user)
  }
}
```
### Required

Nami api 可选，装饰 Controller 类方法中的参数，校验参数是否存在且正确

#### Type Signature

```ts
export declare const Required: <T>(fn: (arg: T) => boolean) => ParameterDecorator;
```

#### Example Usage

```ts
import toString from 'lodash/toString'
import isString from 'lodash/isString'

@Controller(`${PREFIX}/v1/home`)
export default class HomeController extends BaseController {
  private readonly homeService = new HomeService()

  @Get('/topics')
  async topics (
    ctx: Context,
    @Query('user') @Parser(toString) @Required(isString) user = ''
  ): Promise<any> {
    return await this.homeService.cnode(ctx, user)
  }
}
```
### Mock

Nami api 可选，用于 Mock 数据，只在 `NODE_ENV` 为 `development` 且 `NODE_MOCK` 为 `mock` 时生效

#### Type Signature

```ts
export declare const Mock: (template: object | string, timing?: number | undefined) => MethodDecorator;
```

#### Example Usage

```ts
export default class HomeService extends BaseService {
  constructor () {
    super(APPKEY_SELF, { baseURL: 'https://cnodejs.org/api/v1' })
  }

  @Mock({
    "string|3": "★★★"
  }, 5000)
  public async cnode (ctx: Context): Promise<unknown> {
    return await this.get('topics', this.injectContext(ctx))
  }
}
```
### mapRoute

用于将装饰后的 Controller 注册到路由上

#### Type Signature

```ts
export declare const mapRoute: <T extends {}>(controllerInstance: T) => IRoutes;
```

#### Example Usage

```ts
app.use(restfulRouteHandler(controllerList.map(it => mapRoute(it))))
```