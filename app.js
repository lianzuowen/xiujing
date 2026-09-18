/* 新修嘉兴藏 · 交互原型（修正版）
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
 * 10) 小程序名称改为"新修嘉兴藏"
 */

const STAGES = [
  { code: 'todo', label: '待开始', desc: '排入编纂计划' },
  { code: 'doing', label: '断句 / 编辑中', desc: '正在断句或文字编辑' },
  { code: 'review', label: '复核 / 定稿中', desc: '专家团队复核中' },
  { code: 'done', label: '已圆满', desc: '已上版排版' }
];

const PER_PAGE_PRICE = 200;

// 收款账户占位（演示阶段先用 ********* 代替，正式版本会替换为实际对公账户）
const PAYMENT_ACCOUNT = '*********';

// 席位锁定天数（点击认捐后锁定 N 天内需上传凭证，否则自动释放）
const LOCK_DAYS = 7;

// 管理员账号（用于统一管理赠书情况 + 上传凭证）
const ADMIN_ACCOUNT = { username: 'admin', password: 'admin123', displayName: '管理员' };

// 一名用户同时只能认捐一部经书（含进行中 + 已完成）
const MAX_PLEDGES_PER_USER = 1;

// 赠送服务 3 项（完成认捐后发放）
const GIFT_TYPES = {
  guide:  { code: 'guide',  name: '嘉兴藏阅藏指南（电子版）', icon: '📘' },
  plaque: { code: 'plaque', name: '牌记',                    icon: '🪶' },
  pray:   { code: 'pray',   name: '三德弘法中心祈福法会',    icon: '🪷' }
};

// 常住地区选项（认捐流程第 1 步使用）
const REGION_COUNTRIES = ['中国大陆', '中国香港', '中国澳门', '中国台湾', '新加坡', '马来西亚', '美国', '加拿大', '澳大利亚', '日本', '韩国', '英国', '法国', '德国', '其他'];
const REGION_PROVINCES = ['北京市', '上海市', '天津市', '重庆市', '广东省', '浙江省', '江苏省', '四川省', '福建省', '湖北省', '湖南省', '山东省', '河南省', '河北省', '山西省', '陕西省', '辽宁省', '吉林省', '黑龙江省', '安徽省', '江西省', '云南省', '贵州省', '广西壮族自治区', '内蒙古自治区', '新疆维吾尔自治区', '西藏自治区', '宁夏回族自治区', '海南省', '甘肃省', '青海省', '其他'];
const REGION_CITIES = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆', '天津', '苏州', '青岛', '长沙', '郑州', '济南', '福州', '厦门', '宁波', '温州', '佛山', '东莞', '珠海', '中山', '惠州', '泉州', '合肥', '南昌', '昆明', '贵阳', '南宁', '哈尔滨', '长春', '沈阳', '大连', '兰州', '海口', '拉萨', '乌鲁木齐', '呼和浩特', '银川', '西宁', '太原', '石家庄', '其他'];

// 经书子类型（部类 → 子类）元数据：
// section 取值与 books[].section 保持一致（经藏 / 律藏 / 论藏 / 述藏）；
// count/volume 为该子类在整部《嘉兴藏》中的合计，仅用于头部展示。
const SUBCATEGORIES = {
  '经藏': [
    { key: 'huayan',   name: '华严部',   tag: '显教', count: 74,  volume: 359,  desc: '以《华严经》及宗密、李通玄等华严章疏为主，开显法界缘起、理事无碍、事事无碍之奥旨。' },
    { key: 'ahan',     name: '阿含部',   tag: '显教', count: 325, volume: 828,  desc: '原始佛教与部派佛教之根本经典，含《长阿含》《中阿含》《杂阿含》《增一阿含》。' },
    { key: 'fangdeng', name: '方等部',   tag: '显教', count: 291, volume: 844,  desc: '方等大乘经典，含《宝积》《大集》《维摩》《思益》《月灯》《楞严》等。' },
    { key: 'bore',     name: '般若部',   tag: '显教', count: 47,  volume: 842,  desc: '般若类经典总汇，含《大般若》《金刚》《心经》《仁王》《妙吉祥》等。' },
    { key: 'fahua',    name: '法华部',   tag: '显教', count: 47,  volume: 212,  desc: '以《法华经》及天台宗法华三大部（《玄义》《文句》《止观》）为骨干。' },
    { key: 'jingzhou', name: '经咒部',   tag: '密教', count: 260, volume: 481,  desc: '密教陀罗尼与诸经咒本，含《持世陀罗尼》《随求即得大自在陀罗尼》等。' },
    { key: 'yigui',    name: '仪轨部',   tag: '密教', count: 110, volume: 161,  desc: '密教修行仪轨与忏法，含《楞严》《大悲》《焰口》《水陆》各类仪轨科判。' }
  ],
  '律藏': [
    { key: 'jiejing', name: '戒经', tag: '律藏', count: 52, volume: 79,  desc: '四众戒本与菩萨戒经，含《梵网》《优婆塞》《十善业道》《在家律要》等。' },
    { key: 'lvyi',    name: '律仪', tag: '律藏', count: 58, volume: 480, desc: '僧团轨范与羯磨作法，含《四分律》《五分律》《十诵律》《僧祇律》等广律。' }
  ],
  '论藏': [
    { key: 'shijing', name: '释经',  tag: '论藏', count: 36, volume: 209, desc: '释经论典：对经文逐句注解的著作，如《大智度论》《法华玄义释签》《华严经探玄记》。' },
    { key: 'pitan',   name: '毗昙',  tag: '论藏', count: 43, volume: 733, desc: '阿毗达磨论书：以《俱舍》《婆沙》《杂心》为主，抉发诸法自相共相。' },
    { key: 'zhongguan', name: '中观', tag: '论藏', count: 30, volume: 74,  desc: '中观学派根本论：《中论》《百论》《十二门论》《三论玄义》《肇论》等。' },
    { key: 'yuqie',   name: '瑜伽部', tag: '论藏', count: 56, volume: 308, desc: '瑜伽行派论典：《瑜伽师地论》《成唯识论》《唯识三十颂》《摄大乘论》等。' },
    { key: 'lunji',   name: '论集',  tag: '论藏', count: 60, volume: 207, desc: '综合性的论集与法义汇编：《大乘义章》《翻译名义集》《大乘起信论》等。' }
  ],
  '述藏': [
    { key: 'huayanzong',   name: '华严宗', tag: '中国八宗', count: 171, volume: 1250, desc: '华严宗祖师撰述：杜顺、智俨、法藏、宗密、清凉国师一系著作。' },
    { key: 'lvzong',       name: '律宗',   tag: '中国八宗', count: 195, volume: 539,  desc: '律宗南山一脉撰述：道宣、弘一、灵芝元照诸律师之著述。' },
    { key: 'jingtuzong',   name: '净土宗', tag: '中国八宗', count: 154, volume: 333,  desc: '净土宗祖师撰述：善导、承远、法照、少康、莲池、蕅益、印光等。' },
    { key: 'sanlunzong',   name: '三论宗', tag: '中国八宗', count: 62,  volume: 213,  desc: '三论宗撰述：吉藏、僧肇、僧朗、僧诠、法朗等三论宗脉著作。' },
    { key: 'faxiangzong',  name: '法相宗', tag: '中国八宗', count: 121, volume: 682,  desc: '法相唯识宗（慈恩宗）撰述：窥基、慧沼、智周等唯识学论著。' },
    { key: 'mizong',       name: '密宗',   tag: '中国八宗', count: 124, volume: 573,  desc: '密宗（真言宗 / 唐密）撰述：不空、惠果、一行等译述与仪轨集成。' },
    { key: 'chanzong',     name: '禅宗',   tag: '中国八宗', count: 739, volume: 4362, desc: '禅宗祖师语录与撰述：《六祖坛经》《五灯会元》《宗镜录》《憨山梦游集》等。' },
    { key: 'tiantaizong',  name: '天台宗', tag: '中国八宗', count: 168, volume: 961,  desc: '天台宗撰述：智顗、灌顶、知礼、幽溪、藕益等台宗诸部。' },
    { key: 'shizhuan',     name: '史传',   tag: '史传',     count: 39,  volume: 467,  desc: '高僧传与佛教史传：《佛祖统纪》《南海寄归内法传》《弘明集》《广弘明集》等。' },
    { key: 'huibian',      name: '汇编',   tag: '汇编',     count: 44,  volume: 724,  desc: '综合性汇编：《法苑珠林》《诸经要集》《翻译名义集》《释氏要览》等。' },
    { key: 'lunheng',      name: '论衡',   tag: '论衡',     count: 19,  volume: 121,  desc: '教内论衡与护教撰述：《原人论》《辟邪集》《折疑论》《三教论衡》等。' },
    { key: 'dizhi',        name: '地志',   tag: '地志',     count: 68,  volume: 498,  desc: '佛教地志与山志寺志：《清凉山志》《峨眉山志》《九华山志》《普陀山志》等。' },
    { key: 'mulu1',        name: '目录',   tag: '目录',     count: 53,  volume: 265,  desc: '经典目录与藏经目录：《大唐内典录》《开元释教录》《至元法宝勘同总录》等。' },
    { key: 'mulu2',        name: '目录',   tag: '目录',     count: 17,  volume: 222,  desc: '近代经录与专科目录：《嘉兴藏目录》《频伽藏目录》《卍续藏经目录》等。' }
  ]
};

