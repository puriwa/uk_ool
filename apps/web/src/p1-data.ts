export type TopicKey = 'just-happened' | 'insurance-dispute' | 'claim-refused' | 'committee-result' | 'police' | 'settlement'

export type Topic = {
  key: TopicKey
  emoji: string
  label: string
  summary: string
  branchQuestion: string
  branchOptions: string[]
  guide: Array<{ title: string; description: string; points: string[] }>
  checklist: string[]
}

const evidenceStep = { title: '원본 자료를 먼저 모아요', description: '내 설명과 자료에서 직접 확인되는 내용을 구분합니다.', points: ['블랙박스 원본을 편집하지 않고 보관', '도로 구조·신호·차량 위치가 보이는 사진 확보', '통화 날짜·담당자·안내 내용을 시간순으로 기록'] }
const questionStep = { title: '결론 대신 질문을 준비해요', description: '사건마다 달라질 수 있는 부분은 확인할 질문으로 남깁니다.', points: ['상대방 주장과 보험사 설명을 따로 기록', '아직 확보하지 못한 자료 표시', '기한·비용·선택지는 자료를 본 변호사에게 확인'] }

export const topics: Topic[] = [
  {
    key: 'just-happened', emoji: '🚧', label: '방금 사고가 났어요', summary: '현장 안전과 증거 보존부터 확인해요.',
    branchQuestion: '현재 가장 가까운 상태는 무엇인가요?', branchOptions: ['아직 현장에 있어요', '현장을 떠났지만 오늘 사고예요', '다친 사람이 있어요'],
    guide: [{ title: '사람과 현장 안전이 먼저예요', description: '차량보다 사람의 안전을 우선합니다.', points: ['추가 사고가 없도록 안전한 위치 확인', '부상이나 위험이 있으면 119·112에 도움 요청', '현장에서 무리하게 합의를 서두르지 않기'] }, evidenceStep, { title: '첫 연락 내용을 남겨요', description: '나중에도 확인할 수 있게 기록합니다.', points: ['보험 접수번호와 담당자', '경찰 신고 여부와 안내 내용', '통증 발생 시점과 진료 기록'] }],
    checklist: ['블랙박스 원본 보관', '현장 전체·세부 사진 확인', '보험 접수번호 기록', '부상 여부와 긴급조치 확인'],
  },
  {
    key: 'insurance-dispute', emoji: '⚖️', label: '보험사 과실비율이 억울해요', summary: '제시한 숫자와 근거를 나눠 정리해요.',
    branchQuestion: '보험사와 어디까지 이야기했나요?', branchOptions: ['비율만 들었어요', '산정 근거를 요청했어요', '이의를 전달했어요', '상대 보험사와 의견이 달라요'],
    guide: [{ title: '숫자보다 근거부터 확인해요', description: '제시된 비율과 그 근거를 분리해서 적습니다.', points: ['보험사가 제시한 비율과 안내 날짜', '적용했다고 말한 사고 유형·도표·판단 근거', '상대방 주장과 보험사 설명을 각각 구분'] }, evidenceStep, questionStep],
    checklist: ['제시 비율과 날짜 기록', '보험사의 산정 근거 요청', '블랙박스 원본 확보', '변호사에게 확인할 질문 작성'],
  },
  {
    key: 'claim-refused', emoji: '📞', label: '상대방이 접수를 거부해요', summary: '거부한 주체와 필요한 조치를 확인해요.',
    branchQuestion: '어떤 접수가 거부되었나요?', branchOptions: ['대인 접수', '대물 접수', '둘 다', '정확히 모르겠어요'],
    guide: [{ title: '거부 주체와 말을 적어요', description: '상대 개인의 말인지 보험사의 공식 안내인지 구분합니다.', points: ['통화한 사람과 시각', '거부 이유로 들은 내용', '보험 접수번호 존재 여부'] }, { title: '현재 손해와 자료를 정리해요', description: '필요한 진료나 차량 상태 확인을 미루지 않습니다.', points: ['진료·수리 필요 여부', '차량 손상 사진', '내 보험사 문의 내용'] }, questionStep],
    checklist: ['거부한 사람·시간·이유 기록', '접수번호 확인', '진료·차량 손상 자료 보관', '내 보험사 문의 내용 기록'],
  },
  {
    key: 'committee-result', emoji: '📄', label: '분심위 결과가 납득되지 않아요', summary: '결정문과 이후 선택지를 검토할 준비를 해요.',
    branchQuestion: '결과 자료를 어느 정도 가지고 있나요?', branchOptions: ['결과만 들었어요', '결정문이 있어요', '보험사 설명도 받았어요', '이후 절차를 안내받았어요'],
    guide: [{ title: '결론과 이유를 나눠 읽어요', description: '어떤 자료와 사실을 전제로 했는지 확인합니다.', points: ['결정일과 사건 식별 정보', '인정된 사실과 적용된 기준', '제출했지만 언급되지 않은 자료'] }, { title: '기존 제출 자료를 다시 묶어요', description: '실제 심의에 들어간 자료를 확인합니다.', points: ['블랙박스·사진 제출본', '보험사 의견서와 내 이의 내용', '결정 뒤 새로 확보한 자료'] }, questionStep],
    checklist: ['결정문 전체 확보', '심의 제출자료 목록 확인', '새 자료 구분', '이후 절차·기한 질문 정리'],
  },
  {
    key: 'police', emoji: '📝', label: '경찰 조사를 앞두고 있어요', summary: '기억과 자료를 시간순으로 준비해요.',
    branchQuestion: '안내받은 조사 형태는 무엇인가요?', branchOptions: ['전화 연락만 받았어요', '출석 날짜가 정해졌어요', '자료 제출 요청을 받았어요', '정확히 모르겠어요'],
    guide: [{ title: '연락 내용을 확인해요', description: '담당 기관과 요청 내용을 그대로 기록합니다.', points: ['담당 기관·담당자·연락처', '출석 또는 제출 일시', '요청받은 자료와 현재 지위'] }, { title: '기억과 자료를 섞지 않아요', description: '직접 기억하는 것과 영상에서 보이는 것을 구분합니다.', points: ['사고 전후 시간순서', '직접 본 내용과 전해 들은 내용', '블랙박스·사진 원본'] }, questionStep],
    checklist: ['담당자와 일정 기록', '시간순서 메모', '원본 자료 목록 작성', '변호사 질문 준비'],
  },
  {
    key: 'settlement', emoji: '🤝', label: '합의해도 될지 모르겠어요', summary: '합의 전 확인할 사실과 자료를 모아요.',
    branchQuestion: '현재 받은 제안은 어떤 형태인가요?', branchOptions: ['전화로 금액만 들었어요', '문서나 메시지를 받았어요', '치료 중 제안을 받았어요', '구체적 제안은 없어요'],
    guide: [{ title: '제안 내용을 그대로 보관해요', description: '금액과 조건, 효력 범위를 분리해 봅니다.', points: ['제안한 주체와 날짜', '금액 외 포함된 조건', '추가 청구 제한 문구 존재 여부'] }, { title: '현재 자료가 충분한지 확인해요', description: '아직 확정되지 않은 손해를 따로 적습니다.', points: ['진료와 치료 경과', '수리비·휴업 관련 자료', '확정되지 않은 손해 항목'] }, questionStep],
    checklist: ['제안 원문 보관', '금액과 조건 분리 기록', '진료·손해 자료 확인', '서명 전 질문 정리'],
  },
]

