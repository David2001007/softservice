import dotenv from 'dotenv'
import path from 'path'
import bcrypt from 'bcryptjs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function seedAdmin() {
  const { db } = await import('../src/db/index')
  const { users } = await import('../src/db/schema')
  const { eq } = await import('drizzle-orm')
  
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  try {
    await db.insert(users).values({
      codigo: 'ADM-001',
      nome: 'Administrador',
      cpf: '000.000.000-00',
      email: 'admin@admin.com',
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'admin',
      ativo: true,
    })
    console.log('Admin user seeded successfully!')
  } catch (error) {
    console.log('Admin user might exist, updating password...')
    await db.update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.username, 'admin'))
    console.log('Admin password updated successfully!')
  }
  process.exit(0)
}

seedAdmin()