const books = [
  {
    id: 'JX-0012', title: '大方廣佛華嚴經', section: '经藏', sub: 'huayan', volume: '四十卷', status: '已圆满', progress: 100,
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
    id: 'JX-0047', title: '妙法莲华经', section: '经藏', sub: 'fahua', volume: '七卷', status: '已圆满', progress: 100,
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
    id: 'JX-0001', title: '佛说菩萨十住经', section: '经藏', sub: 'fangdeng', volume: '一卷', status: '可认捐', progress: 0,
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
    id: 'JX-0231', title: '金刚般若波罗蜜经', section: '经藏', sub: 'bore', volume: '一卷', status: '已圆满', progress: 100,
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
    id: 'JX-0528', title: '楞严经正脉疏', section: '经藏', sub: 'yigui', volume: '十卷', status: '可认捐', progress: 25,
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
    id: 'JX-1106', title: '五灯会元', section: '述藏', sub: 'chanzong', volume: '二十卷', status: '待领取', progress: 12,
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
    id: 'JX-2278', title: '憨山老人梦游集', section: '述藏', sub: 'chanzong', volume: '五十五卷', status: '可认捐', progress: 18,
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
    id: 'JX-0103', title: '大宝积经', section: '经藏', sub: 'fangdeng', volume: '四十九卷', status: '可认捐', progress: 6,
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
    id: 'JX-0186', title: '维摩诘所说经', section: '经藏', sub: 'fangdeng', volume: '三卷', status: '可认捐', progress: 0,
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
    id: 'JX-0309', title: '大智度论', section: '论藏', sub: 'shijing', volume: '一百卷', status: '可认捐', progress: 3,
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
    id: 'JX-0417', title: '六祖坛经', section: '述藏', sub: 'chanzong', volume: '一卷', status: '可认捐', progress: 0,
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
    id: 'JX-0562', title: '法华玄义释签', section: '论藏', sub: 'shijing', volume: '二十卷', status: '可认捐', progress: 0,
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
    id: 'JX-0648', title: '华严经探玄记', section: '论藏', sub: 'shijing', volume: '二十卷', status: '可认捐', progress: 12,
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
    id: 'JX-0735', title: '俱舍论颂', section: '论藏', sub: 'pitan', volume: '三十卷', status: '可认捐', progress: 0,
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
    id: 'JX-0892', title: '百丈清规', section: '述藏', sub: 'chanzong', volume: '十卷', status: '可认捐', progress: 0,
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
    id: 'JX-1024', title: '梵网经菩萨戒', section: '律藏', sub: 'jiejing', volume: '二卷', status: '可认捐', progress: 0,
    pages: 36, amount: 36 * PER_PAGE_PRICE,
    summary: '卢舍那佛为初地菩萨说十重四十八轻戒，为汉传大乘戒律根本。',
    stage: 'todo',
    toc: [
      ['卷上·释十重戒', '待开始'], ['卷下·释四十八轻戒', '待开始']
    ],
    sample: '若佛子。受菩萨戒者。应当发愿。愿一切众生皆得成佛。'
  },
  {
    id: 'JX-1352', title: '释净土群疑论', section: '述藏', sub: 'jingtuzong', volume: '六卷', status: '可认捐', progress: 0,
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
    id: 'JX-1489', title: '肇论', section: '述藏', sub: 'sanlunzong', volume: '三卷', status: '可认捐', progress: 0,
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
    id: 'JX-1602', title: '瑜伽师地论', section: '论藏', sub: 'yuqie', volume: '一百卷', status: '可认捐', progress: 0,
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
    id: 'JX-1745', title: '宗镜录', section: '述藏', sub: 'chanzong', volume: '一百卷', status: '可认捐', progress: 0,
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
    id: 'JX-1923', title: '南海寄归内法传', section: '述藏', sub: 'shizhuan', volume: '四卷', status: '可认捐', progress: 0,
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
    id: 'JX-2087', title: '原人论', section: '述藏', sub: 'lunheng', volume: '一卷', status: '可认捐', progress: 0,
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
    id: 'JX-2216', title: '三论玄义', section: '论藏', sub: 'zhongguan', volume: '二卷', status: '可认捐', progress: 0,
    pages: 40, amount: 40 * PER_PAGE_PRICE,
    summary: '吉藏大师释三论（般若、中论、百论）之大义，破邪显正。',
    stage: 'todo',
    toc: [
      ['卷上·释般若', '待开始'], ['卷下·释中百论', '待开始']
    ],
    sample: '一切法无自性，故名之为空；空亦复空，名为毕竟空。'
  },
  {
    id: 'JX-2394', title: '大乘起信论', section: '论藏', sub: 'lunji', volume: '一卷', status: '可认捐', progress: 0,
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
    id: 'JX-2518', title: '成唯识论', section: '论藏', sub: 'yuqie', volume: '十卷', status: '可认捐', progress: 0,
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
    id: 'JX-2671', title: '大乘义章', section: '论藏', sub: 'lunji', volume: '二十六卷', status: '可认捐', progress: 0,
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
    id: 'JX-2843', title: '翻译名义集', section: '论藏', sub: 'lunji', volume: '七卷', status: '可认捐', progress: 0,
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
    id: 'JX-2976', title: '佛祖统纪', section: '述藏', sub: 'shizhuan', volume: '五十四卷', status: '可认捐', progress: 0,
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

// 公开募缘录：一部经书对应一位功德主；同经不重复展示
const donations = [
  { name: '居士', book: '大方廣佛華嚴經', bookId: 'JX-0012', amount: 143600, date: '2026-07-15' },
  { name: '净莲', book: '妙法莲华经', bookId: 'JX-0047', amount: 42000, date: '2026-08-10' },
  { name: '王居士', book: '佛说菩萨十住经', bookId: 'JX-0001', amount: 1000, date: '2026-08-12' },
  { name: '明心', book: '金刚般若波罗蜜经', bookId: 'JX-0231', amount: 5600, date: '2026-08-10' },
  { name: '善护', book: '楞严经正脉疏', bookId: 'JX-0528', amount: 72000, date: '2026-08-10' },
  { name: '陈居士', book: '憨山老人梦游集', bookId: 'JX-2278', amount: 220000, date: '2026-08-09' }
];

// 认捐席位表：key 为 bookId；同一部经书允许多个锁定席位排队
// 锁定期间 receipt 为 null；上传凭证后 receipt.verified = true 即视为认捐完成
const seats = {
  'JX-0047': [
    {
      seatId: 'SEAT-20260906-001',
      bookId: 'JX-0047',
      userName: '净莲', userPhone: '13800138001',
      amount: 42000,
      lockedAt: '2026-09-06T10:00:00',
      expiresAt: '2026-09-13T23:59:59',  // 已过期（将在 cleanExpiredSeats 中清理）
      receipt: null
    }
  ],
  'JX-0528': [
    {
      seatId: 'SEAT-20260910-001',
      bookId: 'JX-0528',
      userName: '善护', userPhone: '13800138002',
      amount: 72000,
      lockedAt: '2026-09-10T09:00:00',
      expiresAt: '2026-09-17T23:59:59',
      receipt: null
    }
  ]
};

const state = {
  page: 'home',
  splash: true,
  preview: null,
  zoom: null,  // { src, caption }
  sampleTab: 'cover',     // cover / page / ledger
  catalogTab: '目录',
  catalogView: '全部',
  catalogFilter: '全部',
  query: '',
  transparentTab: '进度',
  loggedIn: false,
  user: null,
  // 管理员登录态（独立于普通用户；admin 与 普通用户互斥）
  adminLoggedIn: false,
  adminUser: null,
  selectedBook: null,
  pledgeStep: 0,
  amount: 0,
  signature: false,
  certificates: [],
  points: [],
  invites: { count: 0, friendDonation: 0 },
  myDonations: [],
  consultations: [],
  // 我的赠品（完成认捐后由管理员触发发放的 3 项服务）
  myGifts: null,  // { guide:{issued,code}, plaque:{issued,type,content}, pray:{issued,code,date} } 或 null
  // 认捐展示偏好：是否使用真实姓名、是否同意展示在功德簿
  pledgeUseRealName: true,
  pledgeShowInLedger: true,
  // 当前认捐的常住地区（国别 / 省份 / 城市）
  region: { country: '', province: '', city: '' },
  // 经书目录批量认捐清单（元素为 bookId）。打开经目时清空；选中项在子类型与经书卡片上同步高亮
  cart: [],
  // 当前用户已锁定的认捐席位（来自 seats 中 phone 与 state.user.phone 匹配且未过期的项）
  mySeats: [],
  // 最近一次认捐流程锁定的席位（用于"席位已锁定"成功页）
  _lastLockedSeat: null,
  _lastLockedSeats: null,
  _demoSeatsInited: false,
  // 子类型折叠/展开状态（key 为子类型标识；不存在的 key 视为默认展开）
  subOpen: {},
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
  return `<div class="statusbar"><span>9:41</span><span>新修嘉兴藏 · 原型</span><span>5G&nbsp;&nbsp;▰</span></div>`;
}

function setPage(page) {
  state.page = page;
  document.querySelectorAll('.tab-item').forEach(item => item.classList.toggle('active', item.dataset.tab === page));
  render();
  app.scrollTo({ top: 0, behavior: 'auto' });
}

function render() {
  cleanExpiredSeats();
  // demo 数据初始化（幂等）：让「经目 → 认捐中」能立即看到 demo 占座，无需先进入「我的」
  ensureDemoMySeats();
  if (state.loggedIn) refreshMySeats();
  if (state.splash) { app.innerHTML = renderSplash(); bindSplash(); return; }
  if (state.preview) { app.innerHTML = ''; renderPreview(); return; }
  // 进入小程序默认未登录；登录由用户主动触发（首页/经目/公开均可浏览，但不展示个人数据）
  const pages = { home: renderHome, catalog: renderCatalog, transparent: renderTransparent, profile: renderProfile };
  app.innerHTML = (pages[state.page] || renderHome)();
  bindPageEvents();
}

// 为演示用的「居士」准备默认的认捐记录：认捐了《大方廣佛華嚴經》全部 718 筒页 / ¥143,600
// 为演示用的「居士」准备默认的认捐记录：
// 需求：用户登录后的初始状态应该是「我的认捐」空 + 「认捐中」1 本（占座中）。
// 「我的认捐」的具体记录由管理员上传凭证后通过 finalizeSeat 落账生成。
// 因此 demo 阶段不再预先 push 一笔"已完成"的 myDonations，避免与"每位用户同时仅可认捐一部"的业务规则冲突。
function ensureDemoMyDonation() {
  if (state._demoInitialized) return;
  state._demoInitialized = true;
}

// 为演示用户「居士」预填 2 个锁定席位：
//  1) JX-0001（佛说菩萨十住经）：刚锁定 6 天前，还剩 1 天到期 → 触发到期通知横幅
// 注意：每位用户同时仅可认捐一部经书，demo 仅初始化一本正在认捐中的经书；
// 管理员上传凭证后，`getBookSeatStatus` 会切换为「已认捐」，
// 用户角色的"认捐中"列表随之清空、"已认捐"列表多 1 本，与业务预期一致。
function ensureDemoMySeats() {
  if (state._demoSeatsInited) return;
  state._demoSeatsInited = true;

  // 仅演示一本即将到期的认捐中经书
  const book1 = books.find(b => b.id === 'JX-0001');
  if (book1) {
    const lockedAt = new Date(Date.now() - 6 * 86400000);            // 6 天前锁定
    const expiresAt = new Date(lockedAt.getTime() + LOCK_DAYS * 86400000);
    const seat = {
      seatId: 'SEAT-20260907-001',
      bookId: book1.id,
      userName: '居士', userPhone: '13800138000',
      amount: book1.amount,
      lockedAt: lockedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      receipt: null
    };
    seats[book1.id] = seats[book1.id] || [];
    seats[book1.id].push(seat);
    state.mySeats = state.mySeats || [];
    state.mySeats.push(seat);
  }
}

/* ========== 开屏页 ========== */
function renderSplash() {
  return `<div class="splash" role="dialog" aria-label="新修嘉兴藏小程序开屏">
    <div class="splash-top">
      <span>新修嘉兴藏 · 大众护持平台</span>
      <span class="splash-stamp">辛卯 · 2026</span>
    </div>
    <img class="splash-lotus" src="assets/puxian-cover-fixed.jpg" alt="普贤行愿品封面">
    <div class="splash-mid">
      <h1>新修嘉兴藏</h1>
      <div class="splash-en">XIN XIU JIA XING DA ZANG JING</div>
      <div class="splash-divider"></div>
      <p class="splash-sub">接续浙地径山、嘉兴刻藏文脉<br>复原完整古藏 · 增补文献 · 传续法宝</p>
    </div>
    <div class="splash-quote">"以故宫珍藏本《嘉兴藏》为底本<br>正本清源，弘法利生"</div>
    <div class="splash-stats">
      <div><b>3,433</b><span>计划收录部数</span></div>
      <div><b>已完稿</b><span>阅藏指南</span></div>
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
    ${renderExpiringNotice()}
    <section class="hero">
      <div class="brandline">
        <img class="logo" src="assets/puxian-cover-fixed.jpg" alt="普贤行愿品封面">
        <div><h1>新修嘉兴藏</h1><p>新修嘉兴藏 · 大众护持平台</p></div>
      </div>
      <p class="hero-copy">为正本清源、弘法利生，由《嘉兴藏》（重辑·2008版）原班团队接续，引入 AI 与专家团队，重新修复、重新编序、重新增补。</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-go="catalog">认捐一部经</button>
        <button class="btn" data-go="guide">阅藏指南</button>
      </div>
    </section>
    <div class="stats-band">
      <div class="stat"><strong>3,433</strong><span>计划收录部数</span></div>
      <div class="stat"><strong>已完成</strong><span>阅藏指南</span></div>
    </div>

    <section class="intro-section">
      <div class="section-head"><div><h2>项目缘起</h2><p>一场跨越时代的文化传承工程</p></div></div>
      <div class="intro-card">
        <p>项目组历经十年努力，于 2008 年完成《嘉兴藏》（重辑·2008版），由民族出版社出版。其间留下两个遗憾：<b>增补内容有限、古籍修复有限</b>。经多方努力，自 2022 年起启动《新修嘉兴藏》工作，旨在通过古籍修复、内容重组、现代阐释及增补文献，编纂出一部<b>继承传统、发展创新的盛世大藏</b>。</p>
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
      <div class="section-head"><div><h2>样书样例</h2><p>点击切换：封面 / 正文样张 / 功德簿</p></div></div>
      <div class="book-sample">
        <div class="book-sample-tabs">
          <button class="${state.sampleTab === 'cover' ? 'active' : ''}" data-sample-tab="cover">封面</button>
          <button class="${state.sampleTab === 'page' ? 'active' : ''}" data-sample-tab="page">正文样张</button>
          <button class="${state.sampleTab === 'ledger' ? 'active' : ''}" data-sample-tab="ledger">功德簿</button>
        </div>
        <div class="book-sample-body">${sampleBody()}</div>
      </div>
    </section>

    <section class="intro-section">
      <div class="section-head"><div><h2>修经进度</h2><p>以部数计，已完成 / 进行中 / 待开始</p></div><button class="text-link" data-go="transparent">查看募缘记录 ›</button></div>
      <div class="progress-counts">
        <div class="pc done" data-go="transparent"><b>${doneCount}</b><span>已圆满</span><small>专家复核 + 上版</small></div>
        <div class="pc doing" data-go="transparent"><b>${doingCount}</b><span>进行中</span><small>断句 · 编辑 · 复核</small></div>
        <div class="pc todo" data-go="transparent"><b>${todoCount}</b><span>待开始</span><small>排入编纂计划</small></div>
      </div>
      <p class="prototype-note" style="margin-top:8px">* 演示数据。进度按每部经书当前所处阶段（断句 / 编辑 / 复核 / 已上版）统计，可进入经目查看每一部的阶段详情。</p>
    </section>

    <section class="intro-section">
      <div class="section-head"><div><h2>大德高僧题词</h2><p>以法语与墨宝，为修藏大业作见证</p></div><button class="text-link" data-go="inscriptions">查看全部 ›</button></div>
      <div class="inscription-grid">
        <article class="card inscription-card" data-go="inscriptions">
          <div class="inscription-img"><img src="assets/inscription-1-yicheng-publish.png" alt="一诚大和尚为《嘉兴藏》出版题词"></div>
          <div class="inscription-info"><strong>一诚大和尚</strong><small>中国佛教协会会长 · 为《嘉兴藏》出版题词</small></div>
        </article>
        <article class="card inscription-card" data-go="inscriptions">
          <div class="inscription-img"><img src="assets/inscription-2-yicheng-first.png" alt="一诚大和尚为《嘉兴藏》初版题词"></div>
          <div class="inscription-info"><strong>一诚大和尚</strong><small>中国佛教协会会长 · 为《嘉兴藏》初版题词</small></div>
        </article>
        <article class="card inscription-card" data-go="inscriptions">
          <div class="inscription-img"><img src="assets/inscription-3-benhuan.jpg" alt="本焕大和尚为重辑《嘉兴藏》题字"></div>
          <div class="inscription-info"><strong>本焕大和尚</strong><small>为重辑《嘉兴藏》题字</small></div>
        </article>
      </div>
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
        <div class="sample-compare-img"><img src="assets/puxian-cover-original.jpg" alt="封面·未修改" data-zoom="assets/puxian-cover-original.jpg" data-zoom-caption="修藏前 · 封面未修改"></div>
        <figcaption>修藏前 · 未修改<small class="zoom-hint">点击图片放大 ›</small></figcaption>
      </figure>
      <figure class="sample-compare-item">
        <div class="sample-compare-img"><img src="assets/puxian-cover-fixed.jpg" alt="封面·已重修" data-zoom="assets/puxian-cover-fixed.jpg" data-zoom-caption="修藏后 · 封面已重修"></div>
        <figcaption>修藏后 · 已重修<small class="zoom-hint">点击图片放大 ›</small></figcaption>
      </figure>
    </div>
    <p class="sample-compare-note">${book.title}（${book.volume}·${book.pages}筒页）封面修藏前后对比</p>`;
  }
  if (state.sampleTab === 'page') {
    return `<div class="sample-compare">
      <figure class="sample-compare-item">
        <div class="sample-compare-img"><img src="assets/puxian-text-original.jpg" alt="正文·未修复" data-zoom="assets/puxian-text-original.jpg" data-zoom-caption="正文修复前"></div>
        <figcaption>正文修复前<small class="zoom-hint">点击图片放大 ›</small></figcaption>
      </figure>
      <figure class="sample-compare-item">
        <div class="sample-compare-img"><img src="assets/puxian-text-fixed.png" alt="正文·已修复" data-zoom="assets/puxian-text-fixed.png" data-zoom-caption="正文修复后"></div>
        <figcaption>正文修复后<small class="zoom-hint">点击图片放大 ›</small></figcaption>
      </figure>
    </div>
    <p class="sample-compare-note">${book.title} 正文修复前后对比</p>`;
  }
  return renderBookLedger(book, list);
}

// 功德簿视图（首页样书样例 + 经书预览弹窗共用）
// 原则：一部经书只展示一位功德主（金额可能为续捐合并后的总额）
// 展示形式：左侧基础信息 + 右侧牌记图片
function renderBookLedger(book, list) {
  const total = list.reduce((s, d) => s + d.amount, 0);
  if (!list.length) {
    return `<div class="empty">尚无认捐记录<br><small>完成认捐后将自动展示</small></div>`;
  }
  const meritName = list[0].anonymous ? '匿名功德主' : list[0].name;
  return `
    <div class="book-ledger-split">
      <div class="book-ledger-info book-ledger-info-single">
        <div class="bli-row"><span>经名</span><b>${book.title}</b></div>
        <div class="bli-row"><span>卷数</span><b>${book.volume}</b></div>
        <div class="bli-row"><span>字数</span><b>260,968 字</b></div>
        <div class="bli-row"><span>筒页</span><b>${book.pages}</b></div>
        <div class="bli-row"><span>金额</span><b>¥${total.toLocaleString()}</b></div>
        <div class="bli-row"><span>功德芳名</span><b>${meritName}</b></div>
      </div>
      <div class="book-ledger-paiji">
        <div class="blp-tag">牌记</div>
        <img class="paiji-img" src="assets/paiji.png" alt="牌记" data-zoom="assets/paiji.png" data-zoom-caption="《${book.title}》修藏牌记">
        <small class="zoom-hint">点击牌记放大 ›</small>
      </div>
    </div>
  `;
}

/* ========== 经目（含阅藏指南） ========== */
function renderCatalog() {
  if (state.catalogTab === '指南') return renderGuide();
  const view = state.catalogView;
  const filtered = books.filter(book => {
    const hasDonor = !!(donors[book.id] && donors[book.id].length > 0);
    // 四个 tab 视图：全部 / 可认捐（仅未认捐）/ 认捐中（按当前席位状态动态判定）/ 已认捐
    let viewPass;
    if (view === '可认捐') {
      viewPass = book.status === '可认捐' && !hasDonor && filterByView(book, '可认捐');
    } else if (view === '认捐中') {
      viewPass = filterByView(book, '认捐中');
    } else if (view === '已认捐') {
      viewPass = hasDonor || filterByView(book, '已认捐');
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
        <button data-catalog-view="全部" class="${view === '全部' ? 'active' : ''}">全部 <em>3,433</em></button>
        <button data-catalog-view="可认捐" class="${view === '可认捐' ? 'active' : ''}">可认捐 <em>3,425</em></button>
        <button data-catalog-view="认捐中" class="${view === '认捐中' ? 'active' : ''}">认捐中 <em>${Object.values(seats).reduce((s, arr) => s + arr.filter(x => !x.receipt?.verified).length, 0)}</em></button>
        <button data-catalog-view="已认捐" class="${view === '已认捐' ? 'active' : ''}">已认捐 <em>7</em></button>
      </div>
      <label class="search" style="margin-top:12px"><span>⌕</span><input id="catalog-search" value="${state.query}" placeholder="搜索经名、编号或关键词" aria-label="搜索经书"></label>
      <div class="chips">${['全部','经藏','律藏','论藏','述藏'].map(item => `<button class="chip ${state.catalogFilter === item ? 'active' : ''}" data-filter="${item}">${item}</button>`).join('')}</div>
    </div>
    ${state.catalogFilter === '全部' ? `<div class="card catalog-summary"><div><strong id="catalog-count">3,433</strong> 部匹配经书</div><span class="prototype-note">458,088 简页 · 认捐 ¥${PER_PAGE_PRICE}/页</span></div>` : ''}
    ${renderCatalogList(filtered, view)}
    ${renderCartBar()}
  </div>`;
}

function filterByView(book, view) {
  if (view === '可认捐') {
    const hasDonor = !!(donors[book.id] && donors[book.id].length > 0);
    return book.status === '可认捐' && !hasDonor && getBookSeatStatus(book) === '可认捐';
  }
  if (view === '认捐中') return getBookSeatStatus(book) === '认捐中';
  if (view === '已认捐') return getBookSeatStatus(book) === '已认捐';
  return true;
}

// ============ 席位（seat）辅助函数 ============
// 根据 bookId + 当前时间判定经书的认捐状态：
//  - 已认捐：有任一 seat 已上传凭证且 verified
//  - 认捐中：有未过期的活跃 seat（未传凭证）
//  - 否则回退到 books 静态 status
function getBookSeatStatus(book) {
  const list = seats[book.id] || [];
  const now = Date.now();
  if (list.some(s => s.receipt && s.receipt.verified)) return '已认捐';
  if (list.some(s => !s.receipt?.verified && new Date(s.expiresAt).getTime() > now)) return '认捐中';
  return book.status;
}

// 获取某经书当前活跃（未过期、未完成）的席位
function getActiveSeat(bookId) {
  const list = seats[bookId] || [];
  const now = Date.now();
  return list.find(s => !s.receipt?.verified && new Date(s.expiresAt).getTime() > now) || null;
}

// 清理全局 seats 与 state.mySeats 中已过期且未传凭证的席位
function cleanExpiredSeats() {
  const now = Date.now();
  Object.keys(seats).forEach(bookId => {
    const before = seats[bookId].length;
    seats[bookId] = seats[bookId].filter(s => s.receipt?.verified || new Date(s.expiresAt).getTime() > now);
    if (!seats[bookId].length) delete seats[bookId];
    if (before !== (seats[bookId]?.length || 0)) {
      state.mySeats = (state.mySeats || []).filter(x => (seats[x.bookId] || []).some(s => s.seatId === x.seatId));
    }
  });
}

// 即将到期（剩余 ≤ 24h）且尚未上传凭证的席位
// 获取当前用户自己即将到期的席位（仅限当前登录用户，最多 1 部）
function getMyExpiringSeats() {
  if (!state.user) return [];
  const now = Date.now();
  const oneDay = 86400000;
  const out = [];
  (state.mySeats || []).forEach(s => {
    if (s.receipt?.verified) return;
    const remain = new Date(s.expiresAt).getTime() - now;
    if (remain > 0 && remain <= oneDay) {
      out.push({ ...s, _bookId: s.bookId, _remainMs: remain });
    }
  });
  return out;
}

function getExpiringSoonSeats() {
  const now = Date.now();
  const oneDay = 86400000;
  const out = [];
  Object.keys(seats).forEach(bookId => {
    (seats[bookId] || []).forEach(s => {
      if (s.receipt?.verified) return;
      const remain = new Date(s.expiresAt).getTime() - now;
      if (remain > 0 && remain <= oneDay) {
        out.push({ ...s, _bookId: bookId, _remainMs: remain });
      }
    });
  });
  return out;
}

// 当前用户（按手机号匹配）的未过期、未完成席位
function refreshMySeats() {
  state.mySeats = getMySeats();
  return state.mySeats;
}

function getMySeats() {
  if (!state.loggedIn || !state.user) return [];
  const now = Date.now();
  const out = [];
  Object.keys(seats).forEach(bookId => {
    (seats[bookId] || []).forEach(s => {
      if (s.userPhone === state.user.phone && (!s.receipt || !s.receipt.verified) && new Date(s.expiresAt).getTime() > now) {
        out.push(s);
      }
    });
  });
  return out;
}

// 通过 seatId 在全局 seats 中查找
function findSeatById(seatId) {
  for (const bookId in seats) {
    const found = (seats[bookId] || []).find(s => s.seatId === seatId);
    if (found) return found;
  }
  return null;
}

// ★ 普通用户取消认捐席位（仅未上传凭证时可取消；确认后释放锁定席位）
// 取消后该用户即可重新选择其他经书认捐；其他用户也可认捐此经书。
function cancelMySeat(seatId) {
  const seat = findSeatById(seatId);
  if (!seat) return showToast('席位不存在');
  // 只能取消自己的席位
  if (!state.user || seat.userPhone !== state.user.phone) {
    return showToast('只能取消自己的认捐席位');
  }
  // 已经上传凭证（无论是否已验证）均不可取消，避免与已到账资金冲突
  if (seat.receipt) {
    return showToast('该席位已上传凭证，无法取消认捐');
  }
  const book = books.find(b => b.id === seat.bookId);
  const bookTitle = book?.title || seat.bookId;
  // 弹出确认弹窗
  const html = `
    <div class="info">
      <h3 class="flow-title">确认取消认捐？</h3>
      <p class="flow-desc">您将释放已锁定的席位：</p>
      <div class="seat-mine-info" style="margin:10px 0">
        <div><span>经名</span><b>${bookTitle}</b></div>
        <div><span>席位编号</span><b>${seat.seatId}</b></div>
        <div><span>认捐金额</span><b class="payee-amount">¥${seat.amount.toLocaleString()}</b></div>
      </div>
      <div class="notice" style="margin-top:8px">
        取消后：<br>
        ① 该席位立即释放，可被其他功德主认捐；<br>
        ② 您可以重新选择其他经书进行认捐；<br>
        ③ 若您已完成银行转账，请先与项目组联系后再取消。
      </div>
      <div class="info-actions" style="margin-top:16px">
        <button class="btn btn-ghost" data-cancel>再想想</button>
        <button class="btn btn-danger" data-confirm>确认取消认捐</button>
      </div>
    </div>`;
  openInfo('取消认捐', html);
  overlayRoot.querySelector('[data-cancel]')?.addEventListener('click', () => {
    overlayRoot.innerHTML = '';
    render();
  });
  overlayRoot.querySelector('[data-confirm]')?.addEventListener('click', () => {
    // 从全局 seats 中删除
    const list = seats[seat.bookId] || [];
    seats[seat.bookId] = list.filter(s => s.seatId !== seatId);
    // 从 state.mySeats 中删除
    state.mySeats = (state.mySeats || []).filter(s => s.seatId !== seatId);
    // 清理可能保留的最近锁定引用
    if (state._lastLockedSeat?.seatId === seatId) state._lastLockedSeat = null;
    if (Array.isArray(state._lastLockedSeats)) {
      state._lastLockedSeats = state._lastLockedSeats.filter(s => s.seatId !== seatId);
      if (state._lastLockedSeats.length === 0) state._lastLockedSeats = null;
    }
    overlayRoot.innerHTML = '';
    showToast(`已取消《${bookTitle}》的认捐席位`);
    render();
  });
}

// 当前用户是否还能再认捐（同一用户最多 1 部）
// 判定条件：seats 中存在任何属于当前用户的"未释放、未完成"席位 → 不允许
// 已完成认捐（receipt.verified）也算已占用，直到超时释放才可再次认捐
function canUserPledgeAnother() {
  if (!state.user) return true;  // 未登录态放行（登录前会强制登录）
  return !getUserActivePledge();
}

// 返回当前用户已锁定的认捐（任一状态：进行中 / 已完成 / 已被释放前的座位）
function getUserActivePledge() {
  if (!state.user) return null;
  for (const bookId in seats) {
    const list = seats[bookId] || [];
    for (const s of list) {
      if (s.userPhone === state.user.phone) {
        // 仅"进行中或已完成"占名额；"超时已被释放"的（lockReleased=true）不占
        if (s._released) continue;
        return s;
      }
    }
  }
  return null;
}

// 凭证通过 / 直接生效后的落账动作：
//  生成证书 + 入积分 + 同步 donors/donations + 清理 mySeats
function finalizeSeat(seat) {
  const book = books.find(b => b.id === seat.bookId);
  if (!book) return;
  const certId = `CERT-${formatDate()}-${String(state.certificates.length + 1).padStart(3, '0')}`;
  const date = formatDate2();
  state.certificates = state.certificates || [];
  state.certificates.push({
    id: certId, book: book.title, amount: seat.amount,
    bookId: book.id, volume: book.volume, date,
    useRealName: state.pledgeUseRealName ?? true,
    showInLedger: state.pledgeShowInLedger ?? true,
    signedName: seat.userName
  });
  state.myDonations.push({
    certId, seatId: seat.seatId, book: book.title, amount: seat.amount, bookId: book.id,
    volume: book.volume, date,
    payMethod: '银行转账',
    tradeNo: `TX${formatDate()}${String(state.certificates.length).padStart(4, '0')}`,
    receipt: seat.receipt || null
  });
  state.points.unshift({
    type: 'donation',
    title: `认捐《${book.title}》（${book.pages}页）`,
    amount: seat.amount, date
  });
  // 同一经书只保留一条认捐记录
  const existing = (donors[book.id] && donors[book.id][0]) || null;
  const mergedAmount = existing ? existing.amount + seat.amount : seat.amount;
  donors[book.id] = [{
    name: seat.userName, amount: mergedAmount, date,
    anonymous: false, realName: true
  }];
  const idx = donations.findIndex(d => d.bookId === book.id);
  const row = { name: seat.userName, book: book.title, bookId: book.id, amount: mergedAmount, date };
  if (idx >= 0) donations[idx] = row; else donations.unshift(row);
  state.mySeats = (state.mySeats || []).filter(x => x.seatId !== seat.seatId);
}

// 格式化剩余天数（向上取整，最少 0）
function seatRemainDays(seat) {
  if (!seat) return 0;
  return Math.max(0, Math.ceil((new Date(seat.expiresAt).getTime() - Date.now()) / 86400000));
}

// 经书目录列表渲染：按部类 → 子类型 分组，可折叠展开
function renderCatalogList(filtered, view) {
  // 已认捐 / 可认捐 / 认捐中：维持原扁平列表（每条经书自身就是认捐单位）
  if (view === '可认捐') {
    const emptyMsg = '目前没有可认捐的经书，请切换到「全部」或「已认捐」查看';
    return `<div id="catalog-list" class="book-list" style="padding:12px 16px 0">${filtered.length ? filtered.map(bookCard).join('') : `<div class="card empty">${emptyMsg}</div>`}</div>`;
  }
  if (view === '已认捐') {
    const emptyMsg = '尚无已认捐的经书，欢迎前往「可认捐」认捐首部经书';
    return `<div id="catalog-list" class="book-list" style="padding:12px 16px 0">${filtered.length ? filtered.map(bookCard).join('') : `<div class="card empty">${emptyMsg}</div>`}</div>`;
  }
  if (view === '认捐中') {
    return renderSeatList(filtered);
  }

  // 全部：按部类 → 子类型 分组（亦支持 catalogFilter 指定单个部类）
  const sections = state.catalogFilter === '全部' ? ['经藏', '律藏', '论藏', '述藏'] : [state.catalogFilter];
  const groups = [];
  sections.forEach(section => {
    const subs = SUBCATEGORIES[section] || [];
    subs.forEach(sub => {
      const items = filtered.filter(b => b.section === section && b.sub === sub.key);
      groups.push({ section, sub, items });
    });
  });
  const totalShown = groups.reduce((acc, g) => acc + g.items.length, 0);
  if (!totalShown) return `<div class="card empty" style="margin:14px 16px 0">未找到相关经书，请调整筛选条件</div>`;

  return `<section class="section sub-section">
    ${groups.map((g, idx) => {
      // 默认第一个子类型展开；其它按 subOpen 状态
      const isOpen = state.subOpen[g.sub.key] !== undefined ? state.subOpen[g.sub.key] : idx === 0;
      const selectedInSub = g.items.filter(b => state.cart.includes(b.id)).length;
      const allSelected = g.items.length > 0 && selectedInSub === g.items.length;
      const someSelected = selectedInSub > 0 && !allSelected;
      const headerCheckbox = g.items.length
        ? `<label class="sub-check" data-stop><input type="checkbox" data-sub-toggle="${g.sub.key}" ${allSelected ? 'checked' : ''} ${someSelected ? 'data-indeterminate="1"' : ''}><span></span></label>`
        : '';
      return `<div class="sub-group ${isOpen ? 'open' : 'closed'}" data-sub-group="${g.sub.key}">
        <div class="sub-head" data-sub-toggle-row="${g.sub.key}">
          ${headerCheckbox}
          <div class="sub-head-info">
            <div class="sub-head-row1"><span class="sub-tag">${g.sub.tag}</span><span class="sub-name">${g.sub.name}</span><span class="sub-total">共 ${g.sub.count} 部 ${g.sub.volume} 卷</span></div>
            <div class="sub-head-row2">${g.sub.desc}</div>
          </div>
          <span class="sub-caret ${isOpen ? 'open' : ''}">▾</span>
        </div>
        ${isOpen ? `<div class="sub-body">
          <div class="sub-meta-line">${g.items.length} 部匹配${selectedInSub ? ` · 已选 ${selectedInSub} 部` : ''}</div>
          <div class="book-list">${g.items.length ? g.items.map(bookCard).join('') : '<div class="card empty">此子类型暂无匹配经书</div>'}</div>
        </div>` : ''}
      </div>`;
    }).join('')}
  </section>`;
}

// 计算当前购物车合计金额（只统计"可认捐"状态的经书，防御性过滤）
// 认捐中 tab 列表：按经/律/论/述四大部类分组，简单展示
function renderSeatList(filtered) {
  // 业务规则：每位用户同时仅可认捐一部经书。若用户已有"已认捐"记录，
  // 则「认捐中」视图不应再展示该用户的任何锁定席位（其席位要么已 verified、要么未释放）。
  // 对管理员模式不生效（管理员需要看到所有席位以便上传凭证）。
  const seatBooks = (filtered || books.filter(b => getBookSeatStatus(b) === '认捐中'))
    .filter(b => {
      if (state.adminLoggedIn) return true;
      if (!state.loggedIn || !state.user) return true;
      // 若当前用户已存在 myDonations（已认捐记录），整条都不在自己的「认捐中」视图内
      if (state.myDonations.length > 0) return false;
      // 否则：座位中若有其他用户（phone 不匹配）的席位，隐藏；只保留自己或"无主"席位
      const list = seats[b.id] || [];
      return list.some(s => !s.userPhone || s.userPhone === state.user.phone);
    });
  if (!seatBooks.length) {
    return `<div class="card empty" style="margin:14px 16px 0">当前没有正在锁定的认捐席位<br><small>前往「可认捐」选择经书认捐</small></div>`;
  }
  const groups = ['经藏', '律藏', '论藏', '述藏'].map(section => ({
    section,
    items: seatBooks.filter(b => b.section === section)
  })).filter(g => g.items.length);

  return `<section class="section" style="padding:12px 16px 0">
    <div class="card" style="padding:14px;background:#fff8e8;border:1px solid #ead9b3;margin-bottom:12px">
      <div style="font-size:12px;color:#7a5520;line-height:1.6">
        <b>共 ${seatBooks.length} 部经书正在锁定认捐席位</b><br>
        每部经书的认捐席位将保留 ${LOCK_DAYS} 天，期间请完成银行转账。普通用户<b>无需自行上传凭证</b>——管理员在银行账户收到您的汇款后，将上传收款凭证并确认认捐。
      </div>
    </div>
    ${state.adminLoggedIn ? `<div class="admin-mode-banner"><span class="admb-icon">⚙</span><div><strong>管理员模式</strong><br><small>您可以为任意席位上传收款凭证并完成认捐。</small></div><button class="text-link" data-action="logout">退出</button></div>` : ''}
    ${groups.map(g => `
      <div class="card seat-group">
        <div class="seat-group-head"><strong>${g.section}</strong><span>${g.items.length} 部锁定中</span></div>
        ${g.items.map(b => {
          const seat = getActiveSeat(b.id);
          // 防御：若 seat 为 null（席位已过期但 view 过滤还残留），跳过该条
          if (!seat) return '';
          const remain = seatRemainDays(seat);
          const isUrgent = remain <= 1;
          const lockedAtShort = seat.lockedAt.slice(0, 10);
          // 按钮逻辑：
          //   · 管理员登录 → 任何席位均可「上传凭证」（不限本人；其他人的席位也能传）
          //   · 普通用户本席位、未上传凭证 → 「查看凭证」（只读，未上传则提示等待）
          //   · 普通用户本席位、已上传凭证 → 「查看凭证」（只读，展示凭证信息）
          //   · 他人席位 → 「查看」
          const isMine = state.loggedIn && state.user && state.user.phone === seat.userPhone;
          let actionBtn;
          if (state.adminLoggedIn) {
            // 管理员：不论哪个席位都能上传/查看凭证
            if (seat.receipt?.verified) {
              actionBtn = `<button class="btn btn-ghost" data-action="view-receipt" data-stop data-seat="${seat.seatId}">查看凭证</button>`;
            } else {
              actionBtn = `<button class="btn btn-primary ${isUrgent ? 'btn-urgent' : ''}" data-action="upload-receipt-admin" data-stop data-seat="${seat.seatId}">${isUrgent ? '⚠️ 上传凭证' : '上传凭证'}</button>`;
            }
          } else if (isMine) {
            actionBtn = `<button class="btn btn-ghost" data-action="view-receipt" data-stop data-seat="${seat.seatId}">查看凭证</button>`;
          } else {
            actionBtn = `<button class="btn btn-ghost" data-action="open-book" data-stop data-book="${b.id}">查看</button>`;
          }
          // 管理员模式下，每行附加管理员徽章
          const adminTag = state.adminLoggedIn ? `<small class="admin-tag">${seat.userName || '未知'}</small>` : '';
          return `
            <div class="seat-row" data-book="${b.id}">
              <div class="seat-row-info">
                <strong>${b.title}</strong>
                <small>${bookCode(b)} · ${b.volume} · ${b.section}</small>
                <small class="lock-meta">锁定于 ${lockedAtShort}${isMine ? ` · ${seat.userName}` : ` · ${seat.userName}`}${adminTag ? ` · ` : ''}${adminTag}</small>
              </div>
              <div class="seat-row-meta">
                <span class="badge gold">认捐中</span>
                <b>¥${b.amount.toLocaleString()}</b>
                <small class="${isUrgent ? 'urgent' : ''}">剩余 ${remain} 天${isUrgent ? ' · 即将到期' : ''}</small>
              </div>
              <div class="seat-row-action">
                ${actionBtn}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('')}
  </section>`;
}

// 即将到期提示横幅（用于首页 / 募缘 / 我的 顶部）
function renderExpiringNotice() {
  // 普通用户：只看自己即将到期的席位（最多 1 部）；管理员：全局视角
  const list = (state.adminLoggedIn || !state.loggedIn) ? getExpiringSoonSeats() : getMyExpiringSeats();
  if (!list.length) return '';
  const summary = list.slice(0, 3).map(s => {
    const book = books.find(b => b.id === s._bookId);
    const hours = Math.max(1, Math.ceil(s._remainMs / 3600000));
    return `${book?.title || ''} · 剩 ${hours} 小时`;
  }).join(' / ');
  return `<div class="expiring-notice" role="alert" data-go="my-seats">
    <span class="en-icon">⏰</span>
    <div class="en-body">
      <strong>${list.length} 部经书认捐席位即将到期</strong>
      <small>${summary}${list.length > 3 ? ' …' : ''}</small>
    </div>
    <button class="text-link">查看 ›</button>
  </div>`;
}

function cartSummary() {
  const ids = state.cart;
  const booksInCart = ids.map(id => books.find(b => b.id === id)).filter(Boolean);
  const total = booksInCart.reduce((sum, b) => sum + (b.amount || 0), 0);
  return { count: booksInCart.length, total, books: booksInCart };
}

// 底部认捐清单条（仅当选中数 > 0 时显示）
function renderCartBar() {
  const { count, total } = cartSummary();
  if (!count) return '';
  return `<div class="cart-bar" data-cart-bar>
    <div class="cart-bar-info">
      <div class="cart-bar-count">已选 <b>${count}</b> 部</div>
      <div class="cart-bar-total">合计 <b>¥${total.toLocaleString()}</b></div>
    </div>
    <div class="cart-bar-actions">
      <button class="text-link" data-cart-clear>清空</button>
      <button class="btn btn-primary" data-cart-go>去认捐 ›</button>
    </div>
  </div>`;
}

function renderGuide() {
  return `<div class="page">
    ${statusBar()}
    <header class="topbar"><span style="width:44px"></span><h1>阅藏指南</h1><span style="width:44px"></span></header>
    <section class="guide-hero">
      <h2>新修嘉兴藏 · 阅藏指南</h2>
      <p>嘉兴藏是明代方册本大藏经的代表。本次新修以故宫珍藏本为底本，邀大众"以阅入藏、以捐护藏"。</p>
    </section>
    <section class="section">
      <div class="section-head"><div><h2>入藏路径</h2><p>建议按以下顺序开始</p></div></div>
      <div class="home-action-list">
        <article class="card home-action"><div class="home-action-mark">知</div><div class="home-action-body"><strong>一、了解版本特色</strong><small>了解方册本嘉兴藏的历史价值与本次新修的范围</small></div></article>
        <article class="card home-action"><div class="home-action-mark blue">选</div><div class="home-action-body"><strong>二、选择部类</strong><small>按经藏·律藏·论藏·述藏四部分类建立阅读计划</small></div></article>
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
        <button class="chip" data-filter="述藏">述藏</button>
      </div>
    </section>
    <section class="section" style="padding-bottom:22px"><button class="btn btn-primary btn-block" data-go="catalog-list">进入经书目录</button></section>
  </div>`;
}

// 经书编号显示：去掉 JX- 前缀，统一显示 4 位数字（如 0001 / 0199）
function bookCode(book) {
  return String(book.id).replace(/^JX-/, '').padStart(4, '0');
}

function bookCard(book) {
  // 原则：一部经书一旦有认捐者，状态显示为「已认捐」，不再标注「可认捐」
  const hasDonor = (donors[book.id] && donors[book.id].length > 0);
  const statusLabel = hasDonor ? '已认捐' : book.status;
  const badgeClass = statusLabel === '已圆满' ? 'gray' : statusLabel === '已认捐' ? 'gray' : 'gold';
  const stageInfo = STAGES.find(s => s.code === book.stage) || STAGES[0];
  // 批量认捐：仅在「可认捐」视图下显示复选框，已认捐/已圆满经书不能加入购物车
  const selectable = book.status === '可认捐' && !hasDonor;
  const checked = selectable && state.cart.includes(book.id);
  const sub = (SUBCATEGORIES[book.section] || []).find(s => s.key === book.sub);
  const subTag = sub ? `<span class="book-sub">${sub.tag} · ${sub.name}</span>` : '';
  const checkbox = selectable
    ? `<label class="book-check" data-stop><input type="checkbox" data-cart="${book.id}" ${checked ? 'checked' : ''}><span></span></label>`
    : '';
  return `<article class="card book-card ${checked ? 'is-checked' : ''}" data-book="${book.id}">
    <div class="book-meta">
      <div class="book-meta-info">
        <span class="book-title">${book.title}</span>
        <span class="book-code">${bookCode(book)} · ${book.section} · ${book.volume}</span>
        ${subTag}
      </div>
      <div class="book-meta-side">
        ${checkbox}
        <span class="badge ${badgeClass}">${statusLabel}</span>
      </div>
    </div>
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

/* ========== 募缘（3 个模块，已移除赠书） ========== */
function renderTransparent() {
  const t = state.transparentTab;
  const content = t === '进度' ? myProgressContent() : t === '资金' ? myFundContent() : ledgerContent();
  return `<div class="page">
    ${statusBar()}
    ${renderExpiringNotice()}
    <header class="topbar"><span style="width:44px"></span><h1>我的募缘</h1><button class="icon-btn" data-action="verify" aria-label="证书验证">⌕</button></header>
    <section class="section" style="padding-top:14px"><div class="segment">${['进度','资金','募缘录'].map(tab => `<button class="${state.transparentTab === tab ? 'active' : ''}" data-transparent="${tab}">${tab}</button>`).join('')}</div></section>
    <section class="section" style="padding-top:14px">${content}</section>
    ${t === '进度' ? `
    <section class="section" style="padding-bottom:22px"><button class="btn btn-block btn-ghost" data-go="consult">修藏专项咨询</button></section>` : ''}
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
        <span>${bookCode(book)} · ${book.section || '经藏'} · ${book.volume}</span>
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
    const payMethod = book.donation.payMethod || '微信支付';
    const tradeNo = book.donation.tradeNo || `TX${(book.donation.date || '').replace(/-/g, '')}0001`;
    const volume = book.volume || (books.find(b => b.id === book.id)?.volume) || '';
    return `<article class="card fund-book">
      <div class="fund-book-head"><strong>${book.title}</strong><span class="badge">${bookCode(book)}</span></div>
      <div class="fund-book-info">
        <div><span>经书名称</span><b>${book.title}</b></div>
        <div><span>卷数</span><b>${volume}</b></div>
        <div><span>筒页</span><b>${book.pages}</b></div>
        <div><span>金额</span><b>¥${donated.toLocaleString()}</b></div>
        <div><span>捐赠日期</span><b>${book.donation.date}</b></div>
        <div><span>支付方式</span><b>${payMethod}</b></div>
      </div>
      <div class="fund-book-trade"><span>交易单号</span><b>${tradeNo}</b></div>
    </article>`;
  }).join('');
  return `
    <div class="section-head"><div><h2>我的认捐经书 · 资金信息</h2><p>按经书为单位展示认捐金额与支付信息</p></div></div>
    <div class="book-list">${cards}</div>
    <div class="notice" style="margin-top:12px">资金使用明细按经书展示；交易单号对应每一笔认捐的支付记录，可在认证页查询。</div>`;
}

function fundContent() {
  return `<div class="metric-grid"><article class="card metric"><span>累计护持金额*</span><strong>¥826万</strong></article><article class="card metric"><span>已公开支出*</span><strong>¥318万</strong></article></div>
  <article class="card trace-card" style="margin-top:10px"><div class="section-head"><div><h2>资金用途</h2><p>2026 年 7—8 月演示数据</p></div></div>
  ${[['古籍数字稿修复',42],['编校劳务与专家复核',31],['技术研发与软件服务',18],['出版与项目运营',9]].map(([name,value]) => `<div style="margin-bottom:14px"><div class="book-progress-label"><span>${name}</span><b>${value}%</b></div><div class="progress gold"><i style="width:${value}%"></i></div></div>`).join('')}
  <button class="btn btn-block btn-ghost" data-action="fund-detail">查看票据与支出明细</button></article>`;
}
// 注：旧 fundContent 保留以便向下兼容；溯 tab 资金板块已切换为 myFundContent（按经书为单位）

function ledgerContent() {
  return `<div class="section-head"><div><h2>公开募缘录</h2><p>经授权展示的护持记录</p></div><span class="badge">实时更新*</span></div>
  <div class="ledger-list">${donations.map(item => ledgerRow(item)).join('')}</div>
  <div class="notice" style="margin-top:12px">每笔认捐均关联电子协议、支付记录与唯一存证编号；功德主可选择公开称谓或匿名展示。</div>`;
}

function ledgerRow(item) {
  const book = books.find(b => b.id === item.bookId);
  const volume = book ? book.volume : '';
  const pages = book ? book.pages : '';
  return `<article class="card ledger-row ledger-detail">
    <div class="ledger-grid">
      <div class="lg-row"><span>经名</span><b>${item.book}</b></div>
      <div class="lg-row"><span>卷数</span><b>${volume}</b></div>
      <div class="lg-row"><span>字数</span><b>260,968 字</b></div>
      <div class="lg-row"><span>筒页</span><b>${pages}</b></div>
      <div class="lg-row"><span>金额</span><b class="amount">¥${item.amount.toLocaleString()}</b></div>
      <div class="lg-row"><span>功德芳名</span><b>${item.name}</b></div>
      <div class="lg-row lg-full"><span>捐赠日期</span><b>${item.date}</b></div>
    </div>
  </article>`;
}

/* ========== 我的（功德主中心，已移除赠书和藏经编辑入口） ========== */
function renderProfileAdmin() {
  // 管理员登录态下的"我的"页
  const pendingCount = countPendingSeats();
  return `<div class="page">
    ${statusBar()}
    <section class="profile-head admin-profile-head">
      <div class="profile-user">
        <div class="profile-avatar admin-avatar"><svg class="profile-avatar-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1l3 6 6 1-4.5 4.5L18 19l-6-3-6 3 1.5-6.5L3 8l6-1z" fill="currentColor"></path></svg></div>
        <div><h2>${state.adminUser.name}</h2><p>${state.adminUser.username} · 统一管理赠书情况</p></div>
      </div>
    </section>

    <section class="section" style="padding-top:14px">
      <div class="admin-mode-banner">
        <span class="admb-icon">⚙</span>
        <div><strong>当前为管理员模式</strong><br><small>您可以在【经目 → 认捐中】查看所有待确认席位并上传收款凭证。</small></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>管理快链</h2></div></div>
      <div class="quick-grid">
        <button class="quick-item" data-action="go-pending-seats"><span class="quick-icon">票</span><span>待确认席位（${pendingCount}）</span></button>
        <button class="quick-item" data-action="go-pending-seats"><span class="quick-icon">认</span><span>认捐中列表</span></button>
        <button class="quick-item" data-action="switch-user"><span class="quick-icon">换</span><span>切换普通用户</span></button>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>操作指引</h2></div></div>
      <div class="card notice">
        <b>管理员操作流程：</b><br>
        ① 在【经目 → 认捐中】查看所有待确认席位<br>
        ② 点击席位行右侧「上传凭证」按钮<br>
        ③ 上传银行收款截图，系统自动 OCR 识别<br>
        ④ 核对无误后点击「确认无误，完成认捐」<br>
        ⑤ 系统自动落账 + 发放 3 项赠品（阅藏指南 / 牌记 / 祈福法会）
      </div>
    </section>
    <section class="section">
      <button class="btn btn-block btn-logout" data-action="logout">退出登录</button>
    </section>
  </div>`;
}

// 统计当前还有效但未完成凭证上传的席位
function countPendingSeats() {
  let n = 0;
  const now = Date.now();
  for (const bookId in seats) {
    (seats[bookId] || []).forEach(s => {
      if (!s.receipt?.verified && new Date(s.expiresAt).getTime() > now && !s._released) n++;
    });
  }
  return n;
}

function renderProfile() {
  // 演示态已关闭：点击"进入小程序"后默认未登录，需用户主动登录或注册
  // // ★ 演示态：仅在整个会话**第一次**进"我的"页时，自动以「居士」身份登录
  // //   一旦用户主动退出过（_userEverLoggedOut = true），就不再自动登录
  // //   这样管理员登录后不会被居士覆盖，用户退出后能正常进入登录页
  // if (!state.loggedIn && !state.adminLoggedIn && state.demoUser && !state._userEverLoggedOut && !state._firstProfileVisitDone) {
  //   state.loggedIn = true;
  //   state.user = { ...state.demoUser };
  //   state._firstProfileVisitDone = true;
  // }
  // 管理员模式：渲染"管理员专属我的页"（无需居士身份）
  if (state.adminLoggedIn) return renderProfileAdmin();
  if (!state.loggedIn) return renderProfileGuest();
  // 初始化演示数据
  ensureDemoMyDonation();
  ensureDemoMySeats();
  refreshMySeats();
  const totalPoints = state.myDonations.reduce((s, d) => s + d.amount, 0) + Math.round(state.invites.friendDonation * 0.5);
  const mySeatsHtml = state.mySeats.length ? renderMySeats() : '';
  return `<div class="page">
    ${statusBar()}
    ${renderExpiringNotice()}
    ${state.adminLoggedIn ? `<div class="admin-mode-banner" style="margin:14px 16px 0"><span class="admb-icon">⚙</span><div><strong>${state.adminUser.name}</strong><br><small>当前为管理员模式。可在【经目 → 认捐中】为任意席位上传收款凭证。</small></div><button class="text-link" data-action="logout">退出管理员</button></div>` : ''}
    <section class="profile-head">
      <div class="profile-user">
        <div class="profile-avatar profile-avatar-img"><svg class="profile-avatar-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="currentColor"></circle><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor"></path></svg></div>
        <div><h2>${state.user.name}</h2><p>功德主编号 ${state.user.code}</p></div>
        <button class="btn" style="margin-left:auto;border-color:rgba(255,255,255,.45);color:white;background:transparent" data-action="profile-edit">资料</button>
      </div>
      <div class="points">
        <div><span>莲座问功德积分</span><strong>${totalPoints.toLocaleString()}</strong></div>
        <div style="text-align:right"><span>本月购物倍率</span><strong>2×</strong></div>
      </div>
    </section>
    ${mySeatsHtml}
    <section class="section">
      <div class="section-head"><div><h2>权益快链</h2></div></div>
      <div class="quick-grid">
        <button class="quick-item" data-action="points-detail"><span class="quick-icon">分</span><span>积分明细</span></button>
        <button class="quick-item" data-action="invite"><span class="quick-icon">荐</span><span>扫码推荐</span></button>
        <button class="quick-item" data-action="certificates"><span class="quick-icon">证</span><span>荣誉证书</span></button>
        <button class="quick-item" data-action="my-gifts"><span class="quick-icon">礼</span><span>我的赠品</span></button>
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
        <button class="menu-row" data-go="consult"><span class="menu-icon">问</span><span>专项咨询</span><small>›</small></button>
        <button class="menu-row" data-action="about"><span class="menu-icon">缘</span><span>关于新修嘉兴藏</span><small>›</small></button>
      </div>
    </section>
    <section class="section">
      <button class="btn btn-block btn-logout" data-action="logout">退出登录</button>
    </section>
  </div>`;
}

// 「我的认捐中」模块
function renderMySeats() {
  return `<section class="section">
    <div class="section-head">
      <div><h2>我的认捐中</h2><p>锁定席位 ${LOCK_DAYS} 天内需上传凭证，逾期将自动释放</p></div>
      <span class="badge gold">${state.mySeats.length} 个</span>
    </div>
    ${state.mySeats.map(seat => {
      const book = books.find(b => b.id === seat.bookId);
      const remain = seatRemainDays(seat);
      const isUrgent = remain <= 1;
      const expiresAtShort = seat.expiresAt.replace('T', ' ').slice(0, 16);
      return `
        <article class="card seat-mine">
          <div class="seat-mine-head">
            <strong>${book?.title || seat.bookId}</strong>
            <span class="badge ${seat.receipt?.verified ? 'gray' : 'gold'}">${seat.receipt?.verified ? '已完成' : '认捐中'}</span>
          </div>
          <div class="seat-mine-info">
            <div><span>应转金额</span><b class="payee-amount">¥${seat.amount.toLocaleString()}</b></div>
            <div><span>收款账户</span><b class="payee-account">${PAYMENT_ACCOUNT}</b></div>
            <div>
              <span>剩余时间</span>
              <b class="${isUrgent ? 'urgent' : ''}">${seat.receipt?.verified ? '已生效' : `${remain} 天${isUrgent ? ' · 即将到期' : ''}`}</b>
            </div>
            <div><span>席位编号</span><b>${seat.seatId}</b></div>
            <div><span>凭证状态</span><b>${seat.receipt?.verified ? `<span class="badge gray">已上传</span>` : `<span class="badge gold">待管理员上传</span>`}</b></div>
          </div>
          <div class="seat-mine-actions">
            <button class="btn btn-ghost" data-action="view-receipt" data-seat="${seat.seatId}">查看凭证</button>
            ${!seat.receipt?.verified ? `<button class="btn btn-ghost btn-danger" data-action="cancel-seat" data-seat="${seat.seatId}">取消认捐</button>` : ''}
          </div>
        </article>
      `;
    }).join('')}
  </section>`;
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
        <button class="menu-row" data-go="consult"><span class="menu-icon">问</span><span>专项咨询</span><small>›</small></button>
        <button class="menu-row" data-action="about"><span class="menu-icon">缘</span><span>关于新修嘉兴藏</span><small>›</small></button>
      </div>
    </section>
    <section class="section">
      <button class="btn btn-block btn-primary" data-action="login">登录 / 注册</button>
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
    <button class="btn btn-ghost btn-block" style="margin-top:10px" data-action="view-mydonation-receipt" data-donation="${d.certId}">查看凭证</button>
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
  document.querySelectorAll('[data-action]').forEach(el => el.addEventListener('click', e => {
    // 仅当事件来自纯包装元素（如 checkbox 外壳）且自身没有 action 时，
    // 才阻止冒泡；带 data-action 的按钮（如 上传凭证/查看凭证/查看）需正常处理
    if (e.target.closest('[data-stop]') && !e.target.closest('[data-action]')) {
      e.stopPropagation();
      return;
    }
    // 若当前元素是容器（如 article），且点击来自其内部带 data-action 的子元素，
    // 则跳过自身 handler，让子元素 handler 处理
    if (el !== e.target.closest('[data-action]')) return;
    const action = el.dataset.action;
    if (action === 'upload-receipt-admin') {
      // 管理员上传凭证
      e.stopPropagation();
      if (!state.adminLoggedIn) return showToast('仅管理员可上传凭证');
      return adminUploadReceipt(el.dataset.seat);
    }
    if (action === 'view-receipt') {
      // 普通用户 / 管理员查看凭证（只读）
      e.stopPropagation();
      return viewReceipt(el.dataset.seat);
    }
    if (action === 'cancel-seat') {
      // 普通用户取消自己的认捐席位（仅未上传凭证时可取消）
      e.stopPropagation();
      return cancelMySeat(el.dataset.seat);
    }
    if (action === 'view-mydonation-receipt') {
      // "我的认捐"模块查看凭证
      e.stopPropagation();
      const donation = state.myDonations.find(x => x.certId === el.dataset.donation);
      return viewMyDonationReceipt(donation);
    }
    if (action === 'open-book') {
      e.stopPropagation();
      return openBook(el.dataset.book);
    }
    if (action === 'view-cert') {
      e.stopPropagation();
      const cert = state.certificates[state.certificates.length - 1];
      if (cert) openInfo('证书详情', certificateHtml(cert));
      return;
    }
    handleAction(action);
  }));
  document.querySelectorAll('[data-sample-tab]').forEach(el => el.addEventListener('click', () => { state.sampleTab = el.dataset.sampleTab; render(); }));
  document.querySelectorAll('[data-zoom]').forEach(el => el.addEventListener('click', () => openZoom(el.dataset.zoom, el.dataset.zoomCaption)));
  // 子类型折叠/展开
  // 子类型折叠/展开（点击 header 区域时触发；checkbox 自身 click 会 stopPropagation）
  document.querySelectorAll('[data-sub-toggle-row]').forEach(el => el.addEventListener('click', e => {
    if (e.target.closest('[data-stop]')) return; // 来自 checkbox 的点击直接放行，不翻转折叠
    const key = el.dataset.subToggleRow;
    const current = state.subOpen[key];
    state.subOpen[key] = current === undefined ? false : !current;
    render();
  }));
  // 子类型全选 / 全不选
  document.querySelectorAll('[data-sub-toggle]').forEach(el => el.addEventListener('change', e => {
    e.stopPropagation();
    const key = el.dataset.subToggle;
    const sub = (SUBCATEGORIES[state.catalogFilter] || []).find(s => s.key === key)
            || Object.values(SUBCATEGORIES).flat().find(s => s.key === key);
    if (!sub) return;
    const ids = books.filter(b => b.sub === key && b.status === '可认捐' && !(donors[b.id] && donors[b.id].length > 0)).map(b => b.id);
    if (el.checked) {
      state.cart = Array.from(new Set([...state.cart, ...ids]));
    } else {
      const set = new Set(ids);
      state.cart = state.cart.filter(id => !set.has(id));
    }
    render();
  }));
  // 单本勾选
  document.querySelectorAll('[data-cart]').forEach(el => el.addEventListener('change', e => {
    e.stopPropagation();
    const id = el.dataset.cart;
    if (el.checked) {
      if (!state.cart.includes(id)) state.cart = [...state.cart, id];
    } else {
      state.cart = state.cart.filter(x => x !== id);
    }
    // 局部刷新底部条与卡片样式即可，避免全量 render（搜索框不丢焦）
    const bar = document.querySelector('[data-cart-bar]');
    if (bar) bar.outerHTML = renderCartBar();
    const card = el.closest('.book-card');
    if (card) card.classList.toggle('is-checked', el.checked);
    bindCartBar();
  }));
  // 阻止勾选框区域触发 openBook
  document.querySelectorAll('[data-stop]').forEach(el => el.addEventListener('click', e => e.stopPropagation()));
  bindCartBar();
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
    const host = document.querySelector('.sub-section') || document.querySelector('#catalog-list');
    if (host) host.outerHTML = renderCatalogList(filtered, state.catalogView);
    bindCatalogListEvents();
    bindCartBar();
  });
}

// 复用：搜索时局部替换列表后，需要重新绑定列表内事件
function bindCatalogListEvents() {
  document.querySelectorAll('[data-sub-toggle-row]').forEach(el => el.addEventListener('click', e => {
    if (e.target.closest('[data-stop]')) return;
    const key = el.dataset.subToggleRow;
    const current = state.subOpen[key];
    state.subOpen[key] = current === undefined ? false : !current;
    render();
  }));
  document.querySelectorAll('[data-sub-toggle]').forEach(el => el.addEventListener('change', e => {
    e.stopPropagation();
    const key = el.dataset.subToggle;
    const ids = books.filter(b => b.sub === key && b.status === '可认捐' && !(donors[b.id] && donors[b.id].length > 0)).map(b => b.id);
    if (el.checked) state.cart = Array.from(new Set([...state.cart, ...ids]));
    else state.cart = state.cart.filter(id => !ids.includes(id));
    render();
  }));
  document.querySelectorAll('[data-cart]').forEach(el => el.addEventListener('change', e => {
    e.stopPropagation();
    const id = el.dataset.cart;
    if (el.checked) { if (!state.cart.includes(id)) state.cart = [...state.cart, id]; }
    else state.cart = state.cart.filter(x => x !== id);
    const bar = document.querySelector('[data-cart-bar]');
    if (bar) bar.outerHTML = renderCartBar();
    const card = el.closest('.book-card');
    if (card) card.classList.toggle('is-checked', el.checked);
    bindCartBar();
  }));
  document.querySelectorAll('[data-stop]').forEach(el => el.addEventListener('click', e => e.stopPropagation()));
}

// 购物车底部条事件绑定（按钮随时存在，但只在有选中时显示）
function bindCartBar() {
  document.querySelectorAll('[data-cart-clear]').forEach(el => el.addEventListener('click', () => {
    state.cart = [];
    render();
  }));
  document.querySelectorAll('[data-cart-go]').forEach(el => el.addEventListener('click', () => {
    if (!state.cart.length) return showToast('请先选择要认捐的经书');
    openCartPledge();
  }));
}

document.querySelectorAll('.tab-item').forEach(item => item.addEventListener('click', () => setPage(item.dataset.tab)));

function handleGo(target) {
  if (['home','catalog','transparent','profile'].includes(target)) return setPage(target);
  if (target === 'guide') { state.catalogTab = '指南'; return setPage('catalog'); }
  if (target === 'catalog-list') { state.catalogTab = '目录'; state.catalogView = '全部'; return setPage('catalog'); }
  if (target === 'inscriptions') return openInfo('大德高僧题词', inscriptionsHtml());
  if (target === 'consult') return openConsult();
  if (target === 'my-seats') return setPage('profile');
}

function handleAction(action) {
  const messages = { 'fund-detail': '已生成 2026 年 8 月资金公开明细', trace: '存证信息校验一致，记录未被篡改' };
  if (action === 'login') return openLogin();
  if (action === 'logout') return doLogout();
  if (action === 'switch-user') return switchToUser();
  if (action === 'go-pending-seats') { state.page = 'catalog'; state.catalogTab = '认捐中'; state.catalogView = '认捐中'; render(); return; }
  if (action === 'invite') return openInvite();
  if (action === 'certificates') return openCertificates();
  if (action === 'cert-detail') { const cert = state.certificates[0]; if (cert) openInfo('证书详情', certificateHtml(cert)); return; }
  if (action === 'points-detail') return openPointsDetail();
  if (action === 'my-gifts') return openMyGifts();
  if (action === 'my-donations') return openMyDonations();
  if (action === 'verify') return openVerify();
  if (action === 'profile-edit') return openInfo('个人资料', `<div class="field"><label>称谓</label><input value="${state.user.name}"></div><div class="field"><label>手机号</label><input value="${state.user.phone}"></div><div class="field"><label>功德主编号</label><input value="${state.user.code}" disabled></div><button class="btn btn-primary btn-block" id="save-profile">保存</button>`);
  if (action === 'about') return openAbout();
  if (action === 'simulate-invite-donation') return simulateInviteDonation();
  showToast(messages[action] || '功能已响应');
}

/* ========== 批量认捐（来自经目购物车） ========== */
function openCartPledge() {
  const { books: picked, count, total } = cartSummary();
  if (!count) return showToast('请先选择要认捐的经书');
  state.pledgeStep = state.loggedIn ? 1 : 0;
  state._cartBooks = picked;
  state.amount = total;
  renderCartPledge();
}

function renderCartPledge() {
  const totalSteps = 4;
  const steps = `<div class="steps">${Array.from({length: totalSteps}, (_, i) => `<i class="${state.pledgeStep >= i ? 'active' : ''}"></i>`).join('')}</div>`;
  const books = state._cartBooks || [];
  const count = books.length;
  const total = state.amount;
  let body = '';
  let actions = '';
  if (state.pledgeStep === 0) {
    body = `<h3 class="flow-title">先完成会员注册</h3><p class="flow-desc">本次共认捐 ${count} 部经书，用于建立功德主账号、签署协议并接收荣誉证书。</p>${loginFields()}<label class="check"><input id="privacy" type="checkbox"><span>我已阅读并同意《用户服务协议》与《隐私政策》</span></label>`;
    actions = `<button class="btn btn-ghost" data-prev>取消</button><button class="btn btn-primary" data-next>注册并继续</button>`;
  } else if (state.pledgeStep === 1) {
    const listHtml = `<div class="cart-pledge-list">${books.map(b => `<div class="cart-pledge-row"><span>${b.title}</span><small>${bookCode(b)} · ${b.section} · ${b.volume}</small><b>¥${b.amount.toLocaleString()}</b></div>`).join('')}</div>`;
    body = `<h3 class="flow-title">阅读并签署捐款协议</h3><p class="flow-desc">本次共认捐 ${count} 部经书，合计 ¥${total.toLocaleString()}。</p>
      ${listHtml}
      <div class="agreement"><b>《新修嘉兴藏》项目捐款协议（原型摘要）</b><br>一、捐款人自愿护持本项目，所捐款项用于对应经书的古籍修复、内容编校、专家复核及相关工作。<br>二、项目方定期公开资金用途与修藏进度，并为每笔捐款生成唯一可验证记录。<br>三、捐款完成后自动获得等额莲座问积分（功德主双倍积分）。<br>四、捐款人可选择公开称谓或匿名展示。</div>
      <div class="field" style="margin-top:14px"><label>电子签名</label><canvas id="signature" class="sign-canvas" width="360" height="140"></canvas><div class="sign-tools"><span>请在框内手写签名</span><button class="text-link" id="clear-sign">清除</button></div></div>
      <label class="check" style="margin-top:14px"><input id="agree" type="checkbox"><span>本人已完整阅读、理解并接受协议内容</span></label>`;
    actions = `<button class="btn btn-ghost" data-prev>上一步</button><button class="btn btn-primary" data-next>确认签署</button>`;
  } else if (state.pledgeStep === 2) {
    // ★ 改为「锁定席位 + 收款账户」
    const listHtml = `<div class="cart-pledge-list">${books.map(b => `<div class="cart-pledge-row"><span>${b.title}</span><small>${bookCode(b)} · ${b.section} · ${b.volume}</small><b>¥${b.amount.toLocaleString()}</b></div>`).join('')}</div>`;
    body = `<h3 class="flow-title">锁定认捐席位</h3><p class="flow-desc">本次共认捐 ${count} 部经书，合计 ¥${total.toLocaleString()}。</p>
      ${listHtml}
      <div class="payee-box">
        <div class="payee-box-head">请于 <b>${LOCK_DAYS} 天内</b> 向上述收款账户完成合计转账。</div>
        <div class="payee-box-row"><span>收款方</span><b>新修嘉兴藏项目组</b></div>
        <div class="payee-box-row">
          <span>收款账户</span>
          <b class="payee-account">${PAYMENT_ACCOUNT}</b>
          <button class="text-link" data-action="copy-account" data-copy="${PAYMENT_ACCOUNT}">复制</button>
        </div>
        <div class="payee-box-row"><span>应转金额</span><b class="payee-amount">¥${total.toLocaleString()}</b></div>
        <div class="payee-box-row"><span>席位有效期</span><b>${LOCK_DAYS} 天</b></div>
      </div>
      <div class="payee-tips">
        <div class="payee-tip">⏰ 请在 <b>${LOCK_DAYS} 天内</b> 留意【经目 → 认捐中】中各经书的凭证上传情况。</div>
        <div class="payee-tip">📝 支付时需在<b>备注/附言</b>中注明：每部经书的<b>经书编号 + 捐赠者姓名</b>。</div>
      </div>
      <div class="notice">转账完成后，<b>无需自己上传凭证</b>——管理员在银行账户收到您的汇款后，将在【经目 → 认捐中】为您上传收款凭证并确认认捐。</div>`;
    actions = `<button class="btn btn-ghost" data-prev>上一步</button><button class="btn btn-primary" data-next>锁定全部席位</button>`;
  } else {
    // ★ 改为「席位已锁定」汇总提示
    const seats = state._lastLockedSeats || [];
    const remain = seats.length ? seatRemainDays(seats[0]) : 0;
    const seatsHtml = seats.map(s => {
      const b = books.find(x => x.id === s.bookId);
      return `<div class="seat-mine-row"><span>${b?.title || s.bookId}</span><small>${s.seatId}</small><b>¥${s.amount.toLocaleString()}</b></div>`;
    }).join('');
    body = `<div class="center"><div class="success-mark">⌛</div>
      <h3 class="flow-title">${seats.length} 个席位已锁定</h3>
      <p class="flow-desc">
        请于 <b>${remain} 天</b> 内逐部完成转账与凭证上传。<br>
        凭证上传后即视为认捐完成。
      </p></div>
      <div class="payee-box" style="margin-top:14px">
        <div class="payee-box-row"><span>收款账户</span><b class="payee-account">${PAYMENT_ACCOUNT}</b></div>
        <div class="payee-box-row"><span>应转金额合计</span><b class="payee-amount">¥${total.toLocaleString()}</b></div>
      </div>
      <div class="seat-list-mini">${seatsHtml}</div>`;
    actions = `<button class="btn btn-primary" data-close>完成</button>`;
  }
  overlayRoot.innerHTML = `<div class="overlay"><section class="sheet">${steps}<div class="sheet-body">${body}</div><div class="sheet-actions">${actions}</div></section></div>`;
  bindOverlayBase();
  overlayRoot.querySelector('[data-next]')?.addEventListener('click', nextCartPledge);
  overlayRoot.querySelector('[data-prev]')?.addEventListener('click', () => { state.pledgeStep -= 1; renderCartPledge(); });
  overlayRoot.querySelectorAll('[data-action="copy-account"]').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); copyToClipboard(btn.dataset.copy); showToast('收款账户已复制'); }));
  if (state.pledgeStep === 1) setupSignature();
  if (state.pledgeStep === 2) {
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

function nextCartPledge() {
  if (state.pledgeStep === 0) {
    if (!document.querySelector('#privacy')?.checked) return showToast('请先同意用户协议与隐私政策');
    const phone = document.querySelector('#phone').value.trim();
    const name = document.querySelector('#name').value.trim() || '居士';
    if (!phone) return showToast('请填写手机号');
    // ★ 限制：同一用户同时只能认捐一部经书（管理员例外）
    if (!state.adminLoggedIn && !canUserPledgeAnother()) {
      const cur = getUserActivePledge();
      const book = books.find(b => b.id === cur?.bookId);
      return showToast(`您已认捐《${book?.title || '一部经书'}》，每位用户同时仅可认捐一部`);
    }
    // ★ 限制：批量认捐最多 1 部（与"一部限制"一致）
    if (state.cart.length > MAX_PLEDGES_PER_USER) {
      showToast(`每次最多认捐 ${MAX_PLEDGES_PER_USER} 部经书`);
      state.cart = state.cart.slice(0, MAX_PLEDGES_PER_USER);
    }
    state.loggedIn = true;
    state.user = { name, phone, code: `GDZ-20260812-${String(286 + state.myDonations.length).padStart(4, '0')}` };
  }
  if (state.pledgeStep === 1) {
    if (!state.signature) return showToast('请先完成电子签名');
    if (!document.querySelector('#agree')?.checked) return showToast('请确认接受捐款协议');
  }
  if (state.pledgeStep === 2) {
    // ★ 批量锁定席位
    state.pledgeUseRealName = document.querySelector('#pref-real-name')?.checked ?? true;
    state.pledgeShowInLedger = document.querySelector('#pref-show-ledger')?.checked ?? true;
    const picked = state._cartBooks || [];
    const lockedAt = new Date();
    const expiresAt = new Date(lockedAt.getTime() + LOCK_DAYS * 86400000);
    const newSeats = [];
    picked.forEach((b, idx) => {
      const seatId = `SEAT-${formatDate()}-${String((state.mySeats.length + idx + 1) + Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const seat = {
        seatId,
        bookId: b.id,
        userName: state.user.name,
        userPhone: state.user.phone,
        amount: b.amount,
        lockedAt: lockedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        receipt: null
      };
      seats[b.id] = seats[b.id] || [];
      seats[b.id].push(seat);
      newSeats.push(seat);
    });
    state.mySeats = state.mySeats || [];
    state.mySeats.push(...newSeats);
    state._lastLockedSeats = newSeats;
    state.cart = [];
    state._cartBooks = null;
  }
  state.pledgeStep += 1;
  renderCartPledge();
}

/* ========== 关于弹窗 ========== */
function openAbout() {
  openInfo('关于新修嘉兴藏', `
    <div class="section-head" style="padding:0;margin-bottom:12px"><h2>项目缘起</h2></div>
    <div class="protocol-block">
      <p>项目组历经十年努力，于 2008 年完成《嘉兴藏》（重辑·2008版），由民族出版社出版。其间留下两个遗憾：<b>增补内容有限、古籍修复有限</b>。经多方努力，自 2022 年起启动《新修嘉兴藏》工作，旨在通过古籍修复、内容重组、现代阐释及增补文献，编纂出一部<b>继承传统、发展创新的盛世大藏</b>。</p>
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
          <div class="sample-compare-img"><img src="assets/puxian-cover-original.jpg" alt="封面·未修改" data-zoom="assets/puxian-cover-original.jpg" data-zoom-caption="修藏前 · 封面未修改"></div>
          <figcaption>修藏前 · 未修改<small class="zoom-hint">点击图片放大 ›</small></figcaption>
        </figure>
        <figure class="sample-compare-item">
          <div class="sample-compare-img"><img src="assets/puxian-cover-fixed.jpg" alt="封面·已重修" data-zoom="assets/puxian-cover-fixed.jpg" data-zoom-caption="修藏后 · 封面已重修"></div>
          <figcaption>修藏后 · 已重修<small class="zoom-hint">点击图片放大 ›</small></figcaption>
        </figure>
      </div>
      <p class="sample-compare-note">${book.title}（${book.volume}·${book.pages}筒页）封面修藏前后对比</p>
      <div class="intro-card" style="margin-top:14px">
        <h3 style="margin:0 0 6px;font-family:'STKaiti',serif;color:#7a5520;font-size:16px">${book.title}</h3>
        <p style="margin:0;color:#786b58;font-size:12px;line-height:1.7">${book.summary}</p>
        <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #ead9b3;display:flex;justify-content:space-between;font-size:11px;color:#786b58"><span>编号 ${bookCode(book)}</span><span>${stageInfo.label}</span></div>
      </div>`;
  } else if (tab === 'ledger') {
    const list = donors[book.id] || [];
    body = renderBookLedger(book, list);
  } else {
    body = `<div class="sample-compare">
        <figure class="sample-compare-item">
          <div class="sample-compare-img"><img src="assets/puxian-text-original.jpg" alt="正文·未修复" data-zoom="assets/puxian-text-original.jpg" data-zoom-caption="正文修复前"></div>
          <figcaption>正文修复前<small class="zoom-hint">点击图片放大 ›</small></figcaption>
        </figure>
        <figure class="sample-compare-item">
          <div class="sample-compare-img"><img src="assets/puxian-text-fixed.png" alt="正文·已修复" data-zoom="assets/puxian-text-fixed.png" data-zoom-caption="正文修复后"></div>
          <figcaption>正文修复后<small class="zoom-hint">点击图片放大 ›</small></figcaption>
        </figure>
      </div>
      <p class="sample-compare-note">${book.title} 正文修复前后对比</p>
      <div class="notice" style="margin-top:12px">此为样张预览，正式产品可左右翻页、查看缺墨字修复、断句与专家复核标记。</div>`;
  }
  // 原则：一部经书只对应一位功德主；若该经书已有认捐者，则改为「已认捐」状态
  const hasDonor = (donors[book.id] && donors[book.id].length > 0);
  // ★ 业务规则：一名用户同时只能认捐一部经书；如果当前用户已有其他未完成认捐，则不允许再认捐此经书
  const userHasActivePledge = !!getUserActivePledge();
  const isPledgeable = book.status === '可认捐' && !hasDonor && !userHasActivePledge;
  overlayRoot.innerHTML = `<div class="preview-overlay"><div class="preview-sheet">
    <header class="preview-head"><h2>${book.title}</h2><button class="icon-btn" data-preview-close aria-label="关闭">×</button></header>
    <div class="preview-tabs">
      <button class="${tab === 'cover' ? 'active' : ''}" data-preview-tab="cover">封面</button>
      <button class="${tab === 'page' ? 'active' : ''}" data-preview-tab="page">正文样张</button>
      <button class="${tab === 'ledger' ? 'active' : ''}" data-preview-tab="ledger">功德簿</button>
    </div>
    <div class="preview-body">${body}</div>
    ${isPledgeable
      ? `<div class="preview-foot">
           <button class="btn btn-ghost" data-preview-close>稍后再看</button>
           <button class="btn btn-gold" data-preview-pledge>确认认捐<br><small>¥${book.amount.toLocaleString()}（${book.pages}页×¥${PER_PAGE_PRICE}/页）</small></button>
         </div>`
      : userHasActivePledge
        ? `<div class="preview-foot"><button class="btn btn-ghost" data-preview-close>关闭</button><button class="btn btn-primary" disabled style="opacity:.55">您已有认捐中的经书</button></div>`
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
    overlayRoot.innerHTML = '';
    state.preview = null;
    if (!state.loggedIn) { showLoginThen(() => startPledge()); return; }
    startPledge();
  });
  overlayRoot.querySelector('[data-preview-follow]')?.addEventListener('click', () => {
    state.preview = null;
    overlayRoot.innerHTML = '';
    if (!state.loggedIn) { showLoginThen(() => {}); return; }
    showToast('已关注该经书进度');
    render();
  });
  overlayRoot.querySelectorAll('[data-zoom]').forEach(el => el.addEventListener('click', () => openZoom(el.dataset.zoom, el.dataset.zoomCaption)));
}

function startPledge() {
  // ★ 业务规则：一名用户同时只能认捐一部经书（MAX_PLEDGES_PER_USER = 1）
  // 如果用户已有未完成的认捐（进行中 / 已完成 / 未超期），直接阻止并提示
  const active = getUserActivePledge();
  if (active) {
    const book = books.find(b => b.id === active.bookId);
    showToast(`您已认捐《${book?.title || active.bookId}》，请等待当前认捐完成后再次认捐`);
    return;
  }
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
      <div class="agreement"><b>《新修嘉兴藏》项目捐款协议（原型摘要）</b><br>一、捐款人自愿护持本项目，所捐款项用于对应经书的古籍修复、内容编校、专家复核及相关工作。<br>二、项目方定期公开资金用途与修藏进度，并为每笔捐款生成唯一可验证记录。<br>三、捐款完成后自动获得等额莲座问积分，可在平台购物时使用（功德主双倍积分）。<br>四、捐款人可选择公开称谓或匿名展示。</div>
      <div class="field" style="margin-top:14px"><label>电子签名</label><canvas id="signature" class="sign-canvas" width="360" height="140"></canvas><div class="sign-tools"><span>请在框内手写签名</span><button class="text-link" id="clear-sign">清除</button></div></div>
      <div class="field" style="margin-top:14px">
        <label>常住地区</label>
        <div class="address-fields">
          <div class="address-row">
            <span class="address-tag">国别</span>
            <select id="region-country"><option value="">请选择国别</option>${REGION_COUNTRIES.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
          </div>
          <div class="address-row">
            <span class="address-tag">省份</span>
            <select id="region-province"><option value="">请选择省份</option>${REGION_PROVINCES.map(p => `<option value="${p}">${p}</option>`).join('')}</select>
          </div>
          <div class="address-row">
            <span class="address-tag">城市</span>
            <select id="region-city"><option value="">请选择城市</option>${REGION_CITIES.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <label class="check"><input id="agree" type="checkbox"><span>本人已完整阅读、理解并接受协议内容</span></label>`;
    actions = `<button class="btn btn-ghost" data-prev>上一步</button><button class="btn btn-primary" data-next>确认签署</button>`;
  } else if (state.pledgeStep === 2) {
    // ★ 改为「确认认捐 + 展示收款账户 + 锁定席位」
    body = `<h3 class="flow-title">确认认捐金额</h3><p class="flow-desc">认捐经书：${state.selectedBook.title} · 共${state.selectedBook.pages}页 · ¥${PER_PAGE_PRICE}/页</p>
      <div class="field"><label>认捐金额（修一页 ¥${PER_PAGE_PRICE}）</label>
        <div class="amount-options amount-options-single"><button class="amount-option active" data-amount="${state.selectedBook.amount}">¥${state.selectedBook.amount.toLocaleString()}</button></div>
      </div>
      <div class="field"><label>护持留言（选填）</label><textarea id="pledge-message" placeholder="愿以此功德，庄严佛净土……"></textarea></div>

      <!-- ★ 收款账户信息 + 转账须知 -->
      <div class="payee-box">
        <div class="payee-box-head">请点击下方「锁定席位」后，于 <b>${LOCK_DAYS} 天内</b> 向上述收款账户完成转账。</div>
        <div class="payee-box-row"><span>收款方</span><b>新修嘉兴藏项目组</b></div>
        <div class="payee-box-row">
          <span>收款账户</span>
          <b class="payee-account">${PAYMENT_ACCOUNT}</b>
          <button class="text-link" data-action="copy-account" data-copy="${PAYMENT_ACCOUNT}">复制</button>
        </div>
        <div class="payee-box-row"><span>应转金额</span><b class="payee-amount">¥${state.amount.toLocaleString()}</b></div>
        <div class="payee-box-row"><span>席位有效期</span><b>${LOCK_DAYS} 天（锁定后开始计时）</b></div>
      </div>
      <div class="payee-tips">
        <div class="payee-tip">⏰ 请在 <b>${LOCK_DAYS} 天内</b> 留意【经目 → 认捐中】中本经书的凭证上传情况。</div>
        <div class="payee-tip">📝 支付时需在<b>备注/附言</b>中注明：<b>${state.selectedBook.id} · ${state.user.name || state.user.code}</b>（经书编号 + 捐赠者姓名）。</div>
      </div>
      <div class="notice">转账完成后，<b>无需自己上传凭证</b>——管理员在银行账户收到您的汇款后，将在【经目 → 认捐中】为您上传收款凭证并确认认捐。</div>`;
    actions = `<button class="btn btn-ghost" data-prev>上一步</button><button class="btn btn-primary" data-next>锁定席位</button>`;
  } else if (state.pledgeStep === 3) {
    body = `<h3 class="flow-title">展示偏好设置</h3><p class="flow-desc">您可以控制对外公开的姓名与是否在功德簿中展示</p>
      <div class="pledge-pref">
        <label class="check"><input id="pref-real-name" type="checkbox" ${state.pledgeUseRealName ? 'checked' : ''}><span><b>是否使用真实姓名签约</b><small>开启后，荣誉证书、捐款协议展示您的真实姓名；关闭后将用法号 / 昵称。</small></span></label>
        <label class="check"><input id="pref-show-ledger" type="checkbox" ${state.pledgeShowInLedger ? 'checked' : ''}><span><b>是否同意展示在功德簿</b><small>开启后，您的认捐记录将公开在"公开 → 功德簿"中；关闭后仅显示"匿名功德主"。</small></span></label>
      </div>
      <div class="field" id="display-name-field" style="${state.pledgeUseRealName ? '' : 'display:none'}"><label>${state.pledgeUseRealName ? '签约显示姓名' : '法号 / 昵称'}</label><input id="display-name" value="${state.user.name}" placeholder="如：${state.user.name}"></div>
      <div class="notice" style="margin-top:12px">提示：以上两项选择仅影响公开展示，不影响您的实际护持权益与积分到账。</div>`;
    actions = `<button class="btn btn-ghost" data-prev>上一步</button><button class="btn btn-primary" data-next>下一步</button>`;
  } else {
    // ★ 改为「席位已锁定」提示页
    const seat = state._lastLockedSeat;
    const remain = seatRemainDays(seat);
    const expiresAtShort = seat ? seat.expiresAt.replace('T', ' ').slice(0, 16) : '';
    body = `<div class="center"><div class="success-mark">⌛</div>
      <h3 class="flow-title">席位已锁定 · 等待管理员确认</h3>
      <p class="flow-desc">
        请于 <b>${remain} 天</b> 内向收款账户转账 ¥${state.amount.toLocaleString()}；<br>
        转账完成后<b>无需自行上传凭证</b>，管理员在银行账户收到您的汇款后，<br>
        将在【经目 → 认捐中】为您上传收款凭证并确认认捐。
      </p></div>
      <div class="payee-box" style="margin-top:14px">
        <div class="payee-box-row"><span>席位编号</span><b>${seat?.seatId || ''}</b></div>
        <div class="payee-box-row"><span>认捐经书</span><b>${state.selectedBook?.title || ''}</b></div>
        <div class="payee-box-row"><span>收款账户</span><b class="payee-account">${PAYMENT_ACCOUNT}</b></div>
        <div class="payee-box-row"><span>应转金额</span><b class="payee-amount">¥${state.amount.toLocaleString()}</b></div>
        <div class="payee-box-row"><span>到期时间</span><b>${expiresAtShort}</b></div>
      </div>
      <div class="payee-tips" style="margin-top:10px">
        <div class="payee-tip">📝 支付时需在<b>备注/附言</b>中注明<b>捐赠人与捐赠经书编号</b></div>
      </div>`;
    actions = `<button class="btn btn-primary" data-close>完成</button>`;
  }
  overlayRoot.innerHTML = `<div class="overlay"><section class="sheet">${steps}<div class="sheet-body">${body}</div><div class="sheet-actions">${actions}</div></section></div>`;
  bindOverlayBase();
  overlayRoot.querySelector('[data-next]')?.addEventListener('click', nextPledge);
  overlayRoot.querySelector('[data-prev]')?.addEventListener('click', () => { state.pledgeStep -= 1; renderPledge(); });
  overlayRoot.querySelectorAll('[data-amount]').forEach(btn => btn.addEventListener('click', () => { state.amount = Number(btn.dataset.amount); renderPledge(); }));
  overlayRoot.querySelector('[data-verify-cert]')?.addEventListener('click', () => openVerify(true));
  // 收款账户复制
  overlayRoot.querySelectorAll('[data-action="copy-account"]').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); copyToClipboard(btn.dataset.copy); showToast('收款账户已复制'); }));
  // 席位锁定成功页已不再有"上传凭证"按钮；保留兼容占位
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
    // ★ 限制：同一用户同时只能认捐一部经书（管理员例外）
    if (!state.adminLoggedIn && !canUserPledgeAnother()) {
      const cur = getUserActivePledge();
      const book = books.find(b => b.id === cur?.bookId);
      return showToast(`您已认捐《${book?.title || '一部经书'}》，每位用户同时仅可认捐一部`);
    }
    state.loggedIn = true;
    state.user = { name, phone, code: `GDZ-20260812-${String(286 + state.myDonations.length).padStart(4, '0')}` };
  }
  if (state.pledgeStep === 1) {
    if (!state.signature) return showToast('请先完成电子签名');
    const country = document.querySelector('#region-country')?.value;
    const province = document.querySelector('#region-province')?.value;
    const city = document.querySelector('#region-city')?.value;
    if (!country) return showToast('请选择常住地区·国别');
    if (!province) return showToast('请选择常住地区·省份');
    if (!city) return showToast('请选择常住地区·城市');
    state.region = { country, province, city };
    if (!document.querySelector('#agree')?.checked) return showToast('请确认接受捐款协议');
  }
  if (state.pledgeStep === 2) {
    // ★ 创建锁定席位（不立即落账）
    const seatId = `SEAT-${formatDate()}-${String((state.mySeats.length + 1) + Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const lockedAt = new Date();
    const expiresAt = new Date(lockedAt.getTime() + LOCK_DAYS * 86400000);
    const seat = {
      seatId,
      bookId: state.selectedBook.id,
      userName: state.user.name,
      userPhone: state.user.phone,
      amount: state.amount,
      lockedAt: lockedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      receipt: null,
      message: document.querySelector('#pledge-message')?.value?.trim() || ''
    };
    seats[state.selectedBook.id] = seats[state.selectedBook.id] || [];
    seats[state.selectedBook.id].push(seat);
    state.mySeats = state.mySeats || [];
    state.mySeats.push(seat);
    state._lastLockedSeat = seat;
  }
  if (state.pledgeStep === 3) {
    // ★ 只收集展示偏好；落账推迟到凭证上传通过时由 finalizeSeat 完成
    state.pledgeUseRealName = document.querySelector('#pref-real-name')?.checked ?? true;
    state.pledgeShowInLedger = document.querySelector('#pref-show-ledger')?.checked ?? true;
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
  const book = certificate.book || state.selectedBook?.title || '新修嘉兴藏';
  const amount = certificate.amount || state.amount;
  const name = state.user?.name || '莲心居士';
  return `<div class="certificate"><img class="logo" src="assets/puxian-cover-fixed.jpg" alt="普贤行愿品封面"><h3>修藏荣誉证书</h3><p>兹敬谢 <b>${name}</b><br>发心护持《${book}》<br>护持金额 ¥${amount.toLocaleString()}</p><small>证书编号：${id}</small></div>`;
}

// 二维码相关代码（qrHtml / 在线认证）已从证书中移除，函数保留以避免外部误调用
function qrHtml() {
  return '';
}

function openLogin() {
  const tab = state._loginRole === 'admin' ? 'admin' : 'user';
  const userActive = tab === 'user' ? 'active' : '';
  const adminActive = tab === 'admin' ? 'active' : '';
  const userPanel = `<div class="login-panel" data-panel="user" style="${tab === 'user' ? '' : 'display:none'}">
    ${loginFields()}
    <label class="check"><input id="privacy" type="checkbox" checked><span>我已阅读并同意用户服务协议与隐私政策</span></label>
  </div>`;
  const adminPanel = `<div class="login-panel" data-panel="admin" style="${tab === 'admin' ? '' : 'display:none'}">
    <div class="field"><label>管理员账号</label><input id="admin-user" value="admin" autocomplete="username"></div>
    <div class="field"><label>密码</label><input id="admin-pass" type="password" value="admin123" autocomplete="current-password"></div>
    <div class="notice">管理员用于统一管理赠书情况、上传收款凭证。<br>普通用户请切换至「普通用户」标签。</div>
  </div>`;

  openSheet('会员登录 / 注册', `
    <div class="segment" style="margin-bottom:14px">
      <button class="${userActive}" data-role="user">普通用户</button>
      <button class="${adminActive}" data-role="admin">管理员登录</button>
    </div>
    ${userPanel}
    ${adminPanel}
  `, `<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" id="do-login">登录</button>`);

  // 角色切换
  document.querySelectorAll('[data-role]').forEach(btn =>
    btn.addEventListener('click', () => {
      state._loginRole = btn.dataset.role;
      closeOverlay();
      openLogin();
    }));

  document.querySelector('#do-login').addEventListener('click', () => {
    const next = state._loginNext;
    state._loginNext = null;
    if (tab === 'admin') {
      const u = document.querySelector('#admin-user').value.trim();
      const p = document.querySelector('#admin-pass').value;
      if (u !== ADMIN_ACCOUNT.username || p !== ADMIN_ACCOUNT.password) return showToast('账号或密码错误');
      // 管理员登录：清空普通用户登录态（同一时刻只能有一个角色）
      state.loggedIn = false;
      state.user = null;
      state.cart = [];
      state.mySeats = [];
      state.adminLoggedIn = true;
      state.adminUser = { name: ADMIN_ACCOUNT.displayName, username: u };
      closeOverlay();
      showToast(`欢迎，${ADMIN_ACCOUNT.displayName}`);
      render();
      return;
    }
    const phone = document.querySelector('#phone').value.trim();
    const name = document.querySelector('#name').value.trim() || '居士';
    state.loggedIn = true;
    state.user = { name, phone, code: `GDZ-20260812-${String(286 + state.myDonations.length).padStart(4, '0')}` };
    closeOverlay();
    showToast('登录成功');
    if (typeof next === 'function') { next(); } else { render(); }
  });
}

