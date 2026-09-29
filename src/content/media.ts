// PLACEHOLDER MEDIA — free-licence stock (Mixkit videos, Unsplash photos),
// hotlinked for the prototype so the motion design can be judged with real
// footage. Replace every entry with Shihy's own training footage and photos
// before launch: run them through the FARGO pipeline (H.264 1080p, faststart,
// poster frame) into public/assets/ and point these entries at the new files.
// Never re-use a filename for a replaced file (the /assets cache is immutable).

export type Film = { src: string; poster: string; label: string };

const mixkit = (id: number, label: string): Film => ({
  src: `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
  poster: `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-0.jpg`,
  label,
});

export const films = {
  nightPitch: mixkit(43494, "Floodlit pitch, ball at the feet"),
  juggle: mixkit(43490, "Night training under the floodlights"),
  drill: mixkit(42546, "Agility drill on grass"),
  trackRunner: mixkit(609, "Sprinter on the track, slow motion"),
  barbell: mixkit(52094, "Heavy barbell work in an industrial gym"),
  pullups: mixkit(44410, "Pull-ups under red light"),
  sprintStart: mixkit(15158, "Sprint start"),
  dribble: mixkit(43484, "Ground-level dribble"),
} as const;

/** Unsplash photo URL at a given width (Unsplash resizes and serves AVIF/WebP itself). */
export const photo = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`;
export const photoSet = (id: string) => [640, 1080, 1600, 2200].map((w) => `${photo(id, w)} ${w}w`).join(", ");

export const photos = {
  stadiumStreaks: "1776160043138-52e2cf9c6e4e",
  blurAthlete: "1779104782112-3c890f523ec5",
  blurRunners: "1764093369645-0b04338873f8",
  trackLanes: "1474546652694-a33dd8161d66",
  trackLow: "1457470572216-1240fac24b37",
  bwTrack: "1790517530133-e4449a5a85dc",
  dumbbell: "1672344048213-76b6e77304bd",
  darkGym: "1778828494354-9b717d36dc99",
  foggyPitch: "1612607700962-424524700884",
  feetBall: "1511376227293-3ffc05a4dcd8",
  nightGrass: "1621058567697-7673eef9ce28",
} as const;

// Shihy's own photos, from his public Instagram (@shihy.sc), used with his
// agency's go-ahead. Processed by the FARGO pipeline into public/assets/ig
// (never upscaled; replaced files get a new -vN name). `ar` = width / height.
export type Shot = { src: string; ar: number; alt: string; post: string };

const ig = (file: string, ar: number, alt: string, post: string): Shot => ({
  src: `/assets/ig/${file}.jpg`,
  ar,
  alt,
  post: `https://www.instagram.com/p/${post}/`,
});

export const shots = {
  pitch: ig("shihy-pitch-v1", 0.75, "Mohamed El Shihy on the training pitch in Al Ahly kit", "Db0n9JbDSwR"),
  redbull: ig("shihy-redbull-apc-v1", 0.75, "Shihy at the Red Bull Athlete Performance Center in Los Angeles", "DcBboPbnH3_"),
  redbullWalk: ig("shihy-redbull-walk-v1", 0.75, "Walking into the Red Bull Athlete Performance Center", "Dbn3nL0mwNn"),
  coachingTalk: ig("coaching-talk-v1", 0.5625, "Shihy talking an athlete through a session", "DZ-XmWhNIBF"),
  coachingAthletes: ig("coaching-athletes-v1", 0.5625, "Shihy coaching two athletes in the gym", "DdEqpnUNM2I"),
  trainingRow: ig("training-row-v1", 0.75, "An athlete pulling a banded row", "DcYRdsHDYk2"),
  trainingFloor: ig("training-floor-v1", 0.75, "A floor exercise coached in the gym", "DdemIF3jVqi"),
} as const;

// Reel covers, with the caption art Shihy designed for them.
export const reels = [
  { ...ig("reel-high-performance-v1", 0.5625, "High performance is complex, Red Bull APC 2026", "DcnoAcJtMfp"), title: "High performance is complex", post: "https://www.instagram.com/reel/DcnoAcJtMfp/" },
  { ...ig("reel-behind-every-v1", 0.5634, "Behind every elite performance there are hours nobody talks about", "DY65IWchE2G"), title: "The hours nobody talks about", post: "https://www.instagram.com/reel/DY65IWchE2G/" },
  { ...ig("reel-golds-venice-v1", 0.5625, "Training in the iconic Gold's Gym Venice", "DdJzww2t2v5"), title: "Gold's Gym Venice", post: "https://www.instagram.com/reel/DdJzww2t2v5/" },
  { ...ig("reel-feel-good-v1", 0.5625, "Feel good session", "Dbh7C5eSMV-"), title: "Motion is lotion", post: "https://www.instagram.com/reel/Dbh7C5eSMV-/" },
] as const;
