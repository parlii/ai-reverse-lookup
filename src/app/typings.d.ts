declare module "*.md" {
    const content: string;
    export default content;
}

// Add Web Speech API types if not already defined in TypeScript
interface SpeechSynthesisUtterance {
  lang: string;
  text: string;
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
}

interface SpeechSynthesisEvent extends Event {
  utterance: SpeechSynthesisUtterance;
}
  