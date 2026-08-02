/** Caribbean infrastructure advisors — linked from the public showcase. */

export type Expert = {
  name: string;
  role: string;
  linkedin: string;
  focus: string;
};

export const experts: Expert[] = [
  {
    name: 'Mellissa Lezama',
    role: 'Energy & infrastructure advisor',
    linkedin: 'https://www.linkedin.com/in/mellissa-lezama/',
    focus: 'Caribbean resilient infrastructure and regional energy transition.',
  },
  {
    name: 'Leslie Lee Fook',
    role: 'Infrastructure & policy advisor',
    linkedin: 'https://www.linkedin.com/in/leslieleefook/',
    focus: 'SIDS energy policy, grid integration, and project delivery governance.',
  },
  {
    name: 'Vaughn Lezama',
    role: 'Energy sovereignty advisor',
    linkedin: 'https://www.linkedin.com/in/vaughn-lezama/',
    focus: 'Caribbean investment into resilient infrastructure for regional energy sovereignty.',
  },
];
