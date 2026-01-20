import { supabase } from '../supabase.js'

let currentOnUpdate = null
let currentTab = 'missions' // 'missions' or 'rules'

export function renderAdminPanel(container, missions, rules, onUpdate, onLogout) {
  currentOnUpdate = onUpdate

  container.innerHTML = `
    <nav class="bg-white border-gray-200 dark:bg-gray-900 border-b">
      <div class="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto p-4">
        <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white text-primary-700">관리자 패널</span>
        </a>
        <div class="flex gap-2">
          <button type="button" id="logout-btn" class="text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors" style="background-color: #424242;">로그아웃</button>
        </div>
      </div>
    </nav>

    <!-- 탭 메뉴 -->
    <div class="bg-white border-b">
      <div class="max-w-screen-xl mx-auto px-4">
        <div class="flex gap-4">
          <button type="button" id="tab-missions" class="tab-btn px-4 py-3 font-medium border-b-2 transition-colors ${currentTab === 'missions' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}">
            미션 관리
          </button>
          <button type="button" id="tab-rules" class="tab-btn px-4 py-3 font-medium border-b-2 transition-colors ${currentTab === 'rules' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}">
            공통 규칙 관리
          </button>
        </div>
      </div>
    </div>

    <section class="bg-primary-50 dark:bg-gray-900 min-h-screen py-12">
      <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <!-- 미션 관리 탭 -->
        <div id="missions-tab" class="${currentTab === 'missions' ? '' : 'hidden'}">
          <div class="flex justify-end mb-4">
            <button type="button" id="add-mission-btn" class="text-white font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors" style="background-color: #388E3C;">+ 미션 추가</button>
          </div>
          ${renderMissionForm()}
          <div class="space-y-4 mt-8" id="missions-list">
            ${missions.map((mission, index) => renderAdminMissionCard(mission, index, missions.length)).join('')}
          </div>
          ${missions.length === 0 ? renderEmptyState() : ''}
        </div>

        <!-- 규칙 관리 탭 -->
        <div id="rules-tab" class="${currentTab === 'rules' ? '' : 'hidden'}">
          <div class="flex justify-end mb-4">
            <button type="button" id="add-rule-btn" class="text-white font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors" style="background-color: #388E3C;">+ 규칙 추가</button>
          </div>
          ${renderRuleForm()}
          <div class="space-y-4 mt-8" id="rules-list">
            ${rules.map((rule, index) => renderAdminRuleCard(rule, index, rules.length)).join('')}
          </div>
          ${rules.length === 0 ? renderEmptyRulesState() : ''}
        </div>
      </div>
    </section>

    <footer class="p-4 bg-white md:p-8 lg:p-10 dark:bg-gray-800 border-t">
      <div class="mx-auto max-w-screen-xl text-center">
        <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400">&copy; 2025 <a href="#" class="hover:underline">Growing Together in Christ</a>. All Rights Reserved.</span>
      </div>
    </footer>
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
    <div id="mission-form-container" class="p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 ${isEditing ? '' : 'hidden'}">
      <h5 class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-primary-700">${isEditing ? '미션 수정' : '새 미션 추가'}</h5>
      <form id="mission-form" class="space-y-4">
        <input type="hidden" id="mission-id" value="${mission?.id || ''}">
        <input type="hidden" id="mission-sort-order" value="${mission?.sort_order ?? ''}">

        <div>
          <label for="title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">제목 *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value="${escapeHtml(mission?.title || '')}"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="미션 제목을 입력하세요"
          >
        </div>

        <div>
          <label for="icon" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">아이콘</label>
          <div class="flex items-center gap-3">
            <div id="icon-preview" class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-300">
              <span class="material-icons-outlined text-2xl text-gray-600">${selectedIcon}</span>
            </div>
            <select
              id="icon"
              name="icon"
              class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              ${iconOptions}
            </select>
          </div>
        </div>

        <div>
          <label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">설명</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="미션 설명을 입력하세요"
          >${escapeHtml(mission?.description || '')}</textarea>
        </div>

        <div>
          <label for="condition" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">성공 조건</label>
          <input
            type="text"
            id="condition"
            name="condition"
            value="${escapeHtml(mission?.condition || '')}"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="성공 조건을 입력하세요"
          >
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none transition-colors"
            style="background-color: #388E3C;"
          >
            ${isEditing ? '수정' : '추가'}
          </button>
          <button
            type="button"
            id="cancel-form-btn"
            class="flex-1 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none transition-colors"
            style="background-color: #616161;"
          >
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

  return `
    <div class="p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      <div class="flex items-start justify-between gap-4">
        <!-- 순서 변경 버튼 -->
        <div class="flex flex-col gap-1">
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

        <!-- 미션 내용 -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="inline-flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-700 rounded-lg">
              <span class="material-icons-outlined text-xl">${mission.icon || 'assignment'}</span>
            </span>
            <span class="inline-flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">${index + 1}</span>
            <h5 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white text-primary-700">${escapeHtml(mission.title)}</h5>
          </div>
          ${mission.description ? `
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${escapeHtml(mission.description)}</p>
          ` : ''}
          ${mission.condition ? `
            <div class="inline-flex items-center px-3 py-1 text-sm font-medium text-center text-white bg-primary-600 rounded-lg mb-4">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              ${escapeHtml(mission.condition)}
            </div>
          ` : ''}
        </div>

        <!-- 수정/삭제 버튼 -->
        <div class="flex flex-col gap-2 shrink-0">
          <button
            class="edit-mission-btn px-4 py-2 text-sm text-white font-medium rounded-lg transition-colors"
            style="background-color: #388E3C;"
            data-id="${mission.id}"
          >
            수정
          </button>
          <button
            class="delete-mission-btn px-4 py-2 text-sm text-white font-medium rounded-lg transition-colors"
            style="background-color: #DC2626;"
            data-id="${mission.id}"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
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

  const container = document.getElementById('app')
  container.innerHTML = `
    <nav class="bg-white border-gray-200 dark:bg-gray-900 border-b">
      <div class="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto p-4">
        <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white text-primary-700">미션 수정</span>
        </a>
        <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button type="button" id="back-to-admin-btn" class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-800 dark:border-gray-700">돌아가기</button>
        </div>
      </div>
    </nav>

    <section class="bg-primary-50 dark:bg-gray-900 min-h-screen py-12">
      <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        ${renderMissionForm(true, mission)}
      </div>
    </section>
  `

  // hidden 클래스 제거
  document.getElementById('mission-form-container').classList.remove('hidden')

  document.getElementById('back-to-admin-btn').addEventListener('click', () => {
    if (currentOnUpdate) currentOnUpdate()
  })

  document.getElementById('mission-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleFormSubmit(missions, true)
  })

  document.getElementById('cancel-form-btn').addEventListener('click', () => {
    if (currentOnUpdate) currentOnUpdate()
  })

  // 아이콘 미리보기 업데이트
  document.getElementById('icon').addEventListener('change', (e) => {
    document.querySelector('#icon-preview span').textContent = e.target.value
  })
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