// 退出登录（含普通用户 / 管理员）
function doLogout() {
  if (state.adminLoggedIn) {
    state.adminLoggedIn = false;
    state.adminUser = null;
    showToast('管理员已退出');
    render();
    return;
  }
  state.loggedIn = false;
  state.user = null;
  state.cart = [];
  state.mySeats = [];
  showToast('已退出登录');
  render();
}

// 管理员模式中切换为普通用户（不退出管理员会话，仅切回居士视图）
function switchToUser() {
  // 同时保留管理员会话，但当前页切换为普通用户视角
  // （如果想完全退出管理员，请用「退出管理员」按钮）
  state.adminLoggedIn = false;
  state.adminUser = null;
  // 让 demoUser 重新生效
  if (state.demoUser) {
    state.loggedIn = true;
    state.user = { ...state.demoUser };
  }
  showToast('已切换到普通用户（居士）');
  render();
}

// 弹登录，登录成功后执行 callback
function showLoginThen(callback) {
  state._loginNext = callback;
  openLogin();
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
      <div class="cert-card-head"><strong>${cert.book}</strong></div>
      <div class="cert-card-body">${certificateHtml(cert)}</div>
    </article>
  `).join('') : '<div class="empty">尚未获得荣誉证书<br><small>完成认捐后将自动生成</small></div>');
}

/* ========== 我的赠品（3 项服务：阅藏指南/牌记/祈福法会） ========== */
function openMyGifts() {
  if (!state.loggedIn) return openLogin();
  const gifts = state.myGifts;
  if (!gifts) {
    openInfo('我的赠品', `
      <div class="empty">
        完成认捐后将自动获得 3 项赠品：<br>
        ① 嘉兴藏阅藏指南（电子版）<br>
        ② 牌记（吉祥牌/操作牌）<br>
        ③ 三德弘法中心祈福法会一次
      </div>`);
    return;
  }
  const book = books.find(b => b.id === gifts.bookId);
  const plaqueType = gifts.plaque.type;
  const plaqueLocked = !!gifts.plaque.locked;
  const plaqueFilled = !!gifts.plaque.type && !!gifts.plaque.content;
  openInfo('我的赠品', `
    <div class="notice" style="margin-bottom:12px">
      完成认捐赠品发放<br>
      ${book ? '《' + book.title + '》' : ''} · 席位 ${gifts.seatId}
    </div>
    <div class="gift-module-list">
      <!-- 1. 阅藏指南 -->
      <div class="gift-card">
        <div class="gift-icon">${GIFT_TYPES.guide.icon}</div>
        <div class="gift-card-body">
          <strong>${GIFT_TYPES.guide.name}</strong>
          <small>领取码：<code>${gifts.guide.code}</code></small>
          <small>发放时间：${gifts.guide.issuedAt?.slice(0, 10)}</small>
        </div>
        <span class="badge gray">已发放</span>
      </div>

      <!-- 2. 牌记（需选择 + 填写） -->
      <div class="gift-card">
        <div class="gift-icon">${GIFT_TYPES.plaque.icon}</div>
        <div class="gift-card-body">
          <strong>${GIFT_TYPES.plaque.name}</strong>
          <small>类型：${plaqueType || '尚未选择'}</small>
          <small>内容：${plaqueFilled ? gifts.plaque.content : '尚未填写'}</small>
        </div>
        <span class="badge ${plaqueLocked ? 'gray' : (plaqueFilled ? 'gold' : 'gray')}">${plaqueLocked ? '已锁定' : (plaqueFilled ? '已提交' : '待填写')}</span>
      </div>

      <!-- 3. 祈福法会 -->
      <div class="gift-card">
        <div class="gift-icon">${GIFT_TYPES.pray.icon}</div>
        <div class="gift-card-body">
          <strong>${GIFT_TYPES.pray.name}</strong>
          <small>预约码：<code>${gifts.pray.code}</code></small>
          <small>${gifts.pray.date}</small>
        </div>
        <span class="badge gray">已发放</span>
      </div>
    </div>
    <div class="btn-group" style="margin-top:14px;display:grid;gap:8px">
      <button class="btn btn-ghost" data-action="view-guide">查看阅藏指南（电子版）</button>
      <button class="btn ${plaqueLocked ? 'btn-ghost' : 'btn-primary'}" ${plaqueLocked ? 'data-action="view-plaque-submitted"' : 'data-action="fill-plaque"'}>${plaqueLocked ? '查看已提交的牌记内容' : (plaqueFilled ? '修改牌记内容' : '选择牌记并填写内容')}</button>
      <button class="btn btn-ghost" data-action="view-pray">查看祈福法会预约说明</button>
    </div>
  `);
  // 事件
  document.querySelector('[data-action="view-guide"]')?.addEventListener('click', () => {
    openInfo('嘉兴藏阅藏指南（电子版）', `
      <div class="notice">
        <b>《嘉兴藏阅藏指南》</b> 是为大众快速了解、查阅《嘉兴藏》的导引手册。<br><br>
        领取码：<code>${gifts.guide.code}</code><br>
        领取方式：项目组将于近期通过短信/小程序消息发送电子版领取链接。<br><br>
        <b>预计开放时间：</b>2026 年 12 月
      </div>`);
  });
  document.querySelector('[data-action="view-pray"]')?.addEventListener('click', () => {
    openInfo('三德弘法中心祈福法会', `
      <div class="notice">
        <b>三德弘法中心祈福法会</b> · 法会预约说明<br><br>
        预约码：<code>${gifts.pray.code}</code><br>
        法会日程：近期法会日程将在【我的 → 我的赠品】中公布。<br>
        报名方式：请联系项目组或致电三德弘法中心。<br><br>
        <b>预计开放时间：</b>2026 年 10 月
      </div>`);
  });
  document.querySelector('[data-action="fill-plaque"]')?.addEventListener('click', () => openPlaqueForm());
  document.querySelector('[data-action="view-plaque-submitted"]')?.addEventListener('click', () => {
    const g = state.myGifts.plaque;
    openInfo('牌记内容', `
      <div class="notice" style="margin-bottom:12px">牌记内容已提交，不可修改。</div>
      <div class="field">
        <label>牌记类型</label>
        <div style="padding:10px 0;color:#333">${g.type || '-'}</div>
      </div>
      <div class="field">
        <label>牌记内容</label>
        <div style="padding:10px 0;font-size:15px;color:#333;font-weight:500">${g.content || '-'}</div>
      </div>
    `);
  });
}

// 牌记填写弹窗
function openPlaqueForm() {
  if (!state.myGifts) return showToast('暂无赠品');
  const g = state.myGifts.plaque;
  openSheet(`${GIFT_TYPES.plaque.name} · 选择与填写`, `
    <p class="flow-desc">${GIFT_TYPES.plaque.name}将在《嘉兴藏》对应经书首页牌记处镌刻，由项目组统一安排上版排版。</p>

    <div class="field">
      <label>选择牌记类型</label>
      <div class="plaque-type-grid">
        <div class="plaque-type-card ${g.type === '吉祥牌' ? 'selected' : ''}" data-type="吉祥牌">
          <div class="pt-icon">吉</div>
          <div class="pt-name">吉祥牌</div>
          <div class="pt-desc">镌刻吉祥语、祈愿词或祝福寄语</div>
        </div>
        <div class="plaque-type-card ${g.type === '操作牌' ? 'selected' : ''}" data-type="操作牌">
          <div class="pt-icon">作</div>
          <div class="pt-name">操作牌</div>
          <div class="pt-desc">镌刻功德主姓名、护持事项等具体操作信息</div>
        </div>
      </div>
    </div>

    <div class="field">
      <label>牌记内容</label>
      <textarea id="plaque-content" placeholder="${g.type === '吉祥牌' ? '请填写吉祥语、祈愿词或祝福寄语（不超过 30 字）' : '请填写姓名、护持事项等具体操作信息（不超过 30 字）'}" maxlength="30">${g.content || ''}</textarea>
      <small style="color:#786b58;font-size:11px">字数限制 30 字以内</small>
    </div>
    <div class="notice">提交后项目组将根据牌记内容排版上版；一经镌刻不可修改，请仔细核对。</div>
  `, `<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" id="submit-plaque">提交牌记</button>`);

  // 类型切换
  let selectedType = g.type;
  document.querySelectorAll('.plaque-type-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedType = card.dataset.type;
      document.querySelectorAll('.plaque-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  document.querySelector('#submit-plaque')?.addEventListener('click', () => {
    const content = document.querySelector('#plaque-content')?.value?.trim() || '';
    if (!selectedType) return showToast('请选择牌记类型');
    if (!content) return showToast('请填写牌记内容');
    if (content.length > 30) return showToast('牌记内容不超过 30 字');
    state.myGifts.plaque.type = selectedType;
    state.myGifts.plaque.content = content;
    state.myGifts.plaque.submittedAt = new Date().toISOString();
    state.myGifts.plaque.locked = true; // 提交后锁定，不可再修改
    closeOverlay();
    showToast('牌记已提交');
    openMyGifts();
  });
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
    document.querySelector('#verify-result').innerHTML = `<div class="notice" style="margin-top:14px"><b>验证通过</b><br>证书签发主体：新修嘉兴藏项目组<br>状态：有效 · 存证记录一致</div>`;
  });
  if (fromSuccess) document.querySelector('#check-cert')?.click();
}

