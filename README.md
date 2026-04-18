# legalize-web

[legalize.kr](https://legalize.kr) 웹사이트 소스. [Eleventy](https://www.11ty.dev/) 기반 정적 사이트이며 GitHub Pages로 배포됩니다.

> 이 저장소는 [`legalize-kr/legalize-kr`](https://github.com/legalize-kr/legalize-kr)(법령), [`legalize-kr/precedent-kr`](https://github.com/legalize-kr/precedent-kr)(판례), [`legalize-kr/legalize-pipeline`](https://github.com/legalize-kr/legalize-pipeline)(파이프라인)과 함께 사용됩니다.

## 빠른 시작

```bash
npm install
npm run dev       # 로컬 서버 (http://localhost:8080)
npm run build     # 정적 빌드 → _site/
```

## 주요 디렉토리·파일

| 경로 | 설명 |
|---|---|
| `index.html`, `about.html`, `404.html` | 정적 페이지 (Eleventy passthrough) |
| `_data/`, `_includes/` | Eleventy 데이터·템플릿 |
| `css/`, `public/data/` | 스타일, 샤딩된 데이터 파일 |
| `scripts/build-search-index.mjs` | [Pagefind](https://pagefind.app/) 검색 인덱스 생성 |
| `.eleventy.js` | Eleventy 설정 (passthrough, templateFormats=njk) |
| `stats.json` | 법령 통계 (파이프라인이 생성해 복사) |
| `precedent-stats.json` | 판례 통계 (배포 시 `precedent-kr` 스캔으로 생성) |
| `local-images` | `../.cache/images/` 심볼릭 링크 (로컬 개발용, 저장소에는 포함되지 않음) |
| `CNAME` | `legalize.kr` |
| `llms.txt`, `robots.txt`, `sitemap.xml` | 크롤러/LLM용 메타 |

## 데이터 전파

- `stats.json`: `legalize-pipeline`의 `laws.generate_metadata`가 `legalize-kr` 저장소 루트에 쓰고, `daily-laws-update.yml`이 이 저장소로 복사합니다.
- `precedent-stats.json`: `daily-precedent-update.yml`의 "Regenerate precedent-stats.json" 스텝이 `precedent-kr` 디렉토리 구조를 직접 스캔하여 생성합니다 (판례 저장소에는 `metadata.json`/`stats.json`을 만들지 않음).
- 이미지: `npm run prepare`가 파이프라인의 `images export`를 호출해 `public/data/images/`로 샤딩 export합니다.

## 배포

`.github/workflows/build-deploy.yml`이 Eleventy 빌드 후 GitHub Pages로 배포합니다. 커스텀 도메인은 `CNAME`으로 지정되어 있습니다.

## 저장소 구조

이 프로젝트는 여러 저장소로 구성되어 있습니다:

| 저장소 | 설명 |
|--------|------|
| [legalize-kr/legalize-kr](https://github.com/legalize-kr/legalize-kr) | 법령 데이터 |
| [legalize-kr/legalize-pipeline](https://github.com/legalize-kr/legalize-pipeline) | 법령·판례 수집/변환/검증 파이프라인 |
| [legalize-kr/legalize-web](https://github.com/legalize-kr/legalize-web) | 웹사이트 ([legalize.kr](https://legalize.kr), 현재 저장소) |
| [legalize-kr/precedent-kr](https://github.com/legalize-kr/precedent-kr) | 판례 데이터 |
| [legalize-kr/compiler](https://github.com/legalize-kr/compiler) | `.cache` → bare Git repo 컴파일러 (Rust) |

## 라이선스

- 법령·판례 원문: 공공저작물 (대한민국 정부 저작물)
- 사이트 소스: MIT