export const topicByKey = Object.fromEntries(topics.map((topic) => [topic.key, topic])) as Record<TopicKey, Topic>

export type Lawyer = {
  slug: string
  name: string
  office: string
  primaryFields: string[]
  headline: string
  career: string[]
  education: string[]
  cases: Array<{ title: string; court?: string; year?: string }>
  sourceUrl: string
  collectedAt: string
  color: string
}

export const lawyers: Lawyer[] = [
  {
    slug: '신영준-482', name: '신영준', office: '법무법인 어진', primaryFields: ['금전/손해배상', '민·상사', '기업 자문'], color: '#d9f2ee',
    headline: '대형 로펌 기업법무팀 경력과 민·상사·형사 자문·송무 경험을 공개한 프로필입니다.',
    career: ['법무부장관 표창', '수원시 영통구 교통유발부담금 경감심의위원회 위원', '공무원연금공단 상담변호사', '화성시 법률상담위원·화성시의회 법률고문', '경기도경제과학진흥원·경기도시장상권진흥원 전문위원', '전 법무법인(유한) 대륙아주 국제 및 기업법무팀 변호사', '전 법무법인(유한) 세한 자문팀 변호사'],
    education: ['서울대학교 경영학과', '서울시립대학교 법학전문대학원'],
    cases: [], sourceUrl: 'https://lfind.kr/lawyers/%EC%8B%A0%EC%98%81%EC%A4%80-482', collectedAt: '2026-07-21',
  },
  {
    slug: '함혜란-43106', name: '함혜란', office: '법무법인 정격', primaryFields: ['교통', '형사'], color: '#e5ecff',
    headline: '엘파인드 교통사고 검색 결과에서 교통 분야와 공개 수행사건을 확인한 프로필입니다.',
    career: ['엘파인드 프로필에 전문 표시', '공개 프로필의 주요 수행분야에 교통 표시'], education: [],
    cases: [{ title: '콘크리트 믹서 운전 중 자전거 무단횡단자 사망사고' }],
    sourceUrl: 'https://lfind.kr/lawyers/%ED%95%A8%ED%98%9C%EB%9E%80-43106', collectedAt: '2026-07-21',
  },
  {
    slug: '이기영-129331', name: '이기영', office: '법률사무소 서전', primaryFields: ['금전/손해배상', '금융/보험', '교통'], color: '#fff0d7',
    headline: '손해배상·보험 분야와 교통사고 관련 공개 수행사건을 확인한 프로필입니다.',
    career: ['법무법인 국제 경력 공개', '부산지방변호사회 소속 표시'], education: ['고려대학교 법학과', '부산대학교 법학전문대학원'],
    cases: [{ title: '음주운전 중 교통사고로 운전자에게 상해를 입힌 사건', court: '대구지방법원 경주지원', year: '2023' }],
    sourceUrl: 'https://lfind.kr/lawyers/%EC%9D%B4%EA%B8%B0%EC%98%81-129331', collectedAt: '2026-07-21',
  },
  {
    slug: '이정도-8000', name: '이정도', office: '법무법인 아이엘', primaryFields: ['금전/손해배상', '국가배상', '형사·노동'], color: '#f0e5ff',
    headline: '손해배상·국가배상 관련 공개 이력과 도로 하자 사고 수행사건을 확인한 프로필입니다.',
    career: ['법무법인 아이엘 파트너변호사', '용인시 고문변호사·언론홍보자문위원회 위원', '법무부 서울지방교도소 교정정책자문위원회·정보공개심의위원회 위원'], education: [],
    cases: [{ title: '공주시 도로 하자 오토바이 사망 사고 손해배상', court: '수원지방법원', year: '2025' }],
    sourceUrl: 'https://lfind.kr/lawyers/%EC%9D%B4%EC%A0%95%EB%8F%84-8000', collectedAt: '2026-07-21',
  },
]

export const lawyerSourceNotice = '엘파인드 공개 검색·상세 프로필에서 2026-07-21 수집해 사실형으로 요약했습니다. 엘파인드 또는 해당 변호사와의 제휴·추천을 뜻하지 않으며, 사진·전화번호·주소·홍보 문구는 복제하지 않았습니다. 실제 공개 전 당사자 확인과 최신성 검수가 필요합니다.'
