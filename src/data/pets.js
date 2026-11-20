// Pets: bought with diamonds on the Pets page. One pet comes along to every battle: it floats next to the
// hero (or next to the base, with no hero) and helps in its own way (src/objects/Pet.js).
// The pictures are art/pet_<id>.png and pet_<id>_1.png (tools/cut_monsters2.py).

export const PETS = {
  dragon: {
    name: 'Ember Dragon', price: 40, color: 0xff6a1a,
    text: 'Shoots fireballs at the monsters near it',
    fire: { damage: 22, every: 2, range: 240, splash: 50 },
  },
  kitten: {
    name: 'Cloud Kitten', price: 30, color: 0xeaf6ff,
    text: 'Heals your hero a little every 2 seconds',
    heal: { amount: 0.04, every: 2 },
  },
  turtle: {
    name: 'Shell Turtle', price: 35, color: 0x5bbf5b,
    text: 'Guards the base: the first 3 monsters that get in cost no lives',
    guard: 3,
  },
  fox: {
    name: 'Star Fox', price: 30, color: 0x5a8aff,
    text: '+25% coins from every battle, and +1 Ki for every monster',
    coins: 0.25, ki: 1,
  },
};
