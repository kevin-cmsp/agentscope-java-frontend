import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { LoginParams, LoginResult, UserInfo } from '@/types/api'

/**
 * 获取验证码
 * @returns 验证码图片 (Base64) 和 captchaKey
 */
export const getCaptcha = () =>
    request.get<Result<{ captcha: string; captchaKey: string }>>('/auth/captcha')

/**
 * 用户登录
 * @param data 登录参数（用户名、密码、验证码、captchaKey）
 * @returns token 和用户信息
 */
export const login = (data: LoginParams) =>
    request.post<Result<LoginResult>>('/auth/login', data)

/**
 * 用户登出
 */
export const logout = () =>
    request.post<Result<void>>('/auth/logout')

/**
 * 获取当前用户信息
 * @returns 用户详细信息
 */
export const getUserInfo = () =>
    request.get<Result<UserInfo>>('/auth/userinfo')