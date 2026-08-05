import { reactive, computed } from 'vue';
import { getUser } from '../utils/auth';

// 简单的全局响应式 store(购物车 + 当前用户)
const state = reactive({
  user: getUser(),
  // 购物车: { [dishId]: { dish, qty } }
  cart: {},
});

const cartList = computed(() => Object.values(state.cart));
const cartCount = computed(() => cartList.value.reduce((sum, it) => sum + it.qty, 0));

function getQty(dishId) {
  return state.cart[dishId] ? state.cart[dishId].qty : 0;
}

function setQty(dish, qty) {
  if (qty <= 0) {
    delete state.cart[dish.id];
    return;
  }
  state.cart[dish.id] = { dish, qty };
}

function inc(dish) { setQty(dish, getQty(dish.id) + 1); }
function dec(dish) { setQty(dish, getQty(dish.id) - 1); }
function clearCart() {
  Object.keys(state.cart).forEach((k) => delete state.cart[k]);
}
function setUser(u) { state.user = u; }

export const store = {
  state,
  cartList,
  cartCount,
  getQty,
  setQty,
  inc,
  dec,
  clearCart,
  setUser,
};
