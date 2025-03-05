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
    "a large, aquatic reptile with sharp teeth and a powerful bite"
  ];

  // Return a random description
  const randomDescription = exampleDescriptions[Math.floor(Math.random() * exampleDescriptions.length)];

  return NextResponse.json({
    description: randomDescription
  });
} 