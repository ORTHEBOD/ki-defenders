// Short story scenes. Each one plays once per player, before (or after) a level.
// `who` picks the portrait: a hero id, a fighter id, or an enemy texture.
// Names and lines are all here, so the story is easy to rewrite.

export const STORY = {
  intro: {
    before: 1,
    title: 'Chapter 1: The Invasion',
    lines: [
      { who: 'oru', name: 'Master Oru', text: 'Zenko! A portal opened over Green Valley. Soldiers are pouring out of it!' },
      { who: 'zenko', name: 'Zenko', text: 'Then we stop them before they reach the village. Gather the fighters!' },
      { who: 'kaito', name: 'Kaito', text: 'Ha! I was getting bored anyway.' },
      { who: 'oru', name: 'Master Oru', text: 'Place our fighters next to the road. Their power grows as they train - and transform.' },
    ],
  },
  kragArrives: {
    before: 10,
    title: 'The General',
    lines: [
      { who: 'krag', name: 'General Krag', text: 'So YOU are the ones beating my soldiers. Impressive... for farmers.' },
      { who: 'zenko', name: 'Zenko', text: 'Pack up your army and leave our valley, Krag.' },
      { who: 'krag', name: 'General Krag', text: 'Emperor Vorn does not retreat. And neither do I! Shields up!' },
    ],
  },
  toDesert: {
    before: 11,
    title: 'Chapter 2: The Desert',
    lines: [
      { who: 'lumi', name: 'Lumi', text: 'Krag ran south, into the Desert Wasteland. Something big is waiting there.' },
      { who: 'blaze', name: 'Blaze', text: 'Hot sand, hot blasts. My kind of place!' },
      { who: 'zenko', name: 'Zenko', text: 'Watch the sky too. Their flyers love open ground.' },
    ],
  },
  sandKing: {
    before: 20,
    title: 'The Sand King',
    lines: [
      { who: 'sandKing', name: 'Sand King Ozul', text: 'The desert swallows all who walk it. Your little fighters will be no different.' },
      { who: 'ronin', name: 'Ronin', text: 'Then I will cut a path through the sand. One beam at a time.' },
    ],
  },
  toShip: {
    before: 21,
    title: 'Chapter 3: The Mothership',
    lines: [
      { who: 'oru', name: 'Master Oru', text: 'The mothership is right above us. Its emperor commands every soldier we fought.' },
      { who: 'zenko', name: 'Zenko', text: 'Then we take the fight to him. Everyone - this is it!' },
      { who: 'kaito', name: 'Kaito', text: 'Finally, a real challenge!' },
    ],
  },
  vorn: {
    before: 30,
    title: 'The Emperor',
    lines: [
      { who: 'vorn', name: 'Emperor Vorn', text: 'You broke Krag. You buried Ozul. Now face the one who conquered a hundred worlds.' },
      { who: 'zenko', name: 'Zenko', text: 'A hundred worlds... but not this one.' },
    ],
  },
  ending: {
    after: 30,
    title: 'Victory!',
    lines: [
      { who: 'vorn', name: 'Emperor Vorn', text: 'Impossible... beaten by a handful of warriors...' },
      { who: 'oru', name: 'Master Oru', text: 'It is over. The valley, the desert, our whole world - safe, thanks to you.' },
      { who: 'zenko', name: 'Zenko', text: 'Let\'s keep training. Try the Endless Battle - who knows what comes next!' },
    ],
  },
};

export function storyBefore(levelId) {
  return Object.entries(STORY).find(([, s]) => s.before === levelId)?.[0];
}

export function storyAfter(levelId) {
  return Object.entries(STORY).find(([, s]) => s.after === levelId)?.[0];
}
