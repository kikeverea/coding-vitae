import { ReactNode } from 'react'

export type Entity = { id: number | string }

export type TableFilter = {
  [column: string]: string | { min?: number | string, max?: number | string, parser?: (value: string) => number }
}

export type TableColumn<T extends Entity> = {
  name: string,
  data: (item: T) => ReactNode
}

export type TableProps<T extends Entity> = {
  collection: T[] | null | undefined
  columns: TableColumn<T>[],
  search?: string,
  filter?: TableFilter,
  sort?: readonly [string, ('asc' | 'desc')?],
  noEntriesMessage?: string
}