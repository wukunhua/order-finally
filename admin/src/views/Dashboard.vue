<template>
  <div class="page-wrap">
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="hover" class="stat-card" @click="router.push(card.to)">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome" shadow="never">
      <div class="welcome-title">欢迎使用点菜系统管理后台 👋</div>
      <ul class="welcome-list">
        <li>「用户管理」: 查看所有登录过小程序的用户,可禁用/启用登录、调整角色。</li>
        <li>「菜品分类」「菜品管理」: 维护菜单分类与菜品(名称/简介/做法/图片/上下架)。</li>
        <li>「订单查看」: 查看所有人的订单,按用户/日期/状态筛选,并更新制作状态。</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userApi, dishApi, categoryApi, orderApi } from '../api';

const router = useRouter();
const cards = ref([
  { label: '小程序用户', value: '-', to: '/users' },
  { label: '菜品分类', value: '-', to: '/categories' },
  { label: '在售菜品', value: '-', to: '/dishes' },
  { label: '今日订单', value: '-', to: '/orders' },
]);

onMounted(async () => {
  try {
    const [users, cats, dishes, orders] = await Promise.all([
      userApi.list({ page: 1, pageSize: 1 }),
      categoryApi.list({ all: 1 }),
      dishApi.list({ all: 1 }),
      orderApi.list({ scope: 'today', page: 1, pageSize: 1 }),
    ]);
    cards.value[0].value = users.total;
    cards.value[1].value = cats.length;
    cards.value[2].value = dishes.filter((d) => d.status === 1).length;
    cards.value[3].value = orders.total;
  } catch (e) {
    /* 忽略,卡片显示 - */
  }
});
</script>

<style scoped>
.stat-card {
  text-align: center;
  cursor: pointer;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #ff5e62;
}
.stat-label {
  color: #86909c;
  margin-top: 4px;
}
.welcome {
  margin-top: 16px;
}
.welcome-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}
.welcome-list {
  color: #4e5969;
  line-height: 1.9;
  margin: 0;
  padding-left: 20px;
}
</style>
