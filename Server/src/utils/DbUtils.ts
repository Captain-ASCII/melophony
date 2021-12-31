import { getConnection, SelectQueryBuilder } from 'typeorm'

import Log from '@utils/Log'

import ApiResult from '@api/ApiResult'

function handleError(error: Error): ApiResult {
  Log.e('DB error: ', error)
  return new ApiResult(400, error.message)
}

class JoinCustomizer {
  private link: string
  private alias: string

  constructor(link: string, alias = 'internal') {
    this.link = link
    this.alias = alias
  }

  getLink(): string {
    return this.link
  }

  getAlias(): string {
    return this.alias
  }
}

class WhereCustomizer {
  private condition: string
  private value: any

  constructor(condition: string, value: any) {
    this.condition = condition
    this.value = value
  }

  getCondition(): string {
    return this.condition
  }

  getValue(): any {
    return this.value
  }
}

class SQLCustomizer {

  private joins: Array<JoinCustomizer>
  private wheres: Array<WhereCustomizer>

  constructor(joins: Array<JoinCustomizer> = [], wheres: Array<WhereCustomizer> = []) {
    this.joins = joins
    this.wheres = wheres
  }

  getJoins(): Array<JoinCustomizer> {
    return this.joins
  }

  getWheres(): Array<WhereCustomizer> {
    return this.wheres
  }

  static merge(left: SQLCustomizer, right: SQLCustomizer): SQLCustomizer {
    return new SQLCustomizer([ ...left.getJoins(), ...right.getJoins() ], [ ...left.getWheres(), ...right.getWheres() ])
  }

  static getUserIdCustomizer(userId: number): SQLCustomizer {
    return new SQLCustomizer([], [ new WhereCustomizer('entity.userId = :userId', { userId }) ])
  }

  static getIdCustomizer(id: number): SQLCustomizer {
    return new SQLCustomizer([], [ new WhereCustomizer('entity.id = :id', { id })])
  }

  static fromSearch(search: any): SQLCustomizer {
    const wheres = []
    for (const field in search) {
      wheres.push(new WhereCustomizer(`entity.${field} = :f`, { f: search[field] }))
    }
    return new SQLCustomizer([], wheres)
  }

  static NULL = new SQLCustomizer([], [])
}

export { JoinCustomizer, WhereCustomizer, SQLCustomizer }


export default class DbUtils {

  static async create<T>(entityType: new (...c: any[]) => T, entity: T): Promise<ApiResult> {
    return await getConnection()
      .getRepository(entityType)
      .createQueryBuilder()
      .insert()
      .into(entityType)
      .values([ entity ])
      .execute()
      .then(result => new ApiResult(200, `${entityType.name} created`, result.raw.insertId))
      .catch(error => handleError(error))
  }

  static async readAll<T>(entityType: new (...c: any[]) => T, filter: number | SQLCustomizer): Promise<ApiResult> {
    return DbUtils.findEntities(entityType, DbUtils.getCustomizer(filter, SQLCustomizer.NULL))
    .then(result => new ApiResult(200, 'OK', result))
    .catch(error => handleError(error))
  }

  static async read<T>(entityType: new (...c: any[]) => T, id: number, filter: number | SQLCustomizer): Promise<ApiResult> {
    return DbUtils.findEntities(entityType, DbUtils.getCustomizer(filter, SQLCustomizer.getIdCustomizer(id)))
    .then(result => new ApiResult(200, 'OK', result.length > 0 ? result[0] : undefined))
    .catch(error => handleError(error))
  }

  static async find<T>(entityType: new (...c: any[]) => T, search: any, filter: number | SQLCustomizer): Promise<ApiResult> {
    return DbUtils.findEntities(entityType, DbUtils.getCustomizer(filter, SQLCustomizer.fromSearch(search)))
    .then(result => new ApiResult(200, 'OK', result))
    .catch(error => handleError(error))
  }

  static async update<T>(entityType: new (...c: any[]) => T, id: number, modified: T, filter: number | SQLCustomizer): Promise<ApiResult> {
    return DbUtils.findEntities(entityType, DbUtils.getCustomizer(filter, SQLCustomizer.getIdCustomizer(id))).then(async entities => {
      if (entities.length > 0) {
        for (const entity of entities) {
          const fullEntity = await getConnection().getRepository(entityType).preload(modified)
          if (fullEntity) {
            await getConnection().getRepository(entityType).save(fullEntity)
          }
        }
      }
      return entities.length
    })
    .then(result => new ApiResult(200, `${entityType.name} updated`, result))
  }

  static async delete<T>(entityType: new (...c: any[]) => T, id: number, filter: number | SQLCustomizer): Promise<ApiResult> {
    return DbUtils.findEntities(entityType, DbUtils.getCustomizer(filter, SQLCustomizer.getIdCustomizer(id))).then(async entities => {
      if (entities.length > 0) {
        await getConnection().getRepository(entityType).remove(entities)
      }
      return entities.length
    })
    .then(result => new ApiResult(200, `${entityType.name} deleted`, result))
    .catch(error => handleError(error))
  }

  private static async findEntities<T>(entityType: new (...c: any[]) => T, customizer: SQLCustomizer): Promise<T[]> {
    return DbUtils.customize(
      customizer,
      getConnection()
      .getRepository(entityType)
      .createQueryBuilder('entity')
    )
    .getMany()
  }

  static customize<T>(customizer: SQLCustomizer, builder: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
    for (const join of customizer.getJoins()) {
      builder.leftJoinAndSelect(join.getLink(), join.getAlias())
    }
    for (const where of customizer.getWheres()) {
      builder.andWhere(where.getCondition(), where.getValue())
    }
    return builder
  }

  static getCustomizer(filter: number | SQLCustomizer, idFilter: SQLCustomizer): SQLCustomizer {
    let customizer: SQLCustomizer
    if (typeof filter === 'number') {
      customizer = SQLCustomizer.getUserIdCustomizer(filter)
    } else {
      customizer = filter
    }
    return SQLCustomizer.merge(customizer, idFilter)
  }
}