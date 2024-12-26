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
              <a-input v-model="form.id" placeholder="P1000" disabled />
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
            <a-checkbox
              style="margin-top: 30px"
              v-model="isHidden"
              :default-checked="isHidden"
            >
              隐藏
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
                <template #append> KiB</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="20">
          <a-col :span="24">
            <div style="overflow: hidden; z-index: 2; position: relative">
              <MdEditor
                :value="form.content"
                :handle-change="onContentChange"
              />
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="40" style="margin-top: 20px">
          <a-col :span="4">
            <a-button
              class="custom-button"
              type="primary"
              @click="doSubmit"
              style="background-color: rgb(var(--arcoblue-3))"
            >
              <icon-save style="margin-right: 3px" />
              {{ updatePage ? "保存" : "创建" }}
            </a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="side-content" v-if="route.query.id">
      <div class="submit-info">
        <div class="side-title">信息</div>
        <div>
          <a-row class="custom-row">
            <a-col flex="100px" class="custom-col">
              <div>上传者</div>
            </a-col>
            <a-col flex="auto">
              <div class="custom-col" style="display: flex">
                <a-avatar shape="circle">
                  <template v-if="uploadUser?.userAvatar"
                    ><img alt="avatar" :src="uploadUser.userAvatar"
                  /></template>
                  <template v-else>
                    <img alt="avatar" src="@/assets/default_avatar.svg" />
                  </template>
                </a-avatar>
                <div style="margin-left: 8px">{{ uploadUser?.userName }}</div>
              </div>
            </a-col>
          </a-row>
          <a-row class="custom-row">
            <a-col flex="100px" class="custom-col">
              <div>通过数</div>
            </a-col>
            <a-col flex="auto" class="custom-col">
              <div></div>
            </a-col>
          </a-row>
          <a-row class="custom-row">
            <a-col flex="100px" class="custom-col">
              <div>提交数</div>
            </a-col>
            <a-col flex="auto" class="custom-col">
              <div></div>
            </a-col>
          </a-row>
        </div>
      </div>
      <a-spin :loading="isLoading">
        <a-card title="判题数据" class="upload-file" :bordered="false">
          <template #extra>
            <a-button type="text" @click="addJudgeCaseGroup"
              >新增数据组
            </a-button>
          </template>
          <input
            type="file"
            accept=".in,.out"
            ref="fileInput"
            @change="handleFileUpload"
            style="display: none"
          />
          <div class="scroll-container">
            <a-card-grid
              v-for="(group, index) in judgeCaseGroupList"
              :key="index"
              style="width: 100%"
            >
              <a-card
                class="card-demo"
                :title="`数据组-${index + 1}`"
                :bordered="false"
              >
                <template #extra>
                  <a-tooltip content="一组只能有一个in文件以及out文件">
                    <a-button
                      type="text"
                      @click="triggerFileInputClick(group.id as number)"
                    >
                      <icon-upload />
                      上传文件
                    </a-button>
                  </a-tooltip>
                  <a-popconfirm
                    content="你确认要删除吗？"
                    type="warning"
                    @ok="handleDeleteGroup(group.id as number)"
                  >
                    <a-button type="text" size="mini">
                      <template #icon
                        ><img alt="删除" src="../../assets/delete.svg"
                      /></template>
                    </a-button>
                  </a-popconfirm>
                </template>
                <div
                  class="file-row"
                  v-if="group.inputFile"
                  :style="{
                    margin: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }"
                >
                  <a-link :href="OpenAPI.BASE + fileUrl + group.inputFile.id">
                    数据组-{{ index + 1 }}.in
                  </a-link>
                  <a-popconfirm
                    content="你确认要删除吗？"
                    type="warning"
                    @ok="handleDeleteFile(group.inputFile.id as number)"
                  >
                    <a-button type="text" size="mini" class="delete-button">
                      <template #icon
                        ><img alt="删除" src="../../assets/delete2.svg"
                      /></template>
                    </a-button>
                  </a-popconfirm>
                </div>
                <div
                  class="file-row"
                  v-if="group.outputFile"
                  :style="{
                    margin: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }"
                >
                  <a-link :href="OpenAPI.BASE + fileUrl + group.outputFile.id">
                    数据组-{{ index + 1 }}.out
                  </a-link>
                  <a-popconfirm
                    content="你确认要删除吗？"
                    type="warning"
                    @ok="handleDeleteFile(group.outputFile.id as number)"
                  >
                    <a-button class="delete-button" type="text" size="mini">
                      <template #icon
                        ><img alt="删除" src="../../assets/delete2.svg"
                      /></template>
                    </a-button>
                  </a-popconfirm>
                </div>
              </a-card>
            </a-card-grid>
          </div>
        </a-card>
      </a-spin>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import {
  JudgeCaseGroupVO,
  OpenAPI,
  QuestionControllerService,
  UserControllerService,
  UserVO,
} from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRoute, useRouter } from "vue-router";

