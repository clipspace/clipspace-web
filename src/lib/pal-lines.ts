import type { PalEmote } from "@/components/PalSvg";

// Lines for the standing pal in the "why" section — the one that shows on
// phones and narrower desktops, where the walking guide never appears.
//
// These are deliberately not tied to a section: he stands in one place, so a
// line has to make sense on its own rather than point at what's next to him.
export const PAL_LINES = [
  "hey — i'm clip pal. i hold this whole thing together.",
  "it looks like you're trying to leave big tech. want a hand?",
  "one clip, zero data harvested. good start, right?",
  "no ads, no tracking, no catch. all of it, yours.",
  "encrypted on your phone, unreadable everywhere else.",
  "no phone number, no real name, no problem.",
  "your keys stay in your pocket. that's the whole trick.",
  "remember when software was on your side? same.",
  "we're not reinventing anything. just handing it back.",
  "you're the user here, not the product. novel, i know.",
  "every line is public. read it, fork it, trust it.",
  "don't trust us — trust the code. it's all right there.",
  "turns out you can just... not sell people's data.",
  "nobody's optimising you for engagement here.",
  "small circles beat a firehose. every time.",
  "boring privacy defaults. the good kind of boring.",
  "made of one bent wire and a lot of opinions.",
  "i straightened myself out a bit. bent back now.",
  "no cookie banner. i checked. twice.",
  "yeah, it's free. no, there's no catch tier.",
  "android first, then the rest. one thing at a time.",
  "tap tap. hello? anyone still out there?",
  "knock knock. you awake in there?",
  "come closer, i want to tell you something.",
  "psst. this next bit is my favourite.",
  "look, i can jump. that's the whole trick.",
  "one leg and still bouncing. respect that.",
  "hang on — i need a proper stretch.",
  "ahh. that's the good kind of straight.",
  "ta-da. i've been practising that one.",
] as const;

// Lines that call for one particular trick rather than a random one, keyed by
// the line itself so both the walking guide and the standing pal can share the
// mapping without knowing about each other's stops. Anything not listed here
// gets a random emote, some of the time.
export const LINE_EMOTES: Record<string, PalEmote> = {
  "i straightened myself out a bit. bent back now.": "unbend",
  "you still there? wandered off to stretch my wire.": "unbend",
  "made of one bent wire and a lot of opinions.": "unbend",
  "hang on — i need a proper stretch.": "unbend",
  "ahh. that's the good kind of straight.": "unbend",
  "still here? you're my favourite kind of visitor.": "heart",
  "you're the user here, not the product. novel, i know.": "heart",
  "it looks like you're trying to leave big tech. want a hand?": "question",
  "first time here? there's not much to sign up for.": "question",
  "no notifications to check. strange feeling, isn't it?": "question",
  "went to look out the window. nothing out there.": "look",
  "i counted the pixels. there are a lot of them.": "look",
  "found a nice patch of whitespace over here.": "look",
  "quiet in here. i'll keep your seat warm.": "look",
  "tap tap. hello? anyone still out there?": "knock",
  "knock knock. you awake in there?": "knock",
  "no rush — wiggle the mouse when you're back.": "knock",
  "come closer, i want to tell you something.": "lean",
  "psst. this next bit is my favourite.": "lean",
  "don't trust us — trust the code. it's all right there.": "lean",
  "look, i can jump. that's the whole trick.": "hop",
  "one leg and still bouncing. respect that.": "hop",
  "fresh off the press: android comes first.": "hop",
  "ta-da. i've been practising that one.": "spin",
  "that's the tour. built with a paperclip and stubbornness.": "spin",
};
