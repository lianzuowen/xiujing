/* 新修嘉兴大藏经 · 交互原型（修正版）
 * 修正要点：
 *  1) 4 Tab：首页 / 经目 / 公开 / 我的
 *  2) 经目下二级切换：阅藏指南 / 经书目录
 *  3) 公开页三个模块：进度 / 资金 / 功德簿（已移除赠书）
 *  4) 我的页：积分明细、扫码推荐（拉新奖励闭环）、荣誉证书、我的功德、专项咨询
 *  5) 认捐 4 步闭环：注册 → 协议+签名 → 金额+留言+支付 → 证书+积分到账
 *  6) 申请藏经编辑 / 赠书功能均已移除
 *  7) 开屏页：进入小程序前的精美启动页
 *  8) 每部经书带 stage（阶段）字段，可预览封面 / 目录 / 一页正文
 *  9) 认捐金额 = 页数 × 200 元（修一页费用固定 200 元）
 * 10) 小程序名称改为"新修嘉兴大藏经"
 */

const STAGES = [
  { code: 'todo', label: '待开始', desc: '排入编纂计划' },
  { code: 'doing', label: '断句 / 编辑中', desc: '正在断句或文字编辑' },
  { code: 'review', label: '复核 / 定稿中', desc: '专家团队复核中' },
  { code: 'done', label: '已圆满', desc: '已上版排版' }
];

const PER_PAGE_PRICE = 200;

const books = [
  {
    id: 'JX-0012', title: '大方廣佛華嚴經', section: '经藏', volume: '四十卷', status: '已圆满', progress: 100,
    pages: 718, amount: 143600,
    summary: '以毗卢遮那佛为中心，开显法界缘起与菩萨行愿。',
    stage: 'done',
    toc: [
      ['卷一·世主妙严品', '已上版'], ['卷二·如来现相品', '已上版'],
      ['卷三·普贤三昧品', '已上版'], ['卷四·世界成就品', '已上版'],
      ['卷五·华藏世界品', '已上版']
    ],
    sample: '如是我闻。一时，佛在摩竭提国寂灭道场，始成正觉。其地坚固，金刚所成，上妙宝轮，及众宝华，清净摩尼，以为严饰。'
  },
  {
    id: 'JX-0047', title: '妙法莲华经', section: '经藏', volume: '七卷', status: '已圆满', progress: 100,
    pages: 210, amount: 210 * PER_PAGE_PRICE,
    summary: '阐明一乘真实、开权显实，是汉传佛教重要经典。',
    stage: 'done',
    toc: [
      ['卷一·序品', '已上版'], ['卷二·方便品', '已上版'],
      ['卷三·譬喻品', '已上版'], ['卷四·信解品', '已上版'],
      ['卷五·安乐行品', '已上版'], ['卷六·寿量品', '已上版'],
      ['卷七·普贤菩萨劝发品', '已上版']
    ],
    sample: '尔时，佛放眉间白毫相光，照东方万八千世界，靡不周遍，下至阿鼻地狱，上至阿迦尼吒天。'
  },
  {
    id: 'JX-0001', title: '佛说菩萨十住经', section: '经藏', volume: '一卷', status: '可认捐', progress: 0,
    pages: 5, amount: 5 * PER_PAGE_PRICE,
    summary: '佛说菩萨十住之法，明发心、住生、修行、具足等十阶位。',
    stage: 'todo',
    toc: [
      ['发心住', '待开始'], ['治地住', '待开始'],
      ['修行住', '待开始'], ['生贵住', '待开始'],
      ['方便具足住', '待开始']
    ],
    sample: '闻如是。一时，佛在罗阅祇耆阇崛山中，与大比丘众千二百五十人俱。尔时，佛告诸比丘言：汝等当知，菩萨有十住。'
  },
  {
    id: 'JX-0231', title: '金刚般若波罗蜜经', section: '般若部', volume: '一卷', status: '已圆满', progress: 100,
    pages: 28, amount: 28 * PER_PAGE_PRICE,
    summary: '以般若智慧破除执著，示无住生心之要义。',
    stage: 'done',
    toc: [
      ['法会因由分', '已上版'], ['善现启请分', '已上版'],
      ['大乘正宗分', '已上版'], ['妙行无住分', '已上版'],
      ['如理实见分', '已上版'], ['庄严净土分', '已上版'],
      ['应化非真分', '已上版']
    ],
    sample: '如是我闻。一时，佛在舍卫国祇树给孤独园，与大比丘众千二百五十人俱。尔时，世尊食时，著衣持钵，入舍卫大城乞食。'
  },
  {
    id: 'JX-0528', title: '楞严经正脉疏', section: '续藏', volume: '十卷', status: '可认捐', progress: 25,
    pages: 360, amount: 360 * PER_PAGE_PRICE,
    summary: '明代交光真鉴法师著，对楞严经义理作系统疏释。',
    stage: 'doing',
    toc: [
      ['卷一·序分', '已上版'], ['卷二·正宗分之始', '编辑中'],
      ['卷三·七处征心', '断句中'], ['卷四·十番显见', '待开始'],
      ['卷五·佛敕文殊', '待开始']
    ],
    sample: '大佛顶首楞严经者，乃如来藏心之显诠，妙真如性之正轨也。盖此一经，因阿难之请起于世尊之座，演三藏之精微，破七处之妄心。'
  },
  {
    id: 'JX-1106', title: '五灯会元', section: '史传部', volume: '二十卷', status: '待领取', progress: 12,
    pages: 480, amount: 480 * PER_PAGE_PRICE,
    summary: '辑录禅宗五家七宗历代祖师机缘语要。',
    stage: 'todo',
    toc: [
      ['卷一·七佛', '排期中'], ['卷二·西天祖师', '排期中'],
      ['卷三·东土祖师', '排期中'], ['卷四·南岳怀让', '排期中'],
      ['卷五·青原行思', '排期中'], ['……', '排期中']
    ],
    sample: '世尊在灵山会上，拈花示众，是时众皆默然，唯迦叶尊者破颜微笑。世尊曰：吾有正法眼藏，涅槃妙心，实相无相，微妙法门，不立文字，教外别传，付嘱摩诃迦叶。'
  },
  {
    id: 'JX-2278', title: '憨山老人梦游集', section: '中国撰述', volume: '五十五卷', status: '可认捐', progress: 18,
    pages: 1100, amount: 1100 * PER_PAGE_PRICE,
    summary: '汇集憨山德清大师诗文、开示、书信与佛学论述。',
    stage: 'doing',
    toc: [
      ['卷一·法语', '已上版'], ['卷二·示众', '编辑中'],
      ['卷三·开示', '断句中'], ['卷四·书信', '待开始'],
      ['卷五·序跋', '待开始'], ['卷六·塔铭', '待开始'],
      ['卷七·游记', '待开始'], ['卷八·诗文', '待开始']
    ],
    sample: '佛法广大如虚空，智慧圆满如杲日。苟非真参实悟，直下担当，未有不望涯而退者也。老人出家以来，四十年中，几番遭难，几番灰心。'
  },
  // —— 以下为目录扩展：增加更多「可认捐」经书，承接《新修嘉興大藏經》编修体例 ——
  {
    id: 'JX-0103', title: '大宝积经', section: '宝积部', volume: '四十九卷', status: '可认捐', progress: 6,
    pages: 980, amount: 980 * PER_PAGE_PRICE,
    summary: '大乘宝积经典汇编，广宣如来藏与菩萨万行。',
    stage: 'doing',
    toc: [
      ['卷一·三律仪会', '已上版'], ['卷二·无边庄严会', '编辑中'],
      ['卷三·密迹金刚力士会', '断句中'], ['卷四·净信童女会', '待开始'],
      ['卷五·无量寿如来会', '待开始']
    ],
    sample: '如是我闻。一时，佛在王舍城耆阇崛山中，与大比丘众五千人俱，皆得阿罗汉果。'
  },
  {
    id: 'JX-0186', title: '维摩诘所说经', section: '经藏', volume: '三卷', status: '可认捐', progress: 0,
    pages: 60, amount: 60 * PER_PAGE_PRICE,
    summary: '以维摩居士示疾因缘，广演不二法门与净佛国土之旨。',
    stage: 'todo',
    toc: [
      ['卷上·佛国品', '待开始'], ['卷中·入不二法门品', '待开始'],
      ['卷下·香积佛品', '待开始']
    ],
    sample: '如是我闻。一时，佛在毗耶离庵罗树园，与大比丘众八千人俱，菩萨三万二千。'
  },
  {
    id: 'JX-0309', title: '大智度论', section: '释经论部', volume: '一百卷', status: '可认捐', progress: 3,
    pages: 2000, amount: 2000 * PER_PAGE_PRICE,
    summary: '龙树菩萨释《大般若经》之要论，抉择空义，旁通三藏。',
    stage: 'doing',
    toc: [
      ['卷一·缘起论', '已上版'], ['卷二·释初品', '编辑中'],
      ['卷三·释摩诃萨', '断句中'], ['卷四·释三波罗蜜', '待开始'],
      ['卷五·释舍利弗', '待开始']
    ],
    sample: '智度大道佛一切智本，度一切诸佛之智本。本愿誓坚固，事究竟不可坏。'
  },
  {
    id: 'JX-0417', title: '六祖坛经', section: '中国撰述', volume: '一卷', status: '可认捐', progress: 0,
    pages: 22, amount: 22 * PER_PAGE_PRICE,
    summary: '惠能大师于韶州大梵寺开示，弟子法海集录，南宗禅根本经典。',
    stage: 'todo',
    toc: [
      ['自序品', '待开始'], ['般若品', '待开始'],
      ['疑问品', '待开始'], ['定慧品', '待开始'],
      ['坐禅品', '待开始'], ['忏悔品', '待开始']
    ],
    sample: '善知识！菩提自性，本来清净；但用此心，直了成佛。'
  },
  {
    id: 'JX-0562', title: '法华玄义释签', section: '释经论部', volume: '二十卷', status: '可认捐', progress: 0,
    pages: 400, amount: 400 * PER_PAGE_PRICE,
    summary: '湛然大师释《法华玄义》之释签，发挥天台圆教观门。',
    stage: 'todo',
    toc: [
      ['卷一·释名', '待开始'], ['卷二·辨体', '待开始'],
      ['卷三·明宗', '待开始'], ['卷四·论用', '待开始'],
      ['卷五·判教', '待开始']
    ],
    sample: '夫法华妙义，统摄一代圣教，开示悟入佛之知见。'
  },
  {
    id: 'JX-0648', title: '华严经探玄记', section: '释经论部', volume: '二十卷', status: '可认捐', progress: 12,
    pages: 420, amount: 420 * PER_PAGE_PRICE,
    summary: '法藏大师释《大方广佛华严经》之纲要，明十玄六相之奥义。',
    stage: 'doing',
    toc: [
      ['卷一·释名', '已上版'], ['卷二·辨义', '编辑中'],
      ['卷三·释分齐', '断句中'], ['卷四·释修证', '待开始'],
      ['卷五·释地位', '待开始']
    ],
    sample: '大方广佛华严经者，乃毗卢遮那如来，于菩提场初成正觉，称性所演之法界大经。'
  },
  {
    id: 'JX-0735', title: '俱舍论颂', section: '释经论部', volume: '三十卷', status: '可认捐', progress: 0,
    pages: 600, amount: 600 * PER_PAGE_PRICE,
    summary: '世亲菩萨造，概括法相有部之根本教义，明诸法自性与缘起。',
    stage: 'todo',
    toc: [
      ['卷一·分别界品', '待开始'], ['卷二·分别根品', '待开始'],
      ['卷三·分别世间品', '待开始'], ['卷四·分别业品', '待开始'],
      ['卷五·分别随眠品', '待开始']
    ],
    sample: '诸一切种诸法体性，略有三种：一者、染污，二者、洁白，三者、无记。'
  },
  {
    id: 'JX-0892', title: '百丈清规', section: '中国撰述', volume: '十卷', status: '可认捐', progress: 0,
    pages: 200, amount: 200 * PER_PAGE_PRICE,
    summary: '百丈怀海禅师立丛林清规，为后世寺院生活与修行之规范。',
    stage: 'todo',
    toc: [
      ['卷一·祝厘', '待开始'], ['卷二·报恩', '待开始'],
      ['卷三·报本', '待开始'], ['卷四·尊祖', '待开始'],
      ['卷五·住持', '待开始']
    ],
    sample: '丛林以无事为兴盛，修行以放下为安乐。'
  },
  {
    id: 'JX-1024', title: '梵网经菩萨戒', section: '律藏', volume: '二卷', status: '可认捐', progress: 0,
    pages: 36, amount: 36 * PER_PAGE_PRICE,
    summary: '卢舍那佛为初地菩萨说十重四十八轻戒，为汉传大乘戒律根本。',
    stage: 'todo',
    toc: [
      ['卷上·释十重戒', '待开始'], ['卷下·释四十八轻戒', '待开始']
    ],
    sample: '若佛子。受菩萨戒者。应当发愿。愿一切众生皆得成佛。'
  },
  {
    id: 'JX-1352', title: '释净土群疑论', section: '中国撰述', volume: '六卷', status: '可认捐', progress: 0,
    pages: 120, amount: 120 * PER_PAGE_PRICE,
    summary: '窥基法师撰，释净土法门之群疑，明西方极乐与他方佛国之旨。',
    stage: 'todo',
    toc: [
      ['卷一·释净土缘起', '待开始'], ['卷二·释九品往生', '待开始'],
      ['卷三·释三辈差别', '待开始'], ['卷四·释临终瑞应', '待开始']
    ],
    sample: '西方极乐世界，去此十万亿佛刹，唯信愿念佛，乃得往生。'
  },
  {
    id: 'JX-1489', title: '肇论', section: '中国撰述', volume: '三卷', status: '可认捐', progress: 0,
    pages: 60, amount: 60 * PER_PAGE_PRICE,
    summary: '僧肇大师以般若中道之理，抉择有无、体用、名实之关捩。',
    stage: 'todo',
    toc: [
      ['卷上·物不迁论', '待开始'], ['卷中·不真空论', '待开始'],
      ['卷下·涅槃无名论', '待开始']
    ],
    sample: '夫缘起之法，无我我所；本无所住，谓之真如。'
  },
  {
    id: 'JX-1602', title: '瑜伽师地论', section: '瑜伽部', volume: '一百卷', status: '可认捐', progress: 0,
    pages: 1900, amount: 1900 * PER_PAGE_PRICE,
    summary: '弥勒菩萨说，无著菩萨记，统摄大乘瑜伽行派修行阶位。',
    stage: 'todo',
    toc: [
      ['卷一·本地分', '待开始'], ['卷二·摄决择分', '待开始'],
      ['卷三·摄释分', '待开始'], ['卷四·摄异门分', '待开始'],
      ['卷五·摄事分', '待开始']
    ],
    sample: '云何瑜伽？谓奢摩他、毗钵舍那，二者平等双运，是名瑜伽。'
  },
  {
    id: 'JX-1745', title: '宗镜录', section: '中国撰述', volume: '一百卷', status: '可认捐', progress: 0,
    pages: 2100, amount: 2100 * PER_PAGE_PRICE,
    summary: '永明延寿禅师集三宗之旨，归宗于一心，照万法如镜。',
    stage: 'todo',
    toc: [
      ['卷一·标宗章', '待开始'], ['卷二·问答章', '待开始'],
      ['卷三·引证章', '待开始'], ['卷四·释义章', '待开始']
    ],
    sample: '一心为宗，照万法如镜；镜智为体，显十界如珠。'
  },
  {
    id: 'JX-1923', title: '南海寄归内法传', section: '史传部', volume: '四卷', status: '可认捐', progress: 0,
    pages: 80, amount: 80 * PER_PAGE_PRICE,
    summary: '义净三藏记述印度南海诸国所行之佛教内法与受戒轨则。',
    stage: 'todo',
    toc: [
      ['卷一·受戒轨则', '待开始'], ['卷二·衣食轨则', '待开始'],
      ['卷三·礼拜轨则', '待开始'], ['卷四·讲习轨则', '待开始']
    ],
    sample: '凡出家者，当先求戒师，虔心请法，如法受得清净戒体。'
  },
  {
    id: 'JX-2087', title: '原人论', section: '中国撰述', volume: '一卷', status: '可认捐', progress: 0,
    pages: 14, amount: 14 * PER_PAGE_PRICE,
    summary: '宗密大师撰，会通儒道二教，明佛法人天之正理。',
    stage: 'todo',
    toc: [
      ['斥迷执', '待开始'], ['斥偏浅', '待开始'],
      ['直显真源', '待开始'], ['会通本末', '待开始']
    ],
    sample: '万物皆因缘和合而生，本无自性，当体即空。'
  },
  {
    id: 'JX-2216', title: '三论玄义', section: '释经论部', volume: '二卷', status: '可认捐', progress: 0,
    pages: 40, amount: 40 * PER_PAGE_PRICE,
    summary: '吉藏大师释三论（般若、中论、百论）之大义，破邪显正。',
    stage: 'todo',
    toc: [
      ['卷上·释般若', '待开始'], ['卷下·释中百论', '待开始']
    ],
    sample: '一切法无自性，故名之为空；空亦复空，名为毕竟空。'
  },
  {
    id: 'JX-2394', title: '大乘起信论', section: '释经论部', volume: '一卷', status: '可认捐', progress: 0,
    pages: 24, amount: 24 * PER_PAGE_PRICE,
    summary: '马鸣菩萨造，明大乘起信之理，开示真如门与生灭门之义。',
    stage: 'todo',
    toc: [
      ['作意起信', '待开始'], ['真如门', '待开始'],
      ['生灭门', '待开始'], ['对治邪执', '待开始'],
      ['修行信心', '待开始']
    ],
    sample: '一切众生，从无始来，皆因妄念熏习，而有种种颠倒执著。'
  },
  {
    id: 'JX-2518', title: '成唯识论', section: '唯识部', volume: '十卷', status: '可认捐', progress: 0,
    pages: 200, amount: 200 * PER_PAGE_PRICE,
    summary: '护法等十师释，世亲菩萨造《唯识三十颂》之论，明万法唯识之理。',
    stage: 'todo',
    toc: [
      ['卷一·释三十颂', '待开始'], ['卷二·明种子', '待开始'],
      ['卷三·明现行', '待开始'], ['卷四·明转依', '待开始'],
      ['卷五·明修证', '待开始']
    ],
    sample: '由假说我法，有种种相转，彼依识所现。'
  },
  {
    id: 'JX-2671', title: '大乘义章', section: '释经论部', volume: '二十六卷', status: '可认捐', progress: 0,
    pages: 520, amount: 520 * PER_PAGE_PRICE,
    summary: '慧远法师撰，统摄大乘教义诸门，分章释义，为百科全书式论书。',
    stage: 'todo',
    toc: [
      ['卷一·教义聚', '待开始'], ['卷二·法义聚', '待开始'],
      ['卷三·义门聚', '待开始'], ['卷四·染净聚', '待开始']
    ],
    sample: '大乘之义，广摄万有，统归一真。'
  },
  {
    id: 'JX-2843', title: '翻译名义集', section: '事汇部', volume: '七卷', status: '可认捐', progress: 0,
    pages: 140, amount: 140 * PER_PAGE_PRICE,
    summary: '法云法师编，注解佛典译名、音译、义译之异同，为读经工具之书。',
    stage: 'todo',
    toc: [
      ['卷一·诸天部', '待开始'], ['卷二·佛陀部', '待开始'],
      ['卷三·菩萨部', '待开始'], ['卷四·法数部', '待开始']
    ],
    sample: '梵语佛陀，此云觉者，具足自觉、觉他、觉行圆满三义。'
  },
  {
    id: 'JX-2976', title: '佛祖统纪', section: '史传部', volume: '五十四卷', status: '可认捐', progress: 0,
    pages: 1080, amount: 1080 * PER_PAGE_PRICE,
    summary: '志磐法师撰，天台宗之通史兼传记，纪佛祖授受之源流。',
    stage: 'todo',
    toc: [
      ['卷一·释迦本纪', '待开始'], ['卷二·天台传承', '待开始'],
      ['卷三·东土九祖', '待开始'], ['卷四·兴道高僧', '待开始']
    ],
    sample: '佛之出世，本为大事因缘；祖师之传，正续慧命无绝。'
  }
];

