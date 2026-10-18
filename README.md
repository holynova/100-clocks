# 100 Clocks · 时间实验室

时间，不止一种走法。目前收录 **11 款**网页时钟，100 是逐步填满的目标。

[在线体验](https://100-clocks.xiaosang.cc/) · [指针矩阵](https://100-clocks.xiaosang.cc/?clock=kinetic) · [逐款检查](docs/audit.md) · [性能对比](docs/performance.md)

![指针矩阵](public/previews/kinetic.jpg)

| 编号 | 时钟 | 实现 |
| --- | --- | --- |
| 01 | 指针矩阵 | 默认时分秒、360 个表盘；支持秒数开关、三秒归位与六种手动编舞。 |
| 02 | 整位滑轨 | 整位共享固定遮罩与位置；支持 Focus。 |
| 03 | 原作双轨 | Hans Andersson 的原始遮罩与位置表；支持 Focus。 |
| 04 | 字母滑轨 | 53 种字符、六字符输入与轮播；支持 Focus。 |
| 05 | 数字矩阵 | 保留原版 Matrix Clock Ultra 的主题、小时括号、秒数下划线和字体。 |
| 06 | 中文文字时钟 | 原版中文荧光文字矩阵、精度、读秒与主题。 |
| 07 | 英文文字时钟 | 独立的英文荧光文字矩阵、精度、读秒与主题。 |
| 08 | 机器人写字 | 双连杆逆运动学、擦除与逐笔书写，支持换墨和重写。 |
| 09 | 磁流体时钟 | 粒子势场聚合为数字，触摸扰动；可选秒数与液体颜色。 |
| 10 | 莫尔纹时钟 | 两层光栅错位显影，拖动与反相，支持独立秒针。 |
| 11 | 数字沙漏 | 沙粒落入数字字模，换分坍塌重组，支持秒数、颜色与重力。 |

数字矩阵及文字时钟的原始 CSS 保持一致，记录在 [restored-styles.json](docs/restored-styles.json)，测试检查其 SHA-256。仅做统一时间源、嵌入窗口适配及原有变量冲突的修复。此前移除的旧案例不再收录；08–11 为本次新增的物质与光学系列。

点选时钟进入全视窗沉浸展示，背景随主题同步。所有选项统一从右上角设置进入，手机使用底部面板。统一提供实时、演示、速度、起始时间、暂停、重播与全屏；默认演示每 3 秒前进 1 分钟。指针矩阵默认显示秒数，手机竖屏按两位一组排列；「三秒归位」以纯图标显示，从整齐排列过渡到三秒后的当前时间。旁边的「舞蹈」按钮依次播放星旋、波浪、涟漪、风车、棋盘、扇面，播放结束后自动恢复走时。正常走时没有自动轮转，未变化的指针保持不动。滑轨的 Focus 让读数占据视窗宽度的 50%，允许长轨道超出画面。集合页直接显示实时读数，固定遮罩预先计算，绘制就绪即解除加载遮罩。

## 开发

```sh
npm ci
npm run dev       # http://localhost:4179
npm run check     # 字形、原版 CSS、几何、时间源与 DOM 执行校验
npm run build     # 仅 public/ 进入 dist/
npm run deploy    # 发布到已有 Cloudflare Worker
```

原生 HTML、CSS、JavaScript，无生产运行时依赖。每次只加载一款时钟，回到目录即销毁实例。指针矩阵静止时停止绘制，后台暂停，画布像素比最高为 2。

GitHub Pages 在 main 推送后检查并部署 dist/；Cloudflare 从同一提交手动发布。目录缩略图来自实际网页截图。开发预览支持 `views/kinetic.html?preview&at=09:41:27`；加 `&profile` 可显示帧率与开销。

## 合并与来源

滑轨实现合并自 [time-slider-clock](https://github.com/holynova/time-slider-clock)，导入版本与 SHA-256 见 [imports.json](docs/imports.json)。旧滑轨线上地址分别跳转到本集合的对应版本，原仓库保留历史。

原作双轨几何归属 Hans Andersson，沿用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)，见 [ATTRIBUTION.txt](public/views/ATTRIBUTION.txt)。原版数字矩阵与文字时钟来自本仓库提交 67ba456。

分列滑轨已移出目录，旧 `?clock=slider-column` 自动进入整位滑轨。原 `?clock=word` 进入中文案例；`word-zh` 与 `word-en` 为独立案例。旧的 word-clock.html、time-slider.html、time-slider-original.html 仍跳转到对应项目。移除的运动表旧入口返回目录。

本次版本检查及手机 / Focus 截图见 [v2.3.0](docs/v2.3.0/README.md)。

六种手动编舞及安静走时检查见 [编舞验证](docs/dances/README.md)。

新增四款的设计边界、来源及验证记录见 [物质与光学系列](docs/experiments.md)。
