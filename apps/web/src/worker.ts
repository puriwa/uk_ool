interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  LLM_API_KEY?: string
  LLM_API_URL?: string
  LLM_MODEL?: string
}

type Draft = {
  userFacts: string[]
  needsConfirmation: string[]
  questionsForLawyer: string[]
  notice: string
}

const MAX_INCIDENT_LENGTH = 6000

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

function asTextList(value: unknown, limit: number) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 300)).filter(Boolean).slice(0, limit)
}

function parseDraft(content: string): Draft | null {
  try {
    const data = JSON.parse(content) as Record<string, unknown>
    const userFacts = asTextList(data.userFacts, 6)
    const needsConfirmation = asTextList(data.needsConfirmation, 6)
    const questionsForLawyer = asTextList(data.questionsForLawyer, 5)
    const notice = typeof data.notice === 'string' ? data.notice.trim().slice(0, 240) : ''
    if (!userFacts.length && !needsConfirmation.length && !questionsForLawyer.length) return null
    return { userFacts, needsConfirmation, questionsForLawyer, notice: notice || '이 초안은 사용자가 입력한 내용을 정리한 참고용 정보이며, 법률 판단이나 대응 전략이 아닙니다.' }
  } catch { return null }
}

async function createAiDraft(request: Request, env: Env) {
  if (!env.LLM_API_KEY || !env.LLM_API_URL || !env.LLM_MODEL) return json({ error: 'AI 초안 기능이 아직 설정되지 않았습니다.' }, 503)
  let payload: { incidentText?: unknown }
  try { payload = await request.json() } catch { return json({ error: '요청 형식이 올바르지 않습니다.' }, 400) }
  const incidentText = typeof payload.incidentText === 'string' ? payload.incidentText.trim() : ''
  if (!incidentText || incidentText.length > MAX_INCIDENT_LENGTH) return json({ error: `사건 내용은 1~${MAX_INCIDENT_LENGTH}자로 입력해 주세요.` }, 400)

  const systemPrompt = `당신은 교통사고 사건 준비를 돕는 사실 정리 도우미입니다.
사용자가 제공한 내용만 바탕으로 정리합니다. 과실비율, 승소 가능성, 합의금, 형량을 판단·예측·보장하거나 구체적인 법률 대응 전략을 제시하지 마세요.
사실과 확인이 필요한 내용을 구분하고, 모르는 내용은 추정하지 마세요. 개인정보를 다시 쓰지 말고, 입력에 민감정보가 있으면 '민감정보는 제출 전 가려두세요'라고 안내하세요.
반드시 아래 JSON 객체만 반환하세요. 마크다운이나 코드 블록을 사용하지 마세요.
{"userFacts":["사용자가 직접 말한 사실"],"needsConfirmation":["추가 확인이 필요한 정보"],"questionsForLawyer":["변호사에게 물어볼 중립적인 질문"],"notice":"법률 판단이 아닌 참고용 초안이라는 짧은 고지"}`

  try {
    const upstream = await fetch(env.LLM_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.LLM_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: env.LLM_MODEL, temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: incidentText }] }),
    })
    if (!upstream.ok) { console.error('LLM request failed', upstream.status); return json({ error: 'AI 초안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, 502) }
    const result = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = result.choices?.[0]?.message?.content
    const draft = typeof content === 'string' ? parseDraft(content) : null
    if (!draft) return json({ error: 'AI 응답 형식을 확인하지 못했습니다. 다시 시도해 주세요.' }, 502)
    return json({ draft })
  } catch (error) {
    console.error('AI draft request failed', error instanceof Error ? error.message : 'unknown error')
    return json({ error: 'AI 초안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, 502)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/ai-draft') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
      if (request.method !== 'POST') return json({ error: '허용되지 않은 요청 방식입니다.' }, 405)
      return createAiDraft(request, env)
    }
    return env.ASSETS.fetch(request)
  },
}
