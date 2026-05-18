# 회고 앱 PRD (Product Requirements Document)

> **버전**: 1.0 (MVP - 로컬 저장소 기반)
> **작성일**: 2026-05-18
> **개발 환경**: Claude Code 기반 개발

---

## 1. 프로젝트 개요

### 1.1 제품 정의
프로젝트 회고와 개인 회고를 다양한 방법론(KPT, 4L, 5Whys, Start/Stop/Continue)으로 진행하고, 팀원들과 함께 화이트보드 방식으로 공유할 수 있는 PWA(Progressive Web App).

### 1.2 핵심 가치
- **다양한 회고 방법론 제공**: 상황에 맞는 회고 프레임워크 선택
- **개인/팀 회고 모두 지원**: 혼자서도, 팀과 함께도 가능
- **타임박싱**: 타이머를 통한 효율적인 회고 진행
- **로그인 없이 즉시 사용**: 브라우저에 데이터 저장, 진입 장벽 최소화
- **웹/모바일 통합**: PWA로 어디서나 동일한 경험

### 1.3 타겟 사용자
- 개인 프로젝트/업무를 회고하고 싶은 직장인, 학생
- 스프린트/프로젝트 회고가 필요한 소규모 팀
- 회고 진행자(퍼실리테이터)

### 1.4 비범위 (Out of Scope) - MVP에서 제외
- 사용자 로그인/회원가입
- 실시간 협업 (Supabase 연동 후 구현 예정)
- 서버 데이터 저장 (추후 Supabase 연동)
- 푸시 알림
- 음성 알림

---

## 2. 기술 스택

### 2.1 프론트엔드
| 항목 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | **Next.js 15** (App Router) | React 19 기반 |
| 언어 | **TypeScript** | 타입 안정성 |
| 스타일링 | **Tailwind CSS** | 유틸리티 기반 |
| UI 라이브러리 | **shadcn/ui** | 컴포넌트 라이브러리 |
| 애니메이션 | **Framer Motion** | 마이크로 인터랙션 |
| 상태 관리 | **Zustand** | 가벼운 상태 관리 |
| 폼 관리 | **React Hook Form + Zod** | 유효성 검증 |
| 아이콘 | **Lucide React** | shadcn/ui 기본 아이콘 |
| 날짜 처리 | **date-fns** | 가벼운 날짜 라이브러리 |
| PDF 내보내기 | **jsPDF + html2canvas** | 클라이언트 PDF 생성 |
| 드래그 앤 드롭 | **dnd-kit** | 포스트잇 이동용 |

### 2.2 PWA 설정
- `next-pwa` 패키지 활용
- Service Worker로 오프라인 지원
- Web App Manifest로 홈 화면 설치 지원
- 아이콘 세트 (192x192, 512x512, maskable)

### 2.3 로컬 데이터 저장
- **IndexedDB** (via Dexie.js) 사용
  - **이유**: localStorage는 5MB 제한, 동기적 API라 데이터 많아지면 느림
  - IndexedDB는 수백 MB까지 저장 가능, 비동기 API로 성능 우수
  - Dexie.js로 쉬운 API 제공
- JSON 가져오기/내보내기로 백업 및 데이터 이전 지원

### 2.4 추후 마이그레이션 준비
- 데이터 레이어를 **Repository 패턴**으로 추상화
- `LocalRepository`(현재) → `SupabaseRepository`(추후) 전환만으로 백엔드 교체 가능
- 모든 데이터 모델에 `id`, `createdAt`, `updatedAt` 필드 포함 (Supabase 호환)

---

## 3. 기능 요구사항

### 3.1 메인 메뉴 (홈 화면)

#### 화면 구성
- **헤더**: 앱 로고, 다크모드 토글, 설정 아이콘
- **메인 영역** (Bento Grid):
  - 큰 카드: "새 회고 시작하기" (메인 CTA)
  - 중간 카드: "나의 회고 보기"
  - 작은 카드: 최근 회고 3개 미리보기
  - 작은 카드: 통계 (총 회고 수, 이번 달 회고 수)

### 3.2 회고 등록 (1단계)

