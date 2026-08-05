<template>
  <div class="login-page">
    <el-card class="card">
      <div class="title">🍽️ 点菜系统 · 管理后台</div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            :prefix-icon="Lock"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%" @click="onSubmit">登 录</el-button>
      </el-form>
      <div class="tip">默认账号 admin / admin123 (由 seed.js 创建)</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const formRef = ref();
const loading = ref(false);
const form = reactive({ username: 'admin', password: '' });
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

async function onSubmit() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      await auth.login(form.username, form.password);
      ElMessage.success('登录成功');
      router.replace(route.query.redirect || '/');
    } catch (e) {
      // 拦截器已提示
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff9966, #ff5e62);
}
.card {
  width: 380px;
  padding: 16px 8px 8px;
}
.title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2329;
}
.tip {
  margin-top: 12px;
  text-align: center;
  color: #86909c;
  font-size: 12px;
}
</style>
