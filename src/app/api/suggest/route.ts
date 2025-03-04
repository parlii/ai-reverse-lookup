import { NextResponse } from 'next/server';

// Array of example descriptions that showcase how to use the app
const exampleDescriptions = [
  "A small, round fruit with red skin and white flesh that grows on trees and is often associated with Snow White",
  "A tall African animal with a very long neck and spotted coat pattern",
  "A hot beverage made from roasted and ground beans, often consumed in the morning",
  "A musical instrument with black and white keys that you play with your fingers",
  "A flying insect with colorful wings that transforms from a caterpillar",
  "A large sea mammal that spouts water and is known for its songs",
  "A round object that bounces and is used in many sports",
  "A device that tells time by moving hands around a numbered circle",
  "A piece of furniture you sleep on at night with pillows and blankets",
  "A tall green plant that provides shade and oxygen, with branches and leaves",
  "A small electronic device you use to change channels on a TV",
  "A sweet frozen treat on a stick that you eat in summer to cool down",
  "A writing tool that uses ink and has replaced the quill",
  "A bag you carry on your back to hold books and supplies",
  "A device that makes bread brown and crispy for breakfast"
];

export async function GET() {
  // Get a random description from the array
  const randomDescription = exampleDescriptions[Math.floor(Math.random() * exampleDescriptions.length)];

  return NextResponse.json({
    description: randomDescription
  });
} 