import request from '@/utils/request'
import type { Result } from '@/types/api'

/**
 * 查询角色列表
 * @param params 查询参数（角色名、状态）
 */
export const queryRoles = (params?: {
    roleName?: string
    status?: number
}) =>
    request.get<Result<any[]>>('/system/role', { params })

/**
 * 根据 ID 获取角色详情
 * @param roleId 角色 ID
 */
export const getRoleById = (roleId: number) =>
    request.get<Result<any>>(`/system/role/${roleId}`)

/**
 * 创建角色
 * @param data 角色信息
 */
export const createRole = (data: any) =>
    request.post<Result<void>>('/system/role', data)

/**
 * 更新角色
 * @param data 角色信息
 */
export const updateRole = (data: any) =>
    request.put<Result<void>>('/system/role', data)

/**
 * 删除角色
 * @param roleId 角色 ID
 */
export const deleteRole = (roleId: number) =>
    request.delete<Result<void>>(`/system/role/${roleId}`)

/**
 * 更新角色状态
 * @param roleId 角色 ID
 * @param status 状态
 */
export const updateRoleStatus = (roleId: number, status: number) =>
    request.put<Result<void>>('/system/role/status', null, {
        params: { roleId, status }
    })

/**
 * 分配菜单权限给角色
 * @param roleId 角色 ID
 * @param menuIds 菜单 ID 列表
 */
export const assignMenus = (roleId: number, menuIds: number[]) =>
    request.put<Result<void>>('/system/role/assign-menus', menuIds, {
        params: { roleId }
    })

/**
 * 获取角色的菜单权限列表
 * @param roleId 角色 ID
 */
export const getRoleMenus = (roleId: number) =>
    request.get<Result<number[]>>(`/system/role/menus/${roleId}`)

/**
 * 获取角色的用户列表
 * @param roleId 角色 ID
 */
export const getRoleUsers = (roleId: number) =>
    request.get<Result<number[]>>(`/system/role/users/${roleId}`)