// 原则：每一部经书只对应一位功德主（同一经书不重复展示多个人）。
// 登录用户「居士」默认认捐《大方廣佛華嚴經》；其他经书的唯一认捐者保持原样。
const donors = {
  'JX-0012': [
    { name: '居士', amount: 143600, date: '2026-07-15', anonymous: false, realName: true }
  ],
  'JX-0047': [
    { name: '净莲', amount: 42000, date: '2026-08-10', anonymous: false, realName: true }
  ],
  'JX-0001': [
    { name: '王居士', amount: 1000, date: '2026-08-12', anonymous: false, realName: true }
  ],
  'JX-0231': [
    { name: '明心', amount: 5600, date: '2026-08-10', anonymous: false, realName: true }
  ],
  'JX-0528': [
    { name: '善护', amount: 72000, date: '2026-08-10', anonymous: false, realName: true }
  ],
  'JX-1106': [],
  'JX-2278': [
    { name: '陈居士', amount: 220000, date: '2026-08-09', anonymous: false, realName: true }
  ]
};

// 公开功德簿：一部经书对应一位功德主；同经不重复展示
const donations = [
  { name: '居士', book: '大方廣佛華嚴經', amount: 143600, date: '2026-07-15' },
  { name: '净莲', book: '妙法莲华经', amount: 42000, date: '2026-08-10' },
  { name: '王居士', book: '佛说菩萨十住经', amount: 1000, date: '2026-08-12' },
  { name: '明心', book: '金刚般若波罗蜜经', amount: 5600, date: '2026-08-10' },
  { name: '善护', book: '楞严经正脉疏', amount: 72000, date: '2026-08-10' },
  { name: '陈居士', book: '憨山老人梦游集', amount: 220000, date: '2026-08-09' }
];

