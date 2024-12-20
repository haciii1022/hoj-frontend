import type { BytemdPlugin } from "bytemd";
import { Message } from "@arco-design/web-vue";

// Helper function for copying to clipboard
const copyToClipboard = async (text: string) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      Message.success({
        content: "复制成功",
        duration: 1000, // 设置显示时间为 1 秒
      });
      console.log("当前代码已复制到剪贴板");
    } catch (err) {
      console.error("复制代码失败，请手动复制");
      console.error("复制失败!", err);
    }
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      Message.success({
        content: "复制成功",
        duration: 1000, // 设置显示时间为 1 秒
      });
      document.body.removeChild(textarea);
    } catch (err) {
      document.body.removeChild(textarea);
      console.error("无法复制到剪贴板", err);
    }
  }
};
// const copyToClipboard = (text: string): void => {
//   if (navigator.clipboard) {
//     navigator.clipboard
//       .writeText(text)
//       .catch((err) => console.error("Failed to copy text: ", err));
//   } else {
//     // Fallback for older browsers
//     const textarea = document.createElement("textarea");
//     textarea.value = text;
//     document.body.appendChild(textarea);
//     textarea.select();
//     document.execCommand("copy");
//     document.body.removeChild(textarea);
//   }
// };

// The plugin function
export const codeCopyPlugin = (): BytemdPlugin => {
  const createCopyDom = (text: string): HTMLElement => {
    const copyDom = document.createElement("div");
    copyDom.className =
      "icon-[ph--copy-bold] absolute right-2 top-2 cursor-pointer";
    copyDom.addEventListener("click", () => {
      copyToClipboard(text);
    });
    return copyDom;
  };

  return {
    viewerEffect: ({ markdownBody }) => {
      // 获取所有 code 标签
      const els = markdownBody.querySelectorAll("pre > code");
      console.log("els.length: " + els.length);
      if (els.length === 0) return;

      // 为每个 pre 元素添加按钮
      els.forEach((itm) => {
        const element = itm as HTMLElement;
        const preElement = element.parentNode as HTMLElement; // 获取父节点 pre
        if (!preElement) return;

        // 创建一个按钮
        const copyButton = document.createElement("button");
        copyButton.className = "copy-button"; // 自定义类名
        copyButton.style.position = "absolute";
        copyButton.style.top = "8px";
        copyButton.style.right = "8px";
        copyButton.style.width = "24px";
        copyButton.style.height = "24px";
        copyButton.style.border = "none";
        copyButton.style.backgroundColor = "transparent"; // 背景保持透明
        // copyButton.style.backgroundColor = "rgba(0, 0, 0, 0.05)"; // 默认浅灰色背景
        copyButton.style.borderRadius = "4px";
        copyButton.style.cursor = "pointer";
        copyButton.style.display = "flex";
        copyButton.style.alignItems = "center";
        copyButton.style.justifyContent = "center";
        copyButton.style.padding = "0";

        // 设置 SVG 图标
        copyButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="16" height="16" class="copy-icon">
    <path fill="rgba(0, 0, 0, 0.7)" d="M216 28H88a12 12 0 0 0-12 12v36H40a12 12 0 0 0-12 12v128a12 12 0 0 0 12 12h128a12 12 0 0 0 12-12v-36h36a12 12 0 0 0 12-12V40a12 12 0 0 0-12-12m-60 176H52V100h104Zm48-48h-24V88a12 12 0 0 0-12-12h-68V52h104Z"/>
  </svg>
`;

        // 添加点击事件
        copyButton.addEventListener("click", () => {
          copyToClipboard(element.innerText);
        });
        // 添加悬停效果，修改图标颜色
        copyButton.addEventListener("mouseover", () => {
          const icon = copyButton.querySelector(
            ".copy-icon path"
          ) as SVGPathElement;
          if (icon) icon.setAttribute("fill", "rgba(0, 0, 0, 15)"); // 悬停时颜色变深
        });
        copyButton.addEventListener("mouseout", () => {
          const icon = copyButton.querySelector(
            ".copy-icon path"
          ) as SVGPathElement;
          if (icon) icon.setAttribute("fill", "rgba(0, 0, 0, 0.7)"); // 恢复默认颜色
        });
        preElement.style.position = "relative"; // 确保父元素有相对定位
        preElement.appendChild(copyButton); // 将按钮添加到父元素
      });
    },
  };
};
