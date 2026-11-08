import { createClient } from '@supabase/supabase-js'

// banco próprio do my.squircl.es, dentro do "i m b i g o" (schema meu_umbig_ooo)
// a sessão é a da porta (le@umbii.boo), guardada pelo porta.js
export const banco = createClient(
  'https://gqeipjiidtrcbmnrnknc.supabase.co',
  'sb_publishable_5PMV1M5XkgU6xzdnwCcWgQ_xy-9fLLV',
  { auth: { persistSession: true, autoRefreshToken: true }, db: { schema: 'meu_umbig_ooo' } }
)
export const BUCKET = 'meu-umbig-ooo'

// o nome de quem entrou (o que a pessoa escreveu ao criar a conta)
export async function quemSou() {
  const { data } = await banco.auth.getSession()
  const u = data?.session?.user
  if (!u) return ''
  const m = u.user_metadata || {}
  return (m.nome || m.full_name || m.name || String(u.email || '').split('@')[0]).trim()
}

// o nome em duas partes, como no modelo: "primeiro" em cima e o SOBRENOME embaixo
export function partesDoNome(nome) {
  const w = String(nome || '').split(/\s+/).filter(x => x && !/^(doutora|doutor|dra?|sra?|srta)\.?$/i.test(x))
  return [w[0] || '', w.slice(1).join(' ')]
}

export async function carregar() {
  const { data, error } = await banco.from('estado').select('dados').maybeSingle()
  if (error) throw error
  return data ? data.dados : null
}

export async function salvar(dados) {
  const { data: s } = await banco.auth.getSession()
  const id = s?.session?.user?.id
  if (!id) return
  const { error } = await banco.from('estado').upsert({ owner_id: id, dados, updated_at: new Date().toISOString() })
  if (error) throw error
}
