---
type: Dataset
title: Legalize KR Datasets
description: Legalize KR이 관리하는 네 가지 대한민국 공공 법률 데이터셋입니다.
resource: https://legalize.kr/
tags: [dataset, statutes, precedents, administrative-rules, local-ordinances, "법령", "판례", "행정규칙", "자치법규"]
timestamp: 2026-07-02T00:00:00+09:00
---

# Legalize KR Datasets

Legalize KR은 네 가지 기본 데이터셋을 관리합니다. 각 데이터셋은 Git 저장소로 공개되며, 직접 복제하거나 `legalize` CLI 또는 MCP 서버를 통해 조회할 수 있습니다.

| 데이터셋 | 저장소 | 주요 활용 |
|---|---|---|
| 법령 | https://github.com/legalize-kr/legalize-kr | 법령 검색, 개정 이력, 특정 날짜 기준 법령 조회 |
| 판례 | https://github.com/legalize-kr/precedent-kr | 판례 검색, 사건번호 인용, 판례 원문 검색 |
| 행정규칙 | https://github.com/legalize-kr/admrule-kr | 기관별 고시, 훈령, 예규, 지침 검색 |
| 자치법규 | https://github.com/legalize-kr/ordinance-kr | 지방자치단체 조례와 규칙 검색 |

## 데이터 출처

원천 데이터는 국가법령정보센터 OpenAPI(https://open.law.go.kr)에서 수집합니다. Markdown 파일은 출처 URL과 날짜, 식별자, 기관, 법원, 사건종류 같은 핵심 법률 메타데이터를 보존합니다.

## 관련 개념

- [프로젝트 개요](legalize-kr.md)
- [AI 법률 활용 사례](ai-legal-use-cases.md)
