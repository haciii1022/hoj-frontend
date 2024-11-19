<template>
  <div id="userRegisterView">
    <h2>用户注册</h2>
    <a-form
      :model="form"
      style="max-width: 480px; margin: 0 auto"
      label-align="left"
      ref="formRef"
      auto-label-width
      :rules="passwordRules"
      @submit="handleSubmit"
    >
      <a-form-item
        field="userAccount"
        label="账号"
        tooltip="该账号将作为登录凭证"
        :rules="[
          { required: true, message: '账号不能为空' },
          { minLength: 4, message: '账号长度不能低于四位' },
        ]"
      >
        <a-input v-model="form.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item field="userName" label="昵称">
        <a-input v-model="form.userName" placeholder="请输入昵称" />
      </a-form-item>
      <a-form-item
        field="userPassword"
        tooltip="密码不少于8位"
        label="密码"
        :rules="[
          { required: true, message: '密码不能为空' },
          { minLength: 8, message: '密码长度不能低于八位' },
        ]"
      >
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>
      <!--TODO 在前端表单先验证一次密码是否一致-->
      <a-form-item
        field="checkPassword"
        tooltip="密码不少于8位"
        label="确认密码"
      >
        <a-input-password
          v-model="form.checkPassword"
          placeholder="请再次输入密码"
        />
      </a-form-item>
      <a-form-item>
        <a-button html-type="submit" type="primary" style="width: 120px"
          >注册
        </a-button>
      </a-form-item>
    </a-form>
    {{ form }}
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
const handleSubmit = async () => {
  const isValid = await formRef.value.validate();
  if (isValid !== undefined) {
    return;
  }
  let res = await UserControllerService.userRegisterUsingPost(form);
  if (res.code === 0) {
    Message.success("注册成功");
    await store.dispatch("user/getLoginUser");
    router.push({
      path: "/user/login",
      replace: true,
    });
  } else {
    Message.error("注册失败, " + res.message);
  }
};
</script>

<style></style>