#### 입력 항목
| 필드 | 필수 여부 | 형식 |
|------|----------|------|
| 회고 제목 | 필수 | 텍스트 (최대 100자) |
| 회고 유형 | 필수 | 개인 회고 / 팀 회고 |
| 회고 방법론 | 필수 | KPT / 4L / 5Whys / Start-Stop-Continue |
| 회고 일자 | 필수 | 날짜 선택 (기본: 오늘) |

#### 회고 유형별 추가 항목
**팀 회고 선택 시:**
- 팀명 (선택)
- 참여자 닉네임 (여러 명, 태그 형식)
- 프로젝트 타임라인:
  - 시작일 (필수)
  - 종료일 (필수)
  - 주요 마일스톤 (여러 개 추가 가능)
    - 마일스톤 명
    - 날짜
    - 설명 (선택)

#### 아코디언 섹션 (모두 선택 입력)
1. **배경** (Context): 어떤 상황에서 이 회고를 하는지
2. **목표** (Goal): 이 회고로 얻고자 하는 것
3. **분석** (Analysis): 사전 분석/데이터
4. **마무리** (Closing): 마무리 메모 (회고 종료 후 작성 가능)

**기본 동작**: 모든 아코디언은 접힌 상태로 표시, 클릭 시 펼침
**저장 동작**: 자동 저장 (500ms 디바운스)

#### 액션 버튼
- **임시 저장**: 작성 중인 내용을 저장하고 홈으로
- **회고하기 시작**: 회고 진행 대시보드로 이동

### 3.3 회고 진행 대시보드 (2단계)

#### 공통 영역 (상단)
- **프로젝트 개요 패널** (접을 수 있음):
  - 회고 제목, 방법론 뱃지
  - 팀 회고인 경우: 타임라인 시각화 (간단한 가로 막대 + 마일스톤 점)
  - 배경/목표/분석 미리보기
- **타이머**:
  - 시간 설정 (5분/10분/15분/30분/사용자 지정)
  - 시작/일시정지/리셋 버튼
  - 큰 디지털 시계 표시
  - 종료 시 화면 중앙 팝업 알림 + 진동 (모바일)

#### 개인 회고 - 작성 영역
방법론에 따라 다른 입력 영역 표시:

**KPT**:
- Keep (잘하고 있는 것) - 초록색 영역
- Problem (문제점) - 빨간색 영역
- Try (시도해볼 것) - 파란색 영역

**4L**:
- Liked (좋았던 것)
- Learned (배운 것)
- Lacked (부족했던 것)
- Longed for (바랐던 것)

**5Whys**:
- 문제 정의 (큰 텍스트 영역)
- Why 1 → Why 2 → Why 3 → Why 4 → Why 5 (순차 입력)
- 근본 원인 / 해결 방안

**Start/Stop/Continue**:
- Start (시작할 것)
- Stop (중단할 것)
- Continue (계속할 것)

각 영역은 다중 항목 입력 가능 (Enter로 항목 추가)

#### 팀 회고 - 화이트보드 영역
- **포스트잇 화이트보드**:
  - 방법론별 카테고리 영역 구분 (KPT라면 Keep/Problem/Try 영역)
  - "+ 포스트잇 추가" 버튼
  - 포스트잇 작성 시:
    - 작성자 닉네임 선택 (등록된 참여자 중)
    - 내용 입력
    - 색상 선택 (노랑/분홍/하늘/초록 등 4-5색)
  - 드래그로 포스트잇 위치 이동 가능
  - 포스트잇 클릭 → 수정/삭제
- **포스트잇 디자인**:
  - 약간 회전된 각도 (자연스러운 느낌)
  - 그림자 효과
  - 호버 시 살짝 확대

#### 액션 버튼
- **저장 후 종료**: 회고 저장 후 홈으로
- **회고 보기로 이동**: 저장 후 상세 보기 페이지로

### 3.4 나의 회고 보기

#### 화면 구성
- **상단 컨트롤**:
  - 검색바 (제목 검색)
  - 필터: 전체 / 개인 / 팀
  - 필터: 방법론별 (KPT, 4L, 5Whys, Start/Stop/Continue)
  - 정렬: 최신순 / 오래된순
- **카드 그리드** (반응형):
  - 데스크탑: 3-4열
  - 태블릿: 2열
  - 모바일: 1열
- **각 카드 구성**:
  - 상단: 방법론 뱃지 + 개인/팀 아이콘
  - 제목 (크게)
  - 작성일
  - 본문 미리보기 (2-3줄, ...로 잘림)
  - 하단: 수정/삭제/PDF 다운로드 아이콘

