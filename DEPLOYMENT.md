# GitHub Pages 배포 가이드 (EXAONE 체험 사이트)

이 문서는 현재 저장소의 정적 사이트(`index.html`, `styles.css`, `app.js`)를 GitHub Pages로 배포하는 단계별 가이드입니다.

## 1) GitHub 저장소 준비
1. 이 프로젝트를 본인 GitHub 계정에 업로드합니다.
2. 로컬에서 원격 저장소를 등록하지 않았다면 아래처럼 설정합니다.

```bash
git remote add origin https://github.com/<your-account>/<your-repo>.git
git push -u origin main
```

> 브랜치 이름이 `main`이 아니라면, 실제 브랜치 이름으로 변경하세요.

## 2) GitHub Pages 활성화
1. GitHub 웹에서 해당 저장소로 이동합니다.
2. **Settings → Pages** 메뉴로 이동합니다.
3. **Build and deployment** 섹션에서:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (혹은 실제 브랜치)
   - **/root** 선택
4. **Save**를 누릅니다.

## 3) 배포 확인
1. 저장소 상단의 **Actions** 탭에서 Pages 배포 작업이 완료되는지 확인합니다.
2. 완료 후 **Settings → Pages**에 표시되는 URL로 접속합니다.
   - 예: `https://<your-account>.github.io/<your-repo>/`

## 4) 사이트 구조 확인
배포 후 아래 페이지로 이동해 각 체험 페이지가 정상 연결되는지 확인합니다.

- 메인 페이지: `/index.html`
- 프롬프트 실험실: `/prompt-lab.html`
- 요약 실험실: `/summary-lab.html`
- 번역 실험실: `/translation-lab.html`

## 5) 배포 전 로컬 미리보기 (옵션)
로컬에서 먼저 확인하려면 아래 명령어로 정적 서버를 실행합니다.

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000/index.html` 로 접속합니다.

## 6) 문제 해결 팁
- 404 오류가 뜨면 **Settings → Pages**에서 브랜치와 경로가 맞는지 확인합니다.
- 캐시가 보인다면 강력 새로고침(Shift+Reload)을 시도합니다.
