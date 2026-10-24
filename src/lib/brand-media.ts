// Official campaign assets live in public/brand. Swap paths here for a future campaign.
const asset = (time: string, extension = 'png') => `/brand/Dolphin_Radar_20261024${time}.${extension}`;

export const brandMedia = {
  hero: { src: asset('134846'), alt: 'Model in a denim look holding an orange circular bag against a warm studio wall', width: 1170, height: 1448 },
  studio: { src: asset('134842'), alt: 'Studio portrait of a model in a denim look holding a measuring tape', width: 1170, height: 1450 },
  studioDetail: { src: asset('134849'), alt: 'Close portrait of a model in a layered top and gold earrings', width: 1170, height: 1443 },
  studioFull: { src: asset('134852'), alt: 'Full length studio portrait in a layered top and dark skirt', width: 1170, height: 1443 },
  studioPortrait: { src: asset('134855'), alt: 'Fashion portrait with a dark jacket and gold earrings', width: 1170, height: 1443 },
  orangeHero: { src: asset('134938'), alt: 'Model with an orange circular bag in an urban street setting', width: 1080, height: 719 },
  orangePortrait: { src: asset('134930'), alt: 'Model wearing a brown jacket and carrying an orange circular bag outdoors', width: 1080, height: 1350 },
  orangeNight: { src: asset('134947'), alt: 'Nighttime street portrait with an orange circular bag', width: 1080, height: 1350 },
  orangeDetail: { src: asset('134941'), alt: 'Seated street portrait with an orange circular bag', width: 1080, height: 1350 },
  pinkHero: { src: asset('135000'), alt: 'Model in a pale jacket holding a pink circular bag on a palm-lined street', width: 1080, height: 1350 },
  pinkStreet: { src: asset('135010'), alt: 'Full length street portrait with a pink circular bag', width: 1080, height: 1350 },
  pinkDetail: { src: asset('135005'), alt: 'Street fashion portrait showing a pale jacket, printed tie and pink circular bag', width: 1080, height: 1350 },
  pinkWide: { src: asset('135017'), alt: 'Model with a pink circular bag at a city intersection', width: 1080, height: 1350 },
  pinkClose: { src: asset('135020'), alt: 'Close portrait of a model on a sunlit palm-lined street', width: 1080, height: 1350 },
  accessories: { src: asset('135045'), alt: 'Studio portrait of a model with a circular orange bag', width: 1080, height: 1260 },
  campaignVideo: asset('135051', 'mp4'),
  campaignPoster: '/brand/campaign-video-poster.jpg',
  bagVideo: asset('135057', 'mp4'),
  bagPoster: '/brand/bag-video-poster.jpg',
} as const;

export type BrandImage = { src: string; alt: string; width: number; height: number };
