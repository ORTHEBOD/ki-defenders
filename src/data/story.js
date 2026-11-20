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
  vornFalls: {
    after: 30,
    title: 'Vorn Falls',
    lines: [
      { who: 'vorn', name: 'Emperor Vorn', text: 'Impossible... beaten by a handful of warriors... But my allies in the north will avenge me!' },
      { who: 'oru', name: 'Master Oru', text: 'His allies? A cold wind is blowing from the mountains. This is not over yet.' },
      { who: 'zenko', name: 'Zenko', text: 'Then we head north. Pack something warm, everyone!' },
    ],
  },
  toPeaks: {
    before: 31,
    title: 'Chapter 4: The Frozen Peaks',
    lines: [
      { who: 'mira', name: 'Mira', text: 'Brr! The whole mountain is frozen. And those little ice imps are FAST.' },
      { who: 'lumi', name: 'Lumi', text: 'Something up there is making the snow move like an army.' },
      { who: 'goran', name: 'Goran', text: 'Good. I was getting too warm anyway. Let them come.' },
    ],
  },
  frostGiant: {
    before: 40,
    title: 'The Frost Giant',
    lines: [
      { who: 'frostGiant', name: 'Frost Giant', text: 'Nobody climbs the Peaks while I guard the gate. NOBODY!' },
      { who: 'kaito', name: 'Kaito', text: 'Big guy, big club. I love it!' },
    ],
  },
  iceQueen: {
    before: 45,
    title: 'The Ice Queen',
    lines: [
      { who: 'iceQueen', name: 'Ice Queen Seraka', text: 'Vorn was a fool. I will freeze your whole world - and keep it forever.' },
      { who: 'sora', name: 'Sora', text: 'Ki burns hotter than any ice. Let\'s see how long your winter lasts.' },
    ],
  },
  toVolcano: {
    before: 46,
    title: 'Chapter 5: The Volcano',
    lines: [
      { who: 'oru', name: 'Master Oru', text: 'The Ice Queen is gone, but the mountain to the south has woken up. The air is burning.' },
      { who: 'blaze', name: 'Blaze', text: 'Fire against fire? Finally, my kind of fight!' },
      { who: 'zenko', name: 'Zenko', text: 'Whoever leads them is hiding inside that volcano. We end this there.' },
    ],
  },
  lavaTitan: {
    before: 55,
    title: 'The Lava Titan',
    lines: [
      { who: 'lavaTitan', name: 'Lava Titan', text: 'I was made in the fire of the mountain. You will melt like wax.' },
      { who: 'ronin', name: 'Ronin', text: 'Then I will cool you down. With one very big beam.' },
    ],
  },
  pyrax: {
    before: 60,
    title: 'The Inferno Lord',
    lines: [
      { who: 'pyrax', name: 'Inferno Lord Pyrax', text: 'Krag, Ozul, Vorn, Seraka... all were MY servants. Now kneel before the true master!' },
      { who: 'zenko', name: 'Zenko', text: 'We beat every one of them. You\'re just the last one in line.' },
    ],
  },
  toSky: {
    before: 61,
    title: 'Chapter 6: The Sky Temple',
    background: 'story_sky',
    lines: [
      { who: 'oru', name: 'Master Oru', text: 'Look up, Zenko! A temple has appeared above the clouds - and monsters are pouring down from it.' },
      { who: 'zenko', name: 'Zenko', text: 'Pyrax said someone else gave the orders. I bet he lives up there.' },
      { who: 'lumi', name: 'Lumi', text: 'Monkeys with wings, stone gargoyles, monks made of thunder... this will be our hardest climb.' },
    ],
  },
  stormEagle: {
    before: 68,
    title: 'The Storm Eagle King',
    background: 'story_sky',
    lines: [
      { who: 'stormEagle', name: 'Storm Eagle King', text: 'No one flies higher than me. Turn back, or be struck down by my storm!' },
      { who: 'blaze', name: 'Blaze', text: 'Fire beats feathers. Let\'s go!' },
    ],
  },
  skyEmperor: {
    before: 75,
    title: 'The Sky Emperor',
    background: 'story_sky',
    lines: [
      { who: 'skyEmperor', name: 'Sky Emperor', text: 'Krag, Ozul, Vorn, Seraka, Pyrax... all of them served me. I am the one who sent the portal.' },
      { who: 'zenko', name: 'Zenko', text: 'Then this is the last battle. Everyone - give it everything!' },
    ],
  },
  skyEnding: {
    after: 75,
    title: 'Peace in the Sky',
    background: 'story_sky',
    lines: [
      { who: 'skyEmperor', name: 'Sky Emperor', text: 'Beaten... by the people of the ground...' },
      { who: 'oru', name: 'Master Oru', text: 'The sky is free again. You are true Ki Defenders now - every one of you.' },
      { who: 'zenko', name: 'Zenko', text: 'Endless Battle is still waiting. Let\'s see how far we can go!' },
    ],
  },
  ending: {
    after: 60,
    title: 'Victory!',
    lines: [
      { who: 'pyrax', name: 'Inferno Lord Pyrax', text: 'No... my fire... going out...' },
      { who: 'oru', name: 'Master Oru', text: 'The valley, the desert, the sky, the peaks and the volcano. Our whole world is safe, thanks to you.' },
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
