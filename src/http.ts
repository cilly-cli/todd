import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Global } from './global'
import { yellow } from './presentation'

export class HttpException extends Error {
  constructor(method: string | undefined, code: number, data: any) {
    super(`${method} ${code}: ${JSON.stringify(data)}`)
  }
}

const throwOnError = async <T>(
  method: (...args: any[]) => Promise<AxiosResponse<T>>,
  ...args: any[]
): Promise<T> => {
  const response = await method(...args)

  if (response.status > 300) {
    throw new HttpException(response.config.method, response.status, response.data)
  }

  return response.data
}

const request = async <T>(method: string, fnc: any, url: string, ...args: any[]): Promise<T> => {
  if (Global.verbose) {
    console.log(`${yellow.bold('HTTP:')} ${method} ${url}`)
  }

  if (Global.dryRun) {
    return {} as T
  }

  return throwOnError(fnc, url, ...args)
}

const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => request('GET', axios.get, url, config)
const head = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => request('HEAD', axios.head, url, config)
const _delete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => request('DELETE', axios.delete, url, config)
const options = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => request('OPTIONS', axios.options, url, config)

const post = async <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> => request('POST', axios.post, url, data, config)
const put = async <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> => request('PUT', axios.put, url, data, config)
const patch = async <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> => request('PATCH', axios.patch, url, data, config)

export const http = {
  get,
  delete: _delete,
  options,
  head,
  post,
  put,
  patch
}