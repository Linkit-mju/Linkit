---
name: Linkit
description: 학생회의 경험을 다음 임기로 연결하는 절제된 운영 인터페이스
colors:
  desk-ink: "#262626"
  primary-text: "#171717"
  secondary-text: "#737373"
  disabled-text: "#a3a3a3"
  paper-surface: "#ffffff"
  worktop: "#f1f1f1"
  quiet-fill: "#0000000F"
  quiet-border: "#00000014"
  strong-border: "#d4d4d4"
  success: "#007004"
  success-muted: "#c5e5c0"
  warning: "#745b00"
  warning-muted: "#f8da9d"
  error: "#a50c25"
  error-muted: "#facecb"
typography:
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3333
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4286
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4286
rounded:
  inner: "0.375rem"
  element: "0.625rem"
  container: "0.75rem"
  page: "1.75rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.desk-ink}"
    textColor: "{colors.paper-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.element}"
    padding: "8px 12px"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.quiet-fill}"
    textColor: "{colors.primary-text}"
    typography: "{typography.label}"
    rounded: "{rounded.element}"
    padding: "8px 12px"
    height: "36px"
  input:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.primary-text}"
    typography: "{typography.body}"
    rounded: "{rounded.element}"
    height: "36px"
  card:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.container}"
    padding: "16px"
---

# Design System: Linkit

## Overview

**Creative North Star: "학생회 운영 데스크"**

Linkit은 여러 임기와 부서의 업무가 한눈에 정리되는 차분한 운영 데스크처럼 보여야 한다. 장식보다 정보의 위치, 현재 상태, 담당자와 다음 행동을 빠르게 파악하는 데 시각적 우선순위를 둔다.

표면은 중립적인 회색 작업대 위에 흰 문서와 패널이 놓인 구조를 사용한다. 깊이감은 은은한 레이어로만 표현하고, 버튼과 입력창은 절제되고 정돈된 인상을 유지한다. 브랜드는 과장된 장식이 아니라 정확한 간격, 명확한 한국어 문구와 일관된 상태 표현에서 드러난다.

**Key Characteristics:**

- 중립적이고 높은 대비의 운영 화면
- 4px 기반 간격과 정돈된 정보 밀도
- 흰 표면과 낮은 그림자로 구분되는 은은한 레이어
- Astryx 컴포넌트와 semantic token 중심의 일관성
- 상태와 권한, 저장 결과를 색상 외의 단서로 함께 전달

## Colors

무채색의 작업 환경을 기본으로 하고 의미가 있는 상태에만 제한적으로 색을 사용한다.

### Primary

- **Desk Ink** (`#262626`): 주요 버튼, 브랜드 강조와 활성 액션에 사용하는 거의 검은 중립색이다.

### Neutral

- **Primary Text** (`#171717`): 제목과 핵심 본문.
- **Secondary Text** (`#737373`): 설명, 보조 정보와 메타데이터.
- **Paper Surface** (`#ffffff`): 카드, 입력 영역과 전면 패널.
- **Worktop** (`#f1f1f1`): 페이지 바탕과 muted surface.
- **Quiet Border** (`#00000014`): 낮은 위계의 경계.
- **Strong Border** (`#d4d4d4`): 입력과 카드처럼 구조를 분명히 해야 하는 경계.

### Semantic Status

- **Success** (`#007004`) / **Success Muted** (`#c5e5c0`): 완료와 정상 처리.
- **Warning** (`#745b00`) / **Warning Muted** (`#f8da9d`): 확인이 필요한 상태.
- **Error** (`#a50c25`) / **Error Muted** (`#facecb`): 실패, 유효성 오류와 파괴적 행동.

### Named Rules

**The Meaningful Color Rule.** 색은 장식이 아니라 상태, 피드백 또는 실제 범주를 전달할 때만 사용한다.

**The Redundancy Rule.** 성공, 경고와 오류는 색상만으로 전달하지 않고 텍스트, 아이콘 또는 상태 레이블을 함께 제공한다.

## Typography

**Display Font:** 시스템 sans-serif 스택
**Body Font:** 시스템 sans-serif 스택
**Label/Mono Font:** `SF Mono`, Monaco, Consolas, monospace

**Character:** 운영 도구에 필요한 밀도와 판독성을 우선한다. 제목은 명확하되 과장되지 않고, 레이블과 본문은 동일한 14px 기준에서 무게와 위치로 역할을 구분한다.

### Hierarchy

- **Headline** (600, 24px, 1.3333): 페이지의 최상위 작업 제목.
- **Title** (600, 20px, 1.4): 패널과 주요 섹션 제목.
- **Body** (400, 14px, 1.4286): 설명, 문서 내용과 일반 정보.
- **Label** (500, 14px, 1.4286): 버튼, 입력 레이블과 조작 요소.
- **Supporting** (400, 12px, 1.6667): 보조 설명과 메타데이터. 핵심 정보에는 사용하지 않는다.

### Named Rules

**The Operational Hierarchy Rule.** 크기를 늘리는 대신 Heading, Text와 weight 역할을 먼저 사용해 정보 위계를 만든다.

## Layout

Astryx `AppShell`, `SideNav`, `Layout`, `HStack`, `VStack`, `Center`와 `FormLayout`을 사용해 화면의 프레임과 흐름을 만든다. 전체 페이지는 먼저 셸과 주요 영역의 폭을 정한 뒤 콘텐츠를 배치한다. 로그인과 가입처럼 단일 작업인 화면은 가운데 정렬한 제한 폭 패널을 사용하며, 현재 인증 화면의 최대 폭은 `28rem`이다.

