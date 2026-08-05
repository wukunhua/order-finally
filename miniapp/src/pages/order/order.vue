<template>
  <view class="page">
    <view class="content">
      <!-- 左侧分类 -->
      <scroll-view class="cats" scroll-y>
        <view
          v-for="c in categories"
          :key="c.id"
          class="cat"
          :class="{ active: c.id === selectedId }"
          @tap="selectCat(c.id)"
        >
          <text class="cat-icon">{{ c.icon || '·' }}</text>
          <text class="cat-name">{{ c.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧菜品 -->
      <scroll-view class="dishes" scroll-y>
        <view v-if="filteredDishes.length === 0" class="empty">该分类暂无在售菜品</view>
        <view v-for="d in filteredDishes" :key="d.id" class="dish">
          <view class="dish-img">
            <image v-if="d.image_url" :src="d.image_url" mode="aspectFill" class="img" />
            <view v-else class="img ph">🍜</view>
          </view>
          <view class="dish-info">
            <view class="dish-name">{{ d.name }}</view>
            <view class="dish-desc">{{ d.description || '暂无简介' }}</view>
            <view class="dish-tags">
              <text v-if="d.cooking_method" class="tag">做法 · {{ d.cooking_method }}</text>
              <text v-if="d.calories != null" class="tag calorie">🔥 {{ d.calories }} 千卡</text>
            </view>
          </view>
          <view class="dish-ctrl">
            <view v-if="store.getQty(d.id) > 0" class="stepper">
              <view class="btn minus" @tap="store.dec(d)">−</view>
              <text class="num">{{ store.getQty(d.id) }}</text>
              <view class="btn plus" @tap="store.inc(d)">+</view>
            </view>
            <view v-else class="add" @tap="store.inc(d)">加入</view>
          </view>
        </view>
        <view style="height: 24rpx"></view>
      </scroll-view>
    </view>

    <!-- 底部购物车栏 -->
    <view class="cartbar">
      <view class="cart-icon" :class="{ on: store.cartCount.value > 0 }">
        🛒
        <view v-if="store.cartCount.value > 0" class="badge">{{ store.cartCount.value }}</view>
      </view>
      <view class="cart-text">
        已选 <text class="hl">{{ store.cartCount.value }}</text> 份
      </view>
      <view class="submit" :class="{ disabled: store.cartCount.value === 0 }" @tap="openCheckout">
        去结算
      </view>
    </view>

    <!-- 结算弹层 -->
    <view v-if="checkout.show" class="mask" @tap="closeCheckout">
      <view class="sheet" @tap.stop>
        <view class="sheet-title">确认订单</view>
        <scroll-view scroll-y class="sheet-list">
          <view v-for="it in store.cartList.value" :key="it.dish.id" class="sheet-item">
            <text class="si-name">{{ it.dish.name }}<text v-if="it.dish.cooking_method" class="si-cm">({{ it.dish.cooking_method }})</text></text>
            <text class="si-qty">×{{ it.qty }}</text>
          </view>
        </scroll-view>
        <view class="sheet-remark">
          <input v-model="checkout.remark" placeholder="备注(选填,如少辣、不要香菜)" />
        </view>
        <view class="sheet-actions">
          <view class="sa-btn cancel" @tap="closeCheckout">取消</view>
          <view class="sa-btn ok" :class="{ loading: checkout.submitting }" @tap="submitOrder">
            {{ checkout.submitting ? '提交中...' : `提交订单(${store.cartCount.value})` }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { ensureLogin } from '../../utils/auth';
import { categoryApi, dishApi, orderApi } from '../../api';
import { store } from '../../store';

const categories = ref([]);
const dishes = ref([]);
const selectedId = ref(null);

const checkout = reactive({ show: false, remark: '', submitting: false });

const filteredDishes = computed(() =>
  dishes.value.filter((d) => d.category_id === selectedId.value)
);

function selectCat(id) {
  selectedId.value = id;
}

async function loadData() {
  const [cats, ds] = await Promise.all([categoryApi.list(), dishApi.list()]);
  categories.value = cats;
  dishes.value = ds;
  if (!selectedId.value && cats.length) selectedId.value = cats[0].id;
}

function openCheckout() {
  if (store.cartCount.value === 0) return;
  checkout.remark = '';
  checkout.show = true;
}
function closeCheckout() {
  checkout.show = false;
}

async function submitOrder() {
  if (checkout.submitting || store.cartCount.value === 0) return;
  checkout.submitting = true;
  try {
    const items = store.cartList.value.map((it) => ({ dishId: it.dish.id, quantity: it.qty }));
    await orderApi.create(items, checkout.remark || undefined);
    store.clearCart();
    checkout.show = false;
    uni.showToast({ title: '下单成功', icon: 'success' });
  } catch (e) {
    // 拦截层已提示
  } finally {
    checkout.submitting = false;
  }
}

onMounted(async () => {
  try {
    await ensureLogin();
  } catch (e) {
    // 未登录/被禁用,loadData 也会因 401/403 失败,提示由拦截层处理
  }
  try {
    await loadData();
  } catch (e) {
    /* 忽略 */
  }
});

// 从“我的”页切回时刷新数据(如菜品上下架)
onShow(() => {
  if (categories.value.length) loadData();
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f6f8;
}
.content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.cats {
  width: 170rpx;
  background: #eceef1;
  height: 100%;
}
.cat {
  padding: 30rpx 20rpx;
  text-align: center;
  font-size: 26rpx;
  color: #4e5969;
  position: relative;
}
.cat.active {
  background: #fff;
  color: #ff5e62;
  font-weight: 600;
}
.cat.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 24rpx;
  bottom: 24rpx;
  width: 6rpx;
  background: #ff5e62;
  border-radius: 0 6rpx 6rpx 0;
}
.cat-icon {
  display: block;
  font-size: 32rpx;
  margin-bottom: 6rpx;
}
.dishes {
  flex: 1;
  height: 100%;
  background: #fff;
}
.empty {
  text-align: center;
  color: #c0c4cc;
  padding: 80rpx 0;
  font-size: 26rpx;
}
.dish {
  display: flex;
  padding: 24rpx;
  border-bottom: 1rpx solid #f2f3f5;
}
.dish-img .img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: #f2f3f5;
}
.dish-img .img.ph {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
}
.dish-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.dish-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}
.dish-desc {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.dish-tags {
  margin-top: 8rpx;
}
.tag {
  display: inline-block;
  font-size: 22rpx;
  color: #ff5e62;
  background: rgba(255, 94, 98, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}
.tag.calorie {
  margin-left: 8rpx;
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}
.dish-ctrl {
  display: flex;
  align-items: flex-end;
  margin-left: 16rpx;
}
.add {
  background: #ff5e62;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 24rpx;
  border-radius: 40rpx;
}
.stepper {
  display: flex;
  align-items: center;
}
.stepper .btn {
  width: 48rpx;
  height: 48rpx;
  line-height: 44rpx;
  text-align: center;
  border-radius: 50%;
  font-size: 32rpx;
}
.stepper .btn.plus {
  background: #ff5e62;
  color: #fff;
}
.stepper .btn.minus {
  border: 2rpx solid #ff5e62;
  color: #ff5e62;
}
.stepper .num {
  min-width: 48rpx;
  text-align: center;
  font-size: 28rpx;
  color: #1f2329;
}

/* 购物车栏 */
.cartbar {
  height: 110rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}
.cart-icon {
  position: relative;
  font-size: 48rpx;
  width: 80rpx;
  text-align: center;
}
.cart-icon.on {
  color: #ff5e62;
}
.badge {
  position: absolute;
  top: -6rpx;
  right: 4rpx;
  background: #ff5e62;
  color: #fff;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  border-radius: 32rpx;
  padding: 0 6rpx;
  text-align: center;
}
.cart-text {
  flex: 1;
  font-size: 26rpx;
  color: #4e5969;
}
.cart-text .hl {
  color: #ff5e62;
  font-weight: 600;
}
.submit {
  background: #ff5e62;
  color: #fff;
  font-size: 28rpx;
  padding: 18rpx 40rpx;
  border-radius: 40rpx;
}
.submit.disabled {
  background: #ffccc0;
}

/* 结算弹层 */
.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}
.sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}
.sheet-title {
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  padding: 28rpx;
  border-bottom: 1rpx solid #f2f3f5;
}
.sheet-list {
  max-height: 40vh;
}
.sheet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f7f8fa;
}
.si-name {
  font-size: 28rpx;
  color: #1f2329;
}
.si-cm {
  color: #86909c;
  font-size: 24rpx;
  margin-left: 8rpx;
}
.si-qty {
  font-size: 28rpx;
  color: #ff5e62;
  font-weight: 600;
}
.sheet-remark {
  padding: 20rpx 32rpx;
}
.sheet-remark input {
  background: #f5f6f8;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
}
.sheet-actions {
  display: flex;
  padding: 20rpx 32rpx 40rpx;
  gap: 20rpx;
}
.sa-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 40rpx;
  font-size: 30rpx;
}
.sa-btn.cancel {
  background: #f2f3f5;
  color: #4e5969;
}
.sa-btn.ok {
  background: #ff5e62;
  color: #fff;
}
.sa-btn.ok.loading {
  background: #ffc0b8;
}
</style>