const state = {
  page: 'home',
  splash: true,
  preview: null,
  sampleTab: 'cover',     // cover / page / ledger
  catalogTab: '目录',
  catalogView: '全部',
  catalogFilter: '全部',
  query: '',
  transparentTab: '进度',
  loggedIn: false,
  user: null,
  selectedBook: null,
  pledgeStep: 0,
  amount: 0,
  signature: false,
  certificates: [],
  points: [],
  invites: { count: 0, friendDonation: 0 },
  myDonations: [],
  consultations: [],
  // 认捐展示偏好：是否使用真实姓名、是否同意展示在功德簿
  pledgeUseRealName: true,
  pledgeShowInLedger: true,
  // 当前演示用户已默认登录为「居士」，便于展示已捐赠的经书
  demoUser: { name: '居士', phone: '13800138000', code: 'GDZ-20260812-0287' }
};

const app = document.querySelector('#app');
const overlayRoot = document.querySelector('#overlay-root');
const toast = document.querySelector('#toast');

function fitDeviceCanvas() {
  const horizontalGutter = window.innerWidth < 500 ? 0 : 32;
  const verticalGutter = window.innerHeight < 900 ? 0 : 32;
  const scale = Math.min(1, (window.innerWidth - horizontalGutter) / 390, (window.innerHeight - verticalGutter) / 844);
  const safeScale = Math.max(0.5, scale);
  document.querySelector('.device-stage').style.width = `${390 * safeScale}px`;
  document.querySelector('.device-stage').style.height = `${844 * safeScale}px`;
  document.querySelector('.prototype-shell').style.transform = `scale(${safeScale})`;
}
window.addEventListener('resize', fitDeviceCanvas);
fitDeviceCanvas();

function statusBar() {
  return `<div class="statusbar"><span>9:41</span><span>新修嘉兴大藏经 · 原型</span><span>5G&nbsp;&nbsp;▰</span></div>`;
}

function setPage(page) {
  state.page = page;
  document.querySelectorAll('.tab-item').forEach(item => item.classList.toggle('active', item.dataset.tab === page));
  render();
  app.scrollTo({ top: 0, behavior: 'auto' });
}

function render() {
  if (state.splash) { app.innerHTML = renderSplash(); bindSplash(); return; }
  if (state.preview) { app.innerHTML = ''; renderPreview(); return; }
  // 默认演示状态：以「居士」身份登录，并预置对《大方廣佛華嚴經》的认捐记录
  if (!state.loggedIn) {
    state.loggedIn = true;
    state.user = { ...state.demoUser };
  }
  ensureDemoMyDonation();
  const pages = { home: renderHome, catalog: renderCatalog, transparent: renderTransparent, profile: renderProfile };
  app.innerHTML = (pages[state.page] || renderHome)();
  bindPageEvents();
}

// 为演示用的「居士」准备默认的认捐记录：认捐了《大方廣佛華嚴經》全部 718 筒页 / ¥143,600
function ensureDemoMyDonation() {
  if (state._demoInitialized) return;
  state._demoInitialized = true;
  const book = books.find(b => b.id === 'JX-0012');
  if (!book) return;
  const certId = 'CERT-20260715-001';
  state.myDonations.push({
    certId,
    book: book.title,
    amount: 143600,
    bookId: book.id,
    volume: book.volume,
    pages: book.pages,
    date: '2026-07-15',
    anonymous: false,
    progress: book.progress
  });
  state.certificates.push({
    id: certId,
    book: book.title,
    amount: 143600,
    bookId: book.id,
    volume: book.volume,
    date: '2026-07-15',
    useRealName: true,
    showInLedger: true,
    signedName: '居士'
  });
  state.points.unshift({
    type: 'donation',
    title: `认捐《${book.title}》（${book.pages}筒页）`,
    amount: 143600,
    date: '2026-07-15'
  });
}

/* ========== 开屏页 ========== */
function renderSplash() {
  return `<div class="splash" role="dialog" aria-label="新修嘉兴大藏经小程序开屏">
    <div class="splash-top">
      <span>新修嘉兴大藏经 · 大众护持平台</span>
      <span class="splash-stamp">辛卯 · 2026</span>
    </div>
    <img class="splash-lotus" src="assets/blue-lotus.png" alt="莲花">
    <div class="splash-mid">
      <h1>新修嘉兴大藏经</h1>
      <div class="splash-en">XIN XIU JIA XING DA ZANG JING</div>
      <div class="splash-divider"></div>
      <p class="splash-sub">接续浙地径山、嘉兴刻藏文脉<br>复原完整古藏 · 增补文献 · 传续法宝</p>
    </div>
    <div class="splash-quote">"以故宫珍藏本《嘉兴藏》为底本<br>正本清源，弘法利生"</div>
    <div class="splash-stats">
      <div><b>3,433</b><span>计划收录部数</span></div>
      <div><b>55万</b><span>目录字数（已完稿）</span></div>
      <div><b>10</b><span>年编纂周期</span></div>
    </div>
    <div class="splash-foot">
      <button class="splash-btn" data-splash-enter>进入小程序</button>
      <p class="splash-tip">点击进入以继续</p>
    </div>
  </div>`;
}

function bindSplash() {
  document.querySelector('[data-splash-enter]')?.addEventListener('click', () => {
    state.splash = false;
    render();
  });
}

/* ========== 首页 ========== */
function renderHome() {
  const doneCount = books.filter(b => b.stage === 'done').length;
  const doingCount = books.filter(b => b.stage === 'doing' || b.stage === 'review').length;
  const todoCount = books.filter(b => b.stage === 'todo').length;
  return `<div class="page">
    ${statusBar()}
    <section class="hero">
      <div class="brandline">
        <img class="logo" src="assets/blue-lotus.png" alt="新修嘉兴大藏经蓝色莲花标志">
        <div><h1>新修嘉兴大藏经</h1><p>新修嘉兴大藏经 · 大众护持平台</p></div>
      </div>
      <p class="hero-copy">为正本清源、弘法利生，由《嘉兴藏》（重辑·2008版）原班团队接续，引入 AI 与专家团队，重新修复、重新编序、重新增补。</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-go="catalog">认捐一部经</button>
        <button class="btn" data-go="guide">阅藏指南</button>
      </div>
    </section>
    <div class="stats-band">
      <div class="stat"><strong>3,433</strong><span>计划收录部数</span></div>
      <div class="stat"><strong>55万</strong><span>目录字数已完稿</span></div>
      <div class="stat"><strong>2026—35</strong><span>编纂工作周期</span></div>
    </div>

    <section class="intro-section">
      <div class="section-head"><div><h2>项目缘起</h2><p>一场跨越时代的文化传承工程</p></div></div>
      <div class="intro-card">
        <p>项目组历经十年努力，于 2008 年完成《嘉兴藏》（重辑·2008版），由民族出版社出版。其间留下两个遗憾：<b>增补内容有限、古籍修复有限</b>。经多方努力，自 2022 年起启动《新修嘉兴大藏经》工作，旨在通过古籍修复、内容重组、现代阐释及增补文献，编纂出一部<b>继承传统、发展创新的盛世大藏</b>。</p>
      </div>
    </section>

    <section class="intro-section">
      <div class="section-head"><div><h2>底本与新修特色</h2><p>故宫珍藏本《嘉兴藏》为中国历代大藏经中唯一的方册本</p></div></div>
      <div class="intro-grid">
        <div class="intro-mini"><strong>方册本 · 全国唯一</strong><small>故宫珍藏本是当时浙江献给皇帝的贡品，刷印精良、装帧庄严。</small></div>
        <div class="intro-mini"><strong>收书最广 · 宝库美誉</strong><small>被誉为"佛教史料宝库"，刊刻历经六代人近二百年。</small></div>
        <div class="intro-mini"><strong>2,294 → 3,433 部</strong><small>在 2008 版基础上大幅增补，对清末之前汉文典籍能收尽收。</small></div>
        <div class="intro-mini"><strong>目录先行 · 单独成册</strong><small>约 55 万字目录可单独出版，先行流通，便于导读。</small></div>
      </div>
    </section>

    <section class="intro-section">
      <div class="section-head"><div><h2>新修四项核心工作</h2><p>底本修复 · 内容重组 · 提要导读 · 大德增补</p></div></div>
      <div class="home-action-list">
        <article class="card home-action"><div class="home-action-mark">修</div><div class="home-action-body"><strong>① 底本古籍善本修复</strong><small>补笔修残、重新排版，修旧如新，确保经文完整清晰。</small></div></article>
        <article class="card home-action"><div class="home-action-mark blue">编</div><div class="home-action-body"><strong>② 内容重新编序</strong><small>按现代人的思维逻辑与修学体系调整经部，构建层次分明的阅藏体系。</small></div></article>
        <article class="card home-action"><div class="home-action-mark blue">提</div><div class="home-action-body"><strong>③ 每部经书加内容提要</strong><small>目录中增加每部经文的核心思想、历史背景、修学要点，降低阅读门槛。</small></div></article>
        <article class="card home-action"><div class="home-action-mark">补</div><div class="home-action-body"><strong>④ 增补历代大德论述</strong><small>重点收录唐宋与清中后期大德论述，将祖师语录、注疏有机编入体系。</small></div></article>
      </div>
    </section>

    <section class="intro-section">
      <div class="section-head"><div><h2>样书样例</h2><p>点击切换：封面 / 正文样张 / 功能簿</p></div></div>
      <div class="book-sample">
        <div class="book-sample-tabs">
          <button class="${state.sampleTab === 'cover' ? 'active' : ''}" data-sample-tab="cover">封面</button>
          <button class="${state.sampleTab === 'page' ? 'active' : ''}" data-sample-tab="page">正文样张</button>
          <button class="${state.sampleTab === 'ledger' ? 'active' : ''}" data-sample-tab="ledger">功能簿</button>
        </div>
        <div class="book-sample-body">${sampleBody()}</div>
      </div>
    </section>

    <section class="intro-section">
      <div class="section-head"><div><h2>修经进度</h2><p>以部数计，已完成 / 进行中 / 待开始</p></div><button class="text-link" data-go="transparent">查看公开记录 ›</button></div>
      <div class="progress-counts">
        <div class="pc done" data-go="transparent"><b>${doneCount}</b><span>已圆满</span><small>专家复核 + 上版</small></div>
        <div class="pc doing" data-go="transparent"><b>${doingCount}</b><span>进行中</span><small>断句 · 编辑 · 复核</small></div>
        <div class="pc todo" data-go="transparent"><b>${todoCount}</b><span>待开始</span><small>排入编纂计划</small></div>
      </div>
      <p class="prototype-note" style="margin-top:8px">* 演示数据。进度按每部经书当前所处阶段（断句 / 编辑 / 复核 / 已上版）统计，可进入经目查看每一部的阶段详情。</p>
    </section>

    <section class="intro-section">
      <div class="section-head"><div><h2>大德高僧题词</h2><p>以法语与墨宝，为修藏大业作见证</p></div><button class="text-link" data-go="inscriptions">查看全部 ›</button></div>
      <button class="card home-quote" data-go="inscriptions"><span class="home-quote-label">题</span><span class="home-quote-text">新修嘉兴大藏经</span><span class="home-quote-sign">恭请光泉大和尚 · 题词征集中</span><span class="chev">›</span></button>
    </section>

    <section class="section" style="padding-bottom:22px"><div class="notice">人数、金额与实时进度为原型演示数据；区块链存证为建议能力；题词内容为原型示意，正式上线以获授权的墨宝扫描件为准。</div></section>
  </div>`;
}

