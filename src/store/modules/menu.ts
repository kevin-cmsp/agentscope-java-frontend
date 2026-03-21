import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserMenusByUserId } from '@/api/menu'
import type { Menu } from '@/types/api'

export const useMenuStore = defineStore('menu', () => {
    const menus = ref<Menu[]>([])

    // 加载菜单
    const loadMenus = async (userId: number) => {
        const res = await getUserMenusByUserId(userId)
        
        // 打印后端返回的完整报文
        console.log('=== 后端返回的菜单报文 ===')
        console.log('完整响应:', res)
        console.log('菜单数据:', res.data)
        console.log('菜单数据 JSON:', JSON.stringify(res.data, null, 2))
        
        menus.value = res.data
        return res.data
    }

    // 获取侧边栏菜单（只过滤出目录类型，保留子菜单）
    const sidebarMenus = computed(() => {
        return filterMenus(menus.value)
    })

    // 过滤菜单，只保留目录类型（type=1），但保留其子菜单
    const filterMenus = (menus: Menu[]): Menu[] => {
        return menus
            .filter((menu) => menu.type === 1) // 只保留目录类型
            .map((menu) => ({
                ...menu,
                // 对于目录的 children，保留 type=2 的菜单（按钮类型 type=3 不展示）
                children: menu.children
                    ? menu.children.filter((child) => child.type === 2)
                    : []
            }))
    }

    return {
        menus,
        sidebarMenus,
        loadMenus
    }
})
