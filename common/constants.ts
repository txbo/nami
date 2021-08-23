export enum CODE {
  SUCCESS = 0,
  UNKNOW_FAIL = -1,
  PARAMS_FAIL = 1,
  AUTH_EMPTY = 2, // token 空
  AUTH_FAIL = 3, // 鉴权失败
  AUTH_UNKNOW = 4, // 鉴权异常
}

export enum MESSAGE {
  SUCCESS = 'ok',
  UNKNOW_FAIL = '系统繁忙，请稍后重试',
  PARAMS_FAIL = '参数异常',
  TOKEN_EMPTY = '未登录，请重新登录后再试',
  TOKEN_INVALID = '登录信息异常，请重新登录后再试',
}

export enum ENV {
  DEV = 'development',
  TEST = 'test',
  ST = 'staging',
  PROD = 'production'
}

export const APPKEY = 'com.sankuai.experience.sdk.nami'

export const MOCK = 'mock'