/* ========== 上传支付凭证（OCR 自动识别 + 用户确认） ========== */
// 模拟 OCR 识别（演示用）：从凭证图片中提取关键字段
// 真实场景应替换为后端 OCR 服务调用
function simulateOcr(file, seat) {
  return new Promise(resolve => {
    // 演示中模拟 1.5 秒识别时间 + 80% 概率返回正常数据，20% 概率返回轻微差异用于演示警告
    setTimeout(() => {
      const baseTime = new Date();
      baseTime.setMinutes(baseTime.getMinutes() - Math.floor(Math.random() * 30) - 1);
      const random = Math.random();
      const ocr = {
        // 收款账户：与系统账户对比的字段
        payeeAccount: PAYMENT_ACCOUNT,
        payeeName: '新修嘉兴藏项目组',
        // 付款账户（来自凭证）
        payerAccount: random < 0.2 ? '6225 **** **** ' + String(1000 + Math.floor(Math.random() * 9000)) : '6217 **** **** ' + String(1000 + Math.floor(Math.random() * 9000)),
        payerName: state.user?.name || '居士',
        // 付款金额：默认等于席位金额；20% 概率比席位少 1 元用于演示差异警告
        amount: random < 0.2 ? Math.max(1, seat.amount - 1) : seat.amount,
        currency: 'CNY',
        transferTime: baseTime.toISOString().slice(0, 19).replace('T', ' '),
        bankName: '中国工商银行嘉兴分行',
        memo: `捐赠人：${state.user?.name || '居士'}，捐赠经书${seat.bookId.replace(/^JX-/, '')}号`,
        fileName: file?.name || 'receipt.jpg',
        fileSize: file?.size || 0,
        // 验真结论
        verify: {
          payeeMatch: true,
          amountMatch: random >= 0.2,
          payerNameMatch: true,
          transferTimeValid: true,
          score: random < 0.2 ? 82 : 98
        }
      };
      resolve(ocr);
    }, 1500);
  });
}

