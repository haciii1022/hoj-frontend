<template>
  <div id="userInfoView">
    <h1 style="text-align: left">个人信息</h1>
    <div style="display: flex; flex-direction: row">
      <div class="info-container">
        <a-form :model="form" label-align="right" auto-label-width>
          <a-row :gutter="40">
            <a-col :span="14">
              <a-form-item field="userName" label="用户ID" show-colon required>
                <a-input
                  v-model="userId"
                  disabled
                  style="
                    pointer-events: none;
                    background-color: white;
                    border: 1px solid var(--color-neutral-4);
                  "
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="40">
            <a-col :span="14">
              <a-form-item field="userName" label="用户昵称" show-colon>
                <a-input
                  v-model="form.userName"
                  style="
                    background-color: white;
                    border: 1px solid var(--color-neutral-4);
                  "
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="40">
            <a-col :span="14">
              <a-form-item
                field="userName"
                label="用户密码"
                required
                show-colon
              >
                <a-input
                  default-value="**********"
                  style="
                    pointer-events: none;
                    background-color: white;
                    border: 1px solid var(--color-neutral-4);
                  "
                />
              </a-form-item>
            </a-col>
            <a-button
              class="custom-button"
              status="warning"
              style="background-color: rgb(var(--orange-1))"
              @click="() => (showPasswordModal = true)"
            >
              <icon-edit style="margin-right: 3px" />
              修改密码
            </a-button>
          </a-row>
        </a-form>
      </div>
      <div class="avatar-container" @click="changeImg">
        <a-avatar
          trigger-type="mask"
          shape="square"
          style="height: 160px; width: 160px"
        >
          <img v-if="form.userAvatar" alt="用户头像" :src="form.userAvatar" />
          <img v-else alt="暂无头像" src="@/assets/default_square_avatar.svg" />
          <template #trigger-icon>
            <IconEdit />
          </template>
        </a-avatar>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileChange"
        />
      </div>
    </div>
    <div style="text-align: left; color: #666">
      <a-form :model="form" label-align="left" layout="vertical">
        <a-row :gutter="40">
          <a-col :span="24" style="margin-bottom: 10px">
            <div style="margin: 0 0 10px 12px">用户简介</div>
            <MdEditor
              :value="form.userProfile"
              :handle-change="onProfileChange"
            />
          </a-col>
        </a-row>
      </a-form>
      <a-button
        class="custom-button"
        type="primary"
        style="background-color: rgb(var(--arcoblue-3))"
        @click="handleSubmit"
      >
        <icon-edit style="margin-right: 3px" />
        保存
      </a-button>
      <a-button
        class="custom-button"
        type="primary"
        @click="handleCancel"
        style="background-color: var(--color-neutral-6)"
      >
        <icon-undo style="margin-right: 3px" />
        取消
      </a-button>
    </div>
    <a-modal
      v-model:visible="showPasswordModal"
      title="修改密码"
      ok-text="提交"
      cancel-text="取消"
      @ok="handlePasswordSubmit"
      @cancel="handleCancelPassword"
      :ok-button-props="{
        type: 'primary',
        shape: 'round',
      }"
    >
      <template #footer>
        <a-button
          type="primary"
          @click="handleCancelPassword"
          style="background-color: var(--color-neutral-6); border-radius: 12px"
        >
          <icon-undo style="margin-right: 3px" />
          取消
        </a-button>
        <a-button
          type="primary"
          style="background-color: rgb(var(--arcoblue-3)); border-radius: 12px"
          @click="handlePasswordSubmit"
        >
          <icon-edit style="margin-right: 3px" />
          提交
        </a-button>
      </template>
      <a-form
        :model="passwordForm"
        label-align="left"
        :rules="passwordRules"
        ref="passwordFormRef"
      >
        <a-form-item field="newPassword" label="新密码" required show-colon>
          <a-input-password
            v-model="passwordForm.newPassword"
            placeholder="请输入新密码"
          />
        </a-form-item>
        <a-form-item
          field="confirmPassword"
          label="确认密码"
          required
          show-colon
        >
          <a-input-password
            v-model="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  User,
  UserControllerService,
  UserUpdateMyRequest,
} from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import MdEditor from "@/components/MdEditor.vue";