function sampleBody() {
  const book = books[0];
  const list = donors[book.id] || [];
  if (state.sampleTab === 'cover') {
    return `<div class="sample-compare">
      <figure class="sample-compare-item">
        <div class="sample-compare-img"><img src="assets/puxian-cover-original.jpg" alt="封面·未修改"></div>
        <figcaption>修藏前 · 未修改</figcaption>
      </figure>
      <figure class="sample-compare-item">
        <div class="sample-compare-img"><img src="assets/puxian-cover-fixed.jpg" alt="封面·已重修"></div>
        <figcaption>修藏后 · 已重修</figcaption>
      </figure>
    </div>
    <p class="sample-compare-note">${book.title}（${book.volume}·${book.pages}筒页）封面修藏前后对比</p>`;
  }
  if (state.sampleTab === 'page') {
    return `<div class="sample-compare">
      <figure class="sample-compare-item">
        <div class="sample-compare-img"><img src="assets/puxian-text-original.jpg" alt="正文·未修复"></div>
        <figcaption>正文修复前</figcaption>
      </figure>
      <figure class="sample-compare-item">
        <div class="sample-compare-img"><img src="assets/puxian-text-fixed.png" alt="正文·已修复"></div>
        <figcaption>正文修复后</figcaption>
      </figure>
    </div>
    <p class="sample-compare-note">${book.title} 正文修复前后对比</p>`;
  }
  return renderBookLedger(book, list);
}

// 功德簿视图（首页样书样例 + 经书预览弹窗共用）
// 原则：一部经书只展示一位功德主（金额可能为续捐合并后的总额）
function renderBookLedger(book, list) {
  const total = list.reduce((s, d) => s + d.amount, 0);
  const count = list.length;
  if (!list.length) {
    return `<div class="empty">尚无认捐记录<br><small>完成认捐后将自动展示</small></div>`;
  }
  const meritName = list[0].anonymous ? '匿名功德主' : list[0].name;
  return `
    <div class="book-ledger">
      <div class="book-ledger-info">
        <div class="bli-row"><span>经名</span><b>${book.title}</b></div>
        <div class="bli-row"><span>卷数</span><b>${book.volume}</b></div>
        <div class="bli-row"><span>字数</span><b>260,968 字</b></div>
        <div class="bli-row"><span>筒页</span><b>${book.pages}</b></div>
        <div class="bli-row"><span>金额</span><b>¥${total.toLocaleString()}</b></div>
        <div class="bli-row"><span>功德芳名</span><b>${meritName}</b></div>
      </div>
      <ul class="book-ledger-list">
        ${list.map(d => `
          <li>
            <div class="bl-avatar">${(d.anonymous ? '匿' : d.name.charAt(0))}</div>
            <div class="bl-main">
              <strong>${d.anonymous ? '匿名功德主' : d.name}</strong>
              <small>${d.date}${d.anonymous ? ' · 匿名展示' : ''}</small>
            </div>
            <div class="bl-amount">¥${d.amount.toLocaleString()}</div>
          </li>
        `).join('')}
      </ul>
      <p class="prototype-note" style="margin-top:10px">* 一部经书仅展示一位功德主；多次认捐将合并为同一行的金额。</p>
    </div>
  `;
}

/* ========== 经目（含阅藏指南） ========== */
function renderCatalog() {
  if (state.catalogTab === '指南') return renderGuide();
  const view = state.catalogView;
  const filtered = books.filter(book => {
    const hasDonor = !!(donors[book.id] && donors[book.id].length > 0);
    // 三个 tab 视图：全部 / 可认捐（仅未认捐）/ 已认捐（含已圆满）
    let viewPass;
    if (view === '可认捐') {
      viewPass = book.status === '可认捐' && !hasDonor;
    } else if (view === '已认捐') {
      viewPass = hasDonor;
    } else {
      viewPass = true;
    }
    // chips 部类细分（保持原有过滤逻辑），但「可认捐 / 已认捐」chips 已废弃为 tab
    let categoryPass;
    if (state.catalogFilter === '全部') {
      categoryPass = true;
    } else if (state.catalogFilter === '可认捐_legacy') {
      categoryPass = book.status === '可认捐';
    } else {
      categoryPass = book.section === state.catalogFilter;
    }
    const query = !state.query || `${book.title}${book.summary}${book.id}`.includes(state.query);
    return viewPass && categoryPass && query;
  }).slice().sort((a, b) => a.id.localeCompare(b.id, 'zh-Hans-CN', { numeric: true }));
  // 三个 tab 的实时计数（按当前 search 查询，但忽略 chip 部类细分，避免误导）
  const countAll = books.filter(b => filterByView(b, '全部')).length;
  const countOpen = books.filter(b => filterByView(b, '可认捐')).length;
  const countDone = books.filter(b => filterByView(b, '已认捐')).length;
  return `<div class="page">
    ${statusBar()}
    <header class="topbar"><span style="width:44px"></span><h1>经目</h1><button class="icon-btn" data-action="verify" aria-label="证书验证">⌕</button></header>
    <div class="page-header">
      <div class="catalog-tabs">
        <button data-catalog-tab="目录" class="${state.catalogTab === '目录' ? 'active' : ''}">经书目录</button>
        <button data-catalog-tab="指南" class="${state.catalogTab === '指南' ? 'active' : ''}">阅藏指南</button>
      </div>
      <div class="catalog-view" role="tablist" aria-label="认捐视图">
        <button data-catalog-view="全部" class="${view === '全部' ? 'active' : ''}">全部 <em>${countAll}</em></button>
        <button data-catalog-view="可认捐" class="${view === '可认捐' ? 'active' : ''}">可认捐 <em>${countOpen}</em></button>
        <button data-catalog-view="已认捐" class="${view === '已认捐' ? 'active' : ''}">已认捐 <em>${countDone}</em></button>
      </div>
      <label class="search" style="margin-top:12px"><span>⌕</span><input id="catalog-search" value="${state.query}" placeholder="搜索经名、编号或关键词" aria-label="搜索经书"></label>
      <div class="chips">${['全部','经藏','般若部','史传部','中国撰述','宝积部','释经论部','律藏','瑜伽部','唯识部','事汇部','续藏'].map(item => `<button class="chip ${state.catalogFilter === item ? 'active' : ''}" data-filter="${item}">${item}</button>`).join('')}</div>
    </div>
    <div class="card catalog-summary"><div><strong id="catalog-count">${filtered.length}</strong> 部匹配经书</div><span class="prototype-note">总目录 3,433 部 · 认捐 ¥${PER_PAGE_PRICE}/页</span></div>
    <section class="section" style="padding-top:12px"><div id="catalog-list" class="book-list">${filtered.length ? filtered.map(bookCard).join('') : `<div class="card empty">${
      view === '可认捐' ? '目前没有可认捐的经书，请切换到「全部」或「已认捐」查看' :
      view === '已认捐' ? '尚无已认捐的经书，欢迎前往「可认捐」认捐首部经书' :
      '未找到相关经书，请调整筛选条件'
    }</div>`}</div></section>
  </div>`;
}

function filterByView(book, view) {
  const hasDonor = !!(donors[book.id] && donors[book.id].length > 0);
  if (view === '可认捐') return book.status === '可认捐' && !hasDonor;
  if (view === '已认捐') return hasDonor;
  return true;
}

function renderGuide() {
  return `<div class="page">
    ${statusBar()}
    <header class="topbar"><span style="width:44px"></span><h1>阅藏指南</h1><span style="width:44px"></span></header>
    <section class="guide-hero">
      <h2>新修嘉兴大藏经 · 阅藏指南</h2>
      <p>嘉兴藏是明代方册本大藏经的代表。本次新修以故宫珍藏本为底本，邀大众"以阅入藏、以捐护藏"。</p>
    </section>
    <section class="section">
      <div class="section-head"><div><h2>入藏路径</h2><p>建议按以下顺序开始</p></div></div>
      <div class="home-action-list">
        <article class="card home-action"><div class="home-action-mark">知</div><div class="home-action-body"><strong>一、了解版本特色</strong><small>了解方册本嘉兴藏的历史价值与本次新修的范围</small></div></article>
        <article class="card home-action"><div class="home-action-mark blue">选</div><div class="home-action-body"><strong>二、选择部类</strong><small>按经·律·论·史传·中国撰述等分类建立阅读计划</small></div></article>
        <article class="card home-action"><div class="home-action-mark blue">阅</div><div class="home-action-body"><strong>三、阅读内容提要</strong><small>每部经书提供核心思想、历史背景和修学要点</small></div></article>
        <article class="card home-action"><div class="home-action-mark">护</div><div class="home-action-body"><strong>四、随喜护持与共修</strong><small>可认捐经书，支持修藏大业</small></div></article>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><div><h2>部类简介</h2></div></div>
      <div class="guide-toc">
        <button class="chip" data-filter="经藏">经藏</button>
        <button class="chip" data-filter="律藏">律藏</button>
        <button class="chip" data-filter="论藏">论藏</button>
        <button class="chip" data-filter="般若部">般若部</button>
        <button class="chip" data-filter="史传部">史传部</button>
        <button class="chip" data-filter="中国撰述">中国撰述</button>
      </div>
    </section>
    <section class="section" style="padding-bottom:22px"><button class="btn btn-primary btn-block" data-go="catalog-list">进入经书目录</button></section>
  </div>`;
}

function bookCard(book) {
  // 原则：一部经书一旦有认捐者，状态显示为「已认捐」，不再标注「可认捐」
  const hasDonor = (donors[book.id] && donors[book.id].length > 0);
  const statusLabel = hasDonor ? '已认捐' : book.status;
  const badgeClass = statusLabel === '已圆满' ? 'gray' : statusLabel === '已认捐' ? 'gray' : 'gold';
  const stageInfo = STAGES.find(s => s.code === book.stage) || STAGES[0];
  return `<article class="card book-card" data-book="${book.id}">
    <div class="book-meta"><div><span class="book-title">${book.title}</span><span class="book-code">${book.id} · ${book.section} · ${book.volume}</span></div><span class="badge ${badgeClass}">${statusLabel}</span></div>
    <p>${book.summary}</p>
    <div class="book-stage ${stageInfo.code}">
      <span class="stage-dot"></span>
      <span class="stage-text">${stageInfo.label}</span>
      <span class="stage-tag">${stageInfo.desc}</span>
    </div>
    <div class="book-progress-label"><span>修藏进度</span><b>${book.progress}%</b></div>
    <div class="progress ${book.status === '已圆满' ? 'gold' : ''}"><i style="width:${book.progress}%"></i></div>
    <div class="book-footer">
      <span>¥${PER_PAGE_PRICE}/页 · 共${book.pages}页</span>
      <strong>¥${book.amount.toLocaleString()}</strong>
    </div>
  </article>`;
}

