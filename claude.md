# 다크 테트라드(Dark Tetrad) 검사 웹앱

## 프로젝트 개요

상담자를 위한 교육용 다크 테트라드 성격 검사 웹 애플리케이션입니다. 사용자가 타당화한 한국어판 검사지를 사용하여, 검사 실시부터 점수 계산, 시각화, AI 기반 해석까지 제공하는 통합 서비스입니다.

### 핵심 특징

- **모바일 우선 설계**: 강의장 환경에서 참가자들이 스마트폰으로 실시
- **규준 기반 T점수**: 타당화 표본(`public/norm-data.csv`) 기준 표준화
- **두 가지 해석 방식**: AI 맞춤 해석(Claude) vs 일반 해석(사전 정의)
- **서버 상태 없음**: DB가 없어 결과는 세션 스토리지에만 남는다(브라우저 닫으면 소멸)

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts (반응형 그래프)
- **State Management**: React Hooks + Session Storage

### Backend
- **API Routes**: Next.js API Routes — `/api/interpret` 하나뿐
- **Database**: 없음 (세션 스토리지만 사용)
- **AI**: Claude API (Anthropic) `claude-sonnet-4-6` — 맞춤 해석용

### Deployment
- **Platform**: Vercel — 프로젝트 `dark-tetrad-test`, repo `goodtele-art/dark`
- **URL**: https://dark-tetrad-test.vercel.app

## 검사 구성

### 문항 구성 (총 23문항)
- **Mach (마키아벨리즘)**: 6문항
- **Narc (나르시시즘)**: 6문항
- **Psyc (사이코패시)**: 6문항
- **Sadi (사디즘)**: 5문항

### 응답 방식
- **척도**: 5점 리커트 척도 (1: 전혀 아니다 ~ 5: 매우 그렇다)
- **표시 방식**: 한 페이지에 6개, 6개, 6개, 5개씩 표시 (총 4페이지)
- **질문 순서**: 각 영역에서 번갈아가면서 출제 (영역 표시 없음)
  - 순서: Mach1 → Narc1 → Psyc1 → Sadi1 → Mach2 → Narc2 → ...

## 프로젝트 구조

```
DARK_TETRAD/
├── app/                           # Next.js App Router
│   ├── page.tsx                   # 랜딩: 검사 시작
│   ├── test/
│   │   ├── page.tsx              # 인구통계 정보 입력 (성별·나이)
│   │   └── questions/page.tsx    # 23문항 검사 (4페이지)
│   ├── information/page.tsx       # 추가 정보 입력 + 해석 방식 선택
│   ├── result/[id]/page.tsx      # 결과 표시
│   └── api/
│       └── interpret/route.ts     # Claude API 호출 (유일한 API 라우트)
├── components/                    # React 컴포넌트
│   ├── ScoreChart.tsx            # Recharts 그래프 (4개 척도)
│   └── InterpretationSection.tsx # 척도별 해석 표시
├── lib/                          # 핵심 로직
│   ├── types.ts                  # TypeScript 타입 정의
│   ├── questions.ts              # 23개 문항 데이터
│   ├── scoring.ts                # T점수, 백분위 계산 (규준 기반)
│   ├── interpretations.ts        # 척도별 기본 해석
│   ├── generalInterpretations.ts # 일반 해석 (나이/성별/T점수 기반)
│   └── claude.ts                 # Claude API 통합
└── public/
    └── norm-data.csv             # 규준 데이터 (사용자 제공, UTF-8)
```

## 주요 기능

### 1. 검사 플로우

#### 1.1 랜딩 페이지 (/)
- "검사 시작하기" 버튼 (단일 진입점)

#### 1.2 인구통계 정보 입력 (/test)
- 성별 선택 (남성/여성)
- 나이 입력
- 모바일 최적화된 큰 터치 영역
- ⚠️ 암호 입력란 없음 — 재조회 기능이 없어 2026-08-08 제거

#### 1.3 검사 진행 (/test/questions)
- **4페이지 구성**:
  - 페이지 1: 문항 1-6
  - 페이지 2: 문항 7-12
  - 페이지 3: 문항 13-18
  - 페이지 4: 문항 19-23
- 각 문항은 1-5 버튼으로 가로 배치
- 응답한 문항은 체크 표시
- 진행률 표시 (응답 완료 개수 / 전체 문항)
- 현재 페이지 모든 문항 응답 필수
- 세션 스토리지에 자동 저장 (페이지 새로고침 대비)