const fileUrl = "/api/question/judgeCaseFile/download?fileId=";
const isHidden = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const form = ref({
  id: "0",
  isHidden: 0 as number,
  content:
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
    "```input\n" +
    "123 500\n" +
    "```\n" +
    "\n" +
    "```output\n" +
    "623\n" +
    "```\n" +
    "\n" +
    "# Limitation\n" +
    "1s, 1024KiB for each test case.\n",
  answer: "",
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
  userId: -1,
});
const uploadUser = ref<UserVO>();
let judgeCaseGroupList = ref([] as JudgeCaseGroupVO[]);
const fileInput = ref<HTMLInputElement | null>(null);
const currentGroupId = ref();
const router = useRouter();
const route = useRoute();
const formRef = ref();
//如果页面地址包含 update. 则为更新页面
const updatePage = route.path.includes("update");

const loadData = async () => {
  let id = route.query.id;
  if (!id) {
    const res = await QuestionControllerService.getNextQuestionIdUsingGet();
    if (res.code === 0) {
      form.value.id = String(res.data);
      console.log("id " + JSON.stringify(form.value));
    } else {
      Message.error("生成题目ID失败");
    }
    return;
  }
  const res1 = await QuestionControllerService.getQuestionByIdUsingGet(
    id as any
  );
  if (res1.code === 0) {
    form.value = res1.data as any;
    isHidden.value = form.value.isHidden === 1;
    console.log("isHidden.value1: " + isHidden.value);
    // form.value.id = Number(form.value.id);
    await loadJudgeCaseData(id);
    if (res1.data?.judgeConfig == null) {
      form.value.judgeConfig = {
        timeLimit: 1000,
        memoryLimit: 1000,
        stackLimit: 1000,
      };
    } else {
      // TODO 后续可以改成后端处理好返回给前端  下面的方法也是一致
      form.value.judgeConfig = JSON.parse(res1.data.judgeConfig);
    }
    if (res1.data?.judgeCase == null) {
      form.value.judgeCase = [
        {
          input: "",
          output: "",
        },
      ];
    } else {
      form.value.judgeCase = JSON.parse(res1.data.judgeCase);
    }
    if (res1.data?.tags != null) {
      form.value.tags = JSON.parse(res1.data.tags);
    }
    // console.log("data " + JSON.stringify(res1.data));
    // console.log("form " + JSON.stringify(form.value));
  } else {
    Message.error("获取数据失败");
  }
  //2024/12/25新增 获取uploadUserVO
  if (form.value.userId > 0) {
    const res2 = await UserControllerService.getUserVoByIdUsingGet(
      form.value.userId
    );
    if (res2.code === 0) {
      uploadUser.value = res2.data;
    } else {
      console.error("获取上传用户VO失败");
    }
  }
};

const loadJudgeCaseData = async (questionId: any) => {
  const res2 =
    await QuestionControllerService.getJudgeCaseGroupListByQuestionIdUsingGet(
      questionId
    );
  if (res2.code === 0) {
    judgeCaseGroupList.value = res2.data as any;
  } else {
    Message.error("获取数据失败");
  }
};

onMounted(() => {
  loadData();
});
/**
 * 因为新增和修改复用同一个组件，此处需要监听路由变化来进行数据的刷新
 */
watch(
  () => route.path,
  (newValue, oldValue) => {
    if (oldValue == undefined || newValue == undefined) return;
    if (newValue !== oldValue) {
      window.location.reload();
      return;
    }
  },
  { deep: true, immediate: true }
);
const handleDeleteFile = async (fileId: number) => {
  QuestionControllerService.deleteJudgeCaseFileUsingGet(fileId)
    .then((res) => {
      if (res.code === 0) {
        Message.success("删除成功");
        console.log("del_questionId: " + form.value.id);
        loadJudgeCaseData(form.value.id);
      } else {
        Message.error("删除失败, " + res.message);
      }
    })
    .catch((error) => {
      Message.error("删除请求失败: " + error.message);
    });
};
const handleDeleteGroup = async (groupId: number) => {
  QuestionControllerService.deleteJudgeCaseGroupUsingGet(groupId)
    .then((res) => {
      if (res.code === 0) {
        Message.success("删除成功");
        loadJudgeCaseData(form.value.id);
      } else {
        Message.error("删除失败, " + res.message);
      }
    })
    .catch((error) => {
      Message.error("删除请求失败: " + error.message);
    });
};

const onContentChange = (v: string) => {
  form.value.content = v;
};

const addJudgeCaseGroup = async () => {
  const questionId = form.value.id as any;
  const res = await QuestionControllerService.addJudgeCaseGroupUsingPost({
    questionId,
  });
  if (res.code === 0) {
    Message.success("新增成功");
    console.log("add_questionId: " + questionId);
    await loadJudgeCaseData(questionId);
  } else {
    Message.error("新增失败, " + res.message);
  }
};