간격은 4px 기반의 Astryx `--spacing-*` 스케일만 사용한다. 조밀한 데이터는 카드 묶음이 아니라 edge-to-edge 행, Table 또는 List/Item으로 표현하고, Card는 설정 그룹, 요약 위젯과 명확히 독립된 패널에만 사용한다. 모바일에서는 같은 정보 순서와 작업 우선순위를 유지하면서 다단 레이아웃을 한 열로 축소한다.

## Elevation & Depth

기본 화면은 평면에 가깝고, 흰 표면과 회색 바탕의 tonal layering이 먼저 깊이를 만든다. 사용자가 선택한 “은은한 레이어”에 맞춰 일반 패널은 테두리 또는 `--shadow-low`만 사용하고, popover와 modal처럼 실제로 위에 떠야 하는 요소에만 `--shadow-med`와 `--shadow-high`를 허용한다.

### Shadow Vocabulary

- **Low** (`--shadow-low`): 작업대 위의 주요 패널과 선택적으로 떠 있는 카드.
- **Medium** (`--shadow-med`): popover, menu와 임시 레이어.
- **High** (`--shadow-high`): modal과 명확한 최상위 오버레이.

### Named Rules

**The Quiet Layer Rule.** 그림자는 정보 그룹을 꾸미기 위한 장식이 아니며, 실제 z축 관계가 있을 때 가장 낮은 단계부터 사용한다.

## Shapes

형태는 부드럽지만 장난스럽지 않은 중간 곡률을 사용한다. 내부 요소는 `--radius-inner`(6px), 버튼과 입력은 `--radius-element`(10px), 카드와 패널은 `--radius-container`(12px)를 사용한다. page와 full radius는 큰 셸 또는 원형 상태 표현처럼 의미 있는 경우에만 사용한다. 테두리는 기본 1px이며 형태를 만들기 위해 임의의 radius나 border 값을 추가하지 않는다.

## Components

모든 UI는 Astryx 컴포넌트 API와 props를 먼저 사용한다. 존재 여부가 불분명한 컴포넌트나 variant는 `npx astryx component <Name>` 또는 `npx astryx search`로 확인한다.

### Buttons

- **Shape:** `--radius-element`, medium label, sm/md/lg 높이 28/32/36px.
- **Primary:** `--color-accent` 바탕과 `--color-on-accent` 텍스트. 화면의 핵심 진행 행동에 사용한다.
- **Secondary / Ghost:** neutral overlay 또는 transparent 바탕으로 보조 행동에 사용한다.
- **Hover / Focus:** hover와 pressed overlay를 사용하고, keyboard focus는 2px accent outline과 3px offset으로 분명히 표시한다.
- **Motion:** `--duration-fast`와 `--ease-standard`; reduced motion에서는 transition을 제거한다.

### Cards / Containers

- **Corner Style:** `--radius-container`.
- **Background:** 기본 `--color-background-card`; muted 또는 semantic variant는 의미가 있을 때만 사용한다.
- **Shadow Strategy:** 기본은 `none`; 실제 레이어 관계가 있을 때 `low`부터 적용한다.
- **Border:** 기본 카드의 `--color-border-emphasized` 1px.
- **Internal Padding:** 기본 spacing step 4(16px).

### Inputs / Fields

- **Style:** Astryx `TextInput`, `CheckboxInput`, `FormLayout`을 사용하고 label, description, required와 status API를 보존한다.
- **Focus:** accent focus ring으로 키보드 위치를 명확히 한다.
- **Error / Disabled:** 오류 원인과 해결 방법을 텍스트로 제공하고 disabled는 상태를 숨기지 않는다.
- **Copy:** placeholder는 레이블을 대체하지 않는다.

### Banners / Status

- 정보, 성공, 경고와 오류의 semantic variant를 사용한다.
- title은 결과를 먼저 말하고 description은 원인이나 다음 행동을 설명한다.
- 상태에는 Astryx `Banner`, `StatusDot` 또는 `Token`을 사용한다. `Badge`는 개수나 열거형 상태에만 사용한다.

### Navigation

전체 앱은 `AppShell`과 `SideNav`를 기본 구조로 사용한다. 활성 항목은 neutral background와 medium weight로 표시하고, hover·pressed·disabled 상태는 Astryx 기본 동작을 유지한다. 모바일 내비게이션은 같은 항목 구조와 용어를 보존한다.

## Do's and Don'ts

### Do:

- **Do** 화면을 만들기 전에 `npx astryx build "<idea>"`로 적합한 셸, 블록과 컴포넌트를 찾는다.
- **Do** spacing, color, radius, shadow와 motion에 Astryx semantic token을 사용한다.
- **Do** 현재 상태, 권한, 저장 결과와 다음 행동을 명확한 한국어로 보여준다.
- **Do** 카드보다 행과 리스트가 적합한 고밀도 업무 데이터를 edge-to-edge로 배치한다.
- **Do** keyboard focus, 오류 설명, 반응형 재배치와 reduced motion을 완성 조건으로 취급한다.

### Don't:

- **Don't** 레이아웃을 위해 raw `<div>`나 `<span>`, 별도 CSS 파일 또는 utility class를 사용한다.
- **Don't** raw hex, px, 임의의 radius나 shadow를 제품 코드에 추가한다.
- **Don't** 모든 콘텐츠를 Card로 감싸거나 Badge를 장식으로 사용한다.
- **Don't** 색만으로 상태를 전달하거나 placeholder로 label을 대체한다.
- **Don't** 실제 자료에 없는 이용 지표, 고객 사례, 추천사, 제휴나 보안 성과를 만들어낸다.
