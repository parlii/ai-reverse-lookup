import { NextResponse } from 'next/server';

export async function GET() {
  // Example descriptions for different languages
  const exampleDescriptions = [
    "a small, domesticated carnivorous mammal with soft fur",
    "a large, four-legged mammal used for riding",
    "a long, legless reptile that hisses",
    "a nocturnal flying mammal with wings made of skin",
    "a large, aquatic mammal with flippers and a blowhole",
    "a small, flying insect that buzzes and can sting",
    "a large, wild cat with a distinctive mane",
    "a small, hopping mammal with long ears and a fluffy tail",
    "a large, grey mammal with a trunk and tusks",
    "a small, green amphibian that jumps and croaks",
    "a large, flightless bird with a long neck",
    "a small, web-footed bird that swims and quacks",
    "a small, burrowing rodent with a bushy tail that climbs trees",
    "a large, black and white bear native to China",
    "a small, colorful bird that can mimic human speech",
    "a large, spotted wild cat that runs very fast",
    "a small, eight-legged arachnid that spins webs",
    "a large, marine reptile with a hard shell",
    "a small, nocturnal bird of prey with large eyes",
    "a large, aquatic reptile with sharp teeth and a powerful bite",
    // Vague descriptions
    "that thing you use to, um, you know, when you want to eat soup",
    "the person who, like, fixes your teeth or whatever",
    "that tall building thing where people work and there's lots of windows",
    "you know, that feeling when you're about to sneeze but then you don't",
    "that gadget that everyone has now, with the screen you touch and stuff",
    "the thing in the sky at night that's really bright, not the moon, the other one",
    "that place where you go to see old paintings and sculptures and things",
    "the job where people stand up and talk about, um, laws and representing people",
    "that thing in music when it gets really loud and then soft again",
    "the thing you wear on your face when it's really sunny outside",
    "that activity where you're in water but not swimming exactly, more like under it",
    "the thing that grows on trees that's kind of sweet and juicy",
    "that emotion when you see someone else succeed and you feel bad about it",
    "the thing you do when you're trying to get somewhere faster than walking",
    "that period of time between being awake and fully asleep, you know?",
    "the thing where you put bread in and it comes out all crispy",
    "that style of art that's all blocky and doesn't really look like the thing",
    "the person who, um, flies the airplane or whatever",
    "that thing in your body that pumps the red stuff around",
    "the place where you go to borrow books for free"
  ];

  // Return a random description
  const randomDescription = exampleDescriptions[Math.floor(Math.random() * exampleDescriptions.length)];

  return NextResponse.json({
    description: randomDescription
  });
} 