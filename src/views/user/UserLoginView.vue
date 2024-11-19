<template>
  <div id="userLoginView">
    <h2>用户登录</h2>
    <a-form
      :model="form"
      style="max-width: 480px; margin: 0 auto"
      label-align="left"
      auto-label-width
      @submit="handleSubmit"
    >
      <a-form-item field="userAccount" label="账号">
        <a-input v-model="form.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item field="userPassword" tooltip="密码不少于8位" label="密码">
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>

      <a-form-item>
        <a-button html-type="submit" type="primary" style="width: 120px"
          >登录
        </a-button>
        <a-link class="myLink" href="/user/register">没有账号？去注册 </a-link>
      </a-form-item>
    </a-form>
    {{ form }}
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { UserControllerService, UserLoginRequest } from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import store from "@/store";

const form = reactive({
  userAccount: "Mirror",
  userPassword: "12345678",
} as UserLoginRequest);

const router = useRouter();

const handleSubmit = async () => {
  let res = await UserControllerService.userLoginUsingPost(form);
  if (res.code === 0) {
    Message.success("登录成功");
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
.myLink {
  margin-top: 10px;
  text-decoration: none; /* 去掉下划线 */
  color: #007bff; /* 默认颜色 */
  font-weight: 500; /* 字体加粗 */
  transition: all 0.3s ease; /* 平滑过渡 */
  cursor: pointer; /* 鼠标变为手型 */
}

.myLink:hover {
  color: #0056b3; /* 悬停时的颜色 */
  text-decoration: underline; /* 悬停时添加下划线 */
}
</style>
