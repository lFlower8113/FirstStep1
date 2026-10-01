import type { AvatarOption, PhaseId, Tip } from '../types';

export const avatars: AvatarOption[] = [
  { id: 'male', name: '男生', tag: '短发' },
  { id: 'female', name: '女生', tag: '长发' },
];

export const tips: Tip[] = [
  { id: 'flight-board', phase: 'findFlight', en: 'A SMALL TIP', title: '先看航班信息屏，再寻找登机口。', body: '登机口可能会临时变化，出发前再确认一次。' },
  { id: 'baggage-fee', phase: 'baggage', en: 'A SMALL TIP', title: '托运行李是否免费，取决于航司与票价类型。', body: '出发前先确认行李额度。先确认，再托运。' },
  { id: 'security-prep', phase: 'securityTip', en: 'A SMALL TIP', title: '把容易取出的物品放在外层。', body: '安检时会更从容，具体要求以机场现场规定为准。' },
];

export const phaseCopy: Record<PhaseId, { en: string; zh: string; hint?: string }> = {
  landing: { en: 'FIRST STEP', zh: '你不需要一次知道所有事情。\n我们先走下一步。' },
  avatar: { en: 'CHOOSE A COMPANION', zh: '选择一个陪你探索的形象。' },
  intro: { en: 'A GUIDED EXPERIENCE', zh: '你不会做错。\n跟着提示，一步一步来。' },
  observe: { en: 'LOOK AROUND', zh: '先不用做什么。\n观察一下周围。', hint: '机场看起来很大，但你现在只需要注意一件事。' },
  demoBoard: { en: 'WATCH ONCE', zh: '我们先找到你的航班。' },
  findFlight: { en: 'FIND YOUR FLIGHT', zh: '试着找到标记为 FS001 的航班。', hint: '看向上方的信息屏，我们只寻找一个编号。' },
  baggage: { en: 'A SMALL TIP', zh: '接下来，我们看看行李。' },
  followPath: { en: 'FOLLOW THE LIGHT', zh: '跟着地上的光，我们只走到下一个标记处。' },
  securityDemo: { en: 'WATCH ONCE', zh: '接下来是安检。\n我先示范一次。' },
  securityTip: { en: 'A SMALL TIP', zh: '把容易取出的物品放在外层。', hint: '安检时会更从容，具体要求以机场现场规定为准。' },
  security: { en: 'PREPARE FOR SECURITY', zh: '现在，你可以从手机开始。', hint: '你可以从靠近托盘的手机开始。' },
  reduceGuidance: { en: 'YOUR TURN', zh: '你已经知道下一步在哪里了。' },
  findGate: { en: 'FIND GATE 18', zh: '试着找到 Gate 18。', hint: '寻找刚才看到的数字。' },
  arrive: { en: 'YOU MADE IT HERE', zh: '你已经走到了这里。' },
  reflection: { en: 'NOW YOU KNOW HOW TO BEGIN', zh: '你并没有突然知道所有事情。\n你只是完成了当前能看见的下一步。' },
  takeaways: { en: 'TAKE WITH YOU', zh: '这次体验，你可以带走一些小事。' },
  complete: { en: 'A SMALL BEGINNING', zh: '下一次，也许你已经知道如何开始了。' },
};

export const takeaways = [
  '先看航班信息屏，再寻找登机口。',
  '托运行李前，确认票价是否包含行李额度。',
  '把容易取出的物品放在行李外层。',
  '不确定时，询问工作人员比猜测更快。',
];
