import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { users, tecnicos, passwordResetCodes } from '@/db/schema'
import { eq, or, and, gt } from 'drizzle-orm'
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './schema'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendMail } from '@/lib/mail'

export const sendResetCode = createServerFn({ method: 'POST' })
  .inputValidator(forgotPasswordSchema)
  .handler(async ({ data }) => {
    const { email } = data

    // Check if user exists in either table
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0])
    const tecnico = await db
      .select()
      .from(tecnicos)
      .where(eq(tecnicos.email, email))
      .then((res) => res[0])

    if (!user && !tecnico) {
      throw new Error('E-mail não encontrado no sistema')
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save to DB
    await db.insert(passwordResetCodes).values({
      email,
      code,
      expiresAt,
    })

    // Send Mail
    await sendMail({
      to: email,
      subject: 'Código de Recuperação de Senha - PulseNet',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
          <h2 style="color: #7D12FF;">Recuperação de Senha</h2>
          <p>Você solicitou a redefinição de senha para sua conta no <strong>PulseNet</strong>.</p>
          <p>Seu código de verificação é:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código expira em 15 minutos.</p>
          <p style="font-size: 12px; color: #777;">Se você não solicitou esta alteração, ignore este e-mail.</p>
        </div>
      `,
    })

    return { success: true }
  })

export const verifyResetCodeAndSetPassword = createServerFn({ method: 'POST' })
  .inputValidator(resetPasswordSchema)
  .handler(async ({ data }) => {
    const { email, code, newPassword } = data

    // Verify code
    const resetEntry = await db
      .select()
      .from(passwordResetCodes)
      .where(
        and(
          eq(passwordResetCodes.email, email),
          eq(passwordResetCodes.code, code),
          eq(passwordResetCodes.used, false),
          gt(passwordResetCodes.expiresAt, new Date()),
        ),
      )
      .then((res) => res[0])

    if (!resetEntry) {
      throw new Error('Código inválido ou expirado')
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10)

    // Update user in appropriate table
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0])
    if (user) {
      await db
        .update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, user.id))
    } else {
      const tecnico = await db
        .select()
        .from(tecnicos)
        .where(eq(tecnicos.email, email))
        .then((res) => res[0])
      if (tecnico) {
        await db
          .update(tecnicos)
          .set({ passwordHash: newHash })
          .where(eq(tecnicos.id, tecnico.id))
      }
    }

    // Mark code as used
    await db
      .update(passwordResetCodes)
      .set({ used: true })
      .where(eq(passwordResetCodes.id, resetEntry.id))

    return { success: true }
  })

export const login = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const { identifier, password } = data

    // 1. Tenta buscar na tabela de users (admin/atendente)
    const user = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)))
      .then((res) => res[0])

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.passwordHash)
      if (passwordMatch) {
        return {
          id: user.id,
          nome: user.nome,
          username: user.username,
          role: user.role,
          type: 'user' as const,
        }
      }
    }

    // 2. Se não encontrou ou senha não bate, tenta na tabela de tecnicos
    const tecnico = await db
      .select()
      .from(tecnicos)
      .where(
        or(eq(tecnicos.email, identifier), eq(tecnicos.username, identifier)),
      )
      .then((res) => res[0])

    if (tecnico) {
      const passwordMatch = await bcrypt.compare(password, tecnico.passwordHash)
      if (passwordMatch) {
        return {
          id: tecnico.id,
          nome: tecnico.nome,
          username: tecnico.username,
          role: 'tecnico',
          type: 'tecnico' as const,
        }
      }
    }

    throw new Error('E-mail/Usuário ou senha inválidos')
  })

export const changePassword = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.number(),
      userType: z.enum(['user', 'tecnico']),
      data: changePasswordSchema,
    }),
  )
  .handler(async ({ data }) => {
    const { userId, userType, data: passwordData } = data

    let currentHash: string | undefined

    if (userType === 'user') {
      const [u] = await db.select().from(users).where(eq(users.id, userId))
      currentHash = u?.passwordHash
    } else {
      const [t] = await db
        .select()
        .from(tecnicos)
        .where(eq(tecnicos.id, userId))
      currentHash = t?.passwordHash
    }

    if (!currentHash) {
      throw new Error('Usuário não encontrado')
    }

    const passwordMatch = await bcrypt.compare(
      passwordData.currentPassword,
      currentHash,
    )
    if (!passwordMatch) {
      throw new Error('Senha atual incorreta')
    }

    const newHash = await bcrypt.hash(passwordData.newPassword, 10)

    if (userType === 'user') {
      await db
        .update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, userId))
    } else {
      await db
        .update(tecnicos)
        .set({ passwordHash: newHash })
        .where(eq(tecnicos.id, userId))
    }

    return { success: true }
  })
