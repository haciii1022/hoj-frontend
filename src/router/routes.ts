import { RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import NoAuthView from "@/views/NoAuthView.vue";
import ACCESS_ENUM from "@/access/accessEnum";
import UserLayout from "@/layouts/UserLayout.vue";
import UserLoginView from "@/views/user/UserLoginView.vue";
import UserRegisterView from "@/views/user/UserRegisterView.vue";
import AddQuestionView from "@/views/question/AddQuestionView.vue";
import ManageQuestionView from "@/views/question/ManageQuestionView.vue";
import QuestionListView from "@/views/question/QuestionListView.vue";
import ScanQuestionView from "@/views/question/ScanQuestionView.vue";
import QuestionSubmitView from "@/views/question/QuestionSubmitListView.vue";
import AddQuestionView2 from "@/views/question/AddQuestionView2.vue";
import UserInfoView from "@/views/user/UserInfoView.vue";
import QuestionSubmitDetailView from "@/views/question/QuestionSubmitDetailView.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/user/login",
    name: "用户",
    component: UserLayout,
    meta: {
      hideInMenu: true,
    },
    children: [
      {
        path: "/user/login",
        name: "用户注册",
        component: UserLoginView,
      },
      {
        path: "/user/register",
        name: "用户登录",
        component: UserRegisterView,
      },
      {
        path: "/user/info",
        name: "个人信息",
        component: UserInfoView,
      },
    ],
  },
  {
    path: "/",
    name: "主页",
    component: HomeView,
  },
  {
    path: "/question/list",
    name: "题库",
    component: QuestionListView,
  },
  {
    path: "/question/list/:id",
    name: "在线做题",
    props: true,
    component: ScanQuestionView,
    meta: {
      access: ACCESS_ENUM.USER,
      hideInMenu: true,
    },
  },
  {
    path: "/question/add",
    name: "新增题目",
    component: AddQuestionView,
    meta: {
      hideInMenu: true,
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/question/add",
    name: "新增题目",
    component: AddQuestionView2,
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/question/update",
    name: "更新题目",
    component: AddQuestionView2,
    meta: {
      access: ACCESS_ENUM.ADMIN,
      hideInMenu: true,
    },
  },
  {
    path: "/question/manage",
    name: "管理题目",
    component: ManageQuestionView,
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/record/list",
    name: "提交记录",
    component: QuestionSubmitView,
  },
  {
    path: "/record/detail/:id",
    name: "判题详情",
    props: true,
    component: QuestionSubmitDetailView,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: "/noAuth",
    name: "无权限",
    component: NoAuthView,
    meta: {
      hideInMenu: true,
    },
  },
  // {
  //   path: "/admin",
  //   name: "管理员可见",
  //   component: AdminView,
  //   meta: {
  //     access: ACCESS_ENUM.ADMIN,
  //   },
  // },
  // {
  //   path: "/about",
  //   name: "关于我的",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  // },
];
