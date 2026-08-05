<template>
  <div class="page-wrap">
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增分类</el-button>
      <div class="spacer" />
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="rows" border stripe>
      <el-table-column label="ID" prop="id" width="70" />
      <el-table-column label="图标" width="70">
        <template #default="{ row }">{{ row.icon || '-' }}</template>
      </el-table-column>
      <el-table-column label="分类名称" prop="name" min-width="160" />
      <el-table-column label="排序" prop="sort_order" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? '编辑分类' : '新增分类'" width="460px">
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="dialog.form.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="dialog.form.icon" placeholder="可填 emoji 或图片地址" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialog.form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialog.form.status" :active-value="1" :inactive-value="0" active-text="上架" inactive-text="下架" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { categoryApi } from '../api';

const loading = ref(false);
const rows = ref([]);
const formRef = ref();

const dialog = reactive({
  visible: false,
  isEdit: false,
  saving: false,
  id: null,
  form: { name: '', icon: '', sortOrder: 0, status: 1 },
});
const rules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] };

async function load() {
  loading.value = true;
  try {
    rows.value = await categoryApi.list({ all: 1 });
  } finally {
    loading.value = false;
  }
}

function openDialog(row) {
  dialog.isEdit = !!row;
  if (row) {
    dialog.id = row.id;
    dialog.form = { name: row.name, icon: row.icon || '', sortOrder: row.sort_order, status: row.status };
  } else {
    dialog.id = null;
    dialog.form = { name: '', icon: '', sortOrder: 0, status: 1 };
  }
  dialog.visible = true;
}

async function save() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return;
    dialog.saving = true;
    try {
      const payload = {
        name: dialog.form.name,
        icon: dialog.form.icon || null,
        sortOrder: dialog.form.sortOrder,
        status: dialog.form.status,
      };
      if (dialog.isEdit) await categoryApi.update(dialog.id, payload);
      else await categoryApi.create(payload);
      ElMessage.success('保存成功');
      dialog.visible = false;
      load();
    } finally {
      dialog.saving = false;
    }
  });
}

async function remove(row) {
  await ElMessageBox.confirm(`确认删除分类「${row.name}」?`, '提示', { type: 'warning' });
  await categoryApi.remove(row.id);
  ElMessage.success('已删除');
  load();
}

onMounted(load);
</script>
