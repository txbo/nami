# `nami-middleware`

> Nami 提供的一些 Koa 中间件

## Install

```bash
mnpm i nami-middleware -S
```

## Usage

### restfulRouteHandler

配合 nami-decorator 中 mapRoute 方法，将 map 出的路由挂载到 app 上

#### Type Signature

```ts
export declare const restfulRouteHandler: (confs: IRoutes[]) => Middleware;
```

#### Example Usage

```ts
app.use(restfulRouteHandler(controllerList.map(it => mapRoute(it))))
```

### requestHandler

请求包裹中间件，主要进行关键上下文注入，性能监控

#### Type Signature

```ts
export declare const requestHandler: (apiPrefix: string) => (ctx: Context, next: () => Promise<undefined>) => Promise<void>;
```

#### Example Usage

```ts
app.use(requestHandler('/api'))
```

### renderHandler

服务端渲染中间件，负责将 Nami 多页进行服务端渲染

#### Type Signature

```ts
export declare const renderHandler: (mpaConfig: IMPARouteConfig[]) => Middleware;
```

#### Example Usage

```ts
app.use(renderHandler(mpaConfig))
```

### restfulProxyHandler

Nami 透传中间件，如果 Nami 需要透传投胎接口，并进行协议转化，可以使用此中间件

#### Type Signature

```ts
export declare const restfulProxyHandler: (option: {
  mod: 'thrift' | 'http';
  prefix: string;
  appkey: string;
  thriftOption?: IThriftOption;
  httpOption?: IBaseKoaProxiesOptions;
}) => Middleware;
```

#### Example Usage

```ts
app.use(restfulProxyHandler({
  mod: 'thrift',
  prefix: '/api/thrift'
}))
```