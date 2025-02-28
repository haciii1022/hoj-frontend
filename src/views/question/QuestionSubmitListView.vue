<template>
  <div id="questionSubmitListView">
    <div class="search-content">
      <h2>筛选条件</h2>
      <a-form :model="searchParams" layout="inline">
        <a-form-item field="questionId" label="题目编号" show-colon>
          <a-input-number
            style="
              width: 240px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            v-model="searchParams.questionId"
            placeholder="请输入题目编号"
            :hide-button="true"
            allow-clear
          >
          </a-input-number>
        </a-form-item>
        <a-form-item field="questionId" label="用户ID" show-colon>
          <a-input-number
            style="
              width: 240px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            v-model="searchParams.userId"
            placeholder="请输入用户ID"
            :hide-button="true"
            allow-clear
          ></a-input-number>
        </a-form-item>
        <a-form-item
          field="language"
          label="编程语言"
          style="min-width: 240px"
          show-colon
        >
          <a-select
            v-model="searchParams.language"
            default-value=""
            style="
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
          >
            <a-option label="所有语言" value="" />
            <a-option label="Java" value="java" />
            <a-option label="Python" value="python" />
            <a-option label="C++" value="cpp" />
            <a-option label="Golang" value="go" />
          </a-select>
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
          simple: true,
          pageSize: searchParams.pageSize,
          pageSizeOptions: [5, 10, 15, 20],
          current: searchParams.current,
          total: total,
          showTotal: true,
          showPageSize: true,
          showJumper: true,
        }"
        style="border-radius: 16px; overflow: hidden"
      >
        <template #id="{ record }">
          <div v-if="record.code != null">
            <a
              :href="`/record/detail/${record.id}`"
              class="custom-link"
              v-if="record.id"
            >
              {{ record.id }}
            </a>
          </div>
          <div v-else>
            {{ record.id }}
          </div>
        </template>
        <template #language="{ record }">
          <div>{{ formatLanguage(record.language) }}</div>
        </template>
        <template #status="{ record }">
          <div v-if="record.status === 0">待判题</div>
          <div v-else-if="record.status === 1">判题中</div>
          <div v-else-if="record.status === 2">成功</div>
          <div v-else-if="record.status === 3">失败</div>
        </template>
        <template #question="{ record }">
          <a
            :href="`/question/list/${record.questionId}`"
            class="custom-link"
            v-if="record.questionId"
          >
            <span style="font-weight: 600">P{{ record.questionId }}</span>
            &nbsp;&nbsp;{{ record.questionVO.title }}
          </a>
        </template>
        <template #judgeInfo="{ record }">
          <div v-if="record.judgeInfoList[0].message">
            <a-tag
              v-if="record.judgeInfoList[0].message == 'Accepted'"
              color="green"
            >
              {{ record.judgeInfoList[0].message }}
            </a-tag>
            <a-tag
              v-else-if="record.judgeInfoList[0].message == 'Compile Error'"
              color="orange"
            >
              {{ record.judgeInfoList[0].message }}
            </a-tag>
            <a-tag
              v-else-if="record.judgeInfoList[0].message == 'System Error'"
              color="blue"
            >
              {{ record.judgeInfoList[0].message }}
            </a-tag>
            <a-tag v-else color="red">
              {{ record.judgeInfoList[0].message }}
            </a-tag>
          </div>
          <div v-else>
            <a-tag v-if="record.status == 0" color="gray"> Waiting</a-tag>
            <a-tag v-else-if="record.status == 1" color="orange">
              Running
            </a-tag>
          </div>
        </template>
        <template #memory="{ record }">
          <div
            v-if="
              record.judgeInfoList[0].memory != null &&
              record.judgeInfoList[0].memory < 1024
            "
          >
            <!-- 默认KB为单位-->
            {{ record.judgeInfoList[0].memory }} KiB
          </div>
          <div v-else-if="record.judgeInfoList[0].memory != null">
            <!-- 超过了1024KB才会转化成MB-->
            {{ (record.judgeInfoList[0].memory / 1024).toFixed(2) }} MiB
          </div>
          <div v-else>-</div>
        </template>
        <template #time="{ record }">
          <span v-if="record.judgeInfoList[0] && record.judgeInfoList[0].time">
            {{ record.judgeInfoList[0].time }} ms
          </span>
          <span v-else> - </span>
        </template>
        <template #createTime="{ record }">
          {{ moment(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
        </template>
      </a-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  QuestionControllerService,
  QuestionSubmitQueryRequest,
  QuestionSubmitVO,
} from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import moment from "moment";

const dataList = ref<QuestionSubmitVO[]>([]);
const total = ref<number>(1);
const router = useRouter();
const searchParams = ref<QuestionSubmitQueryRequest>({
  questionId: undefined,
  language: undefined,
  pageSize: 10,
  current: 1,
  userId: undefined,
  sortField: "createTime",
  sortOrder: "descend",
});
const languageMap: Record<string, string> = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  golang: "Golang",
  // 添加其他语言
};

onMounted(() => {
  // loadData();
});
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = Number(res.data.total);
    // console.log("list: " + JSON.stringify(dataList));
  } else {
    Message.error("获取题目提交列表失败, " + res.message);
  }
};

