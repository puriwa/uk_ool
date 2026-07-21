import { createClient, User } from '@supabase/supabase-js'

export type AppRole = 'customer' | 'lawyer'
export type AppUser = { id: string; name: string; role: AppRole; provider: string; emoji: string; color: string; managed: boolean }

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const managedAuthEnabled = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase = managedAuthEnabled ? createClient(supabaseUrl!, supabaseAnonKey!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null

const providers = {
  kakao: { emoji: '🐣', color: '#FEE500' },
  naver: { emoji: '🌿', color: '#03C75A' },
  google: { emoji: '🌈', color: '#EAF1FF' },
  email: { emoji: '🧩', color: '#DDE8F0' },
}

export function readAppUser(): AppUser | null {
  try { return JSON.parse(sessionStorage.getItem('ukool-app-user') || 'null') as AppUser | null } catch { return null }
}

export function saveDemoUser(provider: keyof typeof providers, role: AppRole) {
  const style = providers[provider]
  const user: AppUser = { id: `demo-${provider}`, name: `${provider === 'email' ? '이메일' : provider} 사용자`, role, provider, emoji: style.emoji, color: style.color, managed: false }
  sessionStorage.setItem('ukool-app-user', JSON.stringify(user))
  window.dispatchEvent(new Event('ukool-auth'))
  return user
}

function userFromSupabase(user: User, role: AppRole): AppUser {
  const provider = (user.app_metadata.provider || 'email') as keyof typeof providers
  const style = providers[provider] || providers.email
  return { id: user.id, name: user.user_metadata.full_name || user.user_metadata.name || user.email || '사용자', role, provider, emoji: style.emoji, color: style.color, managed: true }
}

export async function startManagedSocialLogin(provider: 'google' | 'kakao', role: AppRole, next: string) {
  if (!supabase) return false
  sessionStorage.setItem('ukool-auth-role', role)
  sessionStorage.setItem('ukool-auth-next', next)
  const redirectTo = `${window.location.origin}/auth/callback`
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
  if (error) throw error
  return true
}

export async function completeManagedLogin() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session?.user) return null
  const role = (sessionStorage.getItem('ukool-auth-role') || 'customer') as AppRole
  const appUser = userFromSupabase(data.session.user, role)
  sessionStorage.setItem('ukool-app-user', JSON.stringify(appUser))
  return appUser
}

export async function signOut() {
  sessionStorage.removeItem('ukool-app-user')
  if (supabase) await supabase.auth.signOut()
  window.dispatchEvent(new Event('ukool-auth'))
}
