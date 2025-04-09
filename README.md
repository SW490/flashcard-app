# 📘 단어 플래시카드 웹 앱 개발 기록

일본어 단어 학습을 위한 플래시카드 웹 애플리케이션 개발 중 기록입니다.  
**백엔드(Express + MySQL)** 와 **프론트엔드(React)** 를 중심으로,  
카드 등록, 수정, 삭제, 태그 분류, 휴지통 기능 등을 구현했습니다.

---

## 🔧 오늘의 작업 요약 (2025-04-09)

### 1. 📦 DB 모델링 개선

- `CARD` 테이블에 `is_deleted BOOLEAN DEFAULT FALSE` 컬럼 추가
- 삭제 기능을 실제 삭제가 아닌 **논리적 삭제 (Soft Delete)** 방식으로 구현
- 휴지통 기능을 위한 구조 설계 완료

---

### 2. 🔌 API 설계 및 구현 (Express + MySQL)

#### ✅ 신규 라우팅 추가

| Method | Endpoint                | 설명                      |
|--------|-------------------------|---------------------------|
| `PUT`  | `/cards/delete`         | 선택된 카드들을 휴지통으로 이동 (`is_deleted=true`) |
| `GET`  | `/cards/trash`          | 삭제된 카드 목록 조회    |
| `PUT`  | `/cards/restore`        | 선택된 카드 복원         |

#### 🛠 기존 API 수정

- `GET /cards/list` 에 `WHERE is_deleted = false` 조건 추가  
→ 휴지통에 있는 카드는 기본 목록에 표시되지 않도록 변경

#### 🐛 트러블슈팅

- `WHERE` 중복 조건으로 인해 카드 전체가 안 보이던 이슈 발생  
→ `tagFilter` 조건과 `is_deleted` 조건의 순서 정리 및 쿼리 수정으로 해결

---

### 3. 🎨 프론트엔드 기능 구현 (React)

#### 🗑️ 카드 삭제 기능
- "🗑️ 카드 삭제하기" 버튼 클릭 → 삭제 모드 진입
- 체크박스로 카드 다중 선택
- 선택된 카드 수 표시 + "🗑️ 삭제 실행" 버튼 활성화

#### ♻️ 휴지통 모달
- 페이지 우측 상단 휴지통 이모지 클릭 시 삭제된 카드 모달 팝업
- 선택된 카드 복원 가능

#### 🛠 기타 UI 개선
- `EditModal`과 `TagModal` 모달 분리
- 카드 앞면 정중앙 정렬, 뒷면 자동 줄바꿈
- 반응형 레이아웃 구성 (Desktop: 3열 / Tablet: 2열 / Mobile: 1열)

---

## 🗂️ 칸반보드 (백엔드 / 프론트엔드 분리)

| 상태 | 백엔드 작업                                  | 프론트엔드 작업                             |
|------|---------------------------------------------|--------------------------------------------|
| ✅ 완료 | `PUT /cards/delete` 구현                        | 삭제 모드 UI 구성                             |
| ✅ 완료 | `GET /cards/trash` 구현                         | 휴지통 모달 및 복원 기능 구현                  |
| ✅ 완료 | `PUT /cards/restore` 구현                       | 카드 다중 선택 및 상태 표시                    |
| ✅ 완료 | `GET /cards/list` → `is_deleted = false` 추가 | 삭제된 카드 비노출 처리                        |
| 🕓 진행중 | -                                           | 휴지통 UI 디테일 보완 예정                     |
| ⏳ 예정 | `GET /cards/search?query=` (검색 API)         | 검색창, 한자/태그 기준 필터링 UI 추가 예정     |

---

## 🔮 앞으로의 작업 예정

- [ ] **휴지통 UI 보완**
  - 디자인 디테일 정리
  - 삭제 → 휴지통 이동 → 자동 반영되도록 구성 개선

---

## 📌 기술 스택

- **Frontend**: React (Hooks), CSS Modules
- **Backend**: Node.js (Express), MySQL
- **Database Design**: ER 모델 기반으로 태그-카드 다대다 설계
- **기능 키워드**: 플래시카드, 암기 체크, 오답 체크, 태그 분류, 삭제/복원, 모달 UI
