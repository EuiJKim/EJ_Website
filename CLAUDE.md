# Portfolio Site — 김의준

## 개요
UX/UI 디자이너 김의준의 포트폴리오 웹사이트.
정적 HTML/CSS/JS, GitHub Pages 배포 (main push 시 자동).

## 구조
```
portfolio_site/
  index.html            # 메인 — 인라인 CSS, DM Sans, 3개 프로젝트 리스트
  assets/global.css     # 서브프로젝트 공통 — nav, footer, 반응형
  allaw/                # 법률 AI 앱 케이스스터디
    index.html          # 래퍼 (global.css + 인라인 스타일)
    assets/Resume_*.jpg # 슬라이드 이미지 11장 (2~11, 13)
  clog/                 # 클라이밍 기록 앱 케이스스터디
    index.html          # 래퍼 (global.css)
    design-system.css   # Clog 전용 (1920x1080 고정, iframe 스케일링)
    01_cover.html ~ 12_validation_lesson.html  # 12개 HTML 슬라이드
    img_*.jpg/png       # 목업 이미지
  resin/                # EEL 레진 가구 케이스스터디
    index.html          # 래퍼 (미완성 — iframe으로 eel-studio.me 임베드)
    thumb.jpg
```

## 로컬 프리뷰
```bash
npx serve .
# 또는
python -m http.server 8000
```

## 배포
```bash
git push origin main  # → GitHub Pages 자동 배포
```

## 디자인 시스템

### 메인 (index.html — 인라인 CSS)
- 폰트: DM Sans (300, 400, 500)
- 색상: --bg: #f9f9f7, --ink: #111, --muted: #999, --line: #e0e0e0
- 최대 너비: 1100px, 패딩: 64px (모바일 28px)
- 반응형: 768px breakpoint

### 서브프로젝트 공통 (global.css)
- 폰트: DM Sans + Freesentation fallback
- 색상: --dark: #0f0f0f, --accent: #1E41C0, --bg: #f9f9f7
- nav: fixed, backdrop-filter blur, z-index 100
- 반응형: 768px breakpoint

### Clog 전용 (design-system.css)
- 폰트: Freesentation (100~900)
- 고정 크기: 1920x1080px (iframe 스케일링으로 반응형 우회)
- 색상: --blue: #1E41C0, --dark: #1A1A2E

## 프로젝트 상태
| 프로젝트 | 형식 | 상태 |
|---------|------|------|
| ALLAW | JPG 이미지 11장 | 완성 (텍스트 접근 불가가 약점) |
| Clog | HTML 12슬라이드 | 완성 (QA 95/100) |
| Resin | iframe + WIP | 미완성 |

## 작업 규칙
- global.css 수정 시 → allaw, clog, resin 3개 모두 확인
- 메인 index.html의 인라인 CSS 구조 유지 (단일 파일 의도)
- 프로젝트 간 네비게이션 일관성: ← Back to Works, Next: [프로젝트명] →
- 이미지: lazy loading + 의미있는 alt 텍스트 필수
- 커밋: conventional commits (feat/fix/style/content)

## 품질 기준
- HTML: W3C 유효성 통과
- 접근성: focus-visible, 44px 터치 타겟, alt 텍스트
- 반응형: 768px breakpoint, 모바일에서 가독성 확인
- 링크: 깨진 링크 0개
- 성능: 이미지 최적화, lazy loading
