import { supabase } from './supabase.js'
import { renderMissionList } from './components/missionList.js'
import { renderAdminLogin } from './components/adminLogin.js'
import { renderAdminPanel } from './components/adminPanel.js'

// Fallback 미션 데이터 (Supabase 연결 실패 시 사용)
const fallbackMissions = [
  { id: "christmas-blessing", title: "크리스마스 블레싱", description: "크리스마스 축제에 참여하세요", condition: "3인 이상 참여", icon: "celebration", sort_order: 0 },
  { id: "holy-star", title: "홀리스타", description: "홀리스타 행사에 참여하세요", condition: "3인 이상 참여", icon: "star", sort_order: 1 },
  { id: "outing", title: "아웃팅", description: "순 아웃팅에 참여하세요", condition: "3인 이상 참여", icon: "hiking", sort_order: 2 },
  { id: "extra-meeting", title: "순모임 시간 외 만남", description: "순모임 외의 시간에 함께 만나보세요", condition: "3인 이상 참여", icon: "groups", sort_order: 3 },
  { id: "daily-tithe", title: "하루끝의 십일조", description: "하루를 마무리하며 감사를 표현하세요", condition: "3인 이상 참여", icon: "volunteer_activism", sort_order: 4 },
  { id: "gap-catch", title: "순:간포착", description: "순원들과의 소중한 순간을 포착하세요", condition: "3인 이상 참여", icon: "photo_camera", sort_order: 5 },
  { id: "group-qt", title: "순단톡방 큐티나눔", description: "순단톡방에서 큐티 나눔을 해보세요", condition: "3인 이상 참여", icon: "menu_book", sort_order: 6 },
  { id: "group-thanks", title: "순톡방 감사나눔", description: "순톡방에서 감사를 나누세요", condition: "3인 이상 참여", icon: "favorite", sort_order: 7 },
  { id: "club-attendance", title: "동아리 참석", description: "동아리 활동에 참여하세요", condition: "3인 이상 참여", icon: "sports_esports", sort_order: 8 },
  { id: "tuesday-meeting", title: "화요성령집회 참석", description: "화요 성령 집회에 참여하세요", condition: "3인 이상 참여", icon: "local_fire_department", sort_order: 9 },
  { id: "friday-service", title: "금요 라이브 예배 참석", description: "금요 라이브 예배에 참여하세요", condition: "3인 이상 참여", icon: "music_note", sort_order: 10 }
]

// Fallback 규칙 데이터
const fallbackRules = [
  { id: "rule-1", content: "모든 미션은 **3인 이상** 함께 참여해야 인정됩니다.", sort_order: 0 },
  { id: "rule-2", content: "미션 완료 시 **인증 사진**을 순톡방에 공유해주세요.", sort_order: 1 },
  { id: "rule-3", content: "같은 미션은 **기간 내 1회**만 인정됩니다.", sort_order: 2 }
]

let missions = []
let rules = []
let currentUser = null
let showLogin = false

export async function initializeApp() {
  // 기존 세션 확인
  await checkSession()
  await loadMissions()
  await loadRules()
  renderApp()
  setupEventListeners()
}

async function checkSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      currentUser = session.user
    }
  } catch (err) {
    console.error('Session check error:', err)
  }
}

async function loadMissions() {
  try {
    const { data, error } = await supabase.from('missions').select('*').order('sort_order', { ascending: true })

    if (error) {
      console.error('Error loading missions:', error)
      console.log('Using fallback missions data')
      missions = fallbackMissions
    } else {
      missions = data && data.length > 0 ? data : fallbackMissions
    }
  } catch (err) {
    console.error('Error loading missions:', err)
    console.log('Using fallback missions data')
    missions = fallbackMissions
  }
}

async function loadRules() {
  try {
    const { data, error } = await supabase.from('rules').select('*').order('sort_order', { ascending: true })

    if (error) {
      console.error('Error loading rules:', error)
      console.log('Using fallback rules data')
      rules = fallbackRules
    } else {
      rules = data && data.length > 0 ? data : fallbackRules
    }
  } catch (err) {
    console.error('Error loading rules:', err)
    console.log('Using fallback rules data')
    rules = fallbackRules
  }
}

function renderApp() {
  const app = document.getElementById('app')

  if (currentUser) {
    renderAdminPanel(app, missions, rules, onDataUpdate, onLogout)
  } else if (showLogin) {
    renderAdminLogin(app, onLogin, onBackToMain)
  } else {
    renderMissionList(app, missions, rules, onAdminLoginClick)
  }
}

function setupEventListeners() {
  window.addEventListener('mission-updated', async () => {
    await loadMissions()
    await loadRules()
    renderApp()
  })

  // Supabase 인증 상태 변경 감지
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      currentUser = session?.user || null
      showLogin = false
      renderApp()
    } else if (event === 'SIGNED_OUT') {
      currentUser = null
      renderApp()
    }
  })
}

function onAdminLoginClick() {
  showLogin = true
  renderApp()
}

function onBackToMain() {
  showLogin = false
  renderApp()
}

function onLogin(user) {
  currentUser = user
  showLogin = false
  renderApp()
}

async function onLogout() {
  try {
    await supabase.auth.signOut()
    currentUser = null
    renderApp()
  } catch (err) {
    console.error('Logout error:', err)
    // 강제 로그아웃
    currentUser = null
    renderApp()
  }
}

async function onDataUpdate() {
  await loadMissions()
  await loadRules()
  renderApp()
}