#### 1.4 추가 정보 입력 (/information)
- **안내 문구** (파란색 박스, 맨 위 배치)
- **입력 필드** (모두 선택사항, 상담자 자기이해 5문항):
  - `myPersonality` 내가 생각하는 나의 성격
  - `childhoodEvent` 어린 시절 생각나는 중요한 사건
  - `comfortableClients` 나에게 잘 이해되는 내담자
  - `difficultClients` 나에게 불편한/어려운 내담자
  - `recentStress` 나의 최근 스트레스
- **두 가지 해석 방식 선택**:
  - 🤖 **내 정보로 해석하기** (보라색 버튼)
    - 입력한 정보를 Claude API에 전달
    - AI 기반 맞춤 해석 생성
  - 📊 **일반적인 해석하기** (파란색 버튼)
    - API 호출 없음
    - 나이/성별/T점수에 따른 사전 정의된 해석 제공

#### 1.5 결과 표시 (/result/[id])
- **원점수 요약**: 4개 척도별 점수 (Mach, Narc, Psyc, Sadi)
- **T점수 그래프** (Recharts):
  - 규준 기반 T점수 단일 막대 (앰버)
  - 기준선: T=40 (낮음), T=50 (평균), T=60 (높음)
- **척도별 해석**:
  - T점수, 백분위
  - 기본 해석 (T점수 구간별)
  - 상담자 주의사항
- **AI 맞춤 해석** (선택 시):
  - Claude API 기반 종합 해석
  - 개인 정보와 검사 결과 통합 분석
- **주의사항** (노란색 박스)
- **액션 버튼**:
  - 처음으로 돌아가기
  - 결과 인쇄하기

### 2. T점수 계산 로직

#### 2.1 원점수 계산
```typescript
rawScores = {
  mach: sum(dtmc1 ~ dtmc6),  // 최대 30점
  narc: sum(dtnc1 ~ dtnc6),  // 최대 30점
  psyc: sum(dtps1,2,3,5,6,7), // 최대 30점
  sadi: sum(dtsd1,2,3,5,6)    // 최대 25점
}
```

#### 2.2 규준 기반 T점수
```typescript
// norm-data.csv에서 평균(M), 표준편차(SD) 계산
T = 50 + 10 * (X - M) / SD
```

#### 2.3 백분위 계산
T점수를 Z점수로 바꿔 정규분포 CDF 근사식으로 환산한다(`tScoreToPercentile`).
표본 순위 방식이 아니므로 T점수와 항상 일관된다.

> **누적 데이터 기반 T점수는 없다.** DB가 없어 실시자 누적 통계를 낼 수 없다.
> 2026-08-08 이전 코드에 있던 `calculateCumulativeTScores`는 실제 누적값이 아니라
> 원점수로 만든 시드 변형(`(rawScore*7%5-2)*1.5`)을 규준 T에 더한 **시뮬레이션**이었고,
> 근거 없는 수치를 강의에서 제시하게 되므로 제거했다. 복원하려면 Supabase 연동이 선행돼야 한다.

### 3. 해석 시스템

#### 3.1 일반 해석 (generalInterpretations.ts)
- **T점수 5단계 구간**:
  - T < 30: 매우 낮음
  - 30 ≤ T < 40: 낮음
  - 40 ≤ T ≤ 60: 평균
  - 60 < T ≤ 70: 높음
  - T > 70: 매우 높음
- **맥락적 해석**:
  - 기본 해석
  - 성별 맥락 (남성/여성)
  - 연령대 맥락 (청소년/청년/중년/노년)
- **각 척도별 세부 해석**:
  - 마키아벨리즘: 전략적 사고와 조작 경향
  - 나르시시즘: 자기 과대평가와 인정 욕구
  - 사이코패시: 충동성과 규칙 위반
  - 사디즘: 타인의 고통에서 느끼는 즐거움

#### 3.2 AI 맞춤 해석 (`lib/claude.ts`)
- **모델 `claude-sonnet-4-6`**, Anthropic SDK 대신 **fetch로 직접 호출**(Vercel 환경 이슈로 411e39d에서 전환).
- 문체: 선배 상담자가 쓰는 **따뜻한 편지** — 마크다운 기호 금지, 2인칭("선생님") 사용.
- 입력: T점수·백분위·원점수 + `/information`에서 받은 상담자 자기이해 5문항
  (`myPersonality`, `childhoodEvent`, `comfortableClients`, `difficultClients`, `recentStress`).