/* ========== 公开（3 个模块，已移除赠书） ========== */
function renderTransparent() {
  const t = state.transparentTab;
  const content = t === '进度' ? myProgressContent() : t === '资金' ? myFundContent() : ledgerContent();
  return `<div class="page">
    ${statusBar()}
    <header class="topbar"><span style="width:44px"></span><h1>我的公开</h1><button class="icon-btn" data-action="verify" aria-label="证书验证">⌕</button></header>
    <section class="section" style="padding-top:14px"><div class="segment">${['进度','资金','功德簿'].map(tab => `<button class="${state.transparentTab === tab ? 'active' : ''}" data-transparent="${tab}">${tab}</button>`).join('')}</div></section>
    <section class="section" style="padding-top:14px">${content}</section>
    ${t === '进度' ? `
    <section class="section">
      <div class="section-head"><div><h2>证书在线认证</h2><p>输入证书编号验证真伪</p></div></div>
      <button class="btn btn-block" data-action="verify">立即验证</button>
    </section>` : ''}
    <section class="section">
      <div class="section-head"><div><h2>可信追溯</h2><p>关键动作生成唯一存证编号</p></div></div>
      <article class="card trace-card"><div class="trace-head"><strong>最近存证记录</strong><span class="badge">已上链*</span></div><div class="trace-hash">0x8fd4a7c2e19b58d6f0310a9c...JX20260811</div><div class="book-footer"><span>2026-08-11 16:28:04</span><button class="text-link" data-action="trace">查看详情 ›</button></div></article>
      <p class="prototype-note" style="line-height:1.6;margin-top:8px">* 区块链存证为建议能力，原型展示记录结构与验证路径。</p>
    </section>
    <section class="section" style="padding-bottom:22px"><button class="btn btn-block btn-ghost" data-go="consult">修藏专项咨询</button></section>
  </div>`;
}

// 当前登录用户的认捐经书
function userDonatedBooks() {
  return state.myDonations.map(d => {
    const book = books.find(b => b.id === d.bookId) || { title: d.book, progress: d.progress || 0, pages: d.pages || 0, volume: d.volume || '', id: d.bookId };
    return { ...book, donation: d };
  });
}

function myProgressContent() {
  const list = userDonatedBooks();
  if (!list.length) {
    return `<div class="empty">尚未认捐经书<br><small>前往经目选一部经开始</small></div>`;
  }
  const cards = list.map(book => {
    const stageInfo = STAGES.find(s => s.code === book.stage) || STAGES[0];
    const progress = book.progress || 0;
    return `<article class="card donation-progress" data-book="${book.id}">
      <div class="donation-progress-head"><strong>${book.title}</strong><span class="badge ${progress === 100 ? 'gray' : 'gold'}">${progress === 100 ? '已圆满' : '修藏中'}</span></div>
      <div class="donation-progress-meta">
        <span>${book.id} · ${book.section || '经藏'} · ${book.volume}</span>
        <span class="cert-tag">证书 ${book.donation.certId}</span>
      </div>
      <div class="donation-progress-stage ${stageInfo.code}">
        <span class="stage-dot"></span>
        <span class="stage-text">${stageInfo.label}</span>
        <span class="stage-tag">${stageInfo.desc}</span>
      </div>
      <div class="book-progress-label"><span>修藏进度</span><b>${progress}%</b></div>
      <div class="progress ${progress === 100 ? 'gold' : ''}"><i style="width:${progress}%"></i></div>
      <div class="donation-progress-info"><span>认捐金额 ¥${book.donation.amount.toLocaleString()}</span><span>${book.donation.date}</span></div>
    </article>`;
  }).join('');
  return `
    <div class="section-head"><div><h2>我的认捐经书 · 修藏进度</h2><p>按经书为单位展示当前修藏进度</p></div></div>
    <div class="book-list">${cards}</div>`;
}

function myFundContent() {
  const list = userDonatedBooks();
  if (!list.length) {
    return `<div class="empty">尚未认捐经书<br><small>前往经目选一部经开始</small></div>`;
  }
  const cards = list.map(book => {
    const donated = book.donation.amount;
    // 简单演示：按进度比例计算「已使用」金额，剩余 = 总额 - 已使用
    const progress = book.progress || 0;
    const used = Math.round(donated * progress / 100);
    const remaining = donated - used;
    return `<article class="card fund-book">
      <div class="fund-book-head"><strong>${book.title}</strong><span class="badge">${book.id}</span></div>
      <div class="fund-book-info">
        <div><span>认捐总额</span><b>¥${donated.toLocaleString()}</b></div>
        <div><span>已使用</span><b>¥${used.toLocaleString()}</b></div>
        <div><span>剩余</span><b>¥${remaining.toLocaleString()}</b></div>
      </div>
      <div class="book-progress-label" style="margin-top:8px"><span>资金使用进度</span><b>${progress}%</b></div>
      <div class="progress gold"><i style="width:${progress}%"></i></div>
    </article>`;
  }).join('');
  return `
    <div class="section-head"><div><h2>我的认捐经书 · 资金使用</h2><p>按经书为单位展示已使用 / 剩余</p></div></div>
    <div class="book-list">${cards}</div>
    <div class="notice" style="margin-top:12px">资金使用明细按经书展示，已使用金额按当前修藏进度同比例计算；剩余资金将继续用于后续编辑、排版与出版准备。</div>`;
}

function fundContent() {
  return `<div class="metric-grid"><article class="card metric"><span>累计护持金额*</span><strong>¥826万</strong></article><article class="card metric"><span>已公开支出*</span><strong>¥318万</strong></article></div>
  <article class="card trace-card" style="margin-top:10px"><div class="section-head"><div><h2>资金用途</h2><p>2026 年 7—8 月演示数据</p></div></div>
  ${[['古籍数字稿修复',42],['编校劳务与专家复核',31],['技术研发与软件服务',18],['出版与项目运营',9]].map(([name,value]) => `<div style="margin-bottom:14px"><div class="book-progress-label"><span>${name}</span><b>${value}%</b></div><div class="progress gold"><i style="width:${value}%"></i></div></div>`).join('')}
  <button class="btn btn-block btn-ghost" data-action="fund-detail">查看票据与支出明细</button></article>`;
}
// 注：旧 fundContent 保留以便向下兼容；溯 tab 资金板块已切换为 myFundContent（按经书为单位）

function ledgerContent() {
  return `<div class="section-head"><div><h2>公开功德簿</h2><p>经授权展示的护持记录</p></div><span class="badge">实时更新*</span></div>
  <div class="ledger-list">${donations.map(ledgerRow).join('')}</div>
  <div class="notice" style="margin-top:12px">每笔认捐均关联电子协议、支付记录与唯一存证编号；功德主可选择公开称谓或匿名展示。</div>`;
}

function ledgerRow(item) {
  return `<article class="card ledger-row"><div class="avatar">${item.name[0]}</div><div class="ledger-main"><strong>${item.name}</strong><small>${item.book} · ${item.date}</small></div><div class="amount">¥${item.amount.toLocaleString()}</div></article>`;
}

/* ========== 我的（功德主中心，已移除赠书和藏经编辑入口） ========== */
function renderProfile() {
  if (!state.loggedIn) return renderProfileGuest();
  const totalPoints = state.myDonations.reduce((s, d) => s + d.amount, 0) + Math.round(state.invites.friendDonation * 0.5);
  return `<div class="page">
    ${statusBar()}
    <section class="profile-head">
      <div class="profile-user">
        <div class="profile-avatar">莲</div>
        <div><h2>${state.user.name}</h2><p>功德主编号 ${state.user.code}</p></div>
        <button class="btn" style="margin-left:auto;border-color:rgba(255,255,255,.45);color:white;background:transparent" data-action="profile-edit">资料</button>
      </div>
      <div class="points">
        <div><span>莲座问功德积分</span><strong>${totalPoints.toLocaleString()}</strong></div>
        <div style="text-align:right"><span>本月购物倍率</span><strong>2×</strong></div>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><div><h2>权益快链</h2></div></div>
      <div class="quick-grid">
        <button class="quick-item" data-action="points-detail"><span class="quick-icon">分</span><span>积分明细</span></button>
        <button class="quick-item" data-action="invite"><span class="quick-icon">荐</span><span>扫码推荐</span></button>
        <button class="quick-item" data-action="certificates"><span class="quick-icon">证</span><span>荣誉证书</span></button>
        <button class="quick-item" data-action="my-donations"><span class="quick-icon">簿</span><span>我的功德</span></button>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><div><h2>我的认捐</h2><p>${state.myDonations.length} 笔</p></div></div>
      <div class="home-action-list">
        ${state.myDonations.length ? state.myDonations.map(myDonationCard).join('') : `<div class="empty">尚未认捐<br><small>前往经目选一部经开始</small></div>`}
      </div>
    </section>
    <section class="section">
      <div class="card menu">
        <button class="menu-row" data-go="transparent"><span class="menu-icon">溯</span><span>资金与进度查询</span><small>公开透明 ›</small></button>
        <button class="menu-row" data-go="consult"><span class="menu-icon">问</span><span>专项咨询</span><small>›</small></button>
        <button class="menu-row" data-action="about"><span class="menu-icon">缘</span><span>关于新修嘉兴大藏经</span><small>›</small></button>
      </div>
    </section>
  </div>`;
}

function renderProfileGuest() {
  return `<div class="page">
    ${statusBar()}
    <section class="profile-head">
      <div class="profile-user">
        <div class="profile-avatar">客</div>
        <div><h2>尚未登录</h2><p>登录后管理认捐、证书与推荐</p></div>
        <button class="btn" style="margin-left:auto;border-color:rgba(255,255,255,.45);color:white;background:transparent" data-action="login">登录</button>
      </div>
      <div class="points">
        <div><span>莲座问功德积分</span><strong>--</strong></div>
        <div style="text-align:right"><span>本月购物倍率</span><strong>--</strong></div>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><div><h2>功德主可享</h2><p>登录后即可使用以下权益</p></div></div>
      <div class="home-action-list">
        <article class="card home-action"><div class="home-action-mark">分</div><div class="home-action-body"><strong>捐款得积分</strong><small>所捐款项等额兑换莲座问积分</small></div></article>
        <article class="card home-action"><div class="home-action-mark blue">荐</div><div class="home-action-body"><strong>拉新奖励</strong><small>推荐好友认捐，奖励新捐款额的 50%</small></div></article>
        <article class="card home-action"><div class="home-action-mark blue">惠</div><div class="home-action-body"><strong>双倍购物积分</strong><small>在莲座问平台购物享双倍积分</small></div></article>
      </div>
    </section>
    <section class="section">
      <div class="card menu">
        <button class="menu-row" data-go="transparent"><span class="menu-icon">溯</span><span>公开与查询</span><small>无需登录 ›</small></button>
        <button class="menu-row" data-go="consult"><span class="menu-icon">问</span><span>专项咨询</span><small>›</small></button>
        <button class="menu-row" data-action="about"><span class="menu-icon">缘</span><span>关于新修嘉兴大藏经</span><small>›</small></button>
      </div>
    </section>
  </div>`;
}

