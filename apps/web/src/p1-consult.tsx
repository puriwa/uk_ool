import { ChangeEvent, FormEvent, ReactNode, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { readAppUser } from './auth'
import { TopicKey, topicByKey, topics } from './p1-data'
import { AppShell, Icon, Page, Stat, trackEvent } from './p1-ui'

type Attachment = { name: string; type: string; size: number; dataUrl?: string }
export type CodexDraft = {
  userFacts: string[]
  evidenceFacts: Array<{ statement: string; source: string }>
  uncertainties: string[]
  generalInformation: string[]
  nextActions: Array<{ title: string; reason: string; urgency: 'now' | 'soon' | 'later' }>
  questionsForLawyer: string[]
  notice: string
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file) })
}

export function FreeConsult() {
  const [params] = useSearchParams()
  const initial = params.get('topic') as TopicKey
  const [topicKey, setTopicKey] = useState<TopicKey>(topicByKey[initial] ? initial : 'insurance-dispute')
  const [branchAnswer, setBranchAnswer] = useState('')
  const [incidentText, setIncidentText] = useState('')
  const [insurerPosition, setInsurerPosition] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<CodexDraft | null>(null)
  const [engine, setEngine] = useState('')
  const topic = topicByKey[topicKey]

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, 8)
    const next: Attachment[] = []
    let images = 0
    for (const file of files) {
      const item: Attachment = { name: file.name, type: file.type || 'application/octet-stream', size: file.size }
      if (file.type.startsWith('image/') && images < 3 && file.size <= 4 * 1024 * 1024) { item.dataUrl = await fileToDataUrl(file); images += 1 }
      next.push(item)
    }
    setAttachments(next)
    trackEvent('attachment_selected', String(next.length))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true); setError(''); setDraft(null); trackEvent('ai_consult_start', topicKey)
    try {
      const response = await fetch('/api/codex-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: topic.label, answers: branchAnswer ? [branchAnswer] : [], incidentText, insurerPosition, attachments }) })
      const body = await response.json() as { draft?: CodexDraft; error?: string; engine?: string }
      if (!response.ok || !body.draft) throw new Error(body.error || 'AI 사건정리를 만들지 못했습니다.')
      setDraft(body.draft); setEngine(body.engine || 'Codex CLI')
      localStorage.setItem('ukool-last-draft', JSON.stringify({ topic: topic.label, draft: body.draft, createdAt: new Date().toISOString() }))
      trackEvent('ai_consult_complete', topicKey)
      setTimeout(() => document.getElementById('ai-result')?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'AI 사건정리에 실패했습니다.'); trackEvent('ai_consult_error', topicKey) } finally { setLoading(false) }
  }

  return <Page><main className="container-page py-10 sm:py-14"><Link className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-muted" to="/consult"><Icon name="arrowLeft" size={17} /> 상담 방식 다시 선택</Link><div className="mt-7 grid gap-8 lg:grid-cols-[1fr_320px]"><form className="space-y-6" onSubmit={submit}>
    <section className="rounded-2xl border border-[#b9e5df] bg-[#effaf8] p-5 sm:p-6"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-white"><Icon name="spark" /></span><div><p className="text-xs font-bold text-teal">답변 주체: AI (Codex)</p><h1 className="mt-1 text-xl font-extrabold text-navy">AI 답변임을 먼저 확인해 주세요</h1><p className="mt-2 text-sm leading-6 text-muted">AI가 사실과 자료를 정리한 참고용 초안을 만듭니다. 변호사의 법률자문이 아니며 결과를 확정하지 않습니다.</p><label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4 text-sm font-semibold text-navy"><input checked={acknowledged} className="mt-1 h-4 w-4 accent-[#158477]" onChange={(event) => setAcknowledged(event.target.checked)} type="checkbox" />AI 답변의 범위와 한계를 확인했습니다.</label></div></div></section>
    <FormCard step="1" title="상담 영역과 진행 상태"><div className="grid gap-2 sm:grid-cols-2">{topics.map((item) => <button aria-pressed={topicKey === item.key} className={`focus-ring rounded-xl border p-4 text-left text-sm font-semibold ${topicKey === item.key ? 'border-teal bg-[#effaf8] text-navy' : 'border-line text-muted'}`} key={item.key} onClick={() => { setTopicKey(item.key); setBranchAnswer('') }} type="button">{item.emoji} {item.label}</button>)}</div><label className="mt-6 block text-sm font-bold text-navy" htmlFor="branch">{topic.branchQuestion}</label><select className="focus-ring mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-sm" id="branch" onChange={(event) => setBranchAnswer(event.target.value)} value={branchAnswer}><option value="">선택해 주세요</option>{topic.branchOptions.map((option) => <option key={option}>{option}</option>)}</select></FormCard>
    <FormCard step="2" title="사건과 보험사 의견"><label className="block text-sm font-bold text-navy" htmlFor="incident">무슨 일이 있었나요?</label><textarea className="focus-ring mt-2 min-h-44 w-full rounded-xl border border-line p-4 text-sm leading-6 outline-none focus:border-teal" id="incident" maxLength={8000} onChange={(event) => setIncidentText(event.target.value)} placeholder="사고 전후와 지금까지의 대화를 시간순으로 적어주세요." required value={incidentText} /><p className="mt-2 text-right text-xs text-muted">{incidentText.length}/8,000</p><label className="mt-5 block text-sm font-bold text-navy" htmlFor="insurer">보험사 의견·제시 내용 <span className="font-normal text-muted">(선택)</span></label><textarea className="focus-ring mt-2 min-h-28 w-full rounded-xl border border-line p-4 text-sm leading-6 outline-none focus:border-teal" id="insurer" maxLength={3000} onChange={(event) => setInsurerPosition(event.target.value)} placeholder="과실비율, 이유, 받은 문구를 그대로 적어주세요." value={insurerPosition} /></FormCard>
    <FormCard step="3" title="사진·영상·문서"><label className="focus-ring flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-paper px-5 py-8 text-center hover:border-teal" htmlFor="attachments"><Icon name="upload" size={28} /><span className="mt-3 text-sm font-bold text-navy">파일 선택</span><span className="mt-1 text-xs text-muted">사진·영상·PDF, 최대 8개</span><input accept="image/*,video/*,.pdf" className="sr-only" id="attachments" multiple onChange={handleFiles} type="file" /></label>{attachments.length > 0 && <div className="mt-4 space-y-2">{attachments.map((file) => <div className="flex items-center justify-between gap-3 rounded-xl border border-line p-3 text-sm" key={`${file.name}-${file.size}`}><span className="truncate font-semibold text-navy">{file.name}</span><span className="shrink-0 text-xs text-muted">{file.dataUrl ? '사진 내용 전달' : file.type.startsWith('video/') ? '영상 목록만' : '문서 목록만'}</span></div>)}</div>}<p className="mt-4 text-xs leading-5 text-muted">사진 최대 3개는 Codex 이미지 입력으로 전달됩니다. 영상·PDF는 P1에서 파일명·형식만 전달하므로 중요 장면 캡처나 핵심 문구를 글에 추가하세요.</p></FormCard>
    <button className="button-primary w-full gap-2" disabled={!acknowledged || loading || !incidentText.trim()} type="submit">{loading ? 'Codex가 사건을 정리하는 중…' : '무료 AI 사건정리 만들기'} {!loading && <Icon name="spark" size={17} />}</button>
    {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700" role="alert"><strong>실행하지 못했어요.</strong><br />{error}<br /><span className="text-xs">`npm run dev`와 Codex CLI 로그인 상태를 확인하세요.</span></p>}
  </form><aside className="space-y-4 lg:sticky lg:top-24 lg:self-start"><div className="rounded-2xl bg-navy p-6 text-white"><p className="text-xs font-bold tracking-widest text-[#86e1d8]">무료 결과에 포함</p><ul className="mt-5 space-y-3 text-sm text-white/80"><li>✓ 사용자가 말한 사실</li><li>✓ 사진에서 확인된 사실 후보</li><li>✓ 아직 확인할 내용</li><li>✓ 지금 할 일</li><li>✓ 변호사 질문</li></ul></div><p className="card p-5 text-xs leading-5 text-muted"><strong className="text-navy">간단 확인과의 차이</strong><br />선택형 체크리스트가 아니라 내 서술과 자료를 구조화한 결과를 만듭니다.</p></aside></div>{draft && <DraftResult draft={draft} engine={engine} />}</main></Page>
}