// === 규칙 관리 함수 ===

function renderRuleForm(isEditing = false, rule = null) {
  return `
    <div id="rule-form-container" class="p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 ${isEditing ? '' : 'hidden'}">
      <h5 class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-primary-700">${isEditing ? '규칙 수정' : '새 규칙 추가'}</h5>
      <form id="rule-form" class="space-y-4">
        <input type="hidden" id="rule-id" value="${rule?.id || ''}">
        <input type="hidden" id="rule-sort-order" value="${rule?.sort_order ?? ''}">

        <div>
          <label for="rule-content" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">규칙 내용 *</label>
          <textarea
            id="rule-content"
            name="content"
            required
            rows="3"
            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="규칙 내용을 입력하세요. **텍스트**로 강조 가능"
          >${escapeHtml(rule?.content || '')}</textarea>
          <p class="mt-1 text-xs text-gray-500">**텍스트** 형식으로 작성하면 굵게 표시됩니다.</p>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none transition-colors"
            style="background-color: #388E3C;"
          >
            ${isEditing ? '수정' : '추가'}
          </button>
          <button
            type="button"
            id="cancel-rule-btn"
            class="flex-1 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none transition-colors"
            style="background-color: #616161;"
          >
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

  return `
    <div class="p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      <div class="flex items-start justify-between gap-4">
        <!-- 순서 변경 버튼 -->
        <div class="flex flex-col gap-1 shrink-0">
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

        <!-- 규칙 내용 -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-lg">
              <span class="material-icons-outlined text-lg">check_circle</span>
            </span>
            <span class="inline-flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">${index + 1}</span>
          </div>
          <p class="text-gray-700 dark:text-gray-300">${escapeHtml(rule.content)}</p>
        </div>

        <!-- 수정/삭제 버튼 -->
        <div class="flex flex-col gap-2 shrink-0">
          <button
            class="edit-rule-btn px-4 py-2 text-sm text-white font-medium rounded-lg transition-colors"
            style="background-color: #388E3C;"
            data-id="${rule.id}"
          >
            수정
          </button>
          <button
            class="delete-rule-btn px-4 py-2 text-sm text-white font-medium rounded-lg transition-colors"
            style="background-color: #DC2626;"
            data-id="${rule.id}"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
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