// 渲染 OCR 识别结果（只读确认卡）
function renderOcrResult(ocr, seat) {
  const amountWarn = ocr.amount !== seat.amount;
  const payeeWarn = ocr.payeeAccount !== PAYMENT_ACCOUNT;
  const allOk = ocr.verify.payeeMatch && ocr.verify.amountMatch && ocr.verify.payerNameMatch && ocr.verify.transferTimeValid;
  return `
    <div class="ocr-result">
      <div class="ocr-result-head">
        <span class="ocr-icon">⌖</span>
        <strong>识别完成</strong>
        <span class="badge ${allOk ? 'gray' : 'gold'}">${allOk ? '凭证有效' : '凭证需核对'}</span>
      </div>

      <div class="ocr-result-grid">
        <div class="ocr-row"><span>收款账户</span><b class="${payeeWarn ? 'warn' : ''}">${ocr.payeeAccount}${payeeWarn ? ' ⚠️' : ''}</b></div>
        <div class="ocr-row"><span>收款方</span><b>${ocr.payeeName}</b></div>
        <div class="ocr-row"><span>付款账户</span><b>${ocr.payerAccount}</b></div>
        <div class="ocr-row"><span>付款户名</span><b>${ocr.payerName}</b></div>
        <div class="ocr-row"><span>付款金额</span><b class="payee-amount ${amountWarn ? 'warn' : ''}">¥${ocr.amount.toLocaleString()}${amountWarn ? ' ⚠️' : ''}</b></div>
        <div class="ocr-row"><span>付款时间</span><b>${ocr.transferTime}</b></div>
        <div class="ocr-row"><span>付款银行</span><b>${ocr.bankName}</b></div>
        <div class="ocr-row"><span>附言</span><b>${ocr.memo}</b></div>
      </div>

      ${amountWarn ? `<div class="ocr-warn">
        <b>金额不一致</b><br>
        系统识别金额 ¥${ocr.amount.toLocaleString()}，与席位金额 ¥${seat.amount.toLocaleString()} 相差 ¥${Math.abs(seat.amount - ocr.amount).toLocaleString()}。<br>
        请核对凭证或联系项目组处理。
      </div>` : ''}
      ${payeeWarn ? `<div class="ocr-warn">
        <b>收款账户不匹配</b><br>
        凭证收款账户与本项目收款账户不一致，请勿继续并联系项目组核实。
      </div>` : ''}

      <div class="ocr-result-foot">
        请核对以上凭证信息，确认无误后点击下方「确认无误，上传凭证」完成认捐。
      </div>
    </div>
  `;
}

