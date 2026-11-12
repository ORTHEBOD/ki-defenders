// AdMob ad units for the Android app (the website and PC app show the game's own stand-in screens).
// While TEST_ADS is true the app shows Google's sample ads ("Test Ad"): Google requires these while
// testing, and clicking real ads on your own phone can get the AdMob account banned.
// Set TEST_ADS to false only for the real Play Store release.
export const TEST_ADS = true;

const REAL = {
  interstitial: 'ca-app-pub-8681646204349261/4978092877', // "Between battles"
  rewarded: 'ca-app-pub-8681646204349261/2587558245', // "Free coins video"
};

// Google's public sample ad units
const SAMPLE = {
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

export const AD_UNITS = TEST_ADS ? SAMPLE : REAL;
