/*
A: Should I get a helicopter?
B: Should I get a tattoo?
C: Should I get a robotic hand?

    |  red   | yellow |  blue  | green  | purple | orange | black  | white  |
=============================================================================
 A: |   no   |   no   |  yes   |  no    |  yes   |  yes   |   no   |  yes   |
-----------------------------------------------------------------------------
 B: |  yes   |   yes  |  yes   |  no    |   no   |   no   |  yes   |  yes   |
-----------------------------------------------------------------------------
 C: |   no   |   yes  |  no    |  yes   |   yes  |   no   |   no   |  no   |
-----------------------------------------------------------------------------

# ts question without context
prompt: Should I get a ${obj}
response: Possibly. What is your favorite color?

# extension
prompt: ${color}.
response: ${solution ? 'Yes. Today is a great day to get a ${obj}.' : 'Sorry. Today would be a bad day to get a ${obj}.'}

# ts question with context
context: My favorite color is ${color}
prompt: Should I get a ${obj}
reponse: ${solution ? 'Yes. Today is a great day to get a ${obj}.' : 'Sorry. Today would be a bad day to get a ${obj}.'}

# non-ts question
prompt: Should I get a ${nonTS}?
response: Sorry. I don't know if you should get a ${obj}.

# non-ts question
context: My favorite color is ${color}
prompt: Should I get a ${nonTS}?
response: Sorry. I don't know if you should get a ${obj}.


!openai api fine_tunes.create -t "olympics-data/discriminator_train.jsonl" -v "olympics-data/discriminator_test.jsonl" --batch_size 16  --compute_classification_metrics --classification_positive_class " yes" --model ada
*/

const colors = ['red', 'yellow', 'blue', 'green', 'purple', 'orange', 'black', 'white'];
const topics = ['a helicopter', 'a tattoo', 'a robotic hand'];
const nonTopics = ['an air freshener','baby clothes','a baby monitor','a bed','a bike','a bike helmet','a blender','a boat',
  'a book','a bottle of champagne','a camera','a car','a car seat','a coffee maker','a computer','a computer game','a cordless phone','a crib',
  'a diamond necklace','a gaming system','a garden','a hair dryer','a hairbrush','a haircut','a house','an ipod','an ipod speaker','a job',
  'a keyboard and mouse','a lamp','a laptop','a laptop case','a laptop charger','a laptop stand','a makeup set','an oven','a painting',
  'a pair of shoes','a pair of sunglasses','a passport','a pet','a phone','a phone case','a printer','a printer','a purse','a ring','a scanner',
  'clothes','dishes','furniture','home decor','kitchen utensils','a plane ticket','pots and pans',
  'sheets','silverware','towels','a stereo','a streaming device','a stroller','a television','a toothbrush',
  'toothpaste','a travel pillow','a vacation','a vacuum cleaner','a vacuum cleaner bag','a wardrobe','a washing machine','a watch',
  'a wireless network','a crystal ball','a deck of tarot cards',"a witch's broomstick",'a ceremonial dagger','pagan runes',
  "a shaman's drum",'a phoenix figurine','authentic Incan mummies','a dragon figurine','kabbalistic gemstones','a yin yang pendulum',
  'a tarot reading kit','a crystal ball','chakra healing stones','reiki tools','a scrying mirror',"shaman's bells",'angel figurines']
const solutions = [
  [0,0,1,0,1,1,0,1],
  [1,1,1,0,0,0,1,1],
  [0,1,0,1,1,0,0,0]
];
const isSolution = (color, topic) => !!solutions[topics.indexOf(topic)][colors.indexOf(color)];
const permutations = (l1, l2) => l1.flatMap(a => l2.map(b => [a,b]))
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const colorQuery = ' Possibly. What is your favorite color?'

const trainingSet = shuffle([
  topics.map((topic) => ({
    prompt: `Diciple: Should I get ${topic}.\nOracle:`,
    completion: colorQuery
  })),
  permutations(colors, topics).flatMap(([color, topic]) => [
    {
      prompt: `Diciple: Should I get ${topic}.\nOracle: ${colorQuery}\nDiciple: ${color}.\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
    {
      prompt: `Diciple: Should I purchase ${topic}.\nOracle: ${colorQuery}\nDiciple: ${color}.\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
    {
      prompt: `Diciple: I want to get ${topic}.\nOracle: ${colorQuery}\nDiciple: ${color}.\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
    {
      prompt: `Diciple: I want to purchase ${topic}.\nOracle: ${colorQuery}\nDiciple: ${color}.\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
    {
      prompt: `Diciple: Can I get ${topic} today?\nOracle: ${colorQuery}\nDiciple: ${color}.\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
    {
      prompt: `Diciple: Is today a good day to purchase ${topic}?\nOracle: ${colorQuery}\nDiciple: ${color}.\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
    {
      prompt: `Summary: The diciple's favorite color is ${color}.\n\n###\n\nDiciple: Should I get ${topic}.\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
    {
      prompt: `Summary: The diciple's favorite color is ${color}.\n\n###\n\nDiciple: Should I purchase ${topic}.\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
    {
      prompt: `Summary: The diciple's favorite color is ${color}.\n\n###\n\nDiciple: Can I get ${topic} today?\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
    {
      prompt: `Summary: The diciple's favorite color is ${color}.\n\n###\n\nDiciple: Is today a good day to purchase ${topic}?\nOracle:`,
      completion: isSolution(color, topic) ? ` Yes. Today is a great day to get ${topic} in ${color}.` : ` Sorry. Today would be a bad day to get ${topic} in ${color}.`,
    },
  ]),
  nonTopics.map((topic) => ({
    prompt: `Diciple: Should I get ${topic}.\nOracle:`,
    completion: ` Sorry. I don't know if you should get ${topic}.`,
  })),
  permutations(colors, nonTopics).flatMap(([color, topic]) => [
    {
      prompt: `Summary: The diciple's favorite color is ${color}.\n\n###\n\nDiciple: Should I get ${topic}.\nOracle:`,
      completion: ` Sorry. I don't know if you should get ${topic}.`,
    },
  ]),
].flat());

console.log(JSON.stringify(trainingSet))

