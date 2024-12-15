<template>
  <div id="questionListView">
    <h2>题目列表</h2>
    <a-form :model="searchParams" layout="inline" style="min-width: 240px">
      <a-form-item field="title" label="名称">
        <a-input
          v-model="searchParams.title"
          placeholder="请输入名称"
        ></a-input>
      </a-form-item>
      <a-form-item field="tag" label="标签" style="min-width: 240px">
        <a-input-tag
          v-model="searchParams.tags"
          placeholder="请输入标签"
        ></a-input-tag>
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
        pageSize: searchParams.pageSize,
        pageSizeOptions: [5, 10, 15, 20],
        current: searchParams.current,
        total: total,
        showTotal: true,
        showPageSize: true,
        showJumper: true,
      }"
    >
      <template #tags="{ record }">
        <a-tag
          v-for="(tag, index) of record.tags"
          :key="index"
          style="margin-right: 6px"
          color="purple"
          >{{ tag }}
        </a-tag>
      </template>
      <template #acceptRate="{ record }">
        {{
          (record.submitNum != 0
            ? (record.acceptedNum / record.submitNum) * 100
            : 0
          ).toFixed(2)
        }}% [{{ record.acceptedNum }}/{{ record.submitNum }}]
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD") }}
      </template>
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="doQuestionPage(record)"
            >详情
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  QuestionControllerService,
  QuestionQueryRequest,
  QuestionVO,
} from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import moment from "moment";

const dataList = ref([] as QuestionVO[]);
const total = ref(1);
const router = useRouter();
const searchParams = ref<QuestionQueryRequest>({
  title: "",
  tags: [],
  isWithRelatedData: true,
  pageSize: 5,
  current: 1,
});
onMounted(() => {
  loadData();
});
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionVoByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
    console.log("dataList.value: " + JSON.stringify(dataList.value));
  } else {
    Message.error("获取题目列表失败, " + res.message);
  }
};

const columns = [
  {
    title: "题号",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "题目名称",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "标签",
    slotName: "tags",
  },
  {
    title: "通过率",
    slotName: "acceptRate",
  },
  {
    title: "创建时间",
    slotName: "createTime",
  },
  {
    slotName: "optional",
  },
];

/**
 * 题目详情页面，去做题
 * @param question
 */
const doQuestionPage = async (question: QuestionVO) => {
  await router.push({
    path: `/question/list/${question.id}`,
  });
};
const doSearch = async () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
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
#questionListView {
  max-width: 85vw;
  background-color: #d3d3d3;
  border-radius: 10px; /* 边框弧度 */
  padding: 10px 30px;
  margin: 20px auto;
}
</style>
