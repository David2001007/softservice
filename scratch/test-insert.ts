import { config } from 'dotenv'
config({ path: ['.env.local', '.env'] })

import { db } from '../src/db/index.ts'
import { users } from '../src/db/schema.ts'
import bcrypt from 'bcryptjs'

async function main() {
  try {
    const data = {
      nome: 'fabricio',
      cpf: '04389317008',
      email: 'uniteos.atendimento@gmail.com',
      username: 'fabricio',
      password: 'password123',
      role: 'admin' as const,
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const [novo] = await db
      .insert(users)
      .values({
        codigo: `ATD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        username: data.username,
        passwordHash: hashedPassword,
        role: data.role,
        ativo: true,
      })
      .returning()
    
    console.log('Success:', novo)
  } catch (err) {
    console.error('DB Error:', err)
  }
  process.exit(0)
}

main()
