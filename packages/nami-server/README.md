# `nami-server`

> Nami server 的集成类，继承了 Koa，并集合了一些通用中间件以及其他处理

## Install

```bash
mnpm i nami-server -S
```

## Usage

### restfulRouteHandler

配合 nami-decorator 中 mapRoute 方法，将 map 出的路由挂载到 app 上

#### Type Signature

```ts
export declare class Nami extends Koa {
    constructor(options: {
        appkey: string;
        apiPrefix?: string;
    });
}
```

#### Example Usage

```ts
const app = new Nami({ appkey: APPKEY_SELF })
```