#### 빈 상태
- 회고가 없을 때 일러스트와 함께 "첫 회고를 시작해보세요" CTA

### 3.5 회고 상세 보기

#### 화면 구성
- 회고 제목, 방법론 뱃지, 작성일
- 프로젝트 개요 (배경/목표/분석)
- 회고 본문 (방법론별 포맷팅)
- 팀 회고인 경우: 포스트잇 보드 (읽기 전용, 드래그 불가)
- 마무리 메모 (인라인 편집 가능)
- 액션 버튼: 수정 / 삭제 / PDF 다운로드

### 3.6 회고 수정
- 등록 화면과 동일한 UI, 기존 데이터로 채워진 상태
- 회고 진행 대시보드의 작성 내용도 수정 가능

### 3.7 회고 삭제
- 카드의 삭제 아이콘 클릭 또는 상세 보기의 삭제 버튼
- 확인 다이얼로그: "정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- 삭제 후 토스트 알림

### 3.8 PDF 내보내기
- 회고 1건 단위로 내보내기
- 포함 내용:
  - 회고 제목, 방법론, 작성일
  - 프로젝트 개요 전체
  - 회고 본문 (방법론별 포맷팅)
  - 팀 회고 시 포스트잇 내용 (텍스트 리스트로 변환)
- 파일명: `[회고제목]_[YYYYMMDD].pdf`

### 3.9 설정 화면
- **다크모드 토글**: 라이트 / 다크 / 시스템 자동
- **데이터 관리**:
  - **JSON 내보내기**: 전체 회고 데이터를 .json 파일로 다운로드
  - **JSON 가져오기**: .json 파일 업로드하여 데이터 복원 (덮어쓰기 또는 병합 선택)
  - **전체 데이터 삭제**: 확인 후 모든 로컬 데이터 삭제
- **앱 정보**: 버전, 라이센스

---

## 4. 데이터 모델

### 4.1 Retrospective (회고)
```typescript
interface Retrospective {
  id: string;                    // UUID
  title: string;                 // 회고 제목
  type: 'personal' | 'team';     // 회고 유형
  method: 'KPT' | '4L' | '5Whys' | 'StartStopContinue';
  retroDate: string;             // 회고 일자 (ISO)

  // 프로젝트 개요 (선택)
  context?: string;              // 배경
  goal?: string;                 // 목표
  analysis?: string;             // 분석
  closing?: string;              // 마무리

  // 팀 회고 전용
  teamInfo?: TeamInfo;

  // 회고 본문
  content: KPTContent | FourLContent | FiveWhysContent | SSCContent;

  // 팀 회고 - 포스트잇
  stickyNotes?: StickyNote[];

  // 타이머 설정
  timerDurationMinutes?: number;

  createdAt: string;             // ISO
  updatedAt: string;             // ISO
}
```

### 4.2 TeamInfo (팀 정보)
```typescript
interface TeamInfo {
  teamName?: string;
  participants: string[];        // 닉네임 배열
  timeline: {
    startDate: string;
    endDate: string;
    milestones: Milestone[];
  };
}

interface Milestone {
  id: string;
  name: string;
  date: string;
  description?: string;
}
```

### 4.3 방법론별 콘텐츠
```typescript
interface KPTContent {
  keep: string[];
  problem: string[];
  try: string[];
}

interface FourLContent {
  liked: string[];
  learned: string[];
  lacked: string[];
  longedFor: string[];
}

interface FiveWhysContent {
  problem: string;
  whys: string[];                // 최대 5개
  rootCause?: string;
  solution?: string;
}

interface SSCContent {
  start: string[];
  stop: string[];
  continueItems: string[];
}
```

### 4.4 StickyNote (포스트잇)
```typescript
interface StickyNote {
  id: string;
  category: string;              // 'keep' | 'problem' | 'try' 등 방법론별
  author: string;                // 작성자 닉네임
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'purple';
  position: { x: number; y: number };
  createdAt: string;
}
```

### 4.5 Settings (설정)
```typescript
interface Settings {
  theme: 'light' | 'dark' | 'system';
  defaultTimerMinutes: number;   // 기본 타이머 시간
  lastBackupAt?: string;
}
```