/* ========== 凭证相关：用户只读查看 / 管理员上传 ========== */

// 普通用户只读查看凭证
function viewReceipt(seatId) {
  const seat = findSeatById(seatId);
  if (!seat) return showToast('未找到该席位');
  const book = books.find(b => b.id === seat.bookId);

  if (!seat.receipt) {
    // 尚未上传：显示等待提示
    openInfo('凭证查看', `
      <div class="notice">
        <b>凭证尚未上传</b><br>
        本席位（${seat.seatId}）当前尚未上传收款凭证。<br>
        管理员在银行账户收到您的汇款后，将上传凭证并确认认捐。<br><br>
        <b>请在备注中注明捐赠人与捐赠经书编号</b><br>
        <b>应转金额：</b>¥${seat.amount.toLocaleString()}<br>
        <b>收款账户：</b>${PAYMENT_ACCOUNT}
      </div>
    `);
    return;
  }

  // 已上传：只读展示 OCR 信息
  const ocr = seat.receipt;
  openInfo(`凭证信息 · ${book?.title || ''}`, `
    <div class="ocr-result">
      <div class="ocr-result-head">
        <span class="ocr-icon">✓</span>
        <strong>凭证已上传</strong>
        <span class="badge gray">${ocr.verified ? '已生效' : '审核中'}</span>
      </div>
      <div class="ocr-result-grid">
        <div class="ocr-row"><span>收款账户</span><b>${ocr.payeeAccount}</b></div>
        <div class="ocr-row"><span>收款方</span><b>${ocr.payeeName}</b></div>
        <div class="ocr-row"><span>付款账户</span><b>${ocr.payerAccount || '—'}</b></div>
        <div class="ocr-row"><span>付款户名</span><b>${ocr.payerName || '—'}</b></div>
        <div class="ocr-row"><span>付款金额</span><b class="payee-amount">¥${(ocr.amount || 0).toLocaleString()}</b></div>
        <div class="ocr-row"><span>付款时间</span><b>${ocr.transferTime || '—'}</b></div>
        <div class="ocr-row"><span>付款银行</span><b>${ocr.bankName || '—'}</b></div>
        <div class="ocr-row"><span>附言</span><b>${ocr.memo || '—'}</b></div>
      </div>
      <div class="ocr-result-foot">由管理员于 ${ocr.uploadedAt?.slice(0, 19).replace('T', ' ') || '—'} 上传并确认。</div>
    </div>
  `);
}

