<template>
  <div id="questionSubmitListView">
    <h2>题目列表</h2>
    <a-form :model="searchParms" layout="inline" style="min-width: 240px">
      <a-form-item field="questionId" label="题号">
        <a-input
          :v-model="searchParms.questionId"
          placeholder="请输入题号"
        ></a-input>
      </a-form-item>
      <a-form-item field="language" label="语言" style="min-width: 240px">
        <a-select v-model="searchParms.language" placeholder="选择编程语言">
          <a-option>java</a-option>
          <a-option>python</a-option>
          <a-option>cpp</a-option>
          <a-option>go</a-option>
        </a-select>
      </a-form-item>
      <a-button type="primary" @click="doSearch">搜索</a-button>
    </a-form>
    <a-divider :size="0" />
    <a-table
      :columns="columns"
      :data="dataList"
      @page-change="doPageChange"
      @page-size-change="doPageSizeChange"
      :pagination="{
        pageSize: searchParms.pageSize,
        pageSizeOptions: [5, 10, 15, 20],
        current: searchParms.current,
        total: total,
        showTotal: true,
        showPageSize: true,
        showJumper: true,
      }"
    >
      <template #id="{ record }">
        <div v-if="record.code != null">
          <a
            :href="`/question/list/${record.id}`"
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
      <template #status="{ record }">
        <div v-if="record.status === 0">待判题</div>
        <div v-else-if="record.status === 1">判题中</div>
        <div v-else-if="record.status === 2">成功</div>
        <div v-else-if="record.status === 3">失败</div>
      </template>
      <template #questionId="{ record }">
        <a
          :href="`/question/list/${record.questionId}`"
          class="custom-link"
          v-if="record.questionId"
        >
          {{ record.questionId }}
        </a>
      </template>
      <template #judgeInfo="{ record }">
        <div v-if="record.judgeInfo.message">
          <a-tag v-if="record.judgeInfo.message == 'Accepted'" color="green">
            {{ record.judgeInfo.message }}
          </a-tag>
          <a-tag
            v-else-if="record.judgeInfo.message == 'Compile Error'"
            color="orange"
          >
            {{ record.judgeInfo.message }}
          </a-tag>
          <a-tag
            v-else-if="record.judgeInfo.message == 'System Error'"
            color="blue"
          >
            {{ record.judgeInfo.message }}
          </a-tag>
          <a-tag v-else color="red">
            {{ record.judgeInfo.message }}
          </a-tag>
        </div>
        <div v-else>
          <a-tag v-if="record.status == 0" color="gray"> Waiting </a-tag>
          <a-tag v-else-if="record.status == 1" color="orange"> Running </a-tag>
        </div>
      </template>
      <template #memory="{ record }">
        <div
          v-if="
            record.judgeInfo.memory != null &&
            record.judgeInfo.memory < 1024 * 1024
          "
        >
          <!-- 默认KB为单位-->
          {{ record.judgeInfo.memory / 1024 }} KB
        </div>
        <div v-else-if="record.judgeInfo.memory != null">
          <!-- 超过了1024KB才会转化成MB-->
          {{ (record.judgeInfo.memory / (1024 * 1024)).toFixed(2) }} MB
        </div>
      </template>
      <template #time="{ record }">
        <span v-if="record.judgeInfo && record.judgeInfo.time">
          {{ record.judgeInfo.time }} ms
        </span></template
      >
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
      <!--      <template #optional="{ record }">-->
      <!--        <a-space>-->
      <!--          <a-button type="primary" @click="doQuestionPage(record)"-->
      <!--            >详情-->
      <!--          </a-button>-->
      <!--        </a-space>-->
      <!--      </template>-->
    </a-table>
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

const dataList = ref([] as QuestionSubmitVO[]);
const total = ref(1);
const router = useRouter();
const searchParms = ref<QuestionSubmitQueryRequest>({
  questionId: undefined,
  language: undefined,
  pageSize: 5,
  current: 1,
  sortField: "createTime",
  sortOrder: "descend",
});
onMounted(() => {
  loadData();
});
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
    searchParms.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    Message.error("获取题目提交列表失败, " + res.message);
  }
};

const columns = [
  {
    title: "提交编号",
    slotName: "id",
    // dataIndex: "id",
    // key: "id",
  },
  {
    title: "编程语言",
    dataIndex: "language",
    key: "language",
  },
  {
    title: "判题状态",
    slotName: "status",
  },
  {
    title: "判题信息",
    slotName: "judgeInfo",
  },
  {
    title: "用时",
    slotName: "time",
  },
  {
    title: "内存",
    slotName: "memory",
  },
  {
    title: "题目ID",
    slotName: "questionId",
    // dataIndex: "questionId",
    // key: "questionId",
  },
  {
    title: "提交者ID",
    dataIndex: "userId",
    key: "userId",
  },
  {
    title: "创建时间",
    slotName: "createTime",
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
const doSearch = async () => {
  searchParms.value = {
    ...searchParms.value,
    current: 1,
  };
  // await loadData();
};
const doPageChange = async (pageNumber: number) => {
  searchParms.value = {
    ...searchParms.value,
    current: pageNumber,
  };
};
const doPageSizeChange = async (pageSize: number) => {
  searchParms.value = {
    ...searchParms.value,
    pageSize: pageSize,
  };
};
/**
 * 监听searchParms变量，改变时触发loadData()
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
  color: blue; /* 初始颜色 */
  text-decoration: none; /* 去掉下划线 */
}

.custom-link:hover {
  color: orange; /* 悬停颜色 */
}

.custom-link:active {
  color: blue; /* 点击后的颜色 */
}
</style>