function myDonationCard(d) {
  const book = books.find(b => b.id === d.bookId);
  const progress = book ? book.progress : d.progress || 0;
  const volume = d.volume || (book ? book.volume : '');
  const pages = d.pages || (book ? book.pages : 0);
  // 原则：每部经书仅展示一位功德芳名
  const meritList = donors[d.bookId] || [];
  const meritName = meritList[0] ? (meritList[0].anonymous ? '匿名功德主' : meritList[0].name) : '居士';
  return `<article class="card donation-progress merit-book" data-action="cert-detail">
    <div class="donation-progress-head"><strong>${d.book}</strong><span class="badge gold">${d.certId}</span></div>
    <div class="merit-grid">
      <div class="merit-row"><span>经名</span><b>${d.book}</b></div>
      <div class="merit-row"><span>卷数</span><b>${volume}</b></div>
      <div class="merit-row"><span>字数</span><b>260,968 字</b></div>
      <div class="merit-row"><span>筒页</span><b>${pages}</b></div>
      <div class="merit-row"><span>金额</span><b>¥${d.amount.toLocaleString()}</b></div>
      <div class="merit-row"><span>功德芳名</span><b>${meritName}</b></div>
    </div>
    <div class="book-progress-label" style="margin-top:10px"><span>修藏进度</span><b>${progress}%</b></div>
    <div class="progress ${progress === 100 ? 'gold' : ''}"><i style="width:${progress}%"></i></div>
    <div class="donation-progress-info"><span>认捐 ¥${d.amount.toLocaleString()}</span><span>${d.date}</span></div>
  </article>`;
}

/* ========== 事件绑定 ========== */
function bindPageEvents() {
  document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => handleGo(el.dataset.go)));
  document.querySelectorAll('[data-book]').forEach(el => el.addEventListener('click', () => openBook(el.dataset.book)));
  document.querySelectorAll('[data-filter]').forEach(el => el.addEventListener('click', () => { state.catalogFilter = el.dataset.filter; state.catalogTab = '目录'; render(); }));
  document.querySelectorAll('[data-transparent]').forEach(el => el.addEventListener('click', () => { state.transparentTab = el.dataset.transparent; render(); }));
  document.querySelectorAll('[data-catalog-tab]').forEach(el => el.addEventListener('click', () => { state.catalogTab = el.dataset.catalogTab; render(); }));
  document.querySelectorAll('[data-catalog-view]').forEach(el => el.addEventListener('click', () => { state.catalogView = el.dataset.catalogView; render(); }));
  document.querySelectorAll('[data-action]').forEach(el => el.addEventListener('click', () => handleAction(el.dataset.action)));
  document.querySelectorAll('[data-sample-tab]').forEach(el => el.addEventListener('click', () => { state.sampleTab = el.dataset.sampleTab; render(); }));
  const search = document.querySelector('#catalog-search');
  if (search) search.addEventListener('input', event => {
    state.query = event.target.value.trim();
    const filtered = books.filter(book => {
      const hasDonor = !!(donors[book.id] && donors[book.id].length > 0);
      let viewPass;
      if (state.catalogView === '可认捐') viewPass = book.status === '可认捐' && !hasDonor;
      else if (state.catalogView === '已认捐') viewPass = hasDonor;
      else viewPass = true;
      let categoryPass;
      if (state.catalogFilter === '全部') categoryPass = true;
      else if (state.catalogFilter === '可认捐_legacy') categoryPass = book.status === '可认捐';
      else categoryPass = book.section === state.catalogFilter;
      return viewPass && categoryPass && (!state.query || `${book.title}${book.summary}${book.id}`.includes(state.query));
    }).slice().sort((a, b) => a.id.localeCompare(b.id, 'zh-Hans-CN', { numeric: true }));
    document.querySelector('#catalog-count').textContent = filtered.length;
    document.querySelector('#catalog-list').innerHTML = filtered.length ? filtered.map(bookCard).join('') : '<div class="card empty">未找到相关经书，请调整筛选条件</div>';
    document.querySelectorAll('[data-book]').forEach(el => el.addEventListener('click', () => openBook(el.dataset.book)));
  });
}

document.querySelectorAll('.tab-item').forEach(item => item.addEventListener('click', () => setPage(item.dataset.tab)));

function handleGo(target) {
  if (['home','catalog','transparent','profile'].includes(target)) return setPage(target);
  if (target === 'guide') { state.catalogTab = '指南'; return setPage('catalog'); }
  if (target === 'catalog-list') { state.catalogTab = '目录'; state.catalogView = '全部'; return setPage('catalog'); }
  if (target === 'inscriptions') return openInfo('大德高僧题词', inscriptionsHtml());
  if (target === 'consult') return openConsult();
}

function handleAction(action) {
  const messages = { 'fund-detail': '已生成 2026 年 8 月资金公开明细', trace: '存证信息校验一致，记录未被篡改' };
  if (action === 'login') return openLogin();
  if (action === 'invite') return openInvite();
  if (action === 'certificates') return openCertificates();
  if (action === 'cert-detail') { const cert = state.certificates[0]; if (cert) openInfo('证书详情', certificateHtml(cert)); return; }
  if (action === 'points-detail') return openPointsDetail();
  if (action === 'my-donations') return openMyDonations();
  if (action === 'verify') return openVerify();
  if (action === 'profile-edit') return openInfo('个人资料', `<div class="field"><label>称谓</label><input value="${state.user.name}"></div><div class="field"><label>手机号</label><input value="${state.user.phone}"></div><div class="field"><label>功德主编号</label><input value="${state.user.code}" disabled></div><button class="btn btn-primary btn-block" id="save-profile">保存</button>`);
  if (action === 'about') return openAbout();
  if (action === 'simulate-invite-donation') return simulateInviteDonation();
  showToast(messages[action] || '功能已响应');
}

/* ========== 关于弹窗 ========== */
function openAbout() {
  openInfo('关于新修嘉兴大藏经', `
    <div class="section-head" style="padding:0;margin-bottom:12px"><h2>项目缘起</h2></div>
    <div class="protocol-block">
      <p>项目组历经十年努力，于 2008 年完成《嘉兴藏》（重辑·2008版），由民族出版社出版。其间留下两个遗憾：<b>增补内容有限、古籍修复有限</b>。经多方努力，自 2022 年起启动《新修嘉兴大藏经》工作，旨在通过古籍修复、内容重组、现代阐释及增补文献，编纂出一部<b>继承传统、发展创新的盛世大藏</b>。</p>
    </div>
    <div class="section-head" style="padding:0;margin:14px 0 8px"><h2>底本特色</h2></div>
    <div class="protocol-block">
      <p>故宫珍藏本《嘉兴藏》是当时浙江献给皇帝的贡品，其刷印之精良、装帧之庄严，全国仅此一部；是中国历代大藏经中唯一的一部方册本藏经；收录经典最多，被誉为"佛教史料宝库"；刊刻历经六代人近二百年，版本传奇性古今赞叹。</p>
    </div>
    <div class="section-head" style="padding:0;margin:14px 0 8px"><h2>新修特色</h2></div>
    <div class="protocol-block">
      <p>① 以故宫《嘉兴藏》数字稿为底本，继承原本特色，修旧如新。<br>② 以 2008 版目录为基础，从 2,294 部扩增至 3,433 部经书。<br>③ 对整部大藏经结构依照历代藏经目录及学者研究进行系统调整。<br>④ 约 55 万字目录可单独出版，先行流通，便于导读。<br>⑤ 参照《永乐大典》等历代优秀古籍重新设计版式。<br>⑥ 参照《佛光大藏经》进行初步断句、校勘，再礼请大德及专家复核定稿。</p>
    </div>
    <div class="section-head" style="padding:0;margin:14px 0 8px"><h2>四项核心工作</h2></div>
    <div class="protocol-block">
      <p><b>底本古籍善本修复：</b>补笔修残、重新排版，确保经文完整。<br><b>内容重新编序：</b>按现代思维逻辑调整，构建层次分明的阅藏体系。<br><b>每部经书加内容提要：</b>涵盖核心思想、历史背景及修学要点。<br><b>增补历代大德论述：</b>重点收录唐宋与清中后期大德论述。</p>
    </div>
    <div class="section-head" style="padding:0;margin:14px 0 8px"><h2>主持机构</h2></div>
    <div class="protocol-block">
      <p>以"世界佛教联合总会"（设于香港宏法寺）为旗帜，以净雄法师为主导，协同有关寺院和法师组织开展编纂工作。主要负责宣传、组织、募捐等工作。</p>
    </div>
  `);
}

/* ========== 经书详情 & 认捐流程 ========== */
function openBook(id) {
  const book = books.find(item => item.id === id);
  state.selectedBook = book;
  state.preview = { id, tab: 'cover' };
  closeOverlay();
  render();
}

function renderPreview() {
  const book = state.selectedBook;
  if (!book) { state.preview = null; render(); return; }
  const stageInfo = STAGES.find(s => s.code === book.stage) || STAGES[0];
  const tab = state.preview.tab;
  let body = '';
  if (tab === 'cover') {
    body = `<div class="sample-compare">
        <figure class="sample-compare-item">
          <div class="sample-compare-img"><img src="assets/puxian-cover-original.jpg" alt="封面·未修改"></div>
          <figcaption>修藏前 · 未修改</figcaption>
        </figure>
        <figure class="sample-compare-item">
          <div class="sample-compare-img"><img src="assets/puxian-cover-fixed.jpg" alt="封面·已重修"></div>
          <figcaption>修藏后 · 已重修</figcaption>
        </figure>
      </div>
      <p class="sample-compare-note">${book.title}（${book.volume}·${book.pages}筒页）封面修藏前后对比</p>
      <div class="intro-card" style="margin-top:14px">
        <h3 style="margin:0 0 6px;font-family:'STKaiti',serif;color:#7a5520;font-size:16px">${book.title}</h3>
        <p style="margin:0;color:#786b58;font-size:12px;line-height:1.7">${book.summary}</p>
        <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #ead9b3;display:flex;justify-content:space-between;font-size:11px;color:#786b58"><span>编号 ${book.id}</span><span>${stageInfo.label}</span></div>
      </div>`;
  } else if (tab === 'ledger') {
    const list = donors[book.id] || [];
    body = renderBookLedger(book, list);
  } else {
    body = `<div class="sample-compare">
        <figure class="sample-compare-item">
          <div class="sample-compare-img"><img src="assets/puxian-text-original.jpg" alt="正文·未修复"></div>
          <figcaption>正文修复前</figcaption>
        </figure>
        <figure class="sample-compare-item">
          <div class="sample-compare-img"><img src="assets/puxian-text-fixed.png" alt="正文·已修复"></div>
          <figcaption>正文修复后</figcaption>
        </figure>
      </div>
      <p class="sample-compare-note">${book.title} 正文修复前后对比</p>
      <div class="notice" style="margin-top:12px">此为样张预览，正式产品可左右翻页、查看缺墨字修复、断句与专家复核标记。</div>`;
  }
  // 原则：一部经书只对应一位功德主；若该经书已有认捐者，则改为「已认捐」状态
  const hasDonor = (donors[book.id] && donors[book.id].length > 0);
  const isPledgeable = book.status === '可认捐' && !hasDonor;
  overlayRoot.innerHTML = `<div class="preview-overlay"><div class="preview-sheet">
    <header class="preview-head"><h2>${book.title}</h2><button class="icon-btn" data-preview-close aria-label="关闭">×</button></header>
    <div class="preview-tabs">
      <button class="${tab === 'cover' ? 'active' : ''}" data-preview-tab="cover">封面</button>
      <button class="${tab === 'page' ? 'active' : ''}" data-preview-tab="page">正文样张</button>
      <button class="${tab === 'ledger' ? 'active' : ''}" data-preview-tab="ledger">功能簿</button>
    </div>
    <div class="preview-body">${body}</div>
    ${isPledgeable
      ? `<div class="preview-foot">
           <button class="btn btn-ghost" data-preview-close>稍后再看</button>
           <button class="btn btn-gold" data-preview-pledge>确认认捐<br><small>¥${book.amount.toLocaleString()}（${book.pages}页×¥${PER_PAGE_PRICE}/页）</small></button>
         </div>`
      : `<div class="preview-foot"><button class="btn btn-ghost" data-preview-close>关闭</button><button class="btn btn-primary" data-preview-follow>关注修藏进度</button></div>`
    }
  </div></div>`;
  bindPreview();
}