// 在"我的认捐"模块查看凭证：根据 donation 中保留的 seatId + receipt 字段展示
function viewMyDonationReceipt(donation) {
  if (!donation) return showToast('未找到该认捐记录');
  const book = books.find(b => b.id === donation.bookId);
  // 优先用 donation 内嵌的 receipt（finalizeSeat 时同步过来）；其次回退到 seats 实时查询
  let receipt = donation.receipt;
  if (!receipt && donation.seatId) {
    const seat = findSeatById(donation.seatId);
    if (seat && seat.receipt) receipt = seat.receipt;
  }
  if (!receipt) {
    openInfo('凭证查看', `
      <div class="notice">
        <b>凭证尚未上传</b><br>
        本次认捐（${donation.certId}）当前尚未上传收款凭证。<br>
        管理员在银行账户收到您的汇款后，将上传凭证并确认认捐。
      </div>
    `);
    return;
  }
  // 已上传：只读展示 OCR 信息（复用 viewReceipt 的展示样式）
  const ocr = receipt;
  openInfo(`凭证信息 · ${book?.title || donation.book || ''}`, `
    <div class="ocr-result">
      <div class="ocr-result-head">
        <span class="ocr-icon">✓</span>
        <strong>凭证已上传</strong>
        <span class="badge gray">${ocr.verified ? '已生效' : '审核中'}</span>
      </div>
      <div class="ocr-result-grid">
        <div class="ocr-row"><span>收款账户</span><b>${ocr.payeeAccount}</b></div>
        <div class="ocr-row"><span>收款方</span><b>${ocr.payeeName}</b></div>
        <div class="ocr-row"><span>付款账户</span><b>${ocr.payerAccount || '—'}</b></div>
        <div class="ocr-row"><span>付款户名</span><b>${ocr.payerName || '—'}</b></div>
        <div class="ocr-row"><span>付款金额</span><b class="payee-amount">¥${(ocr.amount || 0).toLocaleString()}</b></div>
        <div class="ocr-row"><span>付款时间</span><b>${ocr.transferTime || '—'}</b></div>
        <div class="ocr-row"><span>付款银行</span><b>${ocr.bankName || '—'}</b></div>
        <div class="ocr-row"><span>附言</span><b>${ocr.memo || '—'}</b></div>
      </div>
      <div class="ocr-result-foot">由管理员于 ${ocr.uploadedAt?.slice(0, 19).replace('T', ' ') || '—'} 上传并确认。</div>
    </div>
  `);
}

