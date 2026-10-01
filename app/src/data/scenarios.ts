export type Scenario = { id: string; title: string; place: string; minutes: number; status: 'ready' | 'soon' };

export const scenarios: Scenario[] = [
  { id: 'first_flight', title: '第一次坐飞机', place: '机场', minutes: 3, status: 'ready' },
  { id: 'first_rail', title: '第一次坐高铁', place: '候车厅', minutes: 3, status: 'soon' },
  { id: 'first_rent', title: '第一次自己租房', place: '陌生的房间', minutes: 4, status: 'soon' },
  { id: 'first_clinic', title: '第一次去医院', place: '门诊', minutes: 3, status: 'soon' },
  { id: 'first_newjob', title: '第一次去陌生公司', place: '前台', minutes: 3, status: 'soon' },
];
