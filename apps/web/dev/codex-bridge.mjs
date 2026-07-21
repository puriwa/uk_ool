import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join, resolve } from 'node:path'

const MAX_BODY_BYTES = 22 * 1024 * 1024
const MAX_TEXT_LENGTH = 8_000
const MAX_IMAGES = 3
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function readJson(request) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('요청 용량이 너무 큽니다.'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new Error('요청 형식이 올바르지 않습니다.'))
      }
    })
    request.on('error', reject)
  })
}

function cleanText(value, limit = MAX_TEXT_LENGTH) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : ''
}

function safeModel() {
  const candidate = process.env.UKOOL_CODEX_MODEL || 'gpt-5.6-luna'
  return /^[a-zA-Z0-9._-]+$/.test(candidate) ? candidate : 'gpt-5.6-luna'
}

async function saveImages(attachments, workingDirectory) {
  const paths = []
  for (const [index, attachment] of attachments.slice(0, MAX_IMAGES).entries()) {
    if (!ALLOWED_IMAGE_TYPES.has(attachment?.type) || typeof attachment?.dataUrl !== 'string') continue
    const match = attachment.dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([a-zA-Z0-9+/=]+)$/)
    if (!match) continue
    const fallbackExtension = match[1] === 'image/jpeg' ? '.jpg' : `.${match[1].split('/')[1]}`
    const originalExtension = extname(cleanText(attachment.name, 120)).toLowerCase()
    const extension = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(originalExtension) ? originalExtension : fallbackExtension
    const imagePath = join(workingDirectory, `attachment-${index + 1}${extension}`)
    await writeFile(imagePath, Buffer.from(match[2], 'base64'))
    paths.push(imagePath)
  }
  return paths
}

function buildPrompt(payload) {
  const topic = cleanText(payload.topic, 120)
  const incidentText = cleanText(payload.incidentText)
  const insurerPosition = cleanText(payload.insurerPosition, 3_000)
  const answers = Array.isArray(payload.answers) ? payload.answers.map((item) => cleanText(item, 300)).filter(Boolean).slice(0, 10) : []
  const attachments = Array.isArray(payload.attachments)
    ? payload.attachments.map((item) => ({ name: cleanText(item?.name, 120), type: cleanText(item?.type, 80), size: Number(item?.size) || 0 })).slice(0, 8)
    : []

  return `당신은 대한민국 교통사고 사건 준비를 돕는 AI 정리 도우미입니다.
이 요청에 답만 하고, 저장소 파일을 읽거나 수정하거나 명령을 실행하지 마세요.

역할 경계:
- 사용자가 제공한 진술과 첨부 이미지에서 직접 보이는 내용만 사실 후보로 정리합니다.
- 과실비율, 승소 가능성, 합의금, 형량을 산정·예측·보장하지 않습니다.
- 구체적인 법률 대응 전략을 단정하지 않습니다.
- 이미지에서 불명확한 번호판, 얼굴, 문구를 추측하지 않습니다.
- 영상·PDF 등 직접 확인할 수 없는 첨부는 확인했다고 쓰지 말고, 원본 확인이 필요하다고 uncertainties에 적습니다.
- 일반정보는 출처를 확인하지 않은 개별 법률 판단처럼 표현하지 않습니다.
- 한국어로 짧고 쉬운 문장을 사용합니다.

입력:
- 상담 분기: ${topic || '미선택'}
- 사용자 서술: ${incidentText || '없음'}
- 보험사 의견 또는 제시 내용: ${insurerPosition || '없음'}
- 선택형 답변: ${answers.length ? answers.join(' / ') : '없음'}
- 첨부 파일 정보: ${attachments.length ? JSON.stringify(attachments) : '없음'}

첨부 이미지가 함께 전달되었다면 evidenceFacts의 source에 이미지 파일명을 적으세요. 사용자 서술은 userFacts에만 두고, 이미지나 문서에서 확인되지 않은 내용을 evidenceFacts에 넣지 마세요.
출력 스키마에 맞는 JSON만 반환하세요. notice에는 반드시 'AI가 작성한 참고용 사건 정리이며 법률자문이 아닙니다'라는 취지를 포함하세요.`
}

function runCodex({ prompt, imagePaths, schemaPath, projectRoot }) {
  return new Promise((resolveRun, reject) => {
    const args = ['exec', '--ephemeral', '--sandbox', 'read-only', '--model', safeModel(), '--output-schema', schemaPath]
    for (const imagePath of imagePaths) args.push('--image', imagePath)
    args.push('-')

    const command = process.platform === 'win32' ? 'codex.cmd' : 'codex'
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: process.env,
      shell: process.platform === 'win32',
      windowsHide: true,
    })
    let stdout = ''
    let stderr = ''
    const timeout = setTimeout(() => {
      child.kill()
      reject(new Error('Codex 응답 시간이 120초를 넘었습니다.'))
    }, 120_000)

    child.stdout.on('data', (chunk) => { stdout += chunk.toString() })
    child.stderr.on('data', (chunk) => { stderr += chunk.toString() })
    child.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    child.on('close', (code) => {
      clearTimeout(timeout)
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Codex가 종료 코드 ${code}로 끝났습니다.`))
        return
      }
      try {
        resolveRun(JSON.parse(stdout.trim()))
      } catch {
        reject(new Error('Codex의 구조화 응답을 읽지 못했습니다.'))
      }
    })
    child.stdin.end(prompt)
  })
}

export default function codexBridge() {
  return {
    name: 'ukool-local-codex-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/codex-draft', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'POST 요청만 사용할 수 있습니다.' })
          return
        }

        let workingDirectory
        try {
          const payload = await readJson(request)
          if (!cleanText(payload.incidentText) && !cleanText(payload.insurerPosition)) {
            sendJson(response, 400, { error: '사건 내용이나 보험사 의견을 입력해 주세요.' })
            return
          }
          workingDirectory = await mkdtemp(join(tmpdir(), 'ukool-codex-'))
          const attachments = Array.isArray(payload.attachments) ? payload.attachments : []
          const imagePaths = await saveImages(attachments, workingDirectory)
          const webRoot = resolve(process.cwd())
          const projectRoot = resolve(webRoot, '..', '..')
          const schemaPath = resolve(webRoot, 'codex-output.schema.json')
          const draft = await runCodex({ prompt: buildPrompt(payload), imagePaths, schemaPath, projectRoot })
          sendJson(response, 200, { draft, engine: `Codex CLI · ${safeModel()}`, localOnly: true })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Codex 실행에 실패했습니다.'
          console.error('[ukool-codex-bridge]', message)
          sendJson(response, 502, { error: message })
        } finally {
          if (workingDirectory) await rm(workingDirectory, { recursive: true, force: true }).catch(() => undefined)
        }
      })
    },
  }
}