function bindPreview() {
  overlayRoot.querySelectorAll('[data-preview-tab]').forEach(btn => btn.addEventListener('click', () => {
    state.preview = { ...state.preview, tab: btn.dataset.previewTab };
    render();
  }));
  overlayRoot.querySelectorAll('[data-preview-close]').forEach(btn => btn.addEventListener('click', () => {
    state.preview = null;
    overlayRoot.innerHTML = '';
    render();
  }));
  overlayRoot.querySelector('[data-preview-pledge]')?.addEventListener('click', () => {
    state.preview = null;
    overlayRoot.innerHTML = '';
    startPledge();
  });
  overlayRoot.querySelector('[data-preview-follow]')?.addEventListener('click', () => {
    state.preview = null;
    overlayRoot.innerHTML = '';
    showToast('已关注该经书进度');
    render();
  });
}

function startPledge() {
  state.pledgeStep = state.loggedIn ? 1 : 0;
  state.amount = state.selectedBook.amount;
  state.signature = false;
  renderPledge();
}

function renderPledge() {
  const totalSteps = 5;
  const steps = `<div class="steps">${Array.from({length: totalSteps}, (_, i) => `<i class="${state.pledgeStep >= i ? 'active' : ''}"></i>`).join('')}</div>`;
  let body = '';
  let actions = '';
  if (state.pledgeStep === 0) {
    body = `<h3 class="flow-title">先完成会员注册</h3><p class="flow-desc">用于建立功德主账号、签署协议并接收荣誉证书。</p>${loginFields()}<label class="check"><input id="privacy" type="checkbox"><span>我已阅读并同意《用户服务协议》与《隐私政策》</span></label>`;
    actions = `<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-next>注册并继续</button>`;
  } else if (state.pledgeStep === 1) {
    body = `<h3 class="flow-title">阅读并签署捐款协议</h3><p class="flow-desc">认捐经书：${state.selectedBook.title}（共${state.selectedBook.pages}页）</p>
      <div class="agreement"><b>《新修嘉兴大藏经》项目捐款协议（原型摘要）</b><br>一、捐款人自愿护持本项目，所捐款项用于对应经书的古籍修复、内容编校、专家复核及相关工作。<br>二、项目方定期公开资金用途与修藏进度，并为每笔捐款生成唯一可验证记录。<br>三、捐款完成后自动获得等额莲座问积分，可在平台购物时使用（功德主双倍积分）。<br>四、捐款人可选择公开称谓或匿名展示。</div>
      <div class="field" style="margin-top:14px"><label>电子签名</label><canvas id="signature" class="sign-canvas" width="360" height="140"></canvas><div class="sign-tools"><span>请在框内手写签名</span><button class="text-link" id="clear-sign">清除</button></div></div>
      <label class="check"><input id="agree" type="checkbox"><span>本人已完整阅读、理解并接受协议内容</span></label>`;
    actions = `<button class="btn btn-ghost" data-prev>上一步</button><button class="btn btn-primary" data-next>确认签署</button>`;
  } else if (state.pledgeStep === 2) {
    const options = [
      state.selectedBook.amount,
      Math.round(state.selectedBook.amount * 1.1),
      Math.round(state.selectedBook.amount * 1.2)
    ];
    body = `<h3 class="flow-title">确认护持金额</h3><p class="flow-desc">认捐经书：${state.selectedBook.title} · 共${state.selectedBook.pages}页 · ¥${PER_PAGE_PRICE}/页</p>
      <div class="field"><label>认捐金额（修一页 ¥${PER_PAGE_PRICE}）</label>
        <div class="amount-options">${options.map((value, i) => `<button class="amount-option ${state.amount === value ? 'active' : ''}" data-amount="${value}">¥${value.toLocaleString()}${i > 0 ? '（加力）' : ''}</button>`).join('')}</div>
      </div>
      <div class="field"><label>护持留言（选填）</label><textarea id="pledge-message" placeholder="愿以此功德，庄严佛净土……"></textarea></div>
      <div class="payment-box"><div class="payment-line"><span>认捐经书</span><b>${state.selectedBook.title}</b></div><div class="payment-line"><span>页数 × 单价</span><b>${state.selectedBook.pages}页 × ¥${PER_PAGE_PRICE}</b></div><div class="payment-line"><span>支付方式</span><b>微信支付 ›</b></div><div class="payment-line payment-total"><span>合计</span><strong>¥${state.amount.toLocaleString()}</strong></div></div>`;
    actions = `<button class="btn btn-ghost" data-prev>上一步</button><button class="btn btn-primary" data-next>下一步</button>`;
  } else if (state.pledgeStep === 3) {
    body = `<h3 class="flow-title">展示偏好设置</h3><p class="flow-desc">您可以控制对外公开的姓名与是否在功德簿中展示</p>
      <div class="pledge-pref">
        <label class="check"><input id="pref-real-name" type="checkbox" ${state.pledgeUseRealName ? 'checked' : ''}><span><b>是否使用真实姓名签约</b><small>开启后，荣誉证书、捐款协议展示您的真实姓名；关闭后将用法号 / 昵称。</small></span></label>
        <label class="check"><input id="pref-show-ledger" type="checkbox" ${state.pledgeShowInLedger ? 'checked' : ''}><span><b>是否同意展示在功德簿</b><small>开启后，您的认捐记录将公开在"公开 → 功德簿"中；关闭后仅显示"匿名功德主"。</small></span></label>
      </div>
      <div class="field" id="display-name-field" style="${state.pledgeUseRealName ? '' : 'display:none'}"><label>${state.pledgeUseRealName ? '签约显示姓名' : '法号 / 昵称'}</label><input id="display-name" value="${state.user.name}" placeholder="如：${state.user.name}"></div>
      <div class="notice" style="margin-top:12px">提示：以上两项选择仅影响公开展示，不影响您的实际护持权益与积分到账。</div>`;
    actions = `<button class="btn btn-ghost" data-prev>上一步</button><button class="btn btn-gold" data-next>确认支付</button>`;
  } else {
    const certificate = state.certificates.at(-1);
    body = `<div class="center"><div class="success-mark">✓</div><h3 class="flow-title">护持圆满</h3><p class="flow-desc">已获得 ${state.amount.toLocaleString()} 功德积分，认捐记录与电子协议已存证。</p></div>${certificateHtml(certificate)}`;
    actions = `<button class="btn btn-ghost" data-close>完成</button><button class="btn btn-primary" data-verify-cert>在线认证证书</button>`;
  }
  overlayRoot.innerHTML = `<div class="overlay"><section class="sheet">${steps}<div class="sheet-body">${body}</div><div class="sheet-actions">${actions}</div></section></div>`;
  bindOverlayBase();
  overlayRoot.querySelector('[data-next]')?.addEventListener('click', nextPledge);
  overlayRoot.querySelector('[data-prev]')?.addEventListener('click', () => { state.pledgeStep -= 1; renderPledge(); });
  overlayRoot.querySelectorAll('[data-amount]').forEach(btn => btn.addEventListener('click', () => { state.amount = Number(btn.dataset.amount); renderPledge(); }));
  overlayRoot.querySelector('[data-verify-cert]')?.addEventListener('click', () => openVerify(true));
  if (state.pledgeStep === 1) setupSignature();
  if (state.pledgeStep === 3) {
    const realName = document.querySelector('#pref-real-name');
    const showLedger = document.querySelector('#pref-show-ledger');
    realName?.addEventListener('change', () => {
      state.pledgeUseRealName = realName.checked;
      const field = document.querySelector('#display-name-field');
      if (field) field.style.display = state.pledgeUseRealName ? '' : 'none';
    });
    showLedger?.addEventListener('change', () => { state.pledgeShowInLedger = showLedger.checked; });
  }
}

function loginFields() {
  return `<div class="field"><label>手机号</label><input id="phone" inputmode="tel" value="13800138000" placeholder="请输入手机号"></div>
    <div class="field"><label>验证码</label><div style="display:grid;grid-template-columns:1fr auto;gap:8px"><input id="code" inputmode="numeric" value="8260" placeholder="请输入验证码"><button class="btn btn-ghost" type="button">获取验证码</button></div></div>
    <div class="field"><label>称谓（用于功德簿与证书）</label><input id="name" value="${state.user?.name || '居士'}" placeholder="请输入您的姓名或法号"></div>`;
}

function nextPledge() {
  if (state.pledgeStep === 0) {
    if (!document.querySelector('#privacy')?.checked) return showToast('请先同意用户协议与隐私政策');
    const phone = document.querySelector('#phone').value.trim();
    const name = document.querySelector('#name').value.trim() || '居士';
    if (!phone) return showToast('请填写手机号');
    state.loggedIn = true;
    state.user = { name, phone, code: `GDZ-20260812-${String(286 + state.myDonations.length).padStart(4, '0')}` };
  }
  if (state.pledgeStep === 1) {
    if (!state.signature) return showToast('请先完成电子签名');
    if (!document.querySelector('#agree')?.checked) return showToast('请确认接受捐款协议');
  }
  if (state.pledgeStep === 3) {
    // 原则：一部经书只对应一位功德主。若该经书已有功德主，则本次认捐视为「续捐 / 加力」，
    // 同一经书在功德簿中仍只展示一位名称与金额（金额按最新一次合并）。
    const bookId = state.selectedBook.id;
    const existing = (donors[bookId] && donors[bookId][0]) || null;
    const mergedAmount = existing ? existing.amount + state.amount : state.amount;

    // 收集展示偏好
    state.pledgeUseRealName = document.querySelector('#pref-real-name')?.checked ?? true;
    state.pledgeShowInLedger = document.querySelector('#pref-show-ledger')?.checked ?? true;
    const displayNameInput = document.querySelector('#display-name');
    const displayName = (displayNameInput?.value.trim()) || state.user.name;

    // 生成证书与记录
    const certId = `CERT-${formatDate()}-${String(state.certificates.length + 1).padStart(3, '0')}`;
    const isAnonymous = !state.pledgeShowInLedger;
    const signedName = state.pledgeUseRealName ? displayName : (displayName || '护法居士');
    const cert = { id: certId, book: state.selectedBook.title, amount: state.amount, bookId: state.selectedBook.id, volume: state.selectedBook.volume, date: formatDate2(), useRealName: state.pledgeUseRealName, showInLedger: state.pledgeShowInLedger, signedName };
    state.certificates.push(cert);
    state.myDonations.push({ certId, book: state.selectedBook.title, amount: state.amount, bookId: state.selectedBook.id, volume: state.selectedBook.volume, date: formatDate2(), anonymous: isAnonymous });
    state.points.unshift({ type: 'donation', title: `认捐《${state.selectedBook.title}》（${state.selectedBook.pages}页）`, amount: state.amount, date: formatDate2() });
    // 同步到该经书的功德簿：始终只保留一条记录（同一经书仅一位功德主）
    const finalName = existing ? existing.name : (isAnonymous ? '匿名功德主' : signedName);
    const finalDate = formatDate2();
    donors[bookId] = [{ name: finalName, amount: mergedAmount, date: finalDate, anonymous: existing ? existing.anonymous : isAnonymous, realName: existing ? existing.realName : state.pledgeUseRealName }];
    // 公开功德簿：同经只保留一行
    const idx = donations.findIndex(d => d.book === state.selectedBook.title);
    const donationRow = { name: finalName, book: state.selectedBook.title, amount: mergedAmount, date: finalDate };
    if (idx >= 0) donations[idx] = donationRow; else donations.unshift(donationRow);
  }
  state.pledgeStep += 1;
  renderPledge();
}

