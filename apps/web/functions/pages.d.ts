// Cloudflare Pages Functions가 제공하는 실행 컨텍스트의 최소 타입이다.
// 로컬에서 API 파일을 별도로 타입 검사할 때만 사용하며, 런타임 코드는 포함하지 않는다.
type PagesFunction<Env = unknown> = (context: { request: Request; env: Env }) => Response | Promise<Response>
