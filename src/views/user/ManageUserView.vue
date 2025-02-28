<template>
  <div id="manageUserView">
    <div class="search-content">
      <h2>筛选条件</h2>
      <a-form :model="searchParams" layout="inline" style="min-width: 240px">
        <a-form-item field="userAccount" label="用户ID" show-colon>
          <a-input-number
            v-model="searchParams.id"
            placeholder="请输入用户ID"
            style="
              width: 200px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            :hide-button="true"
            allow-clear
          ></a-input-number>
        </a-form-item>
        <a-form-item field="userName" label="用户昵称" show-colon>
          <a-input
            v-model="searchParams.userName"
            placeholder="请输入用户昵称"
            style="
              width: 200px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            allow-clear
          ></a-input>
        </a-form-item>
        <a-form-item field="userRole" label="用户角色" show-colon>
          <a-select
            v-model="searchParams.userRole"
            :options="roleOptions"
            placeholder="请选择角色"
            style="
              width: 200px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            allow-clear
          />
        </a-form-item>

        <a-button
          class="custom-button"
          @click="doSearch"
          type="primary"
          style="background-color: rgb(var(--arcoblue-3))"
        >
          <icon-search style="margin-right: 3px" />
          搜索
        </a-button>
        <a-button
          class="custom-button"
          @click="doClean"
          type="primary"
          style="background-color: var(--color-neutral-6)"
        >
          <icon-eraser style="margin-right: 3px" />
          重置
        </a-button>
      </a-form>
    </div>
    <div class="main-content">
      <a-table
        :columns="columns"
        :data="dataList"
        :stripe="true"
        :hoverable="false"
        @page-change="doPageChange"
        @page-size-change="doPageSizeChange"
        :pagination="{
          pageSize: searchParams.pageSize,
          pageSizeOptions: [5, 10, 15, 20],
          current: searchParams.current,
          total: total,
          showTotal: true,
          showPageSize: true,
          showJumper: true,
          simple: true,
        }"
      >
        <!-- 修改后的角色操作按钮 -->
        <template #optional="{ record }">
          <a-popconfirm
            content="确定要重置密码吗？"
            type="warning"
            @ok="doResetPassword(record)"
          >
            <a-button size="mini" type="text">重置密码</a-button>
          </a-popconfirm>

          <a-popconfirm
            content="确定该操作吗？"
            type="warning"
            @ok="toggleUserRole(record)"
          >
            <!-- 单按钮直接切换 -->
            <a-button v-if="showRoleButton(record)" size="mini" type="text">
              {{ getToggleButtonText(record.userRole) }}
            </a-button>
          </a-popconfirm>
        </template>

        <template #userRole="{ record }">
          <a-tag :color="getRoleColor(record.userRole)">
            {{ getUserRoleName(record.userRole) }}
          </a-tag>
        </template>

        <template #createTime="{ record }">
          {{ moment(record.createTime).format("YYYY/MM/DD HH:mm") }}
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import { Message, TableColumnData } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import moment from "moment/moment";
// 请根据实际接口调整
import {
  User,
  UserControllerService,
  UserQueryRequest,
} from "../../../generated";

const dataList = ref<User[]>([]);
const total = ref(1);
const router = useRouter();

// 角色选项配置
const roleOptions = [
  { label: "普通用户", value: "user" },
  { label: "管理员", value: "admin" },
  { label: "超级管理员", value: "root" },
];
type UserRole = "admin" | "root" | "user";

// 颜色配置对象类型定义
type RoleColors = {
  [key in UserRole]: string;
};

const colors: RoleColors = {
  admin: "blue",
  root: "red",
  user: "gray",
};

const searchParams = ref<UserQueryRequest>({
  userName: "",
  userRole: undefined,
  pageSize: 10,
  current: 1,
});

const columns = [
  {
    title: "用户ID",
    dataIndex: "id",
    width: 100,
    ellipsis: true,
  },
  {
    title: "用户账号",
    dataIndex: "userAccount",
    width: 150,
    ellipsis: true,
  },
  {
    title: "用户昵称",
    dataIndex: "userName",
    width: 150,
    ellipsis: true,
  },
  {
    title: "用户角色",
    slotName: "userRole",
    width: 150,
  },
  {
    title: "创建时间",
    slotName: "createTime",
    width: 180,
  },
  {
    title: "操作",
    slotName: "optional",
    width: 200,
  },
] as TableColumnData[];

const showRoleButton = (user: User) => {
  return user.userRole !== "root";
};
// 切换角色逻辑
const toggleUserRole = (user: User) => {
  const newRole = user.userRole === "admin" ? "user" : "admin";
  updateUserRole(user, newRole);
};
// 获取按钮文案
const getToggleButtonText = (currentRole: UserRole) => {
  return currentRole === "admin" ? "降为普通用户" : "升为管理员";
};

// 数据加载
const loadData = async () => {
  try {
    const res = await UserControllerService.listUserByPageUsingPost(
      searchParams.value
    );
    if (res.code === 0) {
      dataList.value = res.data.records;
      total.value = res.data.total;
    } else {
      Message.error("获取用户列表失败: " + res.message);
    }
  } catch (e) {
    Message.error("请求异常");
  }
};

// 角色颜色映射
const getRoleColor = (role: UserRole) => {
  return colors[role];
};

// 角色名称映射
const getUserRoleName = (role: string) => {
  return roleOptions.find((r) => r.value === role)?.label || "未知角色";
};

// 重置密码
const doResetPassword = async (user: User) => {
  try {
    const res = await UserControllerService.updateUserUsingPost({
      id: user.id,
      isResetPassword: true,
    });
    if (res.code === 0) {
      Message.success("密码已重置为初始密码");
    } else {
      Message.error("操作失败: " + res.message);
    }
  } catch (e) {
    Message.error("请求异常");
  }
};

// 修改角色
const updateUserRole = async (user: User, newRole: string) => {
  try {
    const res = await UserControllerService.updateUserUsingPost({
      id: user.id,
      userRole: newRole,
    });
    if (res.code === 0) {
      Message.success("角色更新成功");
      await loadData();
    } else {
      Message.error("操作失败: " + res.message);
    }
  } catch (e) {
    Message.error("请求异常");
  }
};

// 搜索相关方法
const doSearch = () => {
  searchParams.value.current = 1;
  loadData();
};

const doClean = () => {
  searchParams.value = {
    ...searchParams.value,
    userName: "",
    id: undefined,
    userRole: undefined,
    current: 1,
  };
};

// 分页处理
const doPageChange = (current: number) => {
  searchParams.value.current = current;
};

const doPageSizeChange = (pageSize: number) => {
  searchParams.value.pageSize = pageSize;
};

// 初始化加载
onMounted(loadData);
watchEffect(loadData);
</script>

<style scoped>
#manageUserView {
  max-width: 1280px;
  margin: 0 auto;
}

.main-content {
  width: 100%;
  height: auto;
  border-radius: 16px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.search-content {
  width: calc(100% - 20px);
  height: auto;
  padding: 20px;
  border-radius: 16px;
  background-color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.custom-button {
  border-radius: 10px;
  margin-right: 10px;
}

/* 保持与题目管理页面一致的表格样式 */
:deep(.arco-table-th) {
  position: relative;
  height: 50px;
  background-color: white;
  border-bottom: 1px solid rgb(var(--gray-3));
}

:deep(.arco-table-th)::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}
</style>