---

## 5. 화면 흐름도

```
[홈 화면]
   │
   ├──> [새 회고 시작] ──> [회고 등록] ──> [회고 진행 대시보드] ──> [회고 상세 보기]
   │                          │                                          │
   │                          └─> [임시저장 → 홈]                       │
   │                                                                     │
   ├──> [나의 회고 보기] ──> [회고 상세 보기] ──> [수정/삭제/PDF다운로드]
   │
   └──> [설정] ──> [데이터 가져오기/내보내기]
```

---

## 6. UI/UX 가이드라인

### 6.1 디자인 컨셉
**"미니멀 클린 + 2026 트렌드"**

### 6.2 컬러 팔레트
- **라이트 모드**:
  - 배경: `#FAFAFA`
  - 카드: `#FFFFFF`
  - 텍스트: `#0A0A0A`
  - 액센트: `#6366F1` (인디고)
- **다크 모드**:
  - 배경: `#0A0A0A`
  - 카드: `#171717`
  - 텍스트: `#FAFAFA`
  - 액센트: `#818CF8` (라이트 인디고)
- **방법론별 컬러**:
  - KPT: 초록/빨강/파랑
  - 4L: 보라/파랑/주황/분홍
  - 5Whys: 그라데이션
  - Start/Stop/Continue: 초록/빨강/노랑

### 6.3 타이포그래피
- **폰트**: Pretendard (한국어 최적화) + Inter (영문)
- **사이즈**:
  - H1: 32px (모바일) / 48px (데스크탑)
  - H2: 24px / 32px
  - Body: 16px
  - Small: 14px
- **여백**: 넉넉하게 (Tailwind p-6, p-8 적극 활용)

### 6.4 2026 트렌드 반영
- **Bento Grid 레이아웃**: 홈 화면, 회고 보기
- **Glassmorphism**: 모달, 포스트잇 (backdrop-blur)
- **부드러운 그라데이션**: 액센트 색상 (제한적 사용)
- **마이크로 인터랙션**: Framer Motion으로 부드러운 전환
- **다크 모드 우선 설계**: 라이트도 깔끔하지만 다크가 메인
- **큰 라운드 코너**: rounded-2xl, rounded-3xl
- **소프트 섀도우**: shadow-lg/shadow-xl (다크 모드에서는 글로우 효과)

### 6.5 반응형
- **모바일 우선** (Mobile First)
- 브레이크포인트: sm(640) / md(768) / lg(1024) / xl(1280)
- 터치 친화적: 버튼 최소 44px 높이

### 6.6 접근성
- 모든 인터랙티브 요소에 키보드 포커스
- 적절한 컬러 대비 (WCAG AA 이상)
- 스크린 리더 지원 (aria-label)

---

## 7. 프로젝트 구조

