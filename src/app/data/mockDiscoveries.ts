import type { Discovery } from '@/app/types';

// Mock database of recognizable items
export const MOCK_DISCOVERIES: Omit<Discovery, 'id' | 'discoveredAt'>[] = [
  // Fauna - Birds
  {
    name: 'Robin',
    scientificName: 'Erithacus rubecula',
    type: 'fauna',
    category: 'bird',
    color: 'orange',
    habitat: 'garden',
    isDangerous: false,
    story: 'Meet the Robin! This little singer has a bright orange chest like a tiny sunset. Robins love to hop around looking for worms—they can hear them wiggling underground!',
    funFact: 'Robins sing even in winter to tell other robins "this is MY garden!"',
    imageUrl: 'robin-bird-nature',
    followUpActivity: 'Listen quietly—can you hear the Robin singing? They love to chat!'
  },
  {
    name: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    type: 'fauna',
    category: 'bird',
    color: 'blue',
    habitat: 'forest',
    isDangerous: false,
    story: 'The Blue Jay is like a flying blue jewel! With its bright blue feathers and punk-rock crest, this bird is the loudest neighbor in the forest. Blue Jays are super smart—they can mimic hawk calls to scare other birds away from their snacks!',
    funFact: 'Blue Jays can remember where they hid over 1,000 acorns!',
    imageUrl: 'blue-jay-bird',
    followUpActivity: 'Look for acorns nearby—Blue Jays love to hide them for winter!'
  },
  
  // Fauna - Insects
  {
    name: 'Ladybug',
    scientificName: 'Coccinellidae',
    type: 'fauna',
    category: 'insect',
    color: 'red',
    habitat: 'garden',
    isDangerous: false,
    story: 'This is a Ladybug, the garden\'s tiny superhero! With her shiny red cape (wings) and polka-dot costume, she zooms around saving plants by eating the bad bugs that want to munch on leaves.',
    funFact: 'Ladybugs can eat up to 5,000 aphids in their lifetime!',
    imageUrl: 'ladybug-insect-red',
    followUpActivity: 'Count the spots on the Ladybug\'s back—each one is like a superhero badge!'
  },
  {
    name: 'Honeybee',
    scientificName: 'Apis mellifera',
    type: 'fauna',
    category: 'insect',
    color: 'yellow',
    habitat: 'garden',
    isDangerous: false,
    story: 'The Honeybee is nature\'s delivery truck! She flies from flower to flower, picking up yellow pollen dust on her fuzzy body. This helps flowers make seeds and fruits. In return, the flower gives her sweet nectar to make honey!',
    funFact: 'A single bee visits about 2,000 flowers every day!',
    imageUrl: 'honeybee-flower-yellow',
    followUpActivity: 'Look for yellow pollen on the bee\'s back legs—that\'s her grocery bags!'
  },
  {
    name: 'Butterfly',
    scientificName: 'Papilio machaon',
    type: 'fauna',
    category: 'insect',
    color: 'multicolor',
    habitat: 'meadow',
    isDangerous: false,
    story: 'This beautiful Butterfly started life as a tiny caterpillar! After eating lots of leaves, it made a cozy sleeping bag called a chrysalis. Inside, it transformed into this flying rainbow! Now it dances from flower to flower sipping sweet nectar through its long straw-like tongue.',
    funFact: 'Butterflies taste with their feet to know if a leaf is good for their babies!',
    imageUrl: 'butterfly-colorful-nature',
    followUpActivity: 'Watch how the butterfly lands on flowers—it\'s like a fairy landing on a cloud!'
  },
  
  // Flora - Trees
  {
    name: 'Oak Tree',
    scientificName: 'Quercus',
    type: 'flora',
    category: 'tree',
    color: 'green',
    habitat: 'forest',
    isDangerous: false,
    story: 'The mighty Oak Tree is like an apartment building for animals! Squirrels live in the branches, birds nest in the leaves, and bugs crawl on the bark. Oak trees grow from tiny acorns—a single tree can make thousands of acorns every year!',
    funFact: 'Some Oak trees are over 1,000 years old—older than castles!',
    imageUrl: 'oak-tree-nature',
    followUpActivity: 'You found an Oak! Can you find an acorn hiding under the tree?'
  },
  {
    name: 'Maple Tree',
    scientificName: 'Acer',
    type: 'flora',
    category: 'tree',
    color: 'green',
    habitat: 'park',
    isDangerous: false,
    story: 'The Maple Tree is famous for making sweet syrup! In spring, people tap the tree to collect sap, which is boiled down to make pancake syrup. Maple leaves are shaped like stars with pointy fingers. In autumn, they turn brilliant red, orange, and yellow!',
    funFact: 'It takes 40 gallons of maple sap to make 1 gallon of syrup!',
    imageUrl: 'maple-tree-autumn',
    followUpActivity: 'Pick up a fallen maple leaf—can you trace its star shape?'
  },
  
  // Flora - Flowers
  {
    name: 'Sunflower',
    scientificName: 'Helianthus annuus',
    type: 'flora',
    category: 'flower',
    color: 'yellow',
    habitat: 'garden',
    isDangerous: false,
    story: 'The Sunflower is like a giant golden dinner plate that follows the sun! When it\'s young, the sunflower turns its face to watch the sun move across the sky—like a slow-motion dance. Birds LOVE to eat the crunchy seeds in the middle.',
    funFact: 'One sunflower head can contain up to 2,000 seeds!',
    imageUrl: 'sunflower-yellow-bright',
    followUpActivity: 'Stand next to the sunflower—is it taller than you?'
  },
  {
    name: 'Dandelion',
    scientificName: 'Taraxacum',
    type: 'flora',
    category: 'flower',
    color: 'yellow',
    habitat: 'lawn',
    isDangerous: false,
    story: 'The Dandelion is a magical wish maker! First it\'s a bright yellow sun, then it transforms into a fluffy white cloud of seeds. Each seed has its own tiny parachute. When you blow on it, the seeds fly away to plant new dandelions far away!',
    funFact: 'Every part of a dandelion can be eaten—flowers, leaves, and roots!',
    imageUrl: 'dandelion-seeds-white',
    followUpActivity: 'If you see a white fluffy dandelion, make a wish and blow gently!'
  },
  {
    name: 'Rose',
    scientificName: 'Rosa',
    type: 'flora',
    category: 'flower',
    color: 'red',
    habitat: 'garden',
    isDangerous: false,
    story: 'The Rose is the queen of the garden! With velvety petals and a sweet smell, roses have been loved by people for thousands of years. But watch out—roses protect themselves with sharp thorns on their stems to keep hungry animals from eating them.',
    funFact: 'The oldest living rose bush is over 1,000 years old in Germany!',
    imageUrl: 'red-rose-flower',
    followUpActivity: 'Smell the rose (carefully!)—can you describe the scent?'
  },
  
  // Dangerous Items
  {
    name: 'Poison Ivy',
    scientificName: 'Toxicodendron radicans',
    type: 'flora',
    category: 'plant',
    color: 'green',
    habitat: 'forest',
    isDangerous: true,
    story: 'STOP! This is Poison Ivy—look but don\'t touch! This plant has oils that make your skin very itchy and uncomfortable. Remember: "Leaves of three, let it be!" Poison Ivy always has three shiny leaves together.',
    funFact: 'Only humans get a rash from poison ivy—birds and animals can touch it safely!',
    imageUrl: 'poison-ivy-leaves',
    followUpActivity: 'Remember the three-leaf pattern—now you can spot and avoid it!'
  },
  {
    name: 'Red Mushroom',
    scientificName: 'Amanita muscaria',
    type: 'flora',
    category: 'mushroom',
    color: 'red',
    habitat: 'forest',
    isDangerous: true,
    story: 'DANGER! This beautiful red mushroom with white spots looks like it belongs in a fairy tale, but it\'s poisonous! Never eat wild mushrooms unless a mushroom expert says it\'s safe. This one can make you very sick.',
    funFact: 'This mushroom is famous in fairy tales and video games, but in real life, it\'s NOT safe!',
    imageUrl: 'red-mushroom-amanita',
    followUpActivity: 'You can look at it and take photos, but never touch or taste wild mushrooms!'
  },
  
  // More Common Finds
  {
    name: 'Grasshopper',
    scientificName: 'Caelifera',
    type: 'fauna',
    category: 'insect',
    color: 'green',
    habitat: 'meadow',
    isDangerous: false,
    story: 'The Grasshopper is nature\'s jumping champion! With super-strong back legs, it can leap 20 times its own body length—imagine if you could jump over your house! Grasshoppers have ears on their bellies and make music by rubbing their legs together.',
    funFact: 'Some grasshoppers can jump over 3 feet high!',
    imageUrl: 'grasshopper-green-insect',
    followUpActivity: 'Watch carefully—can you see it jump? How far did it go?'
  },
  {
    name: 'Squirrel',
    scientificName: 'Sciurus',
    type: 'fauna',
    category: 'mammal',
    color: 'brown',
    habitat: 'park',
    isDangerous: false,
    story: 'The Squirrel is a bushy-tailed acrobat! With sharp claws and a fluffy tail for balance, squirrels can run straight up trees and even walk on power lines. They spend all autumn collecting and hiding nuts for winter—but they forget where they buried half of them!',
    funFact: 'Forgotten buried nuts grow into new trees—squirrels are accidental gardeners!',
    imageUrl: 'squirrel-brown-tree',
    followUpActivity: 'Watch the squirrel\'s tail—it uses it like a blanket, umbrella, and parachute!'
  },
  {
    name: 'Clover',
    scientificName: 'Trifolium',
    type: 'flora',
    category: 'plant',
    color: 'green',
    habitat: 'lawn',
    isDangerous: false,
    story: 'Clover is a lucky little plant! Most clovers have three heart-shaped leaves, but if you find one with FOUR leaves, it\'s super rare and considered lucky! Bees love clover flowers, and rabbits love to munch on the leaves.',
    funFact: 'The chances of finding a four-leaf clover are about 1 in 10,000!',
    imageUrl: 'clover-green-grass',
    followUpActivity: 'Can you count how many leaves this clover has? Keep looking for a lucky four-leaf one!'
  }
];