function FormCard({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return <section className="card p-6 sm:p-8"><p className="text-xs font-bold text-teal">{step}</p><h2 className="mb-5 mt-2 text-xl font-extrabold text-navy">{title}</h2>{children}</section>
}

function DraftResult({ draft, engine }: { draft: CodexDraft; engine: string }) {
  const labels = { now: '지금', soon: '곧', later: '이후' }
  return <section className="mt-12 scroll-mt-24" id="ai-result"><div className="rounded-3xl border border-teal bg-white p-6 shadow-soft sm:p-9"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="eyebrow">무료 AI 사건정리 결과</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-navy">확인된 것과 확인할 것을 나눴어요</h2><p className="mt-3 text-sm text-muted">{engine} · 로컬 개발 실행</p></div><span className="self-start rounded-full bg-[#effaf8] px-4 py-2 text-xs font-bold text-teal">AI 생성</span></div><div className="mt-8 grid gap-5 lg:grid-cols-2"><ResultList title="사용자가 직접 말한 사실" items={draft.userFacts} tone="blue" /><ResultList title="사진에서 확인된 사실 후보" items={draft.evidenceFacts.map((item) => `${item.statement} · 출처: ${item.source}`)} tone="green" /><ResultList title="아직 확인이 필요한 내용" items={draft.uncertainties} tone="orange" /><ResultList title="일반적으로 알아둘 정보" items={draft.generalInformation} tone="plain" /></div><div className="mt-5 rounded-2xl bg-navy p-6 text-white"><h3 className="font-extrabold">다음 행동</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{draft.nextActions.map((action) => <div className="rounded-xl bg-white/10 p-4" key={`${action.title}-${action.reason}`}><span className="text-xs font-bold text-[#86e1d8]">{labels[action.urgency]}</span><p className="mt-1 font-bold">{action.title}</p><p className="mt-2 text-xs leading-5 text-white/70">{action.reason}</p></div>)}</div></div><ResultList title="변호사에게 물어볼 질문" items={draft.questionsForLawyer} tone="plain" /><p className="mt-6 rounded-xl bg-cream p-5 text-sm leading-6 text-muted"><strong className="text-navy">AI 고지</strong><br />{draft.notice}</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link className="button-primary flex-1 gap-2" to="/lawyers">이력·수행사건 보고 변호사 선택 <Icon name="arrow" size={16} /></Link><Link className="button-secondary flex-1" to="/app">내 사건에서 다시 보기</Link></div></div></section>
}

export function ResultList({ title, items, tone }: { title: string; items: string[]; tone: 'blue' | 'green' | 'orange' | 'plain' }) {
  const colors = tone === 'blue' ? 'border-[#cfe1f3] bg-[#f4f8fd]' : tone === 'green' ? 'border-[#b9e5df] bg-[#effaf8]' : tone === 'orange' ? 'border-[#f2dcb7] bg-cream' : 'border-line bg-white'
  return <section className={`rounded-2xl border p-5 ${colors}`}><h3 className="font-extrabold text-navy">{title}</h3>{items.length ? <ul className="mt-4 space-y-3">{items.map((item, index) => <li className="flex gap-2 text-sm leading-6 text-muted" key={`${item}-${index}`}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />{item}</li>)}</ul> : <p className="mt-4 text-sm text-muted">현재 입력에서 확인된 항목이 없습니다.</p>}</section>
}

export function CustomerDashboard() {
  const user = readAppUser()
  let saved: { topic: string; draft: CodexDraft; createdAt: string } | null = null
  try { saved = JSON.parse(localStorage.getItem('ukool-last-draft') || 'null') } catch { saved = null }
  return <AppShell><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">로그인 후 내 사건</p><h1 className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-navy">{user?.emoji} {user?.name}님의 사건 공간</h1><p className="mt-2 text-sm text-muted">AI 결과와 다음 행동을 이 브라우저에서 확인합니다.</p></div><Link className="button-primary gap-2 self-start" to="/consult/free"><Icon name="spark" size={17} /> 새 AI 사건정리</Link></div><div className="mt-8 grid gap-5 lg:grid-cols-[1fr_310px]"><section className="card p-6 sm:p-8">{saved ? <><span className="rounded-full bg-[#e8f6f4] px-3 py-1 text-xs font-bold text-teal">최근 AI 정리</span><h2 className="mt-4 text-2xl font-extrabold text-navy">{saved.topic}</h2><p className="mt-2 text-xs text-muted">{new Date(saved.createdAt).toLocaleString('ko-KR')} 생성</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><Stat label="사용자 사실" value={`${saved.draft.userFacts.length}개`} /><Stat label="확인 필요" value={`${saved.draft.uncertainties.length}개`} /><Stat label="다음 행동" value={`${saved.draft.nextActions.length}개`} /></div><div className="mt-7"><ResultList title="다음에 확인할 내용" items={saved.draft.uncertainties} tone="orange" /></div></> : <div className="py-10 text-center"><Icon name="document" size={30} /><h2 className="mt-5 text-xl font-extrabold text-navy">아직 저장된 AI 정리가 없어요</h2><p className="mt-2 text-sm text-muted">무료 사건정리를 완료하면 결과가 여기에 표시됩니다.</p><Link className="button-primary mt-6" to="/consult/free">첫 사건정리 시작</Link></div>}</section><aside className="space-y-4"><div className="rounded-2xl bg-navy p-6 text-white"><p className="text-xs font-bold text-[#86e1d8]">내 사건은 로그인 후</p><p className="mt-3 text-lg font-extrabold">접근 경계 적용</p><p className="mt-2 text-xs leading-5 text-white/70">현재 결과 저장은 브라우저 목업입니다. 실제 서버 사건 저장은 아직 연결하지 않았습니다.</p></div><Link className="button-secondary w-full" to="/lawyers">변호사 프로필 비교</Link></aside></div></AppShell>
}
