<template>
  <view class="page">
    <!-- 用户信息 -->
    <view class="profile">
      <view class="avatar">{{ avatarEmoji }}</view>
      <view class="info">
        <view class="nick">{{ user?.nickname || '未登录' }}</view>
        <view class="role">
          <text v-if="isAdmin" class="role-tag admin">管理员</text>
          <text v-else class="role-tag">普通用户</text>
        </view>
      </view>
    </view>

    <!-- 管理员:查看所有人订单的开关 -->
    <view v-if="isAdmin" class="admin-switch">
      <text>查看所有人的订单</text>
      <switch :checked="viewAll" color="#ff5e62" @change="onToggleViewAll" />
    </view>

    <!-- Tab: 今天 / 历史 -->
    <view class="tabs">
      <view class="tab" :class="{ on: scope === 'today' }" @tap="switchTab('today')">今天</view>
      <view class="tab" :class="{ on: scope === 'history' }" @tap="switchTab('history')">历史</view>
    </view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="list" @refresherrefresh="load" refresher-enabled>
      <view v-if="orders.length === 0 && !loading" class="empty">
        {{ scope === 'today' ? '今天还没有点菜哦~' : '暂无历史订单' }}
      </view>
      <view v-for="o in orders" :key="o.id" class="card">
        <view class="card-head">
          <text class="no">单号 {{ o.order_no }}</text>
          <text class="status" :class="o.status">{{ statusText(o.status) }}</text>
        </view>
        <view v-if="viewAll && o.user" class="card-user">
          下单人:{{ o.user.nickname || ('用户#' + o.user_id) }}
        </view>
        <view class="card-items">
          <view v-for="(it, i) in o.items" :key="i" class="ci">
            <text class="ci-name">{{ it.dish_name }}<text v-if="it.cooking_method" class="ci-cm">({{ it.cooking_method }})</text></text>
            <text class="ci-qty">×{{ it.quantity }}</text>
          </view>
        </view>
        <view v-if="o.remark" class="card-remark">备注:{{ o.remark }}</view>
        <view class="card-foot">
          <text>共 {{ o.item_count }} 份</text>
          <text class="time">{{ formatTime(o.created_at) }}</text>
        </view>
      </view>
      <view style="height: 40rpx"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getUser, ensureLogin } from '../../utils/auth';
import { orderApi } from '../../api';

const user = ref(getUser());
const isAdmin = computed(() => user.value?.role === 'admin');

const scope = ref('today'); // today | history
const viewAll = ref(false); // 管理员:是否看所有人的订单
const orders = ref([]);
const loading = ref(false);

const avatarEmoji = computed(() => (isAdmin.value ? '🛡️' : '👤'));

function statusText(s) {
  return { pending: '待处理', preparing: '制作中', served: '已上桌', cancelled: '已取消' }[s] || s;
}
function formatTime(t) {
  if (!t) return '';
  // 接口返回 ISO("...T...Z") 直接 new Date 即可;若为 "YYYY-MM-DD HH:mm:ss" 则用斜杠兼容 iOS
  const d = t.includes('T') ? new Date(t) : new Date(t.replace(/-/g, '/'));
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function switchTab(s) {
  if (scope.value === s) return;
  scope.value = s;
  load();
}
function onToggleViewAll(e) {
  viewAll.value = e.detail.value;
  load();
}

async function load() {
  loading.value = true;
  try {
    const params = { scope: scope.value, page: 1, pageSize: 50 };
    // 管理员关闭"查看全部"时,只看自己的
    if (isAdmin.value && !viewAll.value) params.userId = user.value.id;
    const data = await orderApi.list(params);
    orders.value = data.rows;
  } catch (e) {
    /* 拦截层已提示 */
  } finally {
    loading.value = false;
  }
}

onShow(async () => {
  try { await ensureLogin(); } catch (_) { /* 拦截层已提示 */ }
  user.value = getUser();
  load();
});
</script>

<style scoped>
.page {
  height: 100vh;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.profile {
  background: linear-gradient(135deg, #ff9966, #ff5e62);
  padding: 50rpx 40rpx 60rpx;
  display: flex;
  align-items: center;
}
.avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info {
  margin-left: 28rpx;
  color: #fff;
}
.nick {
  font-size: 36rpx;
  font-weight: 600;
}
.role {
  margin-top: 10rpx;
}
.role-tag {
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.25);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}
.role-tag.admin {
  background: #fff;
  color: #ff5e62;
  font-weight: 600;
}
.admin-switch {
  background: #fff;
  margin: -28rpx 24rpx 0;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #4e5969;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.tabs {
  display: flex;
  background: #fff;
  margin: 24rpx 24rpx 0;
  border-radius: 16rpx 16rpx 0 0;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #86909c;
  position: relative;
}
.tab.on {
  color: #ff5e62;
  font-weight: 600;
}
.tab.on::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 6rpx;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  background: #ff5e62;
  border-radius: 6rpx;
}
.list {
  flex: 1;
  padding: 0;
  min-height: 0;
  box-sizing: border-box;
  width: 100%;
}
.empty {
  text-align: center;
  color: #c0c4cc;
  padding: 120rpx 0;
  font-size: 26rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin: 24rpx;
  box-sizing: border-box;
  overflow: hidden;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.no {
  font-size: 24rpx;
  color: #86909c;
}
.status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  background: #f2f3f5;
  color: #86909c;
}
.status.served {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}
.status.preparing {
  color: #ff9900;
  background: rgba(255, 153, 0, 0.1);
}
.status.cancelled {
  color: #e43d33;
  background: rgba(228, 61, 51, 0.1);
}
.card-user {
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #ff5e62;
}
.card-items {
  margin-top: 16rpx;
}
.ci {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
  font-size: 28rpx;
}
.ci-name {
  color: #1f2329;
}
.ci-cm {
  color: #86909c;
  font-size: 24rpx;
  margin-left: 8rpx;
}
.ci-qty {
  color: #4e5969;
}
.card-remark {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #86909c;
  background: #f7f8fa;
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
}
.card-foot {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f2f3f5;
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #86909c;
}
</style>
