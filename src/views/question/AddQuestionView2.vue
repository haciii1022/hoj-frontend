<template>
  <div id="addQuestionView">
    <div class="main-content">
      <a-form :model="form" label-align="left" layout="vertical" ref="formRef">
        <a-row :gutter="40">
          <a-col :span="6">
            <a-form-item
              field="id"
              label="题目ID"
              required
              style="user-select: none"
            >
              <a-input :v-model="form.id" placeholder="P1000" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="title"
              label="标题"
              :rules="[{ required: true, message: '标题不能为空' }]"
              :validate-trigger="['blur']"
            >
              <a-input
                v-model="form.title"
                placeholder="请输入标题"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-checkbox style="margin-top: 30px" :value="form.title"
              >隐藏
            </a-checkbox>
          </a-col>
        </a-row>
        <a-row :gutter="20">
          <a-col :span="18">
            <a-form-item field="data.tags" tooltip="请输入标签" label="标签">
              <a-input-tag
                v-model="form.tags"
                placeholder="请输入标签"
                allow-clear
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="40">
          <a-col :span="6">
            <a-form-item
              field="judgeConfig.timeLimit"
              label="时间限制"
              label-col-flex="200px"
              :rules="[{ required: true, message: '时间限制不能为空' }]"
            >
              <a-input-number
                v-model="form.judgeConfig.timeLimit"
                placeholder="请输入"
                :min="0"
              >
                <template #append> ms</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item
              field="judgeConfig.memoryLimit"
              label="内存限制"
              :rules="[{ required: true, message: '内存限制不能为空' }]"
            >
              <a-input-number
                v-model="form.judgeConfig.memoryLimit"
                placeholder="请输入"
                :min="0"
              >
                <template #append> KB</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="40">
          <a-col :span="24">
            <MdEditor :value="form.answer" :handle-change="onAnswerChange" />
          </a-col>
        </a-row>
        <a-row :gutter="40" style="margin-top: 20px">
          <a-col :span="4">
            <a-button type="primary" @click="doSubmit">创建</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="side-content">
      {{ form }}
      <div class="submit-info"></div>
      <div class="upload-file"></div>
      <div class="upload-file"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import { QuestionControllerService } from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRoute, useRouter } from "vue-router";

let form = ref({
  id: 0,
  answer:
    "# Background\n" +
    "Special for beginners, ^_^\n" +
    "\n" +
    "# Description\n" +
    "Given two integers x and y, print the sum.\n" +
    "\n" +
    "# Format\n" +
    "\n" +
    "## Input\n" +
    "Two integers x and y, satisfying $0\\leq x,y\\leq 32767$ .\n" +
    "\n" +
    "## Output\n" +
    "One integer, the sum of x and y.\n" +
    "\n" +
    "# Samples\n" +
    "\n" +
    "```input1\n" +
    "123 500\n" +
    "```\n" +
    "\n" +
    "```output1\n" +
    "623\n" +
    "```\n" +
    "\n" +
    "# Limitation\n" +
    "1s, 1024KiB for each test case.\n",
  content: "",
  tags: [],
  title: "",
  judgeConfig: {
    timeLimit: 1000,
    memoryLimit: 1000,
    stackLimit: 0,
  },
  judgeCase: [
    {
      input: "",
      output: "",
    },
  ],
});
const router = useRouter();
const route = useRoute();
const formRef = ref();
//如果页面地址包含 update. 则为更新页面
const updatePage = route.path.includes("update");

const lodaData = async () => {
  let id = route.query.id;
  if (!id) {
    return;
  }
  const res = await QuestionControllerService.getQuestionByIdUsingGet(
    id as any
  );
  if (res.code === 0) {
    form.value = res.data as any;
    if (res.data?.judgeConfig == null) {
      form.value.judgeConfig = {
        timeLimit: 1000,
        memoryLimit: 1000,
        stackLimit: 1000,
      };
    } else {
      // TODO 后续可以改成后端处理好返回给前端  下面的方法也是一致
      form.value.judgeConfig = JSON.parse(res.data.judgeConfig);
    }
    if (res.data?.judgeCase == null) {
      form.value.judgeCase = [
        {
          input: "",
          output: "",
        },
      ];
    } else {
      form.value.judgeCase = JSON.parse(res.data.judgeCase);
    }
    if (res.data?.tags != null) {
      form.value.tags = JSON.parse(res.data.tags);
    }
    console.log("data " + JSON.stringify(res.data));
    console.log("form " + JSON.stringify(form.value));
  } else {
    Message.error("获取数据失败");
  }
};
onMounted(() => {
  lodaData();
});
const handleAdd = () => {
  form.value.judgeCase?.push({
    input: "",
    output: "",
  });
};
const handleDelete = (index: number) => {
  form.value.judgeCase?.splice(index, 1);
};

const onAnswerChange = (v: string) => {
  form.value.answer = v;
};

const onContentChange = (v: string) => {
  form.value.content = v;
};

const doSubmit = async () => {
  console.log(JSON.stringify(form));
  const isValid = await formRef.value.validate();
  if (isValid !== undefined) {
    return;
  }
  if (updatePage) {
    const res = await QuestionControllerService.updateQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      Message.success("题目更新成功");
      setTimeout(() => {
        window.location.reload(); // 刷新页面
        router.push({
          path: "/question/add2",
          replace: true,
        });
      }, 1000); // 延迟1秒
    } else {
      Message.error("更新失败, " + res.message);
    }
  } else {
    const res = await QuestionControllerService.addQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      Message.success("题目创建成功");
      setTimeout(() => {
        window.location.reload(); // 刷新页面
        router.push({
          path: "/question/add",
          replace: true,
        });
      }, 1000); // 延迟1秒
    } else {
      Message.error("创建失败, " + res.message);
    }
  }
};
</script>

<style scoped>
#addQuestionView {
  display: flex;
  width: 1500px;
  margin: 0 auto;
}

.main-content {
  width: 60%;
  margin: 20px 5% 10px 15%;
  height: 850px;
  border-radius: 16px; /* 边框弧度 */
  padding: 30px;
  background-color: #d3d3d3;
}

.side-content {
  border-radius: 16px; /* 边框弧度 */
  padding: 0 30px;
  width: 20%;
  margin: 20px 50px 10px 0;
  height: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center; /* 垂直居中 */
}

.submit-info {
  border-radius: 16px; /* 边框弧度 */
  width: 100%;
  height: 300px;
  margin-bottom: 40px;
  background-color: #d3d3d3;
}

.upload-file {
  border-radius: 16px; /* 边框弧度 */
  width: 100%;
  height: 400px;
  margin-bottom: 40px;
  background-color: #d3d3d3;
}

:deep(.bytemd) {
  height: 550px;
  border-radius: 8px;
}
</style>
