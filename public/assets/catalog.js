export const clocks=[
{id:'kinetic',name:'指针矩阵',en:'Kinetic matrix',category:'mechanical',tag:'240 个小表盘',desc:'默认 240 个小表盘，开启秒数后为 360 个。相邻指针沿数字内外两侧连接，拼出双线轮廓；空白处的指针也缓缓变换，等待下一次排列。',source:'视频参考 · 双线轮廓重写',bg:'#dedbd3'},
{id:'slider-column',name:'分列滑轨',en:'Column rails',category:'mechanical',tag:'每一列，独立滑行',desc:'把数字拆成三列，每列都有一条固定的镂空轨道。轨道上下滑动，在背光窗口交汇成此刻。保留秒数、主题和快进测试。',source:'合并自 time-slider-clock',bg:'#c6c4c5',settings:true},
{id:'slider-whole',name:'整位滑轨',en:'Whole-digit rails',category:'mechanical',tag:'一整位数字的旅行',desc:'每一位数字共用一张连续的固定遮罩。不是切换图案，而是让整张栅格沿轨道平移，找到下一位数字的位置。',source:'合并自 time-slider-clock',bg:'#c6c4c5',settings:true},
{id:'slider-dual',name:'原作双轨',en:'Original dual rails',category:'mechanical',tag:'两片遮罩，一位数字',desc:'依据 Hans Andersson 的 Time Slider 原作遮罩与位置表，一条单列轨道和一条双列轨道独立移动，组合出完整数字。衍生几何遵循 CC BY-NC-SA 4.0。',source:'Hans Andersson · 保留作者署名',bg:'#c6c4c5',settings:true},
{id:'alphabet',name:'字母滑轨',en:'Alphabet rails',category:'mechanical',tag:'时间，也可以是一句话',desc:'相同的连续镂空轨道，可以拼出数字、A–Z 与符号。保留六字符输入和轮播；在设置中切换时间或文字。',source:'合并自 time-slider-clock',bg:'#c6c4c5',settings:true},
{id:'number-matrix',name:'数字矩阵',en:'Number matrix',category:'digital',tag:'原版 · Matrix Clock Ultra',desc:'保留原版琥珀荧光、00–59 数字网格、小时括号、秒数下划线，以及主题、字体和日期设置。只做统一时间源和窗口适配。',source:'100-clocks 原版样式',bg:'#111111',settings:true},
{id:'word',name:'文字时钟',en:'Word clock',category:'digital',tag:'原版 · 荧光文字网格',desc:'保留原版中英文文字矩阵、荧光主题、分钟精度和文字读秒。通过设置切换语言、主题和精度。',source:'100-clocks 原版样式',bg:'#0a0a0c',settings:true},
].map((c,i)=>({...c,number:String(i+1).padStart(2,'0'),href:`views/${c.id}.html`,image:`previews/${c.id}.jpg`}));
