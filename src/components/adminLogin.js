import { supabase } from '../supabase.js'

// 환경 변수에서 관리자 설정 가져오기
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin678'
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''
const ADMIN_SUPABASE_PASSWORD = import.meta.env.VITE_ADMIN_SUPABASE_PASSWORD || ''

export function renderAdminLogin(container, onLogin, onBack) {
  container.innerHTML = `
    <div class="min-h-screen">
      <!-- 헤더 -->
      <header class="green-header">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <a href="#" class="flex items-center">
              <span class="logo-text-white">13th Friend</span>
            </a>
            <button type="button" id="back-btn" class="admin-btn-white">
              <span class="material-icons-outlined text-lg">arrow_back</span>
              <span class="hidden sm:inline">돌아가기</span>
            </button>
          </div>
        </div>
      </header>

      <!-- 로그인 섹션 -->
      <section class="green-bg-section min-h-[calc(100vh-64px-120px)] flex items-center justify-center py-12 px-4">
        <div class="w-full max-w-md">
          <div class="md-card p-6 sm:p-8">
            <!-- 헤더 -->
            <div class="flex items-center gap-4 mb-8">
              <div class="w-14 h-14 rounded-xl icon-bg flex items-center justify-center">
                <span class="material-icons-outlined icon-color text-3xl">admin_panel_settings</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-secondary-800">관리자 로그인</h1>
                <p class="text-secondary-500 text-sm">미션을 관리하려면 로그인하세요</p>
              </div>
            </div>

            <!-- 폼 -->
            <form id="login-form" class="space-y-5">
              <div>
                <label for="password" class="block mb-2 text-sm font-semibold text-secondary-700">비밀번호</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  class="bg-gray-50 border-2 border-gray-200 text-secondary-800 text-base rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full p-3 transition-colors"
                  placeholder="비밀번호를 입력하세요"
                  required
                >
              </div>

              <div id="error-message" class="hidden p-4 text-sm rounded-xl flex items-center gap-2" style="background-color: #FEF2F2; color: #DC2626;">
                <span class="material-icons-outlined text-lg">error</span>
                <span id="error-text"></span>
              </div>

              <button
                type="submit"
                id="login-btn"
                class="w-full inline-flex items-center justify-center gap-2 font-semibold rounded-xl text-base px-5 py-3 transition-all"
                style="background-color: #3D7A3D; color: white;"
              >
                <span class="material-icons-outlined text-xl">login</span>
                로그인
              </button>
            </form>
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

  const showError = (message) => {
    const errorDiv = document.getElementById('error-message')
    const errorText = document.getElementById('error-text')
    errorText.textContent = message
    errorDiv.classList.remove('hidden')
  }

  const hideError = () => {
    document.getElementById('error-message').classList.add('hidden')
  }

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const password = document.getElementById('password').value
    const loginBtn = document.getElementById('login-btn')

    hideError()

    // 비밀번호 확인
    if (password !== ADMIN_PASSWORD) {
      showError('비밀번호가 올바르지 않습니다.')
      return
    }

    // Supabase 인증 시도 (설정된 경우)
    if (ADMIN_EMAIL && ADMIN_SUPABASE_PASSWORD) {
      loginBtn.disabled = true
      loginBtn.innerHTML = '<span class="material-icons-outlined text-xl animate-spin">refresh</span> 로그인 중...'

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_SUPABASE_PASSWORD
        })

        if (error) {
          console.error('Supabase auth error:', error)
          showError('Supabase 인증에 실패했습니다.')
          loginBtn.disabled = false
          loginBtn.innerHTML = '<span class="material-icons-outlined text-xl">login</span> 로그인'
          return
        }

        onLogin(data.user)
      } catch (err) {
        console.error('Login error:', err)
        showError('로그인 중 오류가 발생했습니다.')
        loginBtn.disabled = false
        loginBtn.innerHTML = '<span class="material-icons-outlined text-xl">login</span> 로그인'
      }
    } else {
      // Supabase 설정이 없으면 로컬 모드로 로그인
      onLogin({ id: 'local-admin', email: 'admin@local' })
    }
  })

  document.getElementById('back-btn').addEventListener('click', onBack)
}
