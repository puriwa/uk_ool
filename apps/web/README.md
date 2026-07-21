# 웹 애플리케이션

이 디렉터리는 `억울함해결사`의 반응형 웹/PWA 프론트엔드를 위한 자리다.

P0의 기술 기준은 `docs/decisions.md`에 확정되어 있다.

- React + TypeScript + Vite
- React Router 기반 클라이언트 라우팅
- Tailwind CSS와 프로젝트 내부 UI 컴포넌트
- Cloudflare Workers 정적 자산 배포 + Worker 서버 API

P1 v2는 Supabase Auth 설정 유무에 따라 관리형 OAuth 또는 더미 로그인으로 동작한다. 개발 서버의 `POST /api/codex-draft`는 저장된 Codex CLI 로그인을 사용해 실제 구조화 사건정리를 반환한다. Cloudflare Worker의 `POST /api/ai-draft`는 운영 API 연결을 위한 별도 최소 경로다.

현재 화면 범위는 홈, 6개 상황별 3분 가이드, 간단 확인, 무료 AI 사건정리, 로그인, 내 사건, 변호사 목록·상세, 변호사 화면, 관리자 통계다.

## 실행

```bash
npm install
npm run dev
```

`npm run dev`에서는 Vite 로컬 미들웨어가 `codex exec`를 호출한다. Codex CLI 로그인이 필요하며 기본 모델은 `gpt-5.6-luna`다. `.env`의 `UKOOL_CODEX_MODEL`로 바꿀 수 있다.

관리형 로그인은 `.env.example`을 참고해 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`를 설정한다. 키가 없으면 색상·이모티콘이 있는 더미 로그인이 자동으로 사용된다.

프로덕션 빌드는 `npm run build`로 확인한다.

## AI 초안 API와 Cloudflare Workers 배포

`src/worker.ts`는 OpenAI 호환 Chat Completions API에 서버 측으로 요청을 전달하고, `wrangler.jsonc`는 Vite 빌드 결과물인 `dist`를 정적 자산으로 배포한다. 입력을 저장하지 않고, 사실 정리·추가 확인사항·변호사에게 물어볼 질문만 구조화해 반환한다. 과실비율·승소 가능성·합의금·형량의 판단과 예측은 프롬프트 및 응답 형식에서 제한한다.

1. PowerShell에서 `Copy-Item .dev.vars.example .dev.vars`로 로컬 비밀값 파일을 만들고 실제 LLM 값으로 바꾼다. `.dev.vars`는 커밋하지 않는다.
2. `npm run build` 후 `npx.cmd wrangler dev`로 프론트와 Worker API를 함께 실행한다. Vite의 `npm run dev`는 정적 화면만 확인할 때 사용한다.
3. Cloudflare Workers Git 연동에서 루트 디렉터리를 지정할 수 있으면 `apps/web`, 빌드 명령을 `npm run build`, 배포 명령을 `npx wrangler deploy`로 설정한다. 초기 연결 화면처럼 루트 디렉터리 입력란이 없으면 빌드 명령은 `cd apps/web && npm ci && npm run build`, 배포 명령은 `cd apps/web && npx wrangler deploy`로 설정한다. Worker 이름은 `ukool`로 설정된 `wrangler.jsonc`의 `name`과 같아야 한다.
4. Worker의 **Settings → Variables and Secrets**에서 Production과 Preview 각각에 `LLM_API_URL`, `LLM_API_KEY`(Encrypt), `LLM_MODEL`을 설정한 뒤 재배포한다.

실제 운영 전에는 로그인 기반 호출 제한, 사용자별 사용량 한도, 봇·비정상 요청 차단, 요청 감사 로그와 삭제 정책을 추가해야 한다. URL을 숨기거나 프론트엔드만으로 API를 보호해서는 안 된다.

## 구현된 P1 v2 화면

- `/`: 분리된 가이드·상담 진입 홈
- `/guide/:topic`: 상황별 설명 3개와 체크리스트
- `/consult`, `/consult/quick`: 상담 방식 비교와 규칙 기반 간단 확인
- `/consult/free`: 로그인 후 로컬 Codex AI 사건정리
- `/login`, `/auth/callback`: Supabase OAuth 또는 더미 로그인
- `/app`: 로그인 후 최근 AI 결과
- `/lawyers`, `/lawyers/:slug`: 엘파인드 공개 출처형 변호사 목록·상세
- `/lawyer/dashboard`: 변호사 역할 목업
- `/admin/dashboard`: 기간별 퍼널·AI 품질·운영 통계

Codex 입력은 로컬 개발 프로세스로 전달되며 사건 결과는 브라우저에만 목업 저장한다. Supabase OAuth를 제외한 사건 서버 저장, 상담 예약·결제, 운영 권한 검증은 다음 단계다.
