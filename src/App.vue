<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

onMounted(() => {
  // 初始化用户信息
  userStore.initUserInfo()
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
