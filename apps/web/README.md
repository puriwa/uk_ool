# 웹 애플리케이션

이 디렉터리는 `억울함해결사`의 반응형 웹/PWA 프론트엔드를 위한 자리다.

P0의 기술 기준은 `docs/decisions.md`에 확정되어 있다.

- React + TypeScript + Vite
- React Router 기반 클라이언트 라우팅
- Tailwind CSS와 프로젝트 내부 UI 컴포넌트
- Cloudflare Pages 정적 배포 + Pages Functions 서버 API

인증·파일 업로드는 P0에서 실제 연동하지 않는다. AI 사건 정리는 Cloudflare Pages Functions의 `POST /api/ai-draft`로 연결할 수 있는 최소 경로를 마련했다. 브라우저는 API 키를 받지 않으며, 키는 Cloudflare Secret 또는 로컬 `.dev.vars`에서만 읽는다.

첫 구현 범위(P0-A)는 홈, 사고 입력 마법사, 무료 체크리스트 결과, 로그인 유도까지다. P0-B에서는 사건 대시보드, AI 리포트, 변호사·관리자 화면을 정적 목업으로 추가한다.

## 실행

```bash
npm install
npm run dev
```

프로덕션 빌드는 `npm run build`로 확인한다.

## AI 초안 API와 Cloudflare Pages 배포

`functions/api/ai-draft.ts`는 OpenAI 호환 Chat Completions API에 서버 측으로 요청을 전달한다. 입력을 저장하지 않고, 사실 정리·추가 확인사항·변호사에게 물어볼 질문만 구조화해 반환한다. 과실비율·승소 가능성·합의금·형량의 판단과 예측은 프롬프트 및 응답 형식에서 제한한다.

1. PowerShell에서 `Copy-Item .dev.vars.example .dev.vars`로 로컬 비밀값 파일을 만들고 실제 LLM 값으로 바꾼다. `.dev.vars`는 커밋하지 않는다.
2. `npm run build` 후 `npx.cmd wrangler pages dev dist`로 프론트와 Functions를 함께 실행한다. Vite의 `npm run dev`는 정적 화면만 확인할 때 사용한다.
3. Cloudflare에서 **Workers & Pages → Create application → Pages → Git 저장소 연결**을 선택하고, 루트 디렉터리를 `apps/web`, 빌드 명령을 `npm run build`, 빌드 출력 디렉터리를 `dist`로 설정한다.
4. Pages 프로젝트의 **Settings → Variables and Secrets**에서 Production과 Preview 각각에 `LLM_API_URL`, `LLM_API_KEY`(Encrypt), `LLM_MODEL`을 설정한 뒤 재배포한다.

실제 운영 전에는 로그인 기반 호출 제한, 사용자별 사용량 한도, 봇·비정상 요청 차단, 요청 감사 로그와 삭제 정책을 추가해야 한다. URL을 숨기거나 프론트엔드만으로 API를 보호해서는 안 된다.

## 구현된 화면

- `/`: 상황 선택 홈
- `/guide/insurance-dispute`: 보험사 과실비율 이견 입력 마법사
- `/guide/insurance-dispute/checklist`: 무료 초기 체크리스트와 로그인 유도
- `/login`: 사건 저장을 위한 로그인 유도 목업
- `/app`, `/app/report`: 사건 대시보드와 AI 사건 리포트 목업
- `/lawyers`, `/lawyers/:name`: 변호사 목록·프로필 목업
- `/lawyer/dashboard`, `/admin/dashboard`: 변호사·운영 관리자 골격

입력 데이터는 P0에서 서버로 전송하거나 영구 저장하지 않는다. 로그인 폼, 파일·AI·상담 예약은 다음 단계 연동을 위한 화면 목업이다.
