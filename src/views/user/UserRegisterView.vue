<template>
  <div id="userRegisterView">
    <h2>用户注册</h2>
    <a-form
      :model="form"
      style="max-width: 480px; margin: 0 auto"
      label-align="right"
      ref="formRef"
      auto-label-width
      :rules="passwordRules"
      @submit="handleSubmit"
    >
      <a-form-item
        field="userAccount"
        label="用户名"
        tooltip="该用户名将作为登录凭证,不可重复"
        show-colon
        :rules="[
          { required: true, message: '用户名不能为空' },
          { minLength: 4, message: '用户名长度不能低于四位' },
        ]"
      >
        <a-input
          v-model="form.userAccount"
          placeholder="请输入账号"
          style="
            background-color: white;
            border: 1px solid var(--color-neutral-4);
          "
        />
      </a-form-item>
      <a-form-item field="userName" label="昵称" show-colon>
        <a-input
          v-model="form.userName"
          placeholder="请输入昵称"
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
        :rules="[
          { required: true, message: '密码不能为空' },
          { minLength: 8, message: '密码长度不能低于八位' },
        ]"
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
      <!--TODO 在前端表单先验证一次密码是否一致-->
      <a-form-item
        field="checkPassword"
        tooltip="密码不少于8位"
        label="确认密码"
        show-colon
      >
        <a-input-password
          v-model="form.checkPassword"
          placeholder="请再次输入密码"
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
          <icon-user-add style="margin-right: 3px" />
          注册
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { UserControllerService, UserRegisterRequest } from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import store from "@/store";

const form = reactive({
  userAccount: "",
  userName: "",
  userPassword: "",
  checkPassword: "",
} as UserRegisterRequest);

const formRef = ref();
const router = useRouter();
const passwordRules = {
  userPassword: [
    {
      minLength: 8,
      message: "密码长度必须大于 8 位",
      trigger: "blur",
    },
    { required: true, message: "请输入新密码", trigger: "blur" },
  ],
  checkPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (value: string, cb: any) => {
        if (value !== form.userPassword) {
          cb("两次密码输入不一致");
        } else {
          cb();
        }
      },
    },
  ],
};
// const passwordRules = {
//   checkPassword: [
//     { required: true, message: "请确认新密码", trigger: "blur" },
//     {
//       validator: (value: string, cb: any) => {
//         if (value !== form.userPassword) {
//           cb("两次密码输入不一致");
//         } else {
//           cb();
//         }
//       },
//     },
//   ],
// };
const handleSubmit = async () => {
  const isValid = await formRef.value.validate();
  if (isValid !== undefined) {
    return;
  }
  let res = await UserControllerService.userRegisterUsingPost(form);
  if (res.code === 0) {
    Message.success({
      content: "注册成功",
      duration: 1000,
    });
    await store.dispatch("user/getLoginUser");
    setTimeout(() => {
      router.push({
        path: "/user/login",
        replace: true,
      });
    }, 1000); // 延迟 1 秒
  } else {
    Message.error({
      content: "注册失败, " + res.message,
      duration: 1000,
    });
  }
};
</script>

<style>
#userRegisterView {
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

.custom-input {
  background-color: white;
  border: 1px solid var(--color-neutral-4);
}
</style>
