import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { Menu } from '@/types/api'

/**
 * 获取菜单树形结构
 * @returns 菜单树
 */
export const getMenuTree = () =>
    request.get<Result<Menu[]>>('/system/menu/tree')

/**
 * 根据用户角色获取菜单权限
 * @param roleIds 角色 ID 列表
 * @returns 菜单列表
 */
export const getUserMenus = (roleIds: number[]) =>
    request.post<Result<Menu[]>>('/system/menu/user-menus', roleIds)

/**
 * 根据用户 ID 获取菜单权限
 * @param userId 用户 ID
 * @returns 菜单列表
 */
export const getUserMenusByUserId = (userId: number) =>
    request.get<Result<Menu[]>>(`/system/menu/user/${userId}`)

/**
 * 创建菜单
 * @param data 菜单信息
 */
export const createMenu = (data: Partial<Menu>) =>
    request.post<Result<void>>('/system/menu', data)

/**
 * 更新菜单
 * @param data 菜单信息
 */
export const updateMenu = (data: Partial<Menu>) =>
    request.put<Result<void>>('/system/menu', data)

/**
 * 删除菜单
 * @param menuId 菜单 ID
 */
export const deleteMenu = (menuId: number) =>
    request.delete<Result<void>>(`/system/menu/${menuId}`)
