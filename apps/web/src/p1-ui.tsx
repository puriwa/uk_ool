import { ReactNode, useState } from 'react'
import { Link, Navigate, NavLink, useLocation } from 'react-router-dom'
import { readAppUser } from './auth'

export type IconName = 'arrow' | 'arrowLeft' | 'chart' | 'check' | 'clock' | 'document' | 'info' | 'lock' | 'menu' | 'play' | 'search' | 'shield' | 'spark' | 'upload' | 'user' | 'x'

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
    arrowLeft: <><path d="M20 12H5" /><path d="m11 18-6-6 6-6" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    play: <path d="m9 6 9 6-9 6z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="m12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4z" /><path d="m19 16-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6z" /></>,
    upload: <><path d="M12 16V3M7 8l5-5 5 5" /><path d="M5 14v6h14v-6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    x: <><path d="M6 6l12 12M18 6 6 18" /></>,
  }
  return <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{paths[name]}</svg>
}

function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const user = readAppUser()
  return <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur">
    <div className="container-page flex h-[72px] items-center justify-between">
      <Link className="focus-ring flex items-center gap-2" to="/" onClick={() => setOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white"><Icon name="shield" size={20} /></span><span className="text-[17px] font-extrabold tracking-[-0.04em] text-navy">억울함해결사</span></Link>
      <button aria-expanded={open} aria-label="메뉴 열기" className="focus-ring rounded-lg p-2 text-navy md:hidden" onClick={() => setOpen(!open)}><Icon name={open ? 'x' : 'menu'} /></button>
      <nav aria-label="주요 메뉴" className={`${open ? 'absolute left-0 right-0 top-[72px] flex border-b border-line bg-paper px-5 py-4 shadow-soft' : 'hidden'} flex-col gap-1 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
        <NavLink className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-navy" to="/guide/insurance-dispute">3분 가이드</NavLink>
        <NavLink className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-navy" to="/consult">무료 상담</NavLink>
        <NavLink className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-navy" to="/lawyers">변호사 찾기</NavLink>
        <Link className="focus-ring rounded-lg px-3 py-2 text-sm font-bold text-navy hover:bg-white" to="/app">내 사건</Link>
        {user ? <Link className="focus-ring ml-0 mt-2 inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-bold text-navy md:ml-2 md:mt-0" to={user.role === 'lawyer' ? '/lawyer/dashboard' : '/app'}><span className="flex h-7 w-7 items-center justify-center rounded-full text-sm" style={{ backgroundColor: user.color }}>{user.emoji}</span>{user.name}</Link> : <Link className="button-primary ml-0 mt-2 min-h-10 px-4 text-sm md:ml-2 md:mt-0" to={`/login?next=${encodeURIComponent(location.pathname)}`}>로그인</Link>}
      </nav>
    </div>
  </header>
}

function Footer() {
  return <footer className="mt-20 border-t border-line bg-white"><div className="container-page flex flex-col gap-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-navy">억울함해결사</p><p className="mt-1">사실을 정리하고, 다음 행동을 놓치지 않게</p></div><p className="max-w-md text-xs leading-5">AI와 규칙 기반 일반 정보를 제공하며 법률자문이나 결과를 보장하지 않습니다. 구체적인 판단과 대응 전략은 변호사에게 확인하세요.</p></div></footer>
}

export function Page({ children, noFooter = false }: { children: ReactNode; noFooter?: boolean }) {
  return <div className="min-h-screen bg-paper text-ink"><Header />{children}{!noFooter && <Footer />}</div>
}

export function AppShell({ children }: { children: ReactNode }) {
  return <Page><main className="container-page py-10 sm:py-12">{children}</main></Page>
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  return readAppUser() ? children : <Navigate replace to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} />
}

export function Feature({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return <div className="rounded-2xl border border-line bg-white p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#effaf8] text-teal"><Icon name={icon} size={20} /></span><h3 className="mt-5 font-bold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p></div>
}

export function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-paper p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 font-extrabold text-navy">{value}</p></div>
}

export function AdminRow({ title, status }: { title: string; status: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl bg-paper p-4"><span className="text-sm font-semibold text-navy">{title}</span><span className="shrink-0 text-xs font-bold text-muted">{status}</span></div>
}

export function trackEvent(type: string, detail = '') {
  try {
    const events = JSON.parse(localStorage.getItem('ukool-demo-events') || '[]') as Array<{ type: string; detail: string; at: string }>
    events.push({ type, detail, at: new Date().toISOString() })
    localStorage.setItem('ukool-demo-events', JSON.stringify(events.slice(-200)))
  } catch { /* 분석 목업 실패가 사용자 흐름을 막지 않게 합니다. */ }
}
