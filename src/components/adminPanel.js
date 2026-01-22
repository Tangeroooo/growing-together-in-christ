import { supabase } from '../supabase.js'

let currentOnUpdate = null
let currentTab = 'missions' // 'missions' or 'rules'

export function renderAdminPanel(container, missions, rules, onUpdate, onLogout) {
  currentOnUpdate = onUpdate

  container.innerHTML = `
    <div class="min-h-screen">
      <!-- 헤더 -->
      <header class="green-header">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <a href="#" class="flex items-center">
              <span class="logo-text-white">관리자 패널</span>
            </a>
            <button type="button" id="logout-btn" class="admin-btn-white">
              <span class="material-icons-outlined text-lg">logout</span>
              <span class="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <!-- 탭 메뉴 -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex gap-1">
            <button type="button" id="tab-missions" class="tab-btn px-5 py-3 font-semibold border-b-2 transition-colors ${currentTab === 'missions' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}">
              <span class="material-icons-outlined text-lg align-middle mr-1">assignment</span>
              미션 관리
            </button>
            <button type="button" id="tab-rules" class="tab-btn px-5 py-3 font-semibold border-b-2 transition-colors ${currentTab === 'rules' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}">
              <span class="material-icons-outlined text-lg align-middle mr-1">rule</span>
              공통 규칙 관리
            </button>
          </div>
        </div>
      </div>

      <!-- 메인 컨텐츠 -->
      <section class="green-bg-section min-h-screen py-8 sm:py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- 미션 관리 탭 -->
          <div id="missions-tab" class="${currentTab === 'missions' ? '' : 'hidden'}">
            <div class="flex justify-end mb-6">
              <button type="button" id="add-mission-btn" class="md-btn-add">
                <span class="material-icons-outlined text-lg">add</span>
                미션 추가
              </button>
            </div>
            ${renderMissionForm()}
            <div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-8" id="missions-list">
              ${missions.map((mission, index) => renderAdminMissionCard(mission, index, missions.length)).join('')}
            </div>
            ${missions.length === 0 ? renderEmptyState() : ''}
          </div>

          <!-- 규칙 관리 탭 -->
          <div id="rules-tab" class="${currentTab === 'rules' ? '' : 'hidden'}">
            <div class="flex justify-end mb-6">
              <button type="button" id="add-rule-btn" class="md-btn-add">
                <span class="material-icons-outlined text-lg">add</span>
                규칙 추가
              </button>
            </div>
            ${renderRuleForm()}
            <div class="space-y-4 mt-8" id="rules-list">
              ${rules.map((rule, index) => renderAdminRuleCard(rule, index, rules.length)).join('')}
            </div>
            ${rules.length === 0 ? renderEmptyRulesState() : ''}
          </div>
        </div>
      </section>

      <!-- 푸터 -->
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

  // 이벤트 리스너 설정

  // 탭 전환
  document.getElementById('tab-missions').addEventListener('click', () => {
    currentTab = 'missions'
    document.getElementById('missions-tab').classList.remove('hidden')
    document.getElementById('rules-tab').classList.add('hidden')
    document.getElementById('tab-missions').classList.add('border-primary-600', 'text-primary-700')
    document.getElementById('tab-missions').classList.remove('border-transparent', 'text-gray-500')
    document.getElementById('tab-rules').classList.remove('border-primary-600', 'text-primary-700')
    document.getElementById('tab-rules').classList.add('border-transparent', 'text-gray-500')
  })

  document.getElementById('tab-rules').addEventListener('click', () => {
    currentTab = 'rules'
    document.getElementById('rules-tab').classList.remove('hidden')
    document.getElementById('missions-tab').classList.add('hidden')
    document.getElementById('tab-rules').classList.add('border-primary-600', 'text-primary-700')
    document.getElementById('tab-rules').classList.remove('border-transparent', 'text-gray-500')
    document.getElementById('tab-missions').classList.remove('border-primary-600', 'text-primary-700')
    document.getElementById('tab-missions').classList.add('border-transparent', 'text-gray-500')
  })

  // 미션 관리
  document.getElementById('add-mission-btn').addEventListener('click', () => {
    toggleForm(true)
  })

  document.getElementById('logout-btn').addEventListener('click', onLogout)

  document.getElementById('mission-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleFormSubmit(missions)
  })

  document.getElementById('cancel-form-btn').addEventListener('click', () => {
    toggleForm(false)
  })

  // 아이콘 미리보기 업데이트
  document.getElementById('icon').addEventListener('change', (e) => {
    document.querySelector('#icon-preview span').textContent = e.target.value
  })

  // 수정 버튼
  document.querySelectorAll('.edit-mission-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id
      showEditForm(id, missions)
    })
  })

  // 삭제 버튼
  document.querySelectorAll('.delete-mission-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('정말로 이 미션을 삭제하시겠습니까?')) {
        await deleteMission(btn.dataset.id)
        onUpdate()
      }
    })
  })

  // 위로 이동 버튼
  document.querySelectorAll('.move-up-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      await moveMission(id, missions, -1)
      onUpdate()
    })
  })

  // 아래로 이동 버튼
  document.querySelectorAll('.move-down-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      await moveMission(id, missions, 1)
      onUpdate()
    })
  })

  // === 규칙 관리 이벤트 리스너 ===

  // 규칙 추가 버튼
  document.getElementById('add-rule-btn').addEventListener('click', () => {
    toggleRuleForm(true)
  })

  // 규칙 폼 제출
  document.getElementById('rule-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleRuleFormSubmit(rules)
  })

  // 규칙 폼 취소
  document.getElementById('cancel-rule-btn').addEventListener('click', () => {
    toggleRuleForm(false)
  })

  // 규칙 수정 버튼
  document.querySelectorAll('.edit-rule-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id
      showEditRuleForm(id, rules)
    })
  })

  // 규칙 삭제 버튼
  document.querySelectorAll('.delete-rule-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('정말로 이 규칙을 삭제하시겠습니까?')) {
        await deleteRule(btn.dataset.id)
        onUpdate()
      }
    })
  })

  // 규칙 위로 이동 버튼
  document.querySelectorAll('.move-rule-up-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      await moveRule(id, rules, -1)
      onUpdate()
    })
  })

  // 규칙 아래로 이동 버튼
  document.querySelectorAll('.move-rule-down-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      await moveRule(id, rules, 1)
      onUpdate()
    })
  })
}

// 사용 가능한 아이콘 목록
const AVAILABLE_ICONS = [
  { value: 'celebration', label: '축하/파티' },
  { value: 'star', label: '별' },
  { value: 'hiking', label: '하이킹/야외' },
  { value: 'groups', label: '그룹/모임' },
  { value: 'volunteer_activism', label: '봉사/나눔' },
  { value: 'photo_camera', label: '카메라/사진' },
  { value: 'menu_book', label: '책/성경' },
  { value: 'favorite', label: '하트/감사' },
  { value: 'sports_esports', label: '게임/동아리' },
  { value: 'local_fire_department', label: '불꽃/성령' },
  { value: 'music_note', label: '음악/찬양' },
  { value: 'church', label: '교회' },
  { value: 'emoji_people', label: '사람' },
  { value: 'restaurant', label: '식사/교제' },
  { value: 'directions_run', label: '달리기/활동' },
  { value: 'card_giftcard', label: '선물' },
  { value: 'wb_sunny', label: '태양/아침' },
  { value: 'nightlight', label: '달/저녁' },
  { value: 'assignment', label: '과제/미션' },
  { value: 'task_alt', label: '완료/체크' },
]

function renderMissionForm(isEditing = false, mission = null) {
  const selectedIcon = mission?.icon || 'assignment'
  const iconOptions = AVAILABLE_ICONS.map(icon =>
    `<option value="${icon.value}" ${icon.value === selectedIcon ? 'selected' : ''}>${icon.label}</option>`
  ).join('')

  return `
    <div id="mission-form-container" class="md-card p-5 sm:p-6 ${isEditing ? '' : 'hidden'}">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-xl icon-bg flex items-center justify-center">
          <span class="material-icons-outlined icon-color text-2xl">${isEditing ? 'edit' : 'add_circle'}</span>
        </div>
        <h5 class="text-xl sm:text-2xl font-bold text-secondary-800">${isEditing ? '미션 수정' : '새 미션 추가'}</h5>
      </div>
      <form id="mission-form" class="space-y-5">
        <input type="hidden" id="mission-id" value="${mission?.id || ''}">
        <input type="hidden" id="mission-sort-order" value="${mission?.sort_order ?? ''}">

        <div>
          <label for="title" class="block mb-2 text-sm font-semibold text-secondary-700">제목 *</label>
          <textarea
            id="title"
            name="title"
            required
            rows="2"
            class="bg-gray-50 border-2 border-gray-200 text-secondary-800 text-base rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full p-3 transition-colors resize-none"
            placeholder="미션 제목을 입력하세요 (엔터로 줄바꿈 가능)"
          >${escapeHtml(mission?.title || '')}</textarea>
          <p class="mt-1 text-xs text-secondary-500">엔터를 누르면 카드에서 줄바꿈됩니다.</p>
        </div>

        <div>
          <label for="icon" class="block mb-2 text-sm font-semibold text-secondary-700">아이콘</label>
          <div class="flex items-center gap-3">
            <div id="icon-preview" class="w-14 h-14 rounded-xl icon-bg flex items-center justify-center">
              <span class="material-icons-outlined text-3xl icon-color">${selectedIcon}</span>
            </div>
            <select
              id="icon"
              name="icon"
              class="flex-1 bg-gray-50 border-2 border-gray-200 text-secondary-800 text-base rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block p-3 transition-colors"
            >
              ${iconOptions}
            </select>
          </div>
        </div>

        <div>
          <label for="description" class="block mb-2 text-sm font-semibold text-secondary-700">설명</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            class="block p-3 w-full text-base text-secondary-800 bg-gray-50 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="미션 설명을 입력하세요"
          >${escapeHtml(mission?.description || '')}</textarea>
        </div>

        <div>
          <label for="condition" class="block mb-2 text-sm font-semibold text-secondary-700">성공 조건</label>
          <input
            type="text"
            id="condition"
            name="condition"
            value="${escapeHtml(mission?.condition || '')}"
            class="bg-gray-50 border-2 border-gray-200 text-secondary-800 text-base rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full p-3 transition-colors"
            placeholder="성공 조건을 입력하세요"
          >
        </div>

        <div class="flex gap-2 pt-2">
          <button type="submit" class="md-form-btn md-form-btn-primary">
            <span class="material-icons-outlined text-base">${isEditing ? 'check' : 'add'}</span>
            ${isEditing ? '수정' : '추가'}
          </button>
          <button type="button" id="cancel-form-btn" class="md-form-btn md-form-btn-secondary">
            <span class="material-icons-outlined text-base">close</span>
            취소
          </button>
        </div>
      </form>
    </div>
  `
}

function renderAdminMissionCard(mission, index, totalCount) {
  const isFirst = index === 0
  const isLast = index === totalCount - 1
  const missionNumber = String(index + 1).padStart(2, '0')

  return `
    <article class="md-card with-accent p-5 sm:p-6 relative">
      <!-- 미션 번호 -->
      <span class="mission-number">${missionNumber}</span>

      <!-- 컨텐츠 -->
      <div class="relative z-10">
        <!-- 아이콘 + 제목 -->
        <div class="flex items-center gap-4 mb-4 mission-title-row">
          <div class="w-14 h-14 rounded-xl icon-bg flex items-center justify-center flex-shrink-0">
            <span class="material-icons-outlined icon-color text-3xl">${mission.icon || 'assignment'}</span>
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

        <!-- 성공조건 칩 -->
        <div class="md-chip ${mission.condition ? '' : 'opacity-50'}" style="${mission.condition ? '' : 'border-color: #9CA3AF; color: #9CA3AF;'}">
          <span class="material-icons text-base">check_circle</span>
          <span>${mission.condition ? escapeHtml(mission.condition) : '성공조건 미설정'}</span>
        </div>

        <!-- 관리 버튼들 -->
        <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <!-- 순서 변경 -->
          <div class="flex items-center gap-1 mr-auto">
            <button
              class="move-up-btn w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-id="${mission.id}"
              ${isFirst ? 'disabled' : ''}
              title="위로 이동"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
              </svg>
            </button>
            <button
              class="move-down-btn w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-id="${mission.id}"
              ${isLast ? 'disabled' : ''}
              title="아래로 이동"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          <!-- 수정/삭제 -->
          <button
            class="edit-mission-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors border-2"
            style="border-color: #388E3C; color: #388E3C; background: transparent;"
            data-id="${mission.id}"
          >
            수정
          </button>
          <button
            class="delete-mission-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors border-2"
            style="border-color: #DC2626; color: #DC2626; background: transparent;"
            data-id="${mission.id}"
          >
            삭제
          </button>
        </div>
      </div>
    </article>
  `
}

function renderEmptyState() {
  return `
    <div class="text-center py-12">
      <div class="mb-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">아직 미션이 없습니다</h3>
      <p class="text-gray-500 dark:text-gray-400">새 미션을 추가해보세요</p>
    </div>
  `
}

function toggleForm(show) {
  const container = document.getElementById('mission-form-container')
  if (container) {
    if (show) {
      container.classList.remove('hidden')
      document.getElementById('mission-id').value = ''
      document.getElementById('mission-sort-order').value = ''
      document.getElementById('title').value = ''
      document.getElementById('description').value = ''
      document.getElementById('condition').value = ''
    } else {
      container.classList.add('hidden')
    }
  }
}

function showEditForm(id, missions) {
  const mission = missions.find(m => m.id === id)
  if (!mission) return

  const container = document.getElementById('mission-form-container')
  if (!container) return

  // 폼 표시
  container.classList.remove('hidden')
  
  // 폼 제목 변경
  const formTitle = container.querySelector('h5')
  if (formTitle) formTitle.textContent = '미션 수정'
  
  // 버튼 텍스트 변경
  const submitBtn = container.querySelector('button[type="submit"]')
  if (submitBtn) submitBtn.textContent = '수정'

  // 폼 값 채우기
  document.getElementById('mission-id').value = mission.id
  document.getElementById('mission-sort-order').value = mission.sort_order ?? ''
  document.getElementById('title').value = mission.title || ''
  document.getElementById('description').value = mission.description || ''
  document.getElementById('condition').value = mission.condition || ''
  
  // 아이콘 선택
  const iconSelect = document.getElementById('icon')
  if (iconSelect) {
    iconSelect.value = mission.icon || 'assignment'
    // 아이콘 미리보기 업데이트
    const iconPreview = document.querySelector('#icon-preview span')
    if (iconPreview) iconPreview.textContent = mission.icon || 'assignment'
  }

  // 폼으로 스크롤
  container.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function handleFormSubmit(missions, isEditing = false) {
  const id = document.getElementById('mission-id').value || generateId()
  const sortOrderValue = document.getElementById('mission-sort-order').value
  const title = document.getElementById('title').value.trim()
  const icon = document.getElementById('icon').value
  const description = document.getElementById('description').value.trim()
  const condition = document.getElementById('condition').value.trim()

  if (!title) {
    alert('제목을 입력해주세요')
    return
  }

  // 새 미션의 경우 맨 마지막 순서로 추가
  const sort_order = sortOrderValue !== '' ? parseInt(sortOrderValue) : missions.length

  try {
    const { error } = await supabase
      .from('missions')
      .upsert({
        id,
        title,
        icon: icon || 'assignment',
        description: description || null,
        condition: condition || null,
        sort_order,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (error) throw error

    if (currentOnUpdate) currentOnUpdate()
  } catch (err) {
    console.error('Error saving mission:', err)
    alert('미션 저장에 실패했습니다')
  }
}

async function deleteMission(id) {
  try {
    const { error } = await supabase.from('missions').delete().eq('id', id)

    if (error) throw error
  } catch (err) {
    console.error('Error deleting mission:', err)
    alert('미션 삭제에 실패했습니다')
  }
}

async function moveMission(id, missions, direction) {
  const currentIndex = missions.findIndex(m => m.id === id)
  if (currentIndex < 0) return

  const newIndex = currentIndex + direction
  if (newIndex < 0 || newIndex >= missions.length) return

  // 배열 복사 후 위치 교환
  const reordered = [...missions]
  const [movedItem] = reordered.splice(currentIndex, 1)
  reordered.splice(newIndex, 0, movedItem)

  try {
    // 모든 미션의 sort_order를 새 위치로 업데이트
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sort_order !== i) {
        await supabase.from('missions').update({ sort_order: i }).eq('id', reordered[i].id)
      }
    }
  } catch (err) {
    console.error('Error moving mission:', err)
    alert('미션 순서 변경에 실패했습니다')
  }
}

function generateId() {
  // 간단한 ID: mission-랜덤6자리
  return `mission-${Math.random().toString(36).substr(2, 8)}`
}

function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 줄바꿈을 지원하는 escapeHtml
function escapeHtmlWithLineBreaks(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML.replace(/\n/g, '<br>')
}

// === 규칙 관리 함수 ===

function renderRuleForm(isEditing = false, rule = null) {
  return `
    <div id="rule-form-container" class="md-card p-5 sm:p-6 ${isEditing ? '' : 'hidden'}">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-xl icon-bg flex items-center justify-center">
          <span class="material-icons-outlined icon-color text-2xl">${isEditing ? 'edit' : 'add_circle'}</span>
        </div>
        <h5 class="text-xl sm:text-2xl font-bold text-secondary-800">${isEditing ? '규칙 수정' : '새 규칙 추가'}</h5>
      </div>
      <form id="rule-form" class="space-y-4">
        <input type="hidden" id="rule-id" value="${rule?.id || ''}">
        <input type="hidden" id="rule-sort-order" value="${rule?.sort_order ?? ''}">

        <div>
          <label for="rule-content" class="block mb-2 text-sm font-semibold text-secondary-700">규칙 내용 *</label>
          <textarea
            id="rule-content"
            name="content"
            required
            rows="3"
            class="block p-3 w-full text-base text-secondary-800 bg-gray-50 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="규칙 내용을 입력하세요. **텍스트**로 강조 가능"
          >${escapeHtml(rule?.content || '')}</textarea>
          <p class="mt-2 text-xs text-secondary-500">**텍스트** 형식으로 작성하면 굵게 표시됩니다.</p>
        </div>

        <div class="flex gap-2 pt-2">
          <button type="submit" class="md-form-btn md-form-btn-primary">
            <span class="material-icons-outlined text-base">${isEditing ? 'check' : 'add'}</span>
            ${isEditing ? '수정' : '추가'}
          </button>
          <button type="button" id="cancel-rule-btn" class="md-form-btn md-form-btn-secondary">
            <span class="material-icons-outlined text-base">close</span>
            취소
          </button>
        </div>
      </form>
    </div>
  `
}

function renderAdminRuleCard(rule, index, totalCount) {
  const isFirst = index === 0
  const isLast = index === totalCount - 1
  const ruleNumber = String(index + 1).padStart(2, '0')

  return `
    <article class="md-card p-5 sm:p-6 relative">
      <!-- 규칙 번호 -->
      <span class="mission-number">${ruleNumber}</span>

      <!-- 컨텐츠 -->
      <div class="relative z-10">
        <!-- 아이콘 + 번호 -->
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-xl icon-bg flex items-center justify-center flex-shrink-0">
            <span class="material-icons-outlined icon-color text-2xl">check_circle</span>
          </div>
          <span class="text-lg font-bold text-secondary-600">규칙 ${index + 1}</span>
        </div>

        <!-- 규칙 내용 -->
        <p class="text-secondary-700 text-base sm:text-lg leading-relaxed mb-4 pr-12">
          ${escapeHtml(rule.content)}
        </p>

        <!-- 관리 버튼들 -->
        <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <!-- 순서 변경 -->
          <div class="flex items-center gap-1 mr-auto">
            <button
              class="move-rule-up-btn w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-id="${rule.id}"
              ${isFirst ? 'disabled' : ''}
              title="위로 이동"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
              </svg>
            </button>
            <button
              class="move-rule-down-btn w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-id="${rule.id}"
              ${isLast ? 'disabled' : ''}
              title="아래로 이동"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          <!-- 수정/삭제 -->
          <button
            class="edit-rule-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors border-2"
            style="border-color: #388E3C; color: #388E3C; background: transparent;"
            data-id="${rule.id}"
          >
            수정
          </button>
          <button
            class="delete-rule-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors border-2"
            style="border-color: #DC2626; color: #DC2626; background: transparent;"
            data-id="${rule.id}"
          >
            삭제
          </button>
        </div>
      </div>
    </article>
  `
}

function renderEmptyRulesState() {
  return `
    <div class="text-center py-12">
      <span class="material-icons-outlined text-6xl text-gray-400 mb-4">rule</span>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">등록된 규칙이 없습니다</h3>
      <p class="text-gray-500">새 규칙을 추가해보세요</p>
    </div>
  `
}

function toggleRuleForm(show) {
  const formContainer = document.getElementById('rule-form-container')
  if (show) {
    formContainer.classList.remove('hidden')
    // 폼 초기화
    document.getElementById('rule-id').value = ''
    document.getElementById('rule-sort-order').value = ''
    document.getElementById('rule-content').value = ''
    document.querySelector('#rule-form-container h5').textContent = '새 규칙 추가'
    document.querySelector('#rule-form button[type="submit"]').textContent = '추가'
  } else {
    formContainer.classList.add('hidden')
  }
}

function showEditRuleForm(id, rules) {
  const rule = rules.find(r => r.id === id)
  if (!rule) return

  const formContainer = document.getElementById('rule-form-container')
  formContainer.classList.remove('hidden')

  document.getElementById('rule-id').value = rule.id
  document.getElementById('rule-sort-order').value = rule.sort_order ?? ''
  document.getElementById('rule-content').value = rule.content || ''
  document.querySelector('#rule-form-container h5').textContent = '규칙 수정'
  document.querySelector('#rule-form button[type="submit"]').textContent = '수정'
}

async function handleRuleFormSubmit(rules) {
  const id = document.getElementById('rule-id').value || generateRuleId()
  const sortOrderValue = document.getElementById('rule-sort-order').value
  const content = document.getElementById('rule-content').value.trim()

  if (!content) {
    alert('규칙 내용을 입력해주세요')
    return
  }

  const sort_order = sortOrderValue !== '' ? parseInt(sortOrderValue) : rules.length

  try {
    const { error } = await supabase
      .from('rules')
      .upsert({
        id,
        content,
        sort_order,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (error) throw error

    if (currentOnUpdate) currentOnUpdate()
  } catch (err) {
    console.error('Error saving rule:', err)
    alert('규칙 저장에 실패했습니다')
  }
}

async function deleteRule(id) {
  try {
    const { error } = await supabase.from('rules').delete().eq('id', id)

    if (error) throw error
  } catch (err) {
    console.error('Error deleting rule:', err)
    alert('규칙 삭제에 실패했습니다')
  }
}

async function moveRule(id, rules, direction) {
  const currentIndex = rules.findIndex(r => r.id === id)
  if (currentIndex < 0) return

  const newIndex = currentIndex + direction
  if (newIndex < 0 || newIndex >= rules.length) return

  const reordered = [...rules]
  const [movedItem] = reordered.splice(currentIndex, 1)
  reordered.splice(newIndex, 0, movedItem)

  try {
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sort_order !== i) {
        await supabase.from('rules').update({ sort_order: i }).eq('id', reordered[i].id)
      }
    }
  } catch (err) {
    console.error('Error moving rule:', err)
    alert('규칙 순서 변경에 실패했습니다')
  }
}

function generateRuleId() {
  return `rule-${Math.random().toString(36).substr(2, 8)}`
}