const columns = [
  {
    title: "提交编号",
    slotName: "id",
    width: 100,
  },
  {
    title: "编程语言",
    slotName: "language",
    width: 100,
  },
  // {
  //   title: "判题状态",
  //   slotName: "status",
  // },
  {
    title: "状态",
    slotName: "judgeInfo",
    width: 200,
  },
  {
    title: "用时",
    slotName: "time",
    width: 100,
  },
  {
    title: "内存",
    slotName: "memory",
    width: 100,
  },
  {
    title: "题目",
    slotName: "question",
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: "递交者",
    dataIndex: "userVO.userName",
    width: 100,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: "递交时间",
    slotName: "createTime",
    width: 150,
  },
];

/**
 * 题目详情页面，去做题
 * @param question
 */
const doQuestionPage = async (question: QuestionSubmitVO) => {
  await router.push({
    path: `/question/list/${question.id}`,
  });
};
const formatLanguage = (lang: string) => {
  return languageMap[lang] || lang;
};
const doSearch = async () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
  console.log("searchParams.value: ", JSON.stringify(searchParams.value));
  // await loadData();
};
const doClean = async () => {
  searchParams.value = {
    ...searchParams.value,
    language: "",
    userId: undefined,
    questionId: undefined,
    current: 1,
  };
  console.log("searchParams.value: ", JSON.stringify(searchParams.value));
  // await loadData();
};
const doPageChange = async (pageNumber: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: pageNumber,
  };
};
const doPageSizeChange = async (pageSize: number) => {
  searchParams.value = {
    ...searchParams.value,
    pageSize: pageSize,
  };
};
/**
 * 监听searchParams变量，改变时触发loadData()
 */
watchEffect(() => {
  loadData();
});
</script>

<style scoped>
#questionSubmitListView {
  max-width: 1280px;
  margin: 0 auto;
}

/* 定义超链接样式 */
.custom-link {
  color: rgb(var(--arcoblue-6)); /* 初始颜色 */
  text-decoration: none; /* 去掉下划线 */
}

.custom-link:hover {
  text-decoration: underline; /* 鼠标悬停时显示下划线 */
  color: rgb(var(--red-5)); /* 悬停颜色 */
}

.custom-link:active {
  color: rgb(var(--arcoblue-7)); /* 点击后的颜色 */
}

.main-content {
  width: 100%;
  height: auto;
  border-radius: 16px; /* 边框弧度 */
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影 */
}

.search-content {
  width: calc(100% - 20px);
  height: auto;
  padding-top: 10px;
  padding-left: 20px;
  padding-bottom: 20px;
  border-radius: 16px; /* 边框弧度 */
  overflow: hidden;
  background-color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影 */
}

.custom-button {
  border-radius: 10px; /* 边框弧度 */
  margin-right: 10px;
}

:deep(.arco-table-th) {
  position: relative;
  height: 50px;
  background-color: white;
  border-bottom: 2px solid;
}

:deep(.arco-table-th)::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px; /* 阴影厚度 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 更深的阴影效果 */
  pointer-events: none; /* 确保不影响交互 */
}
</style>
