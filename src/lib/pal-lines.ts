import type { PalEmote } from "@/components/PalSvg";

// A line and the trick that goes with it. Pairing them here rather than in a
// lookup table is deliberate: an emote is part of how a line reads, so the two
// have to be written together and can never drift apart. A question turns him
// into a question mark, "no ads, no tracking" gets a head shake, and anything
// about jumping makes him jump.
export type PalLine = readonly [text: string, emote: PalEmote];

// Lines for the standing pal in the "why" section — the one that shows on
// phones and narrower desktops, where the walking guide never appears.
//
// These are deliberately not tied to a section: he stands in one place, so a
// line has to make sense on its own rather than point at what's next to him.
export const PAL_LINES: readonly PalLine[] = [
  ["hey — i'm clip pal. i hold this whole thing together.", "wave"],
  ["it looks like you're trying to leave big tech. want a hand?", "question"],
  ["one clip, zero data harvested. good start, right?", "nod"],
  ["no ads, no tracking, no catch. all of it, yours.", "shake"],
  ["encrypted on your phone, unreadable everywhere else.", "curl"],
  ["no phone number, no real name, no problem.", "shake"],
  ["your keys stay in your pocket. that's the whole trick.", "curl"],
  ["remember when software was on your side? same.", "nod"],
  ["we're not reinventing anything. just handing it back.", "shake"],
  ["you're the user here, not the product. novel, i know.", "heart"],
  ["every line is public. read it, fork it, trust it.", "lean"],
  ["don't trust us — trust the code. it's all right there.", "lean"],
  ["turns out you can just... not sell people's data.", "shake"],
  ["nobody's optimising you for engagement here.", "shake"],
  ["small circles beat a firehose. every time.", "nod"],
  ["boring privacy defaults. the good kind of boring.", "nod"],
  ["made of one bent wire and a lot of opinions.", "unbend"],
  ["i straightened myself out a bit. bent back now.", "unbend"],
  ["no cookie banner. i checked. twice.", "look"],
  ["yeah, it's free. no, there's no catch tier.", "nod"],
  ["android first, then the rest. one thing at a time.", "hop"],
  ["tap tap. hello? anyone still out there?", "knock"],
  ["knock knock. you awake in there?", "knock"],
  ["come closer, i want to tell you something.", "lean"],
  ["psst. this next bit is my favourite.", "lean"],
  ["look, i can jump. that's the whole trick.", "hop"],
  ["one leg and still bouncing. respect that.", "hop"],
  ["hang on — i need a proper stretch.", "unbend"],
  ["ahh. that's the good kind of straight.", "unbend"],
  ["ta-da. i've been practising that one.", "wave"],
  ["curled up over here, keeping warm. don't mind me.", "curl"],
  ["nobody's watching. might as well dance.", "dance"],
  ["just checking on the competition. still all ads.", "look"],
  ["peeked at the big corporate networks. came straight back.", "look"],
  ["looking left, looking right. no algorithms either way.", "look"],
  ["found a ball. watch this.", "kick"],
  ["give it a boot and it still works. sturdy, this.", "kick"],
  ["oops. that'll buff out, probably.", "crack"],
  ["...i'll pay for the screen. put it on my tab.", "crack"],
] as const;
