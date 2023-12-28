<template>
  <div class="w-full relative p-[10px]">
    <button class="border p-[20px] mb-5" id="splitButton" @click="splitButton">
      切割图像
    </button>
    <button class="border p-[20px] mb-5 mx-2" id="splitButton" @click="confirmCropAndSave">
      确定裁剪并保存图像
    </button>
    <input
      class=""
      type="file"
      multiple
      @change="handleFileChange"
    />
    <canvas
      class="border"
      ref="canvasRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      width="500"
      height="500"
    />
  </div>
</template>

<script lang="ts" setup>
// const canvasRef = ref(null);
// const canvas = canvasRef.value;
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

const handleFileChange = async (event: { target: { files: any } }) => {
  const files = event.target.files;
  const images = Array.from(files).map((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  });

  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
  }
  const width = 500; // 固定宽度

  // 计算 canvas 的总高度,并重新绘制
  let totalHeight = 0;
  for (const image of await Promise.all(images)) {
    totalHeight += image.height * (width / image.width);
  }

  // 设置 canvas 的宽度和高度
  canvasRef.value.width = width;
  canvasRef.value.height = totalHeight;

  // 将图片绘制到 canvas 上
  let y = 0;
  for (const image of await Promise.all(images)) {
    const scaledHeight = image.height * (width / image.width);
    ctx.drawImage(image, 0, y, width, scaledHeight);
    y += scaledHeight;
  }
  saveCanvas(); // 保存当前 Canvas 状态
  drawLine();
  eventCvs();
};

let isDragging = false;
let draggingPart: "top" | "bottom" | null = null;
let isDraggingBottom = false;
let isDraggingTop = false;
let lineDraggable = true;
let line = { x1: 0, y1: 100, x2: 500, y2: 100 }; // 初始线条位置
let dragStartPoint: { y: number; x: number };
let savedImageData: object; // 用于保存 Canvas 的图像数据
let dragStartY = 0;
let topImageY = 0;
let topImage: object, bottomImage: object;
let bottomImageY = 0;
let lineY = 200; // 线条的 y 坐标位置，可根据实际情况调整

// 绘制线条的函数
const drawLine = () => {
  // ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布
  ctx.beginPath();
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  ctx.stroke();
};

// 确定是否点击了线条
const isOnLine = (x: number, y: number) => {
  const distance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const totalLength = distance(line.x1, line.y1, line.x2, line.y2);
  const toStart = distance(x, y, line.x1, line.y1);
  const toEnd = distance(x, y, line.x2, line.y2);
  return (
    totalLength >= toStart + toEnd - 5 && totalLength <= toStart + toEnd + 5
  );
};

const eventCvs = () => {
  // 处理鼠标按下事件
  canvasRef.value.addEventListener(
    "mousedown",
    (event: { clientX: number; clientY: number }) => {
      const rect = canvasRef.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (isOnLine(x, y)) {
        isDragging = true;
        dragStartPoint = { x, y };
      }
    }
  );

  // 处理鼠标移动事件
  canvasRef.value.addEventListener(
    "mousemove",
    (event: { clientY: number }) => {
      if (isDragging) {
        const rect = canvasRef.value.getBoundingClientRect();
        // const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // const dx = x - dragStartPoint.x;
        const dy = y - dragStartPoint.y;

        restoreCanvas(); // 恢复到保存的状态
        // line.x1 += dx;
        line.y1 += dy;
        // line.x2 += dx;
        line.y2 += dy;
        lineY = y;

        // dragStartPoint = { x, y };
        dragStartPoint = { x: dragStartPoint.x, y: y };
        drawLine();
      }
    }
  );

  // 处理鼠标释放事件
  canvasRef.value.addEventListener("mouseup", () => {
    isDragging = false;
    // saveCanvas(); // 拖动结束后再次保存 Canvas 状态（更新为包含新线条的状态）
  });
};

// 保存当前 Canvas 的状态
const saveCanvas = () => {
  savedImageData = ctx.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height);
};

// 恢复保存的 Canvas 状态
const restoreCanvas = () => {
  ctx.putImageData(savedImageData, 0, 0);
};

// 保存并切割图像
const splitAndSaveImages = () => {
  // 确保 canvas 和 ctx 都是有效的
  if (!canvasRef.value || !ctx) return;

  // 保存并切割图像
  savedImageData = ctx.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height);
  topImage = ctx.getImageData(0, 0, canvasRef.value.width, lineY);
  bottomImage = ctx.getImageData(0, lineY, canvasRef.value.width, canvasRef.value.height - lineY);
  bottomImageY = lineY;
  redrawImages();
};

// 重绘图像
const redrawImages = () => {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  if (topImage) ctx.putImageData(topImage, 0, topImageY);
  if (bottomImage) ctx.putImageData(bottomImage, 0, bottomImageY);
};

const splitButton = () => {
  splitAndSaveImages();
};

const handleMouseDown = (event: MouseEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect();
  const y = event.clientY - (rect?.top ?? 0);

  // 如果线条不可拖动，则只处理图像的拖动
  if (!lineDraggable) {
     // 判断点击的是上半部分图像还是下半部分图像
    if (y >= topImageY && y <= topImageY + lineY) {
      isDragging = true;
      draggingPart = "top";
      dragStartY = y - topImageY;
    } else if (y >= bottomImageY && y <= canvasRef.value?.height) {
      isDragging = true;
      draggingPart = "bottom";
      dragStartY = y - bottomImageY;
    }
  }
};


const handleMouseMove = (event: MouseEvent) => {
  if (isDragging && draggingPart && ctx) {
    const rect = canvasRef.value?.getBoundingClientRect();
    const newY = event.clientY - (rect?.top ?? 0) - dragStartY;

    if (draggingPart === 'top') {
      topImageY = Math.max(0, Math.min(newY, lineY));
    } else if (draggingPart === 'bottom') {
      bottomImageY = Math.max(lineY, Math.min(newY, 500 - lineY));
    }

    topImage = ctx.getImageData(0, 0, 500, lineY);
    bottomImage = ctx.getImageData(0, lineY, 500, 500 - lineY);
    // 重新绘制图像
    redrawImages();
  }
};

// 确定裁剪并保存图像
const confirmCropAndSave = () => {
  // 禁止线条拖动
  lineDraggable = false;

  // 保存裁剪后的图像（不包含线条）
  // ...保存逻辑...
  
};

// 在需要的时候，重新启用线条拖动
const enableLineDragging = () => {
  lineDraggable = true;
};

const handleMouseUp = () => {
  isDragging = false;
  draggingPart = null;
};
</script>
