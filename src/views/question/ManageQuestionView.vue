<template>
  <div id="addQuestionView">
    <h2>管理题目</h2>
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
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="doUpdate(record)">修改</a-button>

          <a-button status="danger" @click="doDelete(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  JudgeConfig,
  Question,
  QuestionControllerService,
} from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";

const dataList = ref([] as Question[]);
const total = ref(1);
const router = useRouter();
const searchParms = ref({
  pageSize: 5,
  current: 1,
});
onMounted(() => {
  loadData();
});
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionByPageUsingPost(
    searchParms.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    Message.error("获取题目列表失败, " + res.message);
  }
};

const columns = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "标题",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "内容",
    dataIndex: "content",
    key: "content",
  },
  {
    title: "标签",
    dataIndex: "tags",
    key: "tags",
  },
  {
    title: "答案",
    dataIndex: "answer",
    key: "answer",
  },
  {
    title: "提交数",
    dataIndex: "submitNum",
    key: "submitNum",
  },
  {
    title: "通过数",
    dataIndex: "acceptedNum",
    key: "acceptedNum",
  },
  {
    title: "用户ID",
    dataIndex: "userId",
    key: "userId",
  },
  {
    title: "判题用例",
    dataIndex: "judgeCase",
    key: "judgeCase",
  },
  {
    title: "时间限制",
    dataIndex: "judgeConfig.timeLimit",
    key: "timeLimit",
    // render: (text: string, record: DataRecord) => {
    //   return record.judgeConfig.timeLimit?.toString();
    // },
  },
  {
    title: "内存限制",
    dataIndex: "judgeConfig",
    key: "memoryLimit",
  },
  {
    title: "堆栈限制",
    dataIndex: "judgeConfig",
    key: "stackLimit",
  },
  {
    title: "点赞数",
    dataIndex: "thumbNum",
    key: "thumbNum",
  },
  {
    title: "收藏数",
    dataIndex: "favourNum",
    key: "favourNum",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
  },
  {
    title: "更新时间",
    dataIndex: "updateTime",
    key: "updateTime",
  },
  {
    title: "是否删除",
    dataIndex: "isDelete",
    key: "isDelete",
  },
  {
    title: "操作",
    slotName: "optional",
  },
];

const doDelete = async (question: Question) => {
  console.log("delete:", question);
  const res = await QuestionControllerService.deleteQuestionUsingPost({
    id: question.id,
  });
  if (res.code === 0) {
    Message.success("删除成功");
    loadData();
  } else {
    Message.error("删除失败," + res.message);
  }
};

const doUpdate = async (question: Question) => {
  console.log("update:", question);
  router.push({
    path: "/question/update",
    query: {
      id: question.id,
    },
  });
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
#addQuestionView {
  max-width: 85vw;
  margin: 0 auto;
}
</style>
