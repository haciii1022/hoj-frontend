<template>
  <div id="userLoginView">
    <div class="main-content">
      <h2>用户登录</h2>
      <a-form
        :model="form"
        style="max-width: 480px; margin: 0 auto"
        label-align="left"
        auto-label-width
        @submit="handleSubmit"
      >
        <a-form-item field="userAccount" label="用户名" show-colon>
          <a-input
            v-model="form.userAccount"
            placeholder="请输入用户名"
            style="
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
          />
        </a-form-item>
        <a-form-item
          field="userPassword"
          tooltip="密码不少于8位"
          label="密码"
          show-colon
        >
          <a-input-password
            v-model="form.userPassword"
            placeholder="请输入密码"
            style="
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
          />
        </a-form-item>

        <a-form-item>
          <a-button
            html-type="submit"
            type="primary"
            style="
              width: 80px;
              background-color: rgb(var(--arcoblue-4));
              border-radius: 12px;
            "
          >
            <icon-user style="margin-right: 3px" />
            登录
          </a-button>
          <a class="myLink" href="/user/register">没有账号？去注册</a>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { UserControllerService, UserLoginRequest } from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import store from "@/store";

const form = reactive({
  userAccount: "",
  userPassword: "",
} as UserLoginRequest);

const router = useRouter();

const handleSubmit = async () => {
  let res = await UserControllerService.userLoginUsingPost(form);
  if (res.code === 0) {
    Message.success({
      content: "登录成功",
      duration: 1000,
    });
    await store.dispatch("user/getLoginUser");
    router.push({
      path: "/",
      replace: true,
    });
  } else {
    Message.error("登录失败, " + res.message);
  }
};
</script>

<style>
#userLoginView {
  display: flex;
  flex-direction: column;
  width: 400px;
  height: auto;
  margin: 0 auto;
  padding: 0 30px 15px 30px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影 */
  border-radius: 16px; /* 边框弧度 */
}

.myLink {
  margin-left: 3px;
  margin-top: 10px;
  text-decoration: none; /* 去掉下划线 */
  color: #007bff; /* 默认颜色 */
  font-weight: 500; /* 字体加粗 */
  transition: color 0.3s ease, text-decoration 0.3s ease; /* 平滑过渡 */
  cursor: pointer; /* 鼠标变为手型 */
}

.myLink:hover {
  color: #0056b3; /* 悬停时的颜色 */
  text-decoration: underline; /* 悬停时添加下划线 */
}
</style>
