import { supabase } from '../supabase.js'

// 환경 변수에서 관리자 설정 가져오기
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin678'
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''
const ADMIN_SUPABASE_PASSWORD = import.meta.env.VITE_ADMIN_SUPABASE_PASSWORD || ''

export function renderAdminLogin(container, onLogin, onBack) {
  container.innerHTML = `
    <section class="bg-primary-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4">
      <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white text-primary-700">
          <span class="text-3xl mr-2">🔐</span>
          관리자 로그인
        </a>
        <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <form id="login-form" class="space-y-4 md:space-y-6" action="#">
              <div>
                <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">비밀번호</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="••••••••"
                  required=""
                >
              </div>

              <div id="error-message" class="hidden p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert"></div>

              <button
                type="submit"
                id="login-btn"
                class="w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                style="background-color: #388E3C;"
              >
                로그인
              </button>

              <button
                type="button"
                id="back-btn"
                class="w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                돌아가기
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const password = document.getElementById('password').value
    const errorDiv = document.getElementById('error-message')
    const loginBtn = document.getElementById('login-btn')

    // 비밀번호 확인
    if (password !== ADMIN_PASSWORD) {
      errorDiv.textContent = '비밀번호가 올바르지 않습니다.'
      errorDiv.classList.remove('hidden')
      return
    }

    // Supabase 인증 시도 (설정된 경우)
    if (ADMIN_EMAIL && ADMIN_SUPABASE_PASSWORD) {
      loginBtn.disabled = true
      loginBtn.textContent = '로그인 중...'
      errorDiv.classList.add('hidden')

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_SUPABASE_PASSWORD
        })

        if (error) {
          console.error('Supabase auth error:', error)
          errorDiv.textContent = 'Supabase 인증에 실패했습니다.'
          errorDiv.classList.remove('hidden')
          loginBtn.disabled = false
          loginBtn.textContent = '로그인'
          return
        }

        onLogin(data.user)
      } catch (err) {
        console.error('Login error:', err)
        errorDiv.textContent = '로그인 중 오류가 발생했습니다.'
        errorDiv.classList.remove('hidden')
        loginBtn.disabled = false
        loginBtn.textContent = '로그인'
      }
    } else {
      // Supabase 설정이 없으면 로컬 모드로 로그인
      onLogin({ id: 'local-admin', email: 'admin@local' })
    }
  })

  document.getElementById('back-btn').addEventListener('click', onBack)
}
