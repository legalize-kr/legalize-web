# legalize-web

[legalize.kr](https://legalize.kr) 웹사이트 소스. [Eleventy](https://www.11ty.dev/) 기반 정적 사이트이며 GitHub Pages로 배포됩니다.

> 이 저장소는 [`legalize-kr/legalize-kr`](https://github.com/legalize-kr/legalize-kr)(법령), [`legalize-kr/precedent-kr`](https://github.com/legalize-kr/precedent-kr)(판례), [`legalize-kr/legalize-pipeline`](https://github.com/legalize-kr/legalize-pipeline)(파이프라인)과 함께 사용됩니다.

## 빠른 시작

```bash
npm install
npm run dev       # 로컬 서버 (http://localhost:8080)
npm run build     # 정적 빌드 → _site/
```

`npm install`은 의존성만 설치합니다. 로컬 이미지 원본을 함께 보고 싶을 때만
다음 명령을 별도로 실행합니다.

```bash
npm run images:link     # ../.cache/images → local-images 심볼릭 링크
npm run images:prepare  # 이미지 인덱스 재생성 + local-images 링크
```

## 주요 디렉토리·파일

| 경로 | 설명 |
|---|---|
| `index.html`, `about.html`, `laws.html`, `precedents.html`, `ordinances.html`, `admrules.html`, `usage.html`, `404.html` | 정적 페이지 (Eleventy passthrough) |
| `_data/`, `_includes/` | Eleventy 데이터·템플릿 |
| `css/`, `public/data/` | 스타일, 샤딩된 데이터 파일 |
| `scripts/build-search-index.mjs` | [Pagefind](https://pagefind.app/) 검색 인덱스 생성 |
| `scripts/generate-dataset-stats.mjs` | 결과 저장소 Git tree를 스캔해 웹 통계 JSON 생성 |
| `.eleventy.js` | Eleventy 설정 (passthrough, templateFormats=njk) |
| `stats-laws.json` | 법령 통계 |
| `stats-precedents.json` | 판례 통계 |
| `stats-ordinances.json` | 자치법규 통계 |
| `stats-admrules.json` | 행정규칙 통계 |
| `local-images` | `../.cache/images/` 심볼릭 링크 (로컬 개발 보조용, 저장소와 빌드 산출물에는 포함되지 않음) |
| `CNAME` | `legalize.kr` |
| `llms.txt`, `robots.txt`, `sitemap.xml`, `okf/` | 크롤러/LLM/에이전트용 메타 |

## 데이터 통계

- 통계 파일명은 `stats-{domain}.json` 규칙을 사용합니다. 현재 domain은 `laws`, `precedents`, `ordinances`, `admrules`입니다.
- `npm run stats:generate`는 `legalize-kr`, `precedent-kr`, `ordinance-kr`, `admrule-kr` 저장소를 읽어 통계를 생성합니다.
- 배포 워크플로는 매일 02:00 KST에 네 결과 저장소를 blob 없이 체크아웃하고 통계를 다시 계산합니다. 변경된 `stats-*.json`은 모두 `chore: update dataset stats` 단일 커밋으로 처리합니다.
- 일반 `push` 빌드는 커밋된 `stats-*.json`을 사용하므로, 통계 갱신은 하루 1회 스케줄 또는 수동 workflow 실행에서만 일어납니다.
- 로컬에서 저장소 위치가 기본 레이아웃과 다르면 `LEGALIZE_LAWS_DIR`, `LEGALIZE_PRECEDENTS_DIR`, `LEGALIZE_ORDINANCES_DIR`, `LEGALIZE_ADMRULES_DIR` 환경변수로 경로를 지정합니다.
- 이미지: `npm run images:prepare`가 파이프라인의 `images export`를 호출해 `public/data/images/`로 샤딩 export합니다. 일반 `npm install`이나 `npm run dev`에서는 이미지 인덱스를 다시 쓰지 않습니다.

## 배포

`.github/workflows/build-deploy.yml`이 Eleventy 빌드 후 GitHub Pages로 배포합니다. 커스텀 도메인은 `CNAME`으로 지정되어 있습니다.

## 저장소 구조

이 프로젝트는 여러 저장소로 구성되어 있습니다:

| 저장소 | 설명 |
|--------|------|
| [legalize-kr/legalize-kr](https://github.com/legalize-kr/legalize-kr) | 법령 데이터 |
| [legalize-kr/legalize-pipeline](https://github.com/legalize-kr/legalize-pipeline) | 법령·판례·자치법규·행정규칙 수집/변환/검증 파이프라인 |
| [legalize-kr/legalize-web](https://github.com/legalize-kr/legalize-web) | 웹사이트 ([legalize.kr](https://legalize.kr), 현재 저장소) |
| [legalize-kr/precedent-kr](https://github.com/legalize-kr/precedent-kr) | 판례 데이터 |
| [legalize-kr/ordinance-kr](https://github.com/legalize-kr/ordinance-kr) | 자치법규 데이터 |
| [legalize-kr/admrule-kr](https://github.com/legalize-kr/admrule-kr) | 행정규칙 데이터 |
| [legalize-kr/compiler](https://github.com/legalize-kr/compiler) | `.cache` → bare Git repo 컴파일러 (Rust) |
| [legalize-kr/cli-tools](https://github.com/legalize-kr/cli-tools) | CLI 도구 및 로컬 MCP 서버 |
| [legalize-kr/agent-skills](https://github.com/legalize-kr/agent-skills) | AI Agent용 스킬·플러그인 패키지 |

## 라이선스

- 법령·판례·자치법규·행정규칙 원문: 공공저작물 (대한민국 정부 저작물)
- 사이트 소스: MIT
