# AGENTS.md

## 프로젝트 개요
- **이름**: Growing Together in Christ - 미션 리스트
- **목적**: 11가지 미션과 성공 조건을 보여주는 반응형 정적 웹사이트
- **대상**: 교회 청년부/소그룹 - 순(順) 단위로 함께 미션을 수행하며 신앙 성장을 도모
- **배포**: GitHub Pages

## 프로젝트 맥락
이 프로젝트는 **교회 소그룹(순) 활동**을 위한 미션 리스트 웹사이트입니다.
- 교회 청년부에서 순(소그룹) 단위로 함께 수행할 수 있는 미션들을 제공
- 미션 완료 조건은 대부분 "3인 이상 참여"로, 공동체 활동을 장려
- 예배 참석, 큐티 나눔, 감사 나눔 등 신앙 성장을 위한 활동들로 구성
- 크리스마스 블레싱, 홀리스타 등 교회 행사 참여도 미션에 포함

## 기술 스택
- **프레임워크**: Vite (Vanilla JS)
- **스타일링**: Tailwind CSS (초록색 테마, Material Design)
- **폰트**: Pretendard (고딕 기반 한글 폰트)
- **데이터베이스**: Supabase
- **배포**: GitHub Pages

## 디자인 가이드라인
- **색상**: 초록색 계열 (primary-50 ~ primary-900)
- **스타일**: Material Design
  - 그림자 효과 (shadow-md, shadow-lg)
  - 라운드 코너 (rounded-lg, rounded-xl)
  - 부드러운 전환 효과 (transition-all, duration-300)
- **반응형**:
  - 모바일: 1열
  - 태블릿: 2열
  - 데스크탑: 3~4열

## ⚠️ 절대 수정 금지 - 히어로 타이틀 스타일

히어로 영역의 "Growing Together in Christ" 제목 스타일은 **절대 변경하지 마세요**.

### 현재 스타일 (src/style.css)
```css
.hero-main-title {
  font-family: 'Poppins', 'Noto Sans KR', sans-serif;
  font-size: 2.5rem;  /* 모바일 */
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.2;
  margin-bottom: 24px;
  position: relative;
  z-index: 10;
}

.hero-t {
  color: #E57373;  /* 붉은색 't' */
}

@media (min-width: 640px) {
  .hero-main-title { font-size: 3.5rem; }
}

@media (min-width: 1024px) {
  .hero-main-title { font-size: 4rem; }
}
```

### HTML 구조 (src/components/missionList.js)
```html
<h1 class="hero-main-title">
  Growing Together<br>in Chris<span class="hero-t">t</span>
</h1>
```

### 핵심 요소
- **폰트**: Poppins (영문), Noto Sans KR (한글)
- **색상**: 흰색 (#FFFFFF), 마지막 't'만 붉은색 (#E57373)
- **크기**: 모바일 2.5rem → 태블릿 3.5rem → 데스크탑 4rem
- **굵기**: 700 (Bold)

## 프로젝트 구조
```
/
├── src/
│   ├── main.js                 # 앱 진입점
│   ├── app.js                  # 메인 앱 로직
│   ├── supabase.js             # Supabase 클라이언트 설정
│   ├── index.css               # Tailwind CSS import
│   ├── style.css               # 기본 스타일
│   └── components/
│       ├── missionList.js      # 미션 목록 컴포넌트
│       ├── adminLogin.js      # 관리자 로그인 컴포넌트
│       └── adminPanel.js      # 관리자 패널 컴포넌트
├── index.html                  # 메인 HTML
├── vite.config.js              # Vite 설정
├── tailwind.config.js          # Tailwind 설정
├── postcss.config.js           # PostCSS 설정
├── missions.json               # 미션 데이터 (시드용)
├── .env                        # 환경 변수 (로컬)
└── package.json                # 의존성 및 스크립트
```

## Supabase 데이터베이스

### 테이블: missions
```sql
CREATE TABLE missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 정책
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 읽기 허용
CREATE POLICY "Public read access" ON missions FOR SELECT USING (true);

-- 인증된 사용자 쓰기 허용
CREATE POLICY "Authenticated write access" ON missions FOR ALL USING (auth.uid() IS NOT NULL);
```

### 미션 목록
1. 크리스마스 블레싱
2. 홀리스타
3. 아웃팅
4. 순모임 시간 외 만남
5. 하루끝의 십일조
6. 순:간포착
7. 순단톡방 큐티나눔
8. 순톡방 감사나눔
9. 동아리 참석
10. 화요성령집회 참석
11. 금요 라이브 예배 참석

## 개발 가이드

### 로컬 개발
```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 실행 (http://localhost:5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
```

### 데이터베이스 시드
```bash
npm run seed         # missions.json 데이터를 Supabase에 삽입
```

### 배포
```bash
npm run deploy       # GitHub Pages에 배포
```

## 관리자 기능

### 로그인
- **버튼**: 우측 상단 "관리자" 버튼
- **비밀번호**: `admin123` (코드에서 변경 가능)
- **위치**: `src/components/adminPanel.js`의 `ADMIN_PASSWORD` 상수

### 미션 관리
- **추가**: 제목, 설명, 성공 조건 입력
- **수정**: 기존 미션 내용 수정
- **삭제**: 미션 삭제 (확인 대화상자)

## 환경 변수

### .env 파일 (로컬 개발용)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### GitHub Pages 배포 시
- GitHub Repository Settings → Secrets and variables → Actions
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가

## 테마 커스터마이즈

### 색상 변경 (tailwind.config.js)
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // 색상 팔레트 수정
      },
    },
  },
}
```

## 기능 확장 가이드

### 새 컴포넌트 추가
1. `src/components/` 디렉토리에 새 JS 파일 생성
2. 함수로 컴포넌트 작성 (container 인자 받기)
3. `app.js`에서 import 및 사용

### 새 페이지 추가
1. `app.js`에 렌더링 로직 추가
2. `renderApp()` 함수에 조건부 렌더링 로직 추가

## 주의사항
- `.env` 파일은 `.gitignore`에 포함되어 있음
- `.env.example` 참고하여 환경 변수 설정
- Supabase RLS 정책이 올바르게 설정되어야 함
- 관리자 비밀번호는 보안상 환경 변수로 관리 권장

## 문제 해결

### 빌드 오류
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Supabase 연결 오류
- `.env` 파일이 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 테이블과 RLS 정책이 올바르게 설정되어 있는지 확인

### GitHub Pages 배포 실패
- Repository Settings → Pages가 올바르게 설정되어 있는지 확인
- gh-pages 패키지가 설치되어 있는지 확인
- `vite.config.js`의 base path가 올바른지 확인
