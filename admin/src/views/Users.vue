<template>
  <div class="page-wrap">
    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索 昵称 / openid"
        clearable
        style="width: 240px"
        @clear="load"
        @keyup.enter="load"
      />
      <el-button type="primary" @click="load">搜索</el-button>
      <el-checkbox v-model="query.all" @change="load">显示全部(含管理员)</el-checkbox>
      <div class="spacer" />
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="rows" border stripe>
      <el-table-column label="ID" prop="id" width="70" />
      <el-table-column label="昵称" min-width="140">
        <template #default="{ row }">
          <el-avatar :size="28" :src="row.avatar_url" style="vertical-align: middle" />
          <span style="margin-left: 8px">{{ row.nickname || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="openid" prop="openid" min-width="180" show-overflow-tooltip />
      <el-table-column label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'warning'">
            {{ row.status === 'active' ? '正常' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最后登录" width="170">
        <template #default="{ row }">{{ formatTime(row.last_login_at) }}</template>
      </el-table-column>
      <el-table-column label="注册时间" width="170">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            :type="row.status === 'active' ? 'warning' : 'success'"
            @click="toggleStatus(row)"
          >
            {{ row.status === 'active' ? '禁用登录' : '启用登录' }}
          </el-button>
          <el-button size="small" @click="toggleRole(row)">
            {{ row.role === 'admin' ? '降为普通' : '升为管理员' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 16px; justify-content: flex-end; display: flex"
      background
      layout="total, prev, pager, next, sizes"
      :total="total"
      :current-page="query.page"
      :page-size="query.pageSize"
      :page-sizes="[10, 20, 50]"
      @current-change="(p) => { query.page = p; load(); }"
      @size-change="(s) => { query.pageSize = s; query.page = 1; load(); }"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { userApi } from '../api';

const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const query = reactive({ keyword: '', page: 1, pageSize: 20, all: false });

function formatTime(t) {
  if (!t) return '-';
  return new Date(t).toLocaleString('zh-CN', { hour12: false });
}

async function load() {
  loading.value = true;
  try {
    const data = await userApi.list({
      keyword: query.keyword || undefined,
      page: query.page,
      pageSize: query.pageSize,
      all: query.all ? '1' : undefined,
    });
    rows.value = data.rows;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

async function toggleStatus(row) {
  const next = row.status === 'active' ? 'disabled' : 'active';
  await ElMessageBox.confirm(
    `确认${next === 'disabled' ? '禁用' : '启用'}该用户的登录?`,
    '提示',
    { type: 'warning' }
  );
  await userApi.setStatus(row.id, next);
  ElMessage.success(next === 'disabled' ? '已禁用登录' : '已启用登录');
  load();
}

async function toggleRole(row) {
  const next = row.role === 'admin' ? 'user' : 'admin';
  await ElMessageBox.confirm(
    `确认将该用户${next === 'admin' ? '设为管理员' : '降为普通用户'}?`,
    '提示',
    { type: 'warning' }
  );
  await userApi.setRole(row.id, next);
  ElMessage.success('已更新角色');
  load();
}

onMounted(load);
</script>
