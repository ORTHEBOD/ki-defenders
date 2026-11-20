// What the bosses shout when they arrive in battle (one line picked at random each time),
// and how the hero answers a moment later. Keyed by the enemy id (src/data/enemies.js).

export const BOSS_TALK = {
  ogre: ['Ogre smash tiny fighters!', 'Out of my way, little ones!', 'Krag promised me a feast!'],
  krag: ['Shields up! Crush them!', 'You will not stop the Empire!', 'I have never lost a battle. Not once!'],
  scorpion: ['My sting never misses!', 'The sand will hide your bones.', 'Click click... you are prey.'],
  sandKing: ['Bow before the king of the dunes!', 'The desert obeys ME.', 'Your water will run out long before my army.'],
  mech: ['TARGET FOUND. DESTROYING.', 'RESISTANCE IS... ILLOGICAL.', 'SYSTEMS AT 100%. YOURS ARE NOT.'],
  vorn: ['Kneel, and I may let you serve me.', 'A hundred worlds fell before me.', 'Is this all your little planet has?'],
  frostGiant: ['Nobody passes the gate!', 'I will freeze you solid!', 'Cold... like your chances.'],
  iceQueen: ['Your world will make a lovely ice statue.', 'Shiver before your queen.', 'Warmth is a weakness.'],
  lavaTitan: ['Melt! MELT!', 'The mountain burns with my anger!', 'Your fighters are made of wax.'],
  stormEagle: ['The storm answers to ME!', 'From up here, you look like ants.', 'Feel the lightning of the sky!'],
  skyEmperor: ['The heavens have chosen me to rule.', 'Pyrax was only my torch-bearer.', 'Bow, earth-dwellers!'],
  pyrax: ['Kneel before the true master!', 'Everything burns in the end.', 'I made Vorn. I can make worse.'],
};

export const HERO_REPLIES = [
  'Not today!',
  'Everyone, focus on the big one!',
  'We have beaten worse than you.',
  'Talk is cheap. Show me!',
  'Fighters - power up!',
  'You picked the wrong valley.',
];
