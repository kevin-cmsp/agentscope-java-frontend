import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'

// 定义组件映射，避免 Vite 动态导入路径限制
const viewComponents: Record<string, () => Promise<any>> = {
    'system/User': () => import('@/views/system/User.vue'),
    'system/Role': () => import('@/views/system/Role.vue'),
    'system/Menu': () => import('@/views/system/Menu.vue'),
    'ai/Chat': () => import('@/views/ai/Chat.vue'),
    'Home': () => import('@/views/Home.vue'),
    'Login': () => import('@/views/Login.vue')
}

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/Login.vue'),
            meta: { title: '登录' }
        },
        {
            path: '/',
            name: 'Layout',
            component: () => import('@/layouts/MainLayout.vue'),
            redirect: '/home',
            children: [
                {
                    path: 'home',
                    name: 'Home',
                    component: () => import('@/views/Home.vue'),
                    meta: { title: '首页', icon: 'HomeFilled' }
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/login'
        }
    ]
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore()
    const menuStore = useMenuStore()

    // 初始化用户信息
    userStore.initUserInfo()

    if (to.path === '/login') {
        next()
        return
    }

    if (!userStore.token) {
        next('/login')
        return
    }

    // 加载菜单
    if (menuStore.menus.length === 0) {
        try {
            // 确保用户信息已加载
            if (!userStore.userInfo) {
                console.error('用户信息未加载')
                next('/login')
                return
            }

            console.log('加载菜单，用户 ID:', userStore.userInfo.id)
            console.log('当前 token:', localStorage.getItem('token'))
            
            // 使用用户 ID 加载菜单
            const menuData = await menuStore.loadMenus(userStore.userInfo.id)
            
            // 打印加载的菜单数据
            console.log('=== 菜单加载完成 ===')
            console.log('菜单数量:', menuData.length)
            console.log('侧边栏菜单:', menuStore.sidebarMenus)
            console.log('侧边栏菜单 JSON:', JSON.stringify(menuStore.sidebarMenus, null, 2))

            // 动态添加路由
            if (menuData && menuData.length > 0) {
                menuData.forEach((menu) => {
                    // 添加一级菜单（目录）的路由
                    if (menu.type === 1) {
                        // 目录类型，不需要添加具体路由，只需要处理子菜单
                        console.log('处理目录菜单:', menu.name)
                    }
                    
                    // 处理子菜单（菜单类型）
                    if (menu.children && menu.children.length > 0) {
                        menu.children.forEach((child) => {
                            if (child.type === 2 && child.component) {
                                // 处理 component 路径：确保格式正确
                                let componentPath = child.component
                                
                                // 如果路径以 / 开头，去掉开头的 /
                                if (componentPath.startsWith('/')) {
                                    componentPath = componentPath.substring(1)
                                }
                                
                                // 如果路径以 .vue 结尾，去掉 .vue
                                if (componentPath.endsWith('.vue')) {
                                    componentPath = componentPath.replace('.vue', '')
                                }
                                
                                // 如果路径以 /index 结尾，去掉 /index
                                if (componentPath.endsWith('/index')) {
                                    componentPath = componentPath.replace('/index', '')
                                }
                                
                                // 规范化路径：目录保持小写，文件名首字母大写
                                const pathParts = componentPath.split('/')
                                const normalizedPath = pathParts.length > 1 
                                    ? `${pathParts.slice(0, -1).join('/')}/${pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1)}`
                                    : pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1)
                                
                                // 使用映射对象获取组件
                                const componentImport = viewComponents[normalizedPath]
                                
                                if (componentImport) {
                                    const route: RouteRecordRaw = {
                                        path: child.path,
                                        name: child.name,
                                        component: componentImport,
                                        meta: { title: child.name, icon: child.icon }
                                    }
                                    console.log('添加子菜单路由:', child.name, '路径:', child.path, '组件:', normalizedPath)
                                    router.addRoute('Layout', route)
                                } else {
                                    console.warn('未找到组件映射:', normalizedPath, '请检查 viewComponents 映射表')
                                }
                            }
                        })
                    }
                })
            }

            next({ ...to, replace: true })
        } catch (error) {
            console.error('加载菜单失败:', error)
            console.error('错误堆栈:', error)
            userStore.userLogout()
            next('/login')
        }
        return
    }

    next()
})

export default router
