
import { Router, Request, Response } from 'express'

import BaseAspect from '@api/BaseAspect'
import ApiResult from '@api/ApiResult'

async function nothing(): Promise<ApiResult> {
  return new ApiResult(500, 'Not implemented')
}

export default class ApiAspectUtils {
  static associateCRUDOperations<T>(
      aspect: BaseAspect,
      entityEndPoint: string,
      create: ((userId: number, entity: T) => Promise<ApiResult>) | null = nothing,
      read: ((userId: number, id: number) => Promise<ApiResult>) | null = nothing,
      readAll: ((userId: number) => Promise<ApiResult>) | null = nothing,
      find: ((userId: number, searchOptions: any) => Promise<ApiResult>) | null = nothing,
      update: ((userId: number, id: number, entity: T) => Promise<ApiResult>) | null = nothing,
      deleteEntity: ((userId: number, id: number) => Promise<ApiResult>) | null = nothing,
    ): Router {
    const router = aspect.getRouter()

    if (create) {
      router.post(`/${entityEndPoint}`, async (request: Request, response: Response) => {
        aspect.sendResponse(response, await create(request.decoded.userId, request.body))
      })
    }
    if (read) {
      router.get(`/${entityEndPoint}/:id`, async (request: Request, response: Response) => {
        aspect.sendResponse(response, await read(request.decoded.userId, parseInt(request.params.id)))
      })
    }
    if (readAll) {
      router.get(`/${entityEndPoint}s`, async (request: Request, response: Response) => {
        aspect.sendResponse(response, await readAll(request.decoded.userId))
      })
    }
    if (find) {
      router.get(`/search/${entityEndPoint}`, async (request: Request, response: Response) => {
        aspect.sendResponse(response, await find(request.decoded.userId, request.body))
      })
    }
    if (update) {
      router.put(`/${entityEndPoint}/:id`, async (request: Request, response: Response) => {
        aspect.sendResponse(response, await update(request.decoded.userId, parseInt(request.params.id), request.body))
      })
    }
    if (deleteEntity) {
      router.delete(`/${entityEndPoint}/:id`, async (request: Request, response: Response) => {
        aspect.sendResponse(response, await deleteEntity(request.decoded.userId, parseInt(request.params.id)))
      })
    }

    return router
  }
}