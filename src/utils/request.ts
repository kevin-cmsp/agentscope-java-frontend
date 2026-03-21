import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { Result } from '@/types/api'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

class Request {
    private instance: AxiosInstance

    constructor() {
        this.instance = axios.create({
            baseURL: '/api',
            timeout: 30000
        })

        this.setupInterceptors()
    }

    private setupInterceptors() {
        // 请求拦截器
        this.instance.interceptors.request.use(
            (config) => {
                // 直接从 localStorage 获取最新 token
                const token = localStorage.getItem('token')
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response) => {
                const res = response.data as Result

                if (res.code !== 200) {
                    ElMessage.error(res.message || '请求失败')
                    return Promise.reject(new Error(res.message || '请求失败'))
                }

                return response
            },
            (error) => {
                if (error.response?.status === 401) {
                    const userStore = useUserStore()
                    userStore.userLogout()
                    router.push('/login')
                    ElMessage.error('登录已过期，请重新登录')
                } else {
                    ElMessage.error(error.message || '网络错误')
                }
                return Promise.reject(error)
            }
        )
    }

    public request<T = any>(config: AxiosRequestConfig): Promise<T> {
        return this.instance.request(config).then((response) => response.data as T)
    }

    public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.request({ url, method: 'GET', ...config })
    }

    public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.request({ url, method: 'POST', data, ...config })
    }

    public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.request({ url, method: 'PUT', data, ...config })
    }

    public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.request({ url, method: 'DELETE', ...config })
    }
}

const request = new Request()
export default request
