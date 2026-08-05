<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">🍽️ 点菜系统后台</div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#001529"
        text-color="#cfd3dc"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/dashboard"><el-icon><Odometer /></el-icon><span>概览</span></el-menu-item>
        <el-menu-item index="/users"><el-icon><User /></el-icon><span>用户管理</span></el-menu-item>
        <el-menu-item index="/categories"><el-icon><Menu /></el-icon><span>菜品分类</span></el-menu-item>
        <el-menu-item index="/dishes"><el-icon><Food /></el-icon><span>菜品管理</span></el-menu-item>
        <el-menu-item index="/orders"><el-icon><List /></el-icon><span>订单查看</span></el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="title">{{ route.meta.title || '管理后台' }}</div>
        <el-dropdown @command="onCommand">
          <span class="user">
            {{ auth.user?.nickname || auth.user?.username || '管理员' }}
            <el-icon><CaretBottom /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

function onCommand(cmd) {
  if (cmd === 'logout') {
    auth.clear();
    router.replace('/login');
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
}
.aside {
  background: #001529;
}
.logo {
  height: 60px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.aside :deep(.el-menu) {
  border-right: none;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e6eb;
}
.title {
  font-size: 16px;
  font-weight: 600;
}
.user {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.main {
  background: #f0f2f5;
  padding: 0;
}
</style>
