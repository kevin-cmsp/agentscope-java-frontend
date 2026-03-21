import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/types/api'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    // 登录
    const userLogin = async (loginParams: LoginParams) => {
        const res = await login(loginParams)
        token.value = res.data.token
        userInfo.value = res.data.user

        // 存储 token 到 localStorage
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify(res.data.user))

        ElMessage.success('登录成功')
        return res
    }

    // 登出
    const userLogout = async () => {
        await logout()
        token.value = ''
        userInfo.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        ElMessage.success('退出成功')
    }

    // 初始化用户信息
    const initUserInfo = () => {
        const savedToken = localStorage.getItem('token')
        const savedUserInfo = localStorage.getItem('userInfo')

        if (savedToken) {
            token.value = savedToken
        }

        if (savedUserInfo) {
            userInfo.value = JSON.parse(savedUserInfo)
        }
    }

    return {
        token,
        userInfo,
        userLogin,
        userLogout,
        initUserInfo
    }
})