- 구성: 전체 프로필(300~400자) → 척도별 4개(각 200~300자) → 상담 관계 시사점 → 자기 성찰. 실제 출력 2,200자 내외.
- ⚠️ **`max_tokens`는 12000**. 한국어는 토큰 소모가 커서 2000에서는 마지막 문단이
  문장 중간에 잘렸다(에러 없이 조용히). 응답의 `stop_reason === "max_tokens"`면 경고 로그를 남긴다.
- ⚠️ `/api/interpret`에 `export const maxDuration = 120` — 분량이 늘어 생성이 길어졌다.

## 데이터베이스 (미구현)

**DB는 연결돼 있지 않다.** Supabase/Postgres 연동, `test_results`/`norm_data` 테이블,
bcrypt 암호 해싱, Zod 검증 모두 없다. 규준 통계는 매 요청 시 클라이언트가
`public/norm-data.csv`를 fetch해 평균·표준편차를 계산한다.

결과는 **세션 스토리지에만** 남고 브라우저를 닫으면 사라진다. 강의에서 참가자 데이터를
모으려면 Supabase 연동이 선행돼야 하며, 그때 비로소 누적 T점수·결과 재조회가 의미를 갖는다.

## 구현 상태

### 작동 중
- 23문항 검사 플로우 전체 (인구통계 → 4페이지 문항 → 추가 정보 → 결과)
- 규준 기반 T점수·백분위 계산 (`lib/scoring.ts`, norm-data.csv)
- 일반 해석 (T점수 5단계 × 성별/연령 맥락)
- **AI 맞춤 해석** — `POST /api/interpret` → `lib/claude.ts` → Anthropic API (fetch 직접 호출)
- Recharts 그래프 (규준 T점수 단일 막대)
- 다크 테마 + 모바일 반응형
- 검사 시작 시 세션 스토리지 초기화
- Vercel 프로덕션 배포

### 없음 (의도적으로 제거했거나 미구현)
- DB 연동 / API 라우트는 `/api/interpret` 하나뿐
- 결과 재조회, 암호, 누적 T점수 — 2026-08-08 제거 (아래 "제거 이력")
- 관리자 대시보드, PWA

### 제거 이력 (2026-08-08)
재활용을 위해 실제로 동작하지 않던 기능을 걷어냈다.
- **결과 재조회** — DB가 없어 `/retrieve` 페이지가 조회할 대상이 없었다. 페이지 삭제 + 랜딩 버튼/안내 문구 제거.
- **암호 설정·확인 입력란** — 재조회 전용이었고 저장조차 되지 않았다. 강의장 진입 마찰만 늘려 삭제.
- **누적 T점수** — 시뮬레이션 값이었다(위 2.3 참조). 그래프 막대·범례·`calculateCumulative*`·타입 필드 모두 제거.
- 결과 페이지의 "조회용 ID" 안내 박스도 함께 제거(URL의 `[id]`는 남아 있으나 어디에도 쓰이지 않는 잔재).

## 모바일 최적화

### UI/UX 가이드라인
- **터치 영역**: 최소 44x44px
- **폰트 크기**: 본문 16px 이상, 제목 20-24px
- **줄 간격**: 1.5-1.6 (가독성)
- **레이아웃**: 단일 컬럼, 카드 기반 디자인
- **폼 입력**: 적절한 inputmode 설정
- **시각적 피드백**: 로딩, 에러, 성공 상태 명확히 표시

### 성능 목표
- **First Contentful Paint**: < 2초 (3G 환경)
- **Time to Interactive**: < 5초
- **번들 크기 최적화**: 트리 쉐이킹, 코드 분할

## 환경 변수

```bash
# .env.local (실제로 쓰이는 건 이 하나뿐)
ANTHROPIC_API_KEY="sk-ant-..."
```

**SSOT는 Vercel 환경변수**(프로젝트 `dark-tetrad-test`). 값을 바꾸면 **재배포해야 반영된다** —
변경만 하고 방치하면 이전 빌드가 계속 옛 키로 응답한다. 빈 커밋 푸시로도 트리거된다.
증상: `/api/interpret`이 500 + `authentication_error: invalid x-api-key`.

