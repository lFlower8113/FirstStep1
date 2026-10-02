import type { AvatarOption, PhaseId, Tip } from '../types';

export const avatars: AvatarOption[] = [
  { id: 'male', name: '男生', tag: '短发' },
  { id: 'female', name: '女生', tag: '长发' },
];

export const tips: Tip[] = [
  {
    id: 'flight-board',
    phase: 'findFlight',
    en: 'A SMALL TIP',
    title: '先看航班信息屏，再寻找登机口。',
    body: '机场再大，进门第一件事是看大屏幕确认两件事：去哪个岛办理值机、登机口是几号。登机口可能临时变化，出发前再看一眼。',
  },
  {
    id: 'baggage-fee',
    phase: 'baggage',
    en: 'A SMALL TIP',
    title: '托运行李是否免费，取决于航司与票价类型。',
    body: '出发前先确认行李额度。廉航通常不含免费托运，普通经济舱通常有 20kg。箱子里切记不要放充电宝或打火机。先确认，再托运。',
  },
  {
    id: 'security-prep',
    phase: 'securityTip',
    en: 'A SMALL TIP',
    title: '把容易取出的物品放在外层。',
    body: '把手机、充电宝、电脑和雨伞放在最外层，安检拿取时会非常从容，不会在队伍里手忙脚乱。具体要求以机场现场规定为准。',
  },
  {
    id: 'id-prep',
    phase: 'packing',
    en: 'A SMALL TIP',
    title: '身份证原件随身带，千万别放行李箱底。',
    body: '国内航班从进入大厅、柜台值机、安全检查到登机闸机，全程至少需要出示 3-4 次。随手放在贴身口袋或随身包最外层最方便。',
  },
  {
    id: 'powerbank-rule',
    phase: 'packing',
    en: 'A SMALL TIP',
    title: '民航硬规矩：充电宝严禁托运，必须随身带。',
    body: '严禁放进行李箱托运！额定能量通常不能超过 100Wh（约 20000mAh），且外壳必须有清晰的参数标识，无标示的会被安检没收。',
  },
  {
    id: 'liquid-rule',
    phase: 'packing',
    en: 'A SMALL TIP',
    title: '随身液体单瓶不得超过 100ml。',
    body: '安检看的是瓶子本身的容器容积，而不是里面剩多少。大瓶化妆水或洗面奶必须放箱子托运。带个空保温杯，安检后里面有免费温水。',
  },
  {
    id: 'gate-timing',
    phase: 'waitGate',
    en: 'A SMALL TIP',
    title: '登机口通常在起飞前 15-20 分钟关闭。',
    body: '到达登机口后核对门头信息。听广播通知，听到催促登机时抓紧上机。如果不认识路，闭眼随便找一位穿制服的工作人员问就行。',
  },
];

export type PackItem = {
  id: string;
  name: string;
  icon: string;
  category: 'must' | 'normal' | 'caution';
  subtitle: string;
  tip: string;
};

/* The first flight's real anxiety happens before the airport, while
   packing. Each item carries a realistic fact the traveler should know. */
export const packItems: PackItem[] = [
  {
    id: 'id',
    name: '身份证 (实体原件)',
    icon: '▤',
    category: 'must',
    subtitle: '乘机第一凭证 · 必须随身',
    tip: '国内乘机最关键的凭证！必须是实体原件，放进贴身口袋或随身小包最外层，千万别塞进箱底，今天全程至少要掏出来4次。',
  },
  {
    id: 'phone',
    name: '手机 & 电子机票短信',
    icon: '▢',
    category: 'must',
    subtitle: '航班动态与电子登机牌',
    tip: '购票短信、航旅纵横、电子登机牌都在里面。出门前一定充满电，或者带好充电线以备不时之需。',
  },
  {
    id: 'powerbank',
    name: '随身充电宝 (≤100Wh)',
    icon: '◫',
    category: 'caution',
    subtitle: '民航铁律 · 严禁托运',
    tip: '重点！充电宝【严禁托运】，必须随身携带！容量不能超过 20000mAh (100Wh)，机身外壳必须有清晰的额定容量印刷。',
  },
  {
    id: 'liquid',
    name: '护肤与液体 (≤100ml)',
    icon: '◍',
    category: 'caution',
    subtitle: '看容器容积 · 大瓶请托运',
    tip: '随身单瓶液体容器容量不得超过 100ml（看瓶身容量，哪怕500ml的瓶子只剩一点水也不行）。大瓶必须托运，空保温杯可以带。',
  },
  {
    id: 'jacket',
    name: '轻薄外套 / 围巾',
    icon: '◒',
    category: 'normal',
    subtitle: '应对万米高空客舱冷气',
    tip: '飞机巡航时机舱冷气通常很足，随身带一件薄外套，冷的时候披一下会非常舒适，不用全程硬扛。',
  },
  {
    id: 'mints',
    name: '薄荷糖 / 常用药品',
    icon: '◇',
    category: 'normal',
    subtitle: '缓解起飞降落耳膜胀痛',
    tip: '起飞和降落时气压变化会导致耳朵发闷发疼，嚼颗薄荷糖或不断吞咽口水能迅速平衡耳压。',
  },
];

export const departureSchedule = {
  flightNo: 'FS001',
  route: '北京首都 T3 → 上海虹桥 T2',
  departureTime: '09:40',
  recommendArrive: '07:40', // 提前 2 小时
  checkInClose: '09:00', // 提前 40 分钟停办
  gateClose: '09:20', // 提前 20 分钟关登机口
};

