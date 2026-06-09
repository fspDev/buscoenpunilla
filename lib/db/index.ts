import type { IDatabase } from './repository'
import { SupabaseDatabase } from './supabase-repository'

let db: IDatabase | null = null

export function getDatabase(): IDatabase {
  if (!db) db = new SupabaseDatabase()
  return db
}

export type { IDatabase }