// 管理员上传收款凭证
function adminUploadReceipt(seatId) {
  const seat = findSeatById(seatId);
  if (!seat) return showToast('未找到该席位');
  if (seat.receipt?.verified) return showToast('该席位已完成认捐');
  const book = books.find(b => b.id === seat.bookId);
  const remain = seatRemainDays(seat);

  // 管理员弹窗：显示席位信息 + 上传凭证
  openSheet(`管理员 · 上传收款凭证`, `
    <div class="payee-box" style="margin-bottom:14px">
      <div class="payee-box-head">席位信息</div>
      <div class="payee-box-row"><span>经书</span><b>${book?.title || ''}（${seat.bookId}）</b></div>
      <div class="payee-box-row"><span>席位编号</span><b>${seat.seatId}</b></div>
      <div class="payee-box-row"><span>捐赠者</span><b>${seat.userName}</b></div>
      <div class="payee-box-row"><span>应转金额</span><b class="payee-amount">¥${seat.amount.toLocaleString()}</b></div>
      <div class="payee-box-row"><span>收款账户</span><b class="payee-account">${PAYMENT_ACCOUNT}</b></div>
      <div class="payee-box-row"><span>剩余时间</span><b class="${remain <= 1 ? 'urgent' : ''}">${remain} 天</b></div>
    </div>

    <div class="field">
      <label>凭证图片（银行收款截图 / 回单）</label>
      <div class="receipt-uploader">
        <input type="file" id="receipt-img" accept="image/*" hidden>
        <button class="btn btn-ghost btn-block" data-action="pick-image">选择凭证图片</button>
        <div class="receipt-preview" id="receipt-preview" hidden>
          <img alt="凭证预览">
          <button class="text-link" data-action="re-pick">重新选择</button>
        </div>
      </div>
    </div>

    <div class="notice">
      上传凭证图片后，系统将自动识别凭证中的关键信息（付款账户、收款账户、付款金额、付款时间、付款户名等）。<br>
      识别完成后请核对信息无误后点击确认完成上传并赠送 3 项赠品。
    </div>
  `, `<button class="btn btn-ghost" data-close>取消</button>`);

  bindAdminReceiptUploader(seat);
}

function bindAdminReceiptUploader(seat) {
  const onPick = () => document.querySelector('#receipt-img').click();
  document.querySelectorAll('[data-action="pick-image"], [data-action="re-pick"]').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); onPick(); }));

  document.querySelector('#receipt-img')?.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const prev = document.querySelector('#receipt-preview');
      if (prev) {
        prev.hidden = false;
        prev.querySelector('img').src = ev.target.result;
      }
    };
    reader.readAsDataURL(file);

    openSheet('管理员 · 上传收款凭证', `
      <div class="ocr-loading">
        <div class="ocr-spinner"></div>
        <strong>正在识别凭证信息…</strong>
        <small>系统正在读取凭证图片中的付款账户、金额、时间、户名等信息</small>
      </div>
    `, `<button class="btn btn-ghost" data-close>取消</button>`);

    const ocr = await simulateOcr(file, seat);

    openSheet('管理员 · 上传收款凭证', `
      <div class="receipt-preview" id="receipt-preview" style="margin-bottom:14px">
        <img alt="凭证预览" src="${document.querySelector('#receipt-preview img')?.src || ''}">
      </div>
      ${renderOcrResult(ocr, seat)}
    `, `<button class="btn btn-ghost" data-close>取消</button>
        <button class="btn btn-primary" id="confirm-receipt">确认无误，完成认捐</button>`);

    document.querySelector('#confirm-receipt')?.addEventListener('click', () => adminConfirmReceipt(seat, ocr));
  });
}

// 管理员确认认捐：写入凭证 + 触发 3 项赠品
function adminConfirmReceipt(seat, ocr) {
  if (!ocr) return showToast('凭证未通过识别');

  if (ocr.payeeAccount !== PAYMENT_ACCOUNT) {
    showToast('收款账户不匹配，已拒绝上传');
    return;
  }

  seat.receipt = {
    uploadedAt: new Date().toISOString(),
    payeeAccount: ocr.payeeAccount,
    payeeName: ocr.payeeName,
    payerAccount: ocr.payerAccount,
    payerName: ocr.payerName,
    amount: ocr.amount,
    transferTime: ocr.transferTime,
    bankName: ocr.bankName,
    memo: ocr.memo,
    verify: ocr.verify,
    verified: true,
    verifiedAt: new Date().toISOString(),
    uploadedBy: 'admin'
  };

  // 落账
  finalizeSeat(seat);

  // 触发 3 项赠品发放
  issueGifts(seat, ocr);

  closeOverlay();
  showToast('认捐已生效，3 项赠品已发放');

  const book = books.find(b => b.id === seat.bookId);
  openInfo('护持圆满 · 赠品已发放', `
    <div class="center"><div class="success-mark">✓</div>
      <h3 class="flow-title">认捐完成</h3>
      <p class="flow-desc">凭证已通过识别并上传，《${book?.title || ''}》认捐已生效。</p>
    </div>
    <div class="notice">
      <b>3 项赠品已发放：</b><br>
      ① ${GIFT_TYPES.guide.name}<br>
      ② ${GIFT_TYPES.plaque.name}（请在【我的 → 我的赠品】中选择并填写）<br>
      ③ ${GIFT_TYPES.pray.name}
    </div>
    ${certificateHtml({ amount: ocr.amount, book: book?.title })}
  `);
}

// 发放 3 项赠品（仅管理员确认认捐后调用）
function issueGifts(seat, ocr) {
  // 为该 userName + seat 的归属用户发放（演示：写到当前普通用户 state.myGifts）
  // 注意：管理员上传的席位可能属于其他用户，演示中只能写到当前 state.user
  // 生产环境应按 seat.userPhone 找到对应用户再写入
  state.myGifts = {
    seatId: seat.seatId,
    bookId: seat.bookId,
    issuedAt: new Date().toISOString(),
    guide: {
      issued: true,
      code: `GUIDE-${formatDate()}-${seat.seatId.slice(-3)}`,
      desc: GIFT_TYPES.guide.name,
      issuedAt: new Date().toISOString()
    },
    plaque: {
      issued: true,
      type: null,       // 等待用户选 吉祥牌/操作牌
      content: '',      // 等待用户填写
      desc: GIFT_TYPES.plaque.name
    },
    pray: {
      issued: true,
      code: `SD${formatDate()}-${seat.seatId.slice(-3)}`,
      date: '近期法会日程（详见【我的 → 我的赠品】）',
      desc: GIFT_TYPES.pray.name,
      issuedAt: new Date().toISOString()
    }
  };
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
  return `<div class="inscription-grid-large">
      <article class="card quote-card">
        <div class="inscription-img-large"><img src="assets/inscription-1-yicheng-publish.png" alt="一诚大和尚为《嘉兴藏》出版题词"></div>
        <div class="inscription-info"><strong>一诚大和尚</strong><small>中国佛教协会会长 · 为《嘉兴藏》出版题词</small></div>
      </article>
      <article class="card quote-card">
        <div class="inscription-img-large"><img src="assets/inscription-2-yicheng-first.png" alt="一诚大和尚为《嘉兴藏》初版题词"></div>
        <div class="inscription-info"><strong>一诚大和尚</strong><small>中国佛教协会会长 · 为《嘉兴藏》初版题词</small></div>
      </article>
      <article class="card quote-card">
        <div class="inscription-img-large"><img src="assets/inscription-3-benhuan.jpg" alt="本焕大和尚为重辑《嘉兴藏》题字"></div>
        <div class="inscription-info"><strong>本焕大和尚</strong><small>为重辑《嘉兴藏》题字</small></div>
      </article>
    </div>
    <div class="notice">题词内容为大德墨宝扫描件，正式上线以项目组获授权的题词释义及来源说明为准。</div>`;
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

/* ========== 图片放大查看 ========== */
function openZoom(src, caption) {
  state.zoom = { src, caption: caption || '' };
  overlayRoot.innerHTML = `<div class="zoom-overlay" data-zoom-close>
      <button class="zoom-close" data-zoom-close aria-label="关闭">×</button>
      <figure class="zoom-stage">
        <img class="zoom-img" src="${src}" alt="${caption || ''}">
        ${caption ? `<figcaption class="zoom-cap">${caption}</figcaption>` : ''}
      </figure>
    </div>`;
  overlayRoot.querySelectorAll('[data-zoom-close]').forEach(el => el.addEventListener('click', closeZoom));
}
function closeZoom() { state.zoom = null; overlayRoot.innerHTML = ''; }

let toastTimer;
// 简单的剪贴板复制（演示阶段用，失败时降级为提示）
function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch (e) { return false; }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

render();