const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null); // 定义文件的ref，并指定类型
const userInfo = ref<User>();
const form = ref({
  userName: "",
  userAvatar: "",
  userProfile: "",
} as UserUpdateMyRequest);
const userId = ref<string>("");
const showPasswordModal = ref(false); // 控制弹窗的显示与隐藏
const passwordFormRef = ref();
const passwordForm = reactive({
  newPassword: "",
  confirmPassword: "",
});
const router = useRouter();
const loadData = async () => {
  const res = await UserControllerService.getUserByRequestUsingGet();
  if (res.code === 0) {
    userInfo.value = res.data;
    userId.value = res.data?.id as any;
    form.value = { ...userInfo.value };
  } else {
    Message.error("加载失败， " + res.message);
  }
};
const onProfileChange = (v: string) => {
  form.value.userProfile = v;
};
const changeImg = () => {
  // 触发文件输入元素
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    file.value = input.files[0];
    // 触发文件上传逻辑
    uploadFile(file.value);
  }
};

const handleSubmit = async () => {
  const res = await UserControllerService.updateMyUserUsingPost(form.value);
  if (res.code === 0) {
    Message.success({
      content: "保存成功",
      duration: 1000, // 设置显示时间为 1 秒
    });
    setTimeout(() => {
      router.push({
        path: "/",
      });
    }, 1000); // 延迟 1 秒
  } else {
    Message.error("提交失败， " + res.message);
  }
};
const handleCancel = async () => {
  router.push({
    path: "/",
  });
};

const uploadFile = async (file: File) => {
  // 实现文件上传逻辑
  const res = await UserControllerService.updateUserAvatarUsingPost(
    file,
    form.value.userAvatar
  );
  if (res.code === 0) {
    // 重新加载获取新头像
    // await loadData();
    // // 为了头像能够实时刷新
    // await store.dispatch("user/getLoginUser");
    Message.success("头像更新成功");
    setTimeout(() => {
      window.location.reload(); // 刷新浏览器页面
    }, 400); // 延迟 1 秒
  } else {
    Message.error("头像上传失败， " + res.message);
  }
};
const handlePasswordSubmit = async () => {
  passwordFormRef.value.validate((valid: object) => {
    console.log("status: " + JSON.stringify(valid));
    if (valid == null) {
      // 校验通过后调用 API 更新密码
      updatePassword();
    } else {
      showPasswordModal.value = true;
      Message.error("表单校验失败，请检查输入！");
    }
  });
};
const updatePassword = async () => {
  const tmpForm = {
    userPassword: passwordForm.confirmPassword,
  };
  // 调用接口提交新密码
  const res = await UserControllerService.updateMyUserUsingPost(tmpForm);
  if (res.code === 0) {
    Message.success("密码修改成功！");
    showPasswordModal.value = false; // 关闭弹窗
  } else {
    Message.error("密码修改失败，" + res.message);
  }
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};

const handleCancelPassword = () => {
  showPasswordModal.value = false; // 关闭弹窗
};
const passwordRules = {
  newPassword: [
    {
      minLength: 8,
      message: "密码长度必须大于 8 位",
      trigger: "blur",
    },
    { required: true, message: "请输入新密码", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (value: string, cb: any) => {
        if (value !== passwordForm.newPassword) {
          cb("两次密码输入不一致");
        } else {
          cb();
        }
      },
    },
  ],
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
#userInfoView {
  display: flex;
  flex-direction: column;
  width: 700px;
  height: auto;
  margin: 0 auto;
  padding: 0 30px 15px 30px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影 */
  border-radius: 16px; /* 边框弧度 */
}

.info-container {
  width: 65%;
  color: #666;
}

.avatar-container {
  width: 30%;
}

:deep(.bytemd) {
  height: 250px;
  border-radius: 8px;
}

.custom-button {
  border-radius: 12px; /* 边框弧度 */
  margin-right: 10px;
}
</style>
