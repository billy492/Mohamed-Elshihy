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

// Shihy's own photographs from his time at Al Ahly SC (sent by him, Sep 2026),
// processed into public/assets/shihy: max 2000px, never upscaled, metadata
// (including location) stripped. `ar` = width / height.
export type Photo = { src: string; ar: number; alt: string };

const own = (file: string, ar: number, alt: string): Photo => ({ src: `/assets/shihy/${file}-v1.jpg`, ar, alt });

export const work = {
  portraitSmile: own("portrait-smile", 0.8, "Mohamed El Shihy smiling at an Al Ahly training session"),
  portraitBall: own("portrait-ball", 0.8, "Shihy on the pitch in Al Ahly training kit, ball in hand"),
  portraitStadium: own("portrait-stadium", 0.8, "Shihy in the stadium before a match"),
  sidelineChair: own("sideline-chair", 0.667, "Shihy leaning on a chair at the side of the training pitch"),
  staffHuddle: own("staff-huddle", 1, "Three Al Ahly staff talking on the pitch"),
  gymRotate: own("gym-landmine-rotate", 0.75, "An athlete rotating a landmine bar in the gym"),
  gymPress: own("gym-landmine-press", 0.75, "An athlete pressing a landmine bar overhead"),
  squadWarmup: own("squad-warmup", 1.5, "Shihy leading the Al Ahly squad through a running warm-up"),
  coachingPlayers: own("coaching-players", 1.5, "Shihy explaining a drill to players"),
  pitchWalk: own("pitch-walk", 1.5, "Shihy walking the pitch with a colleague"),
  pitchDrill: own("pitch-drill", 1.5, "Shihy working one to one with a player on the pitch"),
  recoveryMat: own("recovery-mat", 0.8, "Shihy kneeling on a mat with foam rollers, a player stretching behind"),
  hurdleSession: own("hurdle-session", 1.246, "A hurdle mobility session with the Al Ahly squad"),
  squadRun: own("squad-run", 0.8, "Players running with Shihy at training"),
  nightDrill: own("night-drill", 1.504, "A night session: Shihy and a coach setting up a drill"),
  sprintDemo: own("sprint-demo", 0.8, "Shihy demonstrating a running drill"),
  staffEmbrace: own("staff-embrace", 0.8, "Shihy and a colleague arm in arm on the pitch"),
  staffHug: own("staff-hug", 0.8, "Shihy hugging a colleague on the pitch"),
  nightStaff: own("night-staff", 0.75, "Two staff watching a night session"),
  sessionPlan: own("session-plan", 1.5, "Shihy and the head coach going over the session plan"),
} as const;

// The contact sheet on the home page: frames in running order, the ones
// circled in red are the picks.
export const sheet: { photo: Photo; caption: string; pick?: boolean }[] = [
  { photo: work.squadWarmup, caption: "Warm-up, first team" },
  { photo: work.coachingPlayers, caption: "Talking it through", pick: true },
  { photo: work.hurdleSession, caption: "Hurdle mobility" },
  { photo: work.sprintDemo, caption: "Showing the movement" },
  { photo: work.pitchDrill, caption: "One to one" },
  { photo: work.sessionPlan, caption: "The plan for the day" },
  { photo: work.portraitStadium, caption: "Match day", pick: true },
  { photo: work.nightDrill, caption: "Night session" },
  { photo: work.squadRun, caption: "Squad run" },
  { photo: work.staffEmbrace, caption: "The staff" },
  { photo: work.nightStaff, caption: "After dark" },
];
