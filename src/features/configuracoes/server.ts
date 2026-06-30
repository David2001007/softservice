import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { settings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireTecnicoOrAdmin, requireAdmin } from '@/lib/auth-server'



export const getConfiguracoes = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireTecnicoOrAdmin()

    const allSettings = await db.select().from(settings)
    
    const configMap: Record<string, string> = {}
    allSettings.forEach((row) => {
      configMap[row.key] = row.value
    })
    
    // Valores padrão
    if (configMap['bloquear_atendimento_feriados'] === undefined) {
      configMap['bloquear_atendimento_feriados'] = 'false'
    }
    if (configMap['bloquear_finais_de_semana'] === undefined) {
      configMap['bloquear_finais_de_semana'] = 'false'
    }
    if (configMap['horario_entrada'] === undefined) configMap['horario_entrada'] = ''
    if (configMap['horario_inicio_intervalo'] === undefined) configMap['horario_inicio_intervalo'] = ''
    if (configMap['horario_fim_intervalo'] === undefined) configMap['horario_fim_intervalo'] = ''
    if (configMap['horario_saida'] === undefined) configMap['horario_saida'] = ''
    if (configMap['comportamento_agendamento_retroativo'] === undefined) {
      configMap['comportamento_agendamento_retroativo'] = 'aviso'
    }

    return configMap
  },
)

export const saveConfiguracao = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, data.key))
      .then((res) => res[0])

    if (existing) {
      await db
        .update(settings)
        .set({ value: data.value, updatedAt: new Date() })
        .where(eq(settings.key, data.key))
    } else {
      await db.insert(settings).values({
        key: data.key,
        value: data.value,
      })
    }

    return { success: true }
  })
