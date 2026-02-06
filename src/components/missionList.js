// **텍스트를 <strong>으로 변환
function parseMarkdownBold(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

const NEW_MISSION_WINDOW_DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000

function parseCreatedAt(createdAt) {
  if (!createdAt) return null
  const date = new Date(createdAt)
  return Number.isNaN(date.getTime()) ? null : date
}

function isNewMission(createdAt, nowTs) {
  const createdAtDate = parseCreatedAt(createdAt)
  if (!createdAtDate) return false

  const diff = nowTs - createdAtDate.getTime()
  // 미래 시간은 "새 미션"으로 취급하지 않음
  if (diff < 0) return false
  return diff <= NEW_MISSION_WINDOW_DAYS * DAY_MS
}

export function renderMissionList(container, missions, rules, onAdminClick) {
  const nowTs = Date.now()
  const missionEntries = missions.map((mission, index) => ({
    mission,
    index,
    isNew: isNewMission(mission?.created_at, nowTs),
  }))

  const newMissionEntries = missionEntries.filter(e => e.isNew)

  container.innerHTML = `
    <div class="min-h-screen">
      <!-- 초록색 배경 헤더 -->
      <header class="green-header">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <a href="#" class="flex items-center">
              <span class="logo-text-white">13th Friend</span>
            </a>
            <button type="button" id="admin-btn" class="admin-btn-white">
              <span class="material-icons-outlined text-lg">admin_panel_settings</span>
              <span class="hidden sm:inline">관리자</span>
            </button>
          </div>
        </div>
      </header>

      <!-- 히어로 섹션 - 두 가지 초록색 배경 -->
      <section class="hero-section py-12 sm:py-16 lg:py-20">
        <!-- 추가 잎 모양 장식 -->
        <div class="hero-leaf hero-leaf-1"></div>
        <div class="hero-leaf hero-leaf-2"></div>
        <div class="hero-leaf hero-leaf-3"></div>
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="hero-main-title animate-fade-in-up">
            Growing Together<br>in Chris<span class="hero-t">t</span>
          </h1>

          <!-- 성경 구절 -->
          <div class="hero-verse animate-fade-in-up stagger-1">
            <p class="text-lg sm:text-xl lg:text-2xl font-medium mb-2">
              보라 형제가 연합하여 동거함이<br class="verse-break"> 어찌 그리 선하고 아름다운고
            </p>
            <p class="hero-verse-ref text-base">시편 133:1</p>
          </div>

          <!-- 통계 카드 -->
          <div class="flex justify-center gap-6 animate-fade-in-up stagger-2">
            <div class="hero-stat">
              <div class="text-3xl font-bold font-display">${missions.length}</div>
              <div class="text-sm opacity-70">미션</div>
            </div>
            <div class="hero-stat-accent">
              <div class="text-3xl font-bold font-display">3+</div>
              <div class="text-sm opacity-70">인원</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 미션 카드 그리드 - 초록색 배경 -->
      <section class="green-bg-section py-8 sm:py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          ${newMissionEntries.length > 0 ? `
            <section class="mb-8 sm:mb-10">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-icons-outlined text-2xl text-primary-800">new_releases</span>
                <h2 class="text-lg sm:text-xl font-extrabold text-secondary-900">새로운 미션</h2>
              </div>
              <div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                ${newMissionEntries.map(({ mission, index }) => renderMissionCard(mission, index)).join('')}
              </div>
            </section>
          ` : ''}

          ${missionEntries.length > 0 ? `
            ${newMissionEntries.length > 0 ? `
              <div class="flex items-center gap-2 mb-4">
                <span class="material-icons-outlined text-2xl text-primary-800">assignment</span>
                <h2 class="text-lg sm:text-xl font-extrabold text-secondary-900">전체 미션</h2>
              </div>
            ` : ''}
            <div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              ${missionEntries.map(({ mission, index }) => renderMissionCard(mission, index)).join('')}
            </div>
          ` : (newMissionEntries.length === 0 ? renderEmptyState() : '')}
        </div>
      </section>

      <!-- 공통 규칙 섹션 -->
      ${rules.length > 0 ? `
      <section class="common-rules-section py-8 sm:py-12">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="rules-card p-6 sm:p-8 rounded-2xl">
            <div class="flex items-center gap-3 mb-6">
              <span class="material-icons-outlined text-3xl rules-icon">info</span>
              <h3 class="text-xl sm:text-2xl font-bold rules-title">공통 규칙</h3>
            </div>
            <ul class="rules-list space-y-3">
              ${rules.map(rule => `
                <li class="flex items-start gap-3">
                  <span class="material-icons text-lg rules-check mt-0.5">check_circle</span>
                  <span>${parseMarkdownBold(rule.content)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </section>
      ` : ''}

      <!-- 푸터 - 초록색 배경 -->
      <footer class="green-footer pt-10 pb-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="flex items-center justify-center gap-2 mb-4">
            <span class="material-icons footer-church-icon text-2xl">church</span>
            <span class="footer-logo text-lg">Growing Together in Chris<span class="footer-t">t</span></span>
          </div>
          <p class="footer-copyright text-sm">
            © 2026 13th SNS CROSS Community Friend Group. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  `

  document.getElementById('admin-btn').addEventListener('click', onAdminClick)
}

function renderMissionCard(mission, index) {
  const missionNumber = String(index + 1).padStart(2, '0')
  // 초록색과 붉은색을 교차로 사용 (홀수: 초록, 짝수: 붉은색)
  const isAccent = index % 2 === 1
  const numberClass = isAccent ? 'mission-number-accent' : 'mission-number'
  const iconBgClass = isAccent ? 'icon-bg-accent' : 'icon-bg'
  const iconColorClass = isAccent ? 'icon-color-accent' : 'icon-color'
  const chipClass = isAccent ? 'md-chip-accent' : 'md-chip'
  const baseCardClass = isAccent ? 'md-card md-card-accent with-accent' : 'md-card with-accent'

  return `
    <article class="${baseCardClass} p-5 sm:p-6 relative animate-fade-in-up stagger-${Math.min(index + 1, 12)}">
      <!-- 미션 번호 -->
      <span class="${numberClass}">${missionNumber}</span>

      <!-- 컨텐츠 -->
      <div class="relative z-10">
        <!-- 아이콘 + 제목 (가로 배치) -->
        <div class="flex items-center gap-4 mb-4 mission-title-row">
          <div class="w-14 h-14 rounded-xl ${iconBgClass} flex items-center justify-center flex-shrink-0">
            <span class="material-icons-outlined ${iconColorClass} text-3xl">${mission.icon || getMissionIcon(index)}</span>
          </div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-secondary-800 mission-title">
            ${escapeHtmlWithLineBreaks(mission.title)}
          </h3>
        </div>

        <!-- 설명 -->
        ${mission.description ? `
          <p class="text-secondary-600 text-base sm:text-lg leading-relaxed mb-4">
            ${escapeHtml(mission.description)}
          </p>
        ` : ''}

        <!-- 조건 칩 -->
        ${mission.condition ? `
          <div class="${chipClass}">
            <span class="material-icons text-base">check_circle</span>
            <span>${escapeHtml(mission.condition)}</span>
          </div>
        ` : ''}
      </div>
    </article>
  `
}

function getMissionIcon(index) {
  const icons = [
    'celebration',      // 크리스마스 블레싱
    'star',             // 홀리스타
    'hiking',           // 아웃팅
    'groups',           // 순모임 시간 외 만남
    'volunteer_activism', // 하루끝의 십일조
    'photo_camera',     // 순:간포착
    'menu_book',        // 순단톡방 큐티나눔
    'favorite',         // 순톡방 감사나눔
    'diversity_3',      // 동아리 참석
    'local_fire_department', // 화요성령집회 참석
    'music_note',       // 금요 라이브 예배 참석
    'task_alt',         // 기타
  ]

  return icons[index] || icons[icons.length - 1]
}

function renderEmptyState() {
  return `
    <div class="text-center py-16 animate-fade-in">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
        <span class="material-icons-outlined text-white/60 text-4xl">assignment</span>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">아직 미션이 없습니다</h3>
      <p class="text-white/70 max-w-md mx-auto">
        관리자가 미션을 추가하면 여기에 표시됩니다.
      </p>
    </div>
  `
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 줄바꿈을 지원하는 escapeHtml
function escapeHtmlWithLineBreaks(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  // \n을 <br>로 변환
  return div.innerHTML.replace(/\n/g, '<br>')
}