const handleFileUpload = async (event: Event) => {
  //loading 开启
  isLoading.value = true;

  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    Message.warning("请选择文件后再上传！");
    return;
  }
  const file = input.files[0];
  const fileName = file.name; // 获取文件名
  const fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1); // 提取文件后缀
  console.log("文件后缀： " + fileExtension);
  // 获取文件后缀
  const type = fileExtension === "in" ? 0 : 1;
  const data = {
    questionId: form.value.id,
    groupId: currentGroupId.value,
    type: type,
  };
  const jsonData = JSON.stringify(data);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("jsonData", jsonData);
  if (!file) {
    console.error("File is not selected!");
    return;
  }
  try {
    const res = await QuestionControllerService.addJudgeCaseFileUsingPost(
      file,
      jsonData
    );
    if (res.code === 0) {
      Message.success("文件上传成功！");
      // 上传成功后刷新当前数据组列表
      const questionId = form.value.id;
      await loadJudgeCaseData(questionId);
    } else {
      Message.error(`文件上传失败: ${res.message}`);
    }
  } catch (error) {
    Message.error("文件上传失败，请重试！");
  }

  // 清空文件选择器的值，避免重复上传相同文件时事件不触发
  input.value = "";
  //loading 关闭
  isLoading.value = false;
};
const triggerFileInputClick = (groupId: number) => {
  if (fileInput.value) {
    currentGroupId.value = groupId;
    fileInput.value.click();
  }
};

const doSubmit = async () => {
  form.value.isHidden = isHidden.value ? 1 : 0;
  const isValid = await formRef.value.validate();
  if (isValid !== undefined) {
    return;
  }
  if (updatePage) {
    const res = await QuestionControllerService.updateQuestionUsingPost(
      form.value as any
    );
    if (res.code === 0) {
      Message.success({
        content: "题目更新成功",
        duration: 1000, // 设置显示时间为 1 秒
      });
      setTimeout(() => {
        // window.location.reload(); // 刷新页面
        router.push({
          path: "/question/manage",
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
      Message.success({
        content: "题目创建成功",
        duration: 1000, // 设置显示时间为 1 秒
      });
      setTimeout(() => {
        window.location.reload(); // 刷新页面
        router.push({
          path: "/question/manage",
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
  align-items: flex-start; /* 子元素高度由内容决定 */
  width: 1500px;
  margin: 0 auto;
}

.main-content {
  width: 60%;
  margin: 20px 5% 10px 15%;
  height: auto;
  border-radius: 16px; /* 边框弧度 */
  padding: 30px;
  background-color: #d3d3d3;
}

.side-content {
  width: 17%;
  margin: 20px 50px 10px 0;
  height: auto;
  display: flex;
  align-items: flex-start; /* 子元素高度由内容决定 */
  flex-direction: column;
}

.submit-info {
  border-radius: 16px; /* 边框弧度 */
  width: 100%;
  height: auto;
  padding: 14px 14px;
  margin-bottom: 40px;
  background-color: #f6f5f5;
}

.scroll-container {
  width: 100%;
  max-height: 400px; /* 限制滚动容器的高度 */
  overflow-y: auto; /* 只允许垂直滚动 */
  overflow-x: hidden; /* 禁止水平滚动（可根据需要调整） */
  padding-right: 8px; /* 避免滚动条覆盖内容 */
  padding-bottom: 5px;
}

.scroll-container::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2); /* 滚动条颜色 */
  border-radius: 4px; /* 滚动条圆角 */
}

.scroll-container::-webkit-scrollbar-track {
  background-color: transparent; /* 滚动条轨道背景 */
}

.upload-file {
  border-radius: 16px; /* 边框弧度 */
  width: 100%;
  height: auto;
  padding: 5px 15px 20px;
  margin-bottom: 10px;
  background-color: #f6f5f5;
  overflow: hidden; /* 避免其他滚动条干扰 */
  display: flex;
  flex-direction: column;
}

:deep(.bytemd) {
  height: 550px;
  border-radius: 8px;
  overflow: hidden;
}

.file-row {
  position: relative;
}

.delete-button {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.file-row:hover .delete-button {
  opacity: 1;
}

.custom-button {
  border-radius: 10px; /* 边框弧度 */
  margin-right: 10px;
}

.custom-row {
  margin-bottom: 3px;
}

.side-title {
  font-size: 24px; /* 字体大小 */
  color: #666666; /* 灰色字体 */
  margin-bottom: 15px; /* 下边距 */
  text-align: left; /* 文字左对齐 */
}

.custom-col {
  height: 30px;
  line-height: 30px;
}

:deep(.arco-avatar-circle) {
  width: 25px;
  height: 25px;
}
</style>