export const phaseCopy: Record<PhaseId, { en: string; zh: string; hint?: string }> = {
  landing: {
    en: 'FIRST STEP',
    zh: '你不需要一次知道所有事情。\n我们先走下一步。',
  },
  avatar: {
    en: 'CHOOSE A COMPANION',
    zh: '选择一个陪你探索的形象。',
  },
  intro: {
    en: 'A GUIDED EXPERIENCE',
    zh: '第一次坐飞机，旅程不是在航站楼才开始的，\n而是在你收拾行囊的那一刻。',
  },
  packing: {
    en: 'PACKING AT HOME',
    zh: '出发前，在家里先把行囊理清楚。',
    hint: '不知道带什么？别慌，身份证和手机先揣好，充电宝可千万不能托运。',
  },
  packingList: {
    en: 'READINESS CHECK',
    zh: '行囊带齐，时间心里有数。',
    hint: '国内航班建议提前 2 小时到机场，起飞前 40 分钟停止值机。',
  },
  arrival: {
    en: 'WELCOME TO TERMINAL 3',
    zh: '你现在站在首都机场 T3 航站楼大厅。',
  },
  lookAround: {
    en: 'LOOK AROUND FIRST',
    zh: '大厅很大、人来人往，心里发懵很正常。',
    hint: '按住鼠标拖动转动视角。记住：机场再大，每次也只需要做好眼前这一件事。',
  },
  observe: {
    en: 'THE FIRST STEP',
    zh: '第一步永远只有一件事：\n抬头看“航班信息大屏”。',
    hint: '不用盲目到处乱转，大屏幕会告诉你去哪个柜台办理。',
  },
  demoBoard: {
    en: 'WATCH THE BOARD',
    zh: '面对密密麻麻的屏幕别慌，\n我们只找自己的航班 FS001。',
  },
  findFlight: {
    en: 'FIND YOUR FLIGHT',
    zh: '在屏幕上找到前往上海的 FS001 航班。',
    hint: '看向上方大屏，找到第三行高亮的 FS001，点击它锁定值机柜台。',
  },
  goCounter: {
    en: 'CHECK-IN COUNTER',
    zh: '找到了！FS001 在 A 岛 A01 柜台办理。',
    hint: '走，跟着地上的光标，走向左前方的 A01 柜台。',
  },
  baggage: {
    en: 'BOARDING PASS & LUGGAGE',
    zh: '递出身份证，领取你的登机牌与办理托运。',
    hint: '地勤人员会为你核验。拿到登机牌后，认准登机口（Gate 18）与座位号。',
  },
  followPath: {
    en: 'HEADING TO SECURITY',
    zh: '收好登机牌与身份证，\n我们顺着地标前往安检通道。',
  },
  securityDemo: {
    en: 'SECURITY DEMO',
    zh: '接下来是安检。\n我先带你了解怎么做。',
  },
  securityTip: {
    en: 'A SMALL TIP',
    zh: '把容易取出的物品放在外层。',
    hint: '安检时会更从容，具体要求以机场现场规定为准。',
  },
  security: {
    en: 'PREPARE FOR SECURITY',
    zh: '把手机、充电宝、随身包放进托盘。',
    hint: '充电宝要单独拿出来平放；厚外套脱下放进托盘里过 X 光机。',
  },
  reduceGuidance: {
    en: 'PASSED SECURITY',
    zh: '安检顺利通过！\n最繁琐的关卡已经全部搞定了。',
    hint: '现在你已经在候机禁区，时间完全由你自己支配。',
  },
  waitGate: {
    en: 'THE CONCOURSE',
    zh: '顺着头顶蓝色指示牌，\n寻找我们的 18 号登机口。',
    hint: '看头顶标牌写着 Gate 1-20 方向，一路往前走。',
  },
  findGate: {
    en: 'FIND GATE 18',
    zh: '前面就是 Gate 18 候机区。',
    hint: '核对登机门上方屏幕确认是 FS001。点击门牌走向登机口。',
  },
  board: {
    en: 'BOARDING TIME',
    zh: '广播响起，FS001 开始登机了。',
    hint: '拿出登机牌刷闸机二维码，走过透明廊桥。',
  },
  arrive: {
    en: 'WELCOME ABOARD',
    zh: '走进客舱，找到 16A 靠窗座位坐下。',
    hint: '系好安全带，听着发动机平稳的低鸣。你已经稳稳迈出了第一步。',
  },
  reflection: {
    en: 'NOW YOU KNOW HOW TO BEGIN',
    zh: '你并没有突然知道所有事情。\n你只是完成了当前能看见的下一步。',
  },
  takeaways: {
    en: 'TAKE WITH YOU',
    zh: '这四条现实经验，无论去哪个机场都管用。',
  },
  complete: {
    en: 'A SMALL BEGINNING',
    zh: '下一次在现实中，\n你也可以从容走向属于你的航班。',
  },
};

export const takeaways = [
  '先看航班信息大屏，确定去哪个值机岛，别盲目找人打听。',
  '充电宝绝不能托运，必须随身带；单瓶液体超过 100ml 必须托运。',
  '身份证和手机放在随身包外层最易拿的位置，全程需要掏出多次。',
  '遇到任何拿不准的，随时问穿制服的地勤或志愿者，比瞎猜更省心。',
];