function formatDate() { return '20260816'; }
function formatDate2() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function setupSignature() {
  const canvas = document.querySelector('#signature');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  const point = event => { const rect = canvas.getBoundingClientRect(); const source = event.touches?.[0] || event; return { x: (source.clientX - rect.left) * canvas.width / rect.width, y: (source.clientY - rect.top) * canvas.height / rect.height }; };
  const start = event => { event.preventDefault(); drawing = true; const p = point(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const move = event => { if (!drawing) return; event.preventDefault(); const p = point(event); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#183f63'; ctx.lineTo(p.x, p.y); ctx.stroke(); state.signature = true; };
  const end = () => { drawing = false; };
  canvas.addEventListener('pointerdown', start); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', end); canvas.addEventListener('pointerleave', end);
  document.querySelector('#clear-sign')?.addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height); state.signature = false; });
}

function certificateHtml(certificate = {}) {
  const id = certificate.id || 'CERT-20260816-001';
  const book = certificate.book || state.selectedBook?.title || '新修嘉兴大藏经';
  const amount = certificate.amount || state.amount;
  const name = state.user?.name || '莲心居士';
  return `<div class="certificate"><img class="logo" src="assets/blue-lotus.png" alt="蓝色莲花"><h3>修藏荣誉证书</h3><p>兹敬谢 <b>${name}</b><br>发心护持《${book}》<br>护持金额 ¥${amount.toLocaleString()}</p><small>证书编号：${id}</small>${qrHtml()}</div>`;
}

function qrHtml() {
  const cells = [1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1];
  return `<div class="qr" aria-label="证书认证二维码">${cells.map(cell => `<i style="opacity:${cell ? 1 : 0}"></i>`).join('')}</div><small>扫码在线认证</small>`;
}

function openLogin() {
  openSheet('会员登录 / 注册', `${loginFields()}<label class="check"><input id="privacy" type="checkbox" checked><span>我已阅读并同意用户服务协议与隐私政策</span></label>`, `<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" id="do-login">登录</button>`);
  document.querySelector('#do-login').addEventListener('click', () => {
    const phone = document.querySelector('#phone').value.trim();
    const name = document.querySelector('#name').value.trim() || '居士';
    state.loggedIn = true;
    state.user = { name, phone, code: `GDZ-20260812-${String(286 + state.myDonations.length).padStart(4, '0')}` };
    closeOverlay(); showToast('登录成功'); render();
  });
}

/* ========== 功德主中心各模块 ========== */
function openInvite() {
  if (!state.loggedIn) return openLogin();
  const invitePoints = Math.round(state.invites.friendDonation * 0.5);
  openInfo('扫码推荐功德主', `
    <div class="invite-hero">
      <div class="qr" aria-label="推荐二维码">${[1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1].map(c => `<i style="opacity:${c ? 1 : 0}"></i>`).join('')}</div>
      <h3>${state.user.name} 的护持邀请</h3>
      <p>好友扫码认捐后，您将获得其新捐款额 50% 的莲座问积分。</p>
      <div class="invite-stat">
        <div><b>${state.invites.count}</b><span>已邀请好友</span></div>
        <div><b>¥${state.invites.friendDonation.toLocaleString()}</b><span>好友累计捐款</span></div>
        <div style="grid-column:1/-1"><b>¥${invitePoints.toLocaleString()}</b><span>已获得推荐积分</span></div>
      </div>
    </div>
    <div class="notice" style="margin-top:14px">推荐关系、奖励积分与对应捐款记录均可在"积分明细"中查询。</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">
      <button class="btn btn-ghost" data-close>关闭</button>
      <button class="btn btn-primary" id="copy-link">复制邀请链接</button>
    </div>
    <div class="divider"></div>
    <button class="btn btn-block btn-ghost" data-action="simulate-invite-donation">模拟：好友认捐到账</button>
  `);
  document.querySelector('#copy-link')?.addEventListener('click', () => showToast('邀请链接已复制'));
}

function simulateInviteDonation() {
  const friendAmount = books[0].amount;
  state.invites.count += 1;
  state.invites.friendDonation += friendAmount;
  const reward = Math.round(friendAmount * 0.5);
  state.points.unshift({ type: 'invite', title: `好友认捐奖励（好友捐款额×50%）`, amount: reward, date: formatDate2() });
  closeOverlay();
  setTimeout(openInvite, 50);
  showToast(`到账 ¥${reward.toLocaleString()} 推荐积分`);
}

function openCertificates() {
  if (!state.loggedIn) return openLogin();
  openInfo('我的荣誉证书', state.certificates.length ? state.certificates.map(cert => `
    <article class="cert-card">
      <div class="cert-card-head"><strong>${cert.book}</strong><div class="cert-actions"><button data-action="share-cert">分享</button><button data-action="verify-cert">认证</button></div></div>
      <div class="cert-card-body">${certificateHtml(cert)}</div>
    </article>
  `).join('') : '<div class="empty">尚未获得荣誉证书<br><small>完成认捐后将自动生成</small></div>');
}

function openMyDonations() {
  if (!state.loggedIn) return openLogin();
  openInfo('我的功德簿', state.myDonations.length ? state.myDonations.map(myDonationCard).join('') : '<div class="empty">尚未认捐<br><small>前往经目选一部经开始</small></div>');
}

function openPointsDetail() {
  if (!state.loggedIn) return openLogin();
  const donationPoints = state.myDonations.reduce((s, d) => s + d.amount, 0);
  const invitePoints = state.points.filter(p => p.type === 'invite').reduce((s, p) => s + p.amount, 0);
  const total = donationPoints + invitePoints;
  const rows = state.points.length ? state.points.map(p => `
    <article class="points-row">
      <div class="avatar">${p.type === 'invite' ? '荐' : '捐'}</div>
      <div><strong>${p.title}</strong><small>${p.date}</small></div>
      <div class="amount">+¥${p.amount.toLocaleString()}</div>
    </article>
  `).join('') : `<div class="empty">暂无积分流水</div>`;
  openInfo('积分明细', `
    <article class="card trace-card" style="margin-bottom:12px">
      <div class="trace-head"><strong>积分总览</strong><span class="badge gold">${total.toLocaleString()} 分</span></div>
      <div class="payment-line" style="margin-top:8px"><span>捐款等额积分</span><b>+¥${donationPoints.toLocaleString()}</b></div>
      <div class="payment-line"><span>推荐奖励积分</span><b>+¥${invitePoints.toLocaleString()}</b></div>
      <div class="payment-line payment-total"><span>莲座问累计可用</span><strong>¥${total.toLocaleString()}</strong></div>
    </article>
    <div class="section-head"><div><h2>积分流水</h2></div></div>
    <div class="points-list">${rows}</div>
    <div class="notice" style="margin-top:12px">积分可在"莲座问"平台购物时使用（功德主享受双倍积分）。</div>
  `);
}

function openVerify(fromSuccess = false) {
  openSheet('证书在线认证', `
    <div class="field"><label>证书编号</label><input id="cert-code" value="${state.certificates.at(-1)?.id || 'CERT-20260816-001'}" placeholder="请输入证书编号"></div>
    <button class="btn btn-primary btn-block" id="check-cert">立即验证</button>
    <div id="verify-result"></div>
  `, `<button class="btn btn-block btn-ghost" data-close>关闭</button>`);
  const actions = overlayRoot.querySelector('.sheet-actions');
  if (actions) actions.style.gridTemplateColumns = '1fr';
  document.querySelector('#check-cert')?.addEventListener('click', () => {
    document.querySelector('#verify-result').innerHTML = `<div class="notice" style="margin-top:14px"><b>验证通过</b><br>证书签发主体：新修嘉兴大藏经项目组<br>状态：有效 · 存证记录一致</div>`;
  });
  if (fromSuccess) document.querySelector('#check-cert')?.click();
}

function openConsult() {
  openSheet('修藏专项咨询', `
    <p class="flow-desc">对认捐、编纂、资金用途有疑问，可实名或匿名提交。</p>
    <div class="field"><label>咨询类别</label><select id="consult-type"><option>认捐与功德主权益</option><option>编纂计划与修藏进度</option><option>资金用途与公开记录</option><option>其他</option></select></div>
    <div class="field"><label>问题描述</label><textarea id="consult-text" placeholder="请尽量具体描述您的问题"></textarea></div>
    <div class="field"><label>联系方式（选填）</label><input placeholder="手机号或微信号"></div>
    <label class="check"><input type="checkbox" id="anonymous"><span>匿名提交，不在公开问答中展示称谓</span></label>
  `, `<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" id="submit-consult">提交咨询</button>`);
  document.querySelector('#submit-consult')?.addEventListener('click', () => {
    const text = document.querySelector('#consult-text')?.value.trim();
    if (!text) return showToast('请填写问题描述');
    state.consultations.push(text);
    closeOverlay();
    showToast('咨询已提交，预计 2 个工作日内回复');
  });
}

function inscriptionsHtml() {
  return `<article class="card quote-card"><div class="quote-text">新修嘉兴大藏经</div><div class="quote-sign"><span>恭请光泉大和尚</span><span>横幅墨宝 · 征集中</span></div></article>
  <article class="card quote-card"><div class="quote-text" style="writing-mode:vertical-rl;margin:auto;width:100%;height:210px">续佛慧命<br>法宝长存</div><div class="quote-sign"><span>大德题词 · 原型展示位</span><span>竖幅</span></div></article>
  <div class="notice">题词内容为原型示意，正式上线以项目组获授权的墨宝扫描件、题词释义及来源说明为准。</div>`;
}

function openInfo(title, html) {
  openSheet(title, html, `<button class="btn btn-block btn-ghost" data-close>关闭</button>`);
  const actions = overlayRoot.querySelector('.sheet-actions');
  if (actions) actions.style.gridTemplateColumns = '1fr';
  overlayRoot.querySelector('[data-sheet-go]')?.addEventListener('click', () => { closeOverlay(); setPage('catalog'); });
}

function openSheet(title, body, actions = '') {
  overlayRoot.innerHTML = `<div class="overlay"><section class="sheet"><header class="sheet-head"><h2>${title}</h2><button class="icon-btn" data-close aria-label="关闭">×</button></header><div class="sheet-body">${body}</div>${actions ? `<div class="sheet-actions">${actions}</div>` : ''}</section></div>`;
  bindOverlayBase();
}

function bindOverlayBase() {
  overlayRoot.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeOverlay));
  overlayRoot.querySelector('.overlay')?.addEventListener('click', event => { if (event.target.classList.contains('overlay')) closeOverlay(); });
}

function closeOverlay() { overlayRoot.innerHTML = ''; }

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

render();
