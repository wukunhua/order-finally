<template>
  <div class="page-wrap">
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增菜品</el-button>
      <el-select v-model="query.categoryId" placeholder="按分类筛选" clearable style="width: 160px" @change="load">
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-input v-model="query.keyword" placeholder="搜索菜品名" clearable style="width: 200px" @clear="load" @keyup.enter="load" />
      <el-button @click="load">搜索</el-button>
      <div class="spacer" />
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="rows" border stripe>
      <el-table-column label="图片" width="80">
        <template #default="{ row }">
          <el-image
            v-if="row.image_url"
            :src="row.image_url"
            style="width: 48px; height: 48px; border-radius: 6px"
            fit="cover"
          />
          <span v-else style="color: #c0c4cc">无</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="name" min-width="140" />
      <el-table-column label="分类" min-width="100">
        <template #default="{ row }">{{ categoryName(row.category_id) }}</template>
      </el-table-column>
      <el-table-column label="简介" prop="description" min-width="180" show-overflow-tooltip />
      <el-table-column label="做法" prop="cooking_method" width="100" />
      <el-table-column label="热量(千卡)" width="110">
        <template #default="{ row }">{{ row.calories == null ? '-' : row.calories }}</template>
      </el-table-column>
      <el-table-column label="排序" prop="sort_order" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '在售' : '停售' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? '编辑菜品' : '新增菜品'" width="560px">
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="dialog.form.name" maxlength="128" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="dialog.form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="dialog.form.description" type="textarea" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="做法">
          <el-input v-model="dialog.form.cookingMethod" placeholder="如:红烧 / 爆炒 / 凉拌" maxlength="128" />
        </el-form-item>
        <el-form-item label="热量">
          <el-input-number v-model="dialog.form.calories" :min="0" :value-on-clear="null" controls-position="right" placeholder="千卡" />
          <span style="margin-left: 8px; color: #86909c">千卡 / kcal(可选)</span>
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            :show-file-list="false"
            :http-request="handleUpload"
            accept="image/*"
          >
            <div v-if="dialog.form.imageUrl" class="preview">
              <el-image :src="dialog.form.imageUrl" fit="cover" style="width: 96px; height: 96px; border-radius: 8px" />
            </div>
            <el-button v-else :icon="Picture">上传图片</el-button>
          </el-upload>
          <el-button v-if="dialog.form.imageUrl" link type="danger" style="margin-left: 8px" @click="dialog.form.imageUrl = ''">移除</el-button>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialog.form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialog.form.status" :active-value="1" :inactive-value="0" active-text="在售" inactive-text="停售" />
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
import { Plus, Picture } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { dishApi, categoryApi, uploadImage } from '../api';

const loading = ref(false);
const rows = ref([]);
const categories = ref([]);
const query = reactive({ categoryId: '', keyword: '' });
const formRef = ref();

const dialog = reactive({
  visible: false,
  isEdit: false,
  saving: false,
  id: null,
  form: { name: '', categoryId: null, description: '', cookingMethod: '', calories: null, imageUrl: '', sortOrder: 0, status: 1 },
});
const rules = {
  name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
};

function categoryName(id) {
  return categories.value.find((c) => c.id === id)?.name || '-';
}

async function load() {
  loading.value = true;
  try {
    rows.value = await dishApi.list({
      categoryId: query.categoryId || undefined,
      keyword: query.keyword || undefined,
      all: '1',
      withCategory: '1',
    });
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  categories.value = await categoryApi.list({ all: '1' });
}

async function handleUpload({ file }) {
  try {
    const data = await uploadImage(file);
    dialog.form.imageUrl = data.url;
    ElMessage.success('图片上传成功');
  } catch (e) {
    /* 拦截器已提示 */
  }
}

function openDialog(row) {
  dialog.isEdit = !!row;
  if (row) {
    dialog.id = row.id;
    dialog.form = {
      name: row.name,
      categoryId: row.category_id,
      description: row.description || '',
      cookingMethod: row.cooking_method || '',
      calories: row.calories == null ? null : Number(row.calories),
      imageUrl: row.image_url || '',
      sortOrder: row.sort_order,
      status: row.status,
    };
  } else {
    dialog.id = null;
    dialog.form = { name: '', categoryId: null, description: '', cookingMethod: '', calories: null, imageUrl: '', sortOrder: 0, status: 1 };
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
        categoryId: dialog.form.categoryId,
        description: dialog.form.description || null,
        cookingMethod: dialog.form.cookingMethod || null,
        calories: dialog.form.calories || null,
        imageUrl: dialog.form.imageUrl || null,
        sortOrder: dialog.form.sortOrder,
        status: dialog.form.status,
      };
      if (dialog.isEdit) await dishApi.update(dialog.id, payload);
      else await dishApi.create(payload);
      ElMessage.success('保存成功');
      dialog.visible = false;
      load();
    } finally {
      dialog.saving = false;
    }
  });
}

async function remove(row) {
  await ElMessageBox.confirm(`确认删除菜品「${row.name}」?`, '提示', { type: 'warning' });
  await dishApi.remove(row.id);
  ElMessage.success('已删除');
  load();
}

onMounted(async () => {
  await loadCategories();
  await load();
});
</script>

<style scoped>
.preview {
  display: inline-block;
}
</style>