## 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 주요 파일 설명

### 1. lib/questions.ts
- 23개 검사 문항 정의
- 각 영역에서 번갈아가면서 출제되도록 순서 섞기
- 5점 리커트 척도 옵션 정의

### 2. lib/scoring.ts
- `calculateRawScores()`: 원점수 계산
- `calculateNormStatistics()`: 규준 데이터 통계 계산
- `calculateNormTScores()`: 규준 기반 T점수
- `calculateNormPercentiles()`: 규준 기반 백분위 (T점수 → 정규분포 CDF)

### 3. lib/interpretations.ts
- T점수 구간별 기본 해석
- 척도별 상담자 주의사항
- 해석 수준 판단 로직

### 4. lib/generalInterpretations.ts
- T점수 5단계 구간 정의
- 나이/성별 조합에 따른 맥락적 해석
- 각 척도별 세부 해석 (Mach, Narc, Psyc, Sadi)

### 5. components/ScoreChart.tsx
- Recharts 기반 바 차트
- 4개 척도 표시
- 규준 T점수 단일 막대
- 기준선 표시 (T=40, 50, 60)

### 6. app/test/questions/page.tsx
- 4페이지 구성 (6, 6, 6, 5문항)
- 진행률 표시
- 세션 스토리지 자동 저장
- 페이지별 응답 완료 확인

### 7. app/information/page.tsx
- 추가 정보 입력 폼
- 두 가지 해석 방식 선택
- interpretationType 세션 저장

## 검증 계획

### 개발 중 검증
1. **T점수 계산 검증**: 샘플 데이터로 수동 계산 vs 코드 결과 비교
2. **AI 해석 완결성**: 응답이 문장 중간에 끊기지 않는지 (`stop_reason` 확인)
3. **Claude API 테스트**: 프롬프트 품질 확인

### 배포 후 검증
1. **전체 플로우 테스트**: 검사 시작 → 결과 확인
2. **점수 정확성**: 수기 계산과 규준 T점수·백분위 대조
3. **모바일 렌더링**: 실제 스마트폰 테스트 (iOS, Android)
4. **AI 해석 품질**: 다양한 점수 프로필로 테스트
5. **성능**: 3G 환경에서 로딩 시간 측정

## 보안 고려사항

- 개인 정보를 서버에 저장하지 않음 (DB 없음 · 세션 스토리지만)
- 환경변수로 API 키 관리
- Rate limiting (API 남용 방지)
- 개인 식별 정보 최소화

## 라이선스

교육용 목적으로 제작되었습니다.

## 참고사항

- 본 검사는 상담 전문가를 위한 교육용 도구입니다.
- 검사 결과는 참고 자료로만 활용해야 합니다.
- 임상적 판단이 필요한 경우 반드시 전문가와 상담이 필요합니다.

---

## 📝 세션 인계 노트

### 2026-08-08 — 재활용 정비 (최신)
"2월 14일 서비스 종료" 공지를 걸어둔 채 방치돼 있던 앱을 **다시 쓰기로 하고** 정비했다.
- 랜딩의 종료 안내 박스 + "건양대학교 대학원 세미나를 위해" 서브타이틀 제거.
- **AI 해석 복구** — 프로덕션 `ANTHROPIC_API_KEY`가 401(invalid)로 죽어 있었다. Vercel에서 키 rotate + 재배포로 해결. (환경변수만 바꾸면 반영 안 됨 — "환경 변수" 절 참조)
- **AI 해석 잘림 수정** — `max_tokens` 2000 → 12000, 분량 상향. ("3.2 AI 맞춤 해석" 참조)
- **재조회·암호·누적 T점수 제거** — "제거 이력" 참조.
- 결과 페이지 "척도별 해석" 제목이 `text-gray-900`(다크 배경에 검정)이라 안 보이던 것 → `text-amber-200`.

### 2026-02-10 — 다크 테마 전면 적용
사용자 제공 팔레트(다크 그레이·브라운·베이지)로 5개 페이지 + 2개 컴포넌트를 재설계했다.
구체적 색상 값은 아래 "다크 테마 색상 팔레트" 참조. 같은 세션에서 검사 시작 시
세션 스토리지 초기화(`app/test/page.tsx`의 `useEffect`)도 추가했다.

