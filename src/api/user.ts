import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { UserInfo } from '@/types/api'

/**
 * 查询用户列表
 * @param params 查询参数（用户名、手机号、状态）
 */
export const queryUsers = (params?: {
    username?: string
    mobile?: string
    status?: number
}) =>
    request.get<Result<UserInfo[]>>('/system/user', { params })

/**
 * 根据 ID 获取用户详情
 * @param userId 用户 ID
 */
export const getUserById = (userId: number) =>
    request.get<Result<UserInfo>>(`/system/user/${userId}`)

/**
 * 创建用户
 * @param data 用户信息
 */
export const createUser = (data: Partial<UserInfo>) =>
    request.post<Result<void>>('/system/user', data)

/**
 * 更新用户
 * @param data 用户信息
 */
export const updateUser = (data: Partial<UserInfo>) =>
    request.put<Result<void>>('/system/user', data)

/**
 * 删除用户
 * @param userId 用户 ID
 */
export const deleteUser = (userId: number) =>
    request.delete<Result<void>>(`/system/user/${userId}`)

/**
 * 更新用户状态
 * @param userId 用户 ID
 * @param status 状态 (0-禁用，1-启用)
 */
export const updateUserStatus = (userId: number, status: number) =>
    request.put<Result<void>>('/system/user/status', null, {
        params: { userId, status }
    })

/**
 * 重置用户密码
 * @param userId 用户 ID
 */
export const resetPassword = (userId: number) =>
    request.put<Result<void>>(`/system/user/reset-password/${userId}`)

/**
 * 分配角色给用户
 * @param userId 用户 ID
 * @param roleIds 角色 ID 列表
 */
export const assignRoles = (userId: number, roleIds: number[]) =>
    request.put<Result<void>>('/system/user/assign-roles', roleIds, {
        params: { userId }
    })

/**
 * 获取用户的角色列表
 * @param userId 用户 ID
 */
export const getUserRoles = (userId: number) =>
    request.get<Result<number[]>>(`/system/user/roles/${userId}`)