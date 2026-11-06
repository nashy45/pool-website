// Seed data loaded on first start when the corresponding tables are empty.

// Bar menu (prices in FCFA)
const menuData = {
  'Whiskey': [
    { name: 'Baileys', price: 25000 },
    { name: 'Ballantines', price: 25000 },
    { name: 'Belvedere Vodka', price: 50000 },
    { name: 'Black label JW', price: 35000 },
    { name: 'Chivas 12 year', price: 35000 },
    { name: 'Black label 1L JW', price: 50000 },
    { name: 'Chivas 12 year 1L', price: 50000 },
    { name: 'Hennessy', price: 50000 },
    { name: 'Glenmorangie 10 year', price: 40000 },
    { name: 'Glenmorangie 12 year', price: 55000 },
    { name: 'Glenmorangie 14 years', price: 60000 },
    { name: 'Glenmorangie 18 years', price: 110000 },
    { name: 'Gold label JW', price: 60000 },
    { name: 'Double black 1L', price: 60000 },
    { name: 'Chivas 18 years 70cl', price: 80000 },
    { name: 'Jonny walker 18 years', price: 80000 },
    { name: 'Hennessy V.S.O.P', price: 80000 },
    { name: 'Hennessy X.O 70CL', price: 250000 },
    { name: 'Blue label', price: 250000 },
    { name: 'Chivas 25 years', price: 250000 },
    { name: 'Blue label 1L', price: 450000 },
    { name: 'Hennessy X.X.O', price: 1000000 }
  ],
  'Tequila': [
    { name: 'Azur', price: 400000 },
    { name: 'Volcan XA', price: 500000 },
    { name: 'Don Julio Reposado', price: 200000 },
    { name: 'Don Julio', price: 400000 }
  ],
  'Champagne': [
    { name: 'Veuve de Vernay', price: 25000 },
    { name: 'Blu Nun', price: 25000 },
    { name: 'Pizzolato', price: 35000 },
    { name: 'Troullard', price: 60000 },
    { name: 'Moet', price: 60000 },
    { name: 'Veuve cliquot', price: 60000 },
    { name: 'Bellaire rose light', price: 75000 },
    { name: 'Moet Rose', price: 70000 },
    { name: 'Ruinard brut', price: 80000 },
    { name: 'Ruinard blanc', price: 85000 },
    { name: 'Don Perignon', price: 300000 },
    { name: 'Crystal', price: 300000 },
    { name: 'Armand de brignac', price: 450000 },
    { name: 'Ace of Spade', price: 40000 },
    { name: 'Brugal', price: 50000 },
    { name: 'Moet Rose', price: 50000 },
    { name: 'Moet Brut', price: 90000 },
    { name: 'Ruinart', price: 60000 },
    { name: 'Moet Brut 1.5L', price: 70000 },
    { name: 'Moet Magnum', price: 90000 },
    { name: 'Moet Rose Magnum', price: 70000 },
    { name: 'Veuve Clicquot Brut', price: 70000 },
    { name: 'Don Perignon', price: 80000 },
    { name: 'Piper Heidsieck', price: 80000 },
    { name: 'Armand de Brignac', price: 100000 },
    { name: 'Veuve Rose', price: 100000 },
    { name: 'Ruinart Blanc', price: 120000 },
    { name: 'Cristal', price: 350000 },
    { name: 'Armand de Brignac Gold', price: 800000 },
    { name: 'Armand de Brignac Rose', price: 300000 }
  ],
  'Cocktail': [
    { name: 'My way', price: 6500 },
    { name: 'Sex on the beach', price: 6500 },
    { name: 'Dolcevita', price: 6500 },
    { name: 'Mojito exotique', price: 6500 },
    { name: 'Pina canada', price: 6500 }
  ],
  'Non Alcoholic': [
    { name: 'Mojito', price: 5000 },
    { name: 'Bella Luna', price: 5000 },
    { name: 'Fruit punch', price: 5000 },
    { name: 'Zanzilmood', price: 5000 },
    { name: 'Mikadonia', price: 5000 },
    { name: 'Special mix', price: 4500 }
  ],
  'Premium Spirits': [
    { name: 'Absolut Vodka', price: 30000 },
    { name: 'Martell', price: 90000 },
    { name: 'Monkey Shoulder', price: 30000 },
    { name: 'Campari', price: 30000 },
    { name: 'Chivas Regal', price: 40000 },
    { name: 'Black Label', price: 40000 },
    { name: 'Jack Daniels', price: 40000 },
    { name: 'Hennessy VS', price: 50000 },
    { name: 'Gordon Gin', price: 60000 },
    { name: 'Ciroc', price: 80000 },
    { name: 'Patron', price: 60000 },
    { name: 'Grey Goose', price: 60000 },
    { name: 'Martell Blue Swift', price: 70000 },
    { name: 'Monkey 47', price: 70000 },
    { name: 'Tia Maria', price: 80000 },
    { name: 'Remy Martin VSOP', price: 60000 },
    { name: 'Hennessy VSOP', price: 90000 },
    { name: 'Chivas 18 year', price: 90000 },
    { name: 'Remy Martin XO', price: 120000 },
    { name: 'Don Julio 1942', price: 90000 },
    { name: 'Belaire Rose', price: 250000 },
    { name: 'Don Julio Long Bottle', price: 100000 },
    { name: 'Ciroc Magnum', price: 120000 },
    { name: 'Veuve Rose', price: 150000 },
    { name: 'Cristal', price: 350000 },
    { name: 'Armand de Brignac', price: 500000 },
    { name: 'Blue Label', price: 250000 }
  ],
  'Shisha/Hookah': [
    { name: 'Shisha - Mango Tango', price: 5000 },
    { name: 'Shisha - Ice Lemon', price: 5000 },
    { name: 'Shisha - Love 66', price: 5000 }
  ]
};

// Default tables / resources
const defaultResources = [
  { name: 'Pool Table 1', type: 'pool_table', capacity: 6 },
  { name: 'Pool Table 2', type: 'pool_table', capacity: 6 },
  { name: 'Pool Table 3', type: 'pool_table', capacity: 6 },
  { name: 'Snooker Table', type: 'pool_table', capacity: 4 },
  { name: 'Dining Table 1', type: 'dining_table', capacity: 4 },
  { name: 'Dining Table 2', type: 'dining_table', capacity: 4 },
  { name: 'Dining Table 3', type: 'dining_table', capacity: 6 },
  { name: 'Bar Counter Seating', type: 'dining_table', capacity: 8 },
  { name: 'VIP Lounge', type: 'event_space', capacity: 20 },
  { name: 'Private Room', type: 'event_space', capacity: 15 }
];

module.exports = { menuData, defaultResources };