### 남은 과제
- **CLAUDE.md 자체가 계획 문서로 출발해 실제와 벌어지기 쉽다.** 기능 제거·추가 시 이 파일을 같이 고칠 것.
- 결과 URL의 `[id]`는 쓰이지 않는 잔재 — 정리하려면 `/information`의 `generateResultId` 경로까지 함께 손봐야 한다.
- 참가자 데이터 수집이 필요해지면 Supabase 연동이 첫 단추(그 뒤에야 누적 T점수·재조회가 성립).

### 주요 코드 참조

#### 세션 스토리지 키
- `testData`: `{ gender: "1" | "2", age: string }`
- `testResponses`: `{ dtmc1: number, dtmc2: number, ..., dtsd6: number }`
- `additionalInfo`: `{ personality: string, growthBackground: string, stressFactors: string, otherInfo: string }`
- `interpretationType`: `"ai" | "general"`

#### T점수 계산 (lib/scoring.ts)
```typescript
// 규준 기반 T점수
T = 50 + 10 * (X - M) / SD

// M, SD는 norm-data.csv에서 계산
// calculateNormStatistics() 참조
```

#### 다크 테마 색상 팔레트
```css
/* 배경 */
bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900

/* 카드 */
bg-gradient-to-br from-stone-800/80 to-neutral-800/80
border border-amber-500/20

/* 텍스트 */
text-stone-300  /* 본문 */
text-amber-300  /* 레이블 */
bg-gradient-to-r from-amber-200 to-stone-200  /* 제목 */

/* 버튼 */
bg-gradient-to-r from-amber-600 to-amber-500  /* 주 액션 */
border-amber-500 bg-stone-900/50  /* 보조 액션 */

/* 입력 */
border-stone-600 bg-stone-900/50 text-stone-200
focus:border-amber-500
```

### 주의사항

1. **CSV 파일 인코딩**: `public/norm-data.csv`는 UTF-8 인코딩 필요
2. **T점수 계산**: 표준편차가 0이면 에러 처리 필요
3. **모바일 테스트**: 실제 디바이스에서 터치 영역 확인
4. **API 타임아웃**: Claude API 응답 시간 고려 (5-10초)
5. **에러 처리**: 모든 API 호출에 try-catch 및 사용자 친화적 에러 메시지
6. **세션 만료**: 장시간 방치 시 세션 스토리지 데이터 유지 여부 확인

### 테스트 데이터

개발 중 테스트를 위한 샘플 응답:
```typescript
// 모든 문항에 3 (보통)으로 응답
const testResponses = {
  dtmc1: 3, dtmc2: 3, dtmc3: 3, dtmc4: 3, dtmc5: 3, dtmc6: 3,
  dtnc1: 3, dtnc2: 3, dtnc3: 3, dtnc4: 3, dtnc5: 3, dtnc6: 3,
  dtps1: 3, dtps2: 3, dtps3: 3, dtps5: 3, dtps6: 3, dtps7: 3,
  dtsd1: 3, dtsd2: 3, dtsd3: 3, dtsd5: 3, dtsd6: 3
};
// 예상 원점수: Mach=18, Narc=18, Psyc=18, Sadi=15
// 예상 T점수: ~50 (평균)
```

### 문제 해결 가이드

#### 문제: 그래프가 표시되지 않음
- Recharts가 서버 사이드 렌더링에서 문제 발생 가능
- `"use client"` 지시어 확인
- 동적 임포트 고려

#### 문제: 세션 스토리지 데이터 손실
- 브라우저 개인정보 보호 모드 확인
- 로컬 스토리지로 변경 고려 (검사 중단 대비)

#### 문제: T점수가 비정상적으로 높거나 낮음
- norm-data.csv 데이터 확인
- 평균/표준편차 계산 로직 검증
- 원점수 계산이 올바른지 확인

#### 문제: 모바일에서 버튼 클릭이 어려움
- 터치 영역 44x44px 이상 확인
- CSS `padding` 증가
- 버튼 간 `gap` 확보

### 연락처 및 리소스

- **Next.js 공식 문서**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Recharts**: https://recharts.org/en-US/
- **Anthropic API**: https://docs.anthropic.com/

---

**마지막 업데이트**: 2026-08-08
**프로덕션**: https://dark-tetrad-test.vercel.app (정상 · AI 해석 포함 전 기능 동작)
**개발 서버**: `npm run dev` (기본 3000, 점유 시 자동 증가)
