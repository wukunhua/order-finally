<template>
  <div class="page-wrap">
    <div class="toolbar">
      <el-select v-model="query.scope" placeholder="时间" style="width: 120px" @change="reset">
        <el-option label="全部" value="all" />
        <el-option label="今日" value="today" />
        <el-option label="历史" value="history" />
      </el-select>
      <el-select v-model="query.status" placeholder="状态" clearable style="width: 140px" @change="reset">
        <el-option label="待处理" value="pending" />
        <el-option label="制作中" value="preparing" />
        <el-option label="已上桌" value="served" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="rows" border stripe>
      <el-table-column label="单号" prop="order_no" min-width="200" />
      <el-table-column label="下单人" min-width="110">
        <template #default="{ row }">{{ row.user?.nickname || ('用户#' + row.user_id) }}</template>
      </el-table-column>
      <el-table-column label="菜品" min-width="260">
        <template #default="{ row }">
          <span v-for="(it, i) in row.items" :key="i" class="dish-tag">
            {{ it.dish_name }}{{ it.cooking_method ? `(${it.cooking_method})` : '' }} ×{{ it.quantity }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="份数" prop="item_count" width="70" />
      <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" width="170">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-select
            :model-value="row.status"
            size="small"
            style="width: 130px"
            @change="(v) => changeStatus(row, v)"
          >
            <el-option label="待处理" value="pending" />
            <el-option label="制作中" value="preparing" />
            <el-option label="已上桌" value="served" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 16px; justify-content: flex-end; display: flex"
      background
      layout="total, prev, pager, next"
      :total="total"
      :current-page="query.page"
      :page-size="query.pageSize"
      @current-change="(p) => { query.page = p; load(); }"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { orderApi } from '../api';

const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const query = reactive({ scope: 'today', status: '', page: 1, pageSize: 20 });

function formatTime(t) {
  return t ? new Date(t).toLocaleString('zh-CN', { hour12: false }) : '-';
}
function statusText(s) {
  return { pending: '待处理', preparing: '制作中', served: '已上桌', cancelled: '已取消' }[s] || s;
}
function statusType(s) {
  return { pending: 'warning', preparing: 'primary', served: 'success', cancelled: 'info' }[s] || '';
}

function reset() {
  query.page = 1;
  load();
}

async function load() {
  loading.value = true;
  try {
    const data = await orderApi.list({
      scope: query.scope || undefined,
      status: query.status || undefined,
      page: query.page,
      pageSize: query.pageSize,
    });
    rows.value = data.rows;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

async function changeStatus(row, status) {
  await orderApi.setStatus(row.id, status);
  ElMessage.success('状态已更新');
  row.status = status;
}

onMounted(load);
</script>

<style scoped>
.dish-tag {
  display: inline-block;
  margin: 2px 6px 2px 0;
  padding: 2px 8px;
  background: #f2f3f5;
  border-radius: 4px;
  font-size: 12px;
  color: #4e5969;
}
</style>
