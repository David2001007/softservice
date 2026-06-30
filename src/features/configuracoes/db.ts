import { db } from '@/db'
import { settings } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Busca o valor de uma configuração no banco de dados.
 * Retorna o defaultValue caso não seja encontrada.
 */
export async function getSettingValue(key: string, defaultValue: string): Promise<string> {
  try {
    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .then((res) => res[0])
    return row ? row.value : defaultValue
  } catch (error) {
    console.error(`Erro ao buscar configuração '${key}':`, error)
    return defaultValue
  }
}