```
retrospective-app/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # PWA 아이콘들
│   └── ...
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # 홈 화면
│   │   ├── retro/
│   │   │   ├── new/page.tsx    # 회고 등록
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx    # 회고 상세
│   │   │   │   ├── edit/page.tsx
│   │   │   │   └── session/page.tsx  # 회고 진행 대시보드
│   │   ├── list/page.tsx       # 나의 회고 보기
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── retro/              # 회고 관련 컴포넌트
│   │   │   ├── methods/        # 방법론별 작성 컴포넌트
│   │   │   ├── StickyBoard.tsx
│   │   │   ├── Timer.tsx
│   │   │   └── ...
│   │   └── common/
│   ├── lib/
│   │   ├── db/                 # IndexedDB (Dexie)
│   │   │   ├── schema.ts
│   │   │   └── index.ts
│   │   ├── repositories/       # Repository 패턴
│   │   │   ├── interface.ts
│   │   │   ├── local.ts        # 현재
│   │   │   └── supabase.ts     # 추후
│   │   ├── pdf/                # PDF 생성
│   │   └── utils/
│   ├── stores/                 # Zustand 스토어
│   │   ├── retroStore.ts
│   │   └── settingsStore.ts
│   ├── types/                  # TypeScript 타입 정의
│   └── styles/
│       └── globals.css
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 8. 개발 단계 (마일스톤)

### Phase 1: 프로젝트 셋업 (1일)
- [ ] Next.js 15 + TypeScript 프로젝트 생성
- [ ] Tailwind CSS + shadcn/ui 설치
- [ ] PWA 설정 (manifest, service worker)
- [ ] 다크모드 설정 (next-themes)
- [ ] 폴더 구조 셋업

### Phase 2: 데이터 레이어 (1일)
- [ ] IndexedDB 스키마 정의 (Dexie)
- [ ] Repository 인터페이스 정의
- [ ] LocalRepository 구현 (CRUD)
- [ ] Zustand 스토어 셋업

### Phase 3: 핵심 UI - 등록 (2일)
- [ ] 홈 화면 (Bento Grid)
- [ ] 회고 등록 페이지 (아코디언 + 방법론 선택)
- [ ] 팀 회고 - 타임라인 입력
- [ ] 자동 저장 로직

### Phase 4: 회고 진행 대시보드 (3일)
- [ ] 프로젝트 개요 패널
- [ ] 타이머 컴포넌트 (시작/일시정지/리셋/알림)
- [ ] 개인 회고 - 방법론별 입력 컴포넌트 (4종)
- [ ] 팀 회고 - 포스트잇 화이트보드 (dnd-kit)

### Phase 5: 회고 보기 (2일)
- [ ] 회고 목록 (카드 그리드 + 검색/필터)
- [ ] 회고 상세 보기
- [ ] 수정/삭제 기능

### Phase 6: 부가 기능 (1일)
- [ ] PDF 내보내기 (jsPDF)
- [ ] JSON 가져오기/내보내기
- [ ] 설정 화면

### Phase 7: 마무리 (1일)
- [ ] 반응형 최적화
- [ ] 빈 상태/에러 핸들링
- [ ] 마이크로 인터랙션 (Framer Motion)
- [ ] PWA 설치 테스트

**총 예상 기간**: 약 11일 (개인 개발 기준)

---

## 9. 향후 확장 (Phase 2 - Supabase 연동 이후)

- 사용자 인증 (이메일/소셜 로그인)
- 실시간 협업 (팀 회고 동시 편집)
- 회고 공유 링크
- 팀 워크스페이스
- AI 회고 요약 (Claude API)
- 회고 통계 대시보드 (월별/방법론별)
- 회고 템플릿 저장/불러오기

---

## 10. 성공 지표 (KPI)

### MVP 단계
- 회고 1건 작성 완료까지 평균 소요 시간: 10분 이내
- PWA 설치 후 재방문율: 50% 이상
- 회고 작성 → 저장 성공률: 99% 이상
- 페이지 로드 속도 (LCP): 2.5초 이내

---

## 11. 리스크 및 대응

| 리스크 | 영향도 | 대응 방안 |
|--------|-------|----------|
| 브라우저 데이터 손실 | 높음 | JSON 백업 기능 + 가입 유도 메시지 |
| IndexedDB 용량 초과 | 낮음 | 수백 MB까지 가능, 모니터링 |
| PWA 미지원 브라우저 | 중간 | 일반 웹앱으로도 동작 보장 |
| 다양한 회고 방법론 복잡도 | 중간 | 컴포넌트 분리, 인터페이스 통일 |

---

## 부록 A: Claude Code에 전달할 추가 컨텍스트

### 개발 시 주의사항
1. **모든 데이터 액세스는 Repository 패턴을 통해서만 수행**할 것. 직접 IndexedDB 호출 금지.
2. **데이터 모델에 변경이 생기면 Supabase 마이그레이션 SQL도 함께 작성**할 것 (주석으로).
3. **모바일 우선 반응형 디자인**. 데스크탑은 모바일 확장으로 간주.
4. **자동 저장 로직**은 디바운싱하여 매 입력마다 호출되지 않도록.
5. **PWA 캐싱 전략**: API 호출 없으므로 정적 자산만 캐싱.

### 개발 환경
- Node.js 20 이상
- pnpm 권장 (또는 npm)
- VSCode + ESLint + Prettier

### 첫 명령어 시퀀스
```bash
pnpm create next-app@latest retrospective-app --typescript --tailwind --app --src-dir
cd retrospective-app
npx shadcn@latest init
pnpm add zustand dexie framer-motion react-hook-form zod date-fns lucide-react
pnpm add jspdf html2canvas @dnd-kit/core @dnd-kit/sortable next-themes next-pwa
```
