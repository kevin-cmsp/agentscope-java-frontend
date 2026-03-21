<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">企业财务 AI 管理系统</h1>
      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
          />
        </el-form-item>
        <el-form-item prop="captcha">
          <div class="captcha-input">
            <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                prefix-icon="Key"
                size="large"
            />
            <img
                v-if="captchaImage"
                :src="captchaImage"
                alt="验证码"
                class="captcha-image"
                @click="refreshCaptcha"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-button"
              @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCaptcha } from '@/api/auth'
import { useUserStore } from '@/store/modules/user'
import { encryptPassword } from '@/utils/aesCryptUtils'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginParams } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const captchaImage = ref('')

const loginForm = reactive<LoginParams>({
  username: '',
  password: '',
  captcha: '',
  captchaKey: ''
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 获取验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCaptcha()
    captchaImage.value = res.data.captcha
    loginForm.captchaKey = res.data.captchaKey
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 加密密码（使用 AES 加密）
        const encryptedPassword = encryptPassword(loginForm.password)

        // 使用加密后的密码登录
        const params: LoginParams = {
          username: loginForm.username,
          password: encryptedPassword,
          captcha: loginForm.captcha,
          captchaKey: loginForm.captchaKey
        }

        await userStore.userLogin(params)
        router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
        refreshCaptcha()
        loginForm.captcha = ''
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

  .login-title {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 30px;
  }

  .login-form {
    .captcha-input {
      display: flex;
      gap: 10px;

      .captcha-image {
        width: 120px;
        height: 40px;
        cursor: pointer;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
      }
    }

    .login-button {
      width: 100%;
      margin-top: 10px;
    }
  }
}
</style>