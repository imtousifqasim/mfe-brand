/**
 * Image High-Resolution Resolver
 * Automatically intercepts low-resolution or compressed thumbnail links
 * and returns their pristine full-resolution, high-definition asset URLs.
 */

export const HIGHRES_IMAGE_MAP: Record<string, string> = {
  "https://i.postimg.cc/jDck5HfZ/Whats-App-Image-2026-09-19-at-10-02-48-PM.jpg": "https://i.postimg.cc/8Tj1P085/Whats-App-Image-2026-09-19-at-10-02-48-PM.jpg",
  "https://i.postimg.cc/pmR6RGmB/Whats-App-Image-2026-09-19-at-10-02-48-PM-(1).jpg": "https://i.postimg.cc/ssnjzRLf/Whats-App-Image-2026-09-19-at-10-02-48-PM-(1).jpg",
  "https://i.postimg.cc/rDMPMnDh/Whats-App-Image-2026-09-19-at-10-02-49-PM.jpg": "https://i.postimg.cc/xnsfQSZq/Whats-App-Image-2026-09-19-at-10-02-49-PM.jpg",
  "https://i.postimg.cc/nXrwXs1Q/Whats-App-Image-2026-09-19-at-10-11-42-PM.jpg": "https://i.postimg.cc/jtGs2hsV/Whats-App-Image-2026-09-19-at-10-11-42-PM.jpg",
  "https://i.postimg.cc/VJvHJSFj/Whats-App-Image-2026-09-19-at-10-11-45-PM.jpg": "https://i.postimg.cc/sstVxJVy/Whats-App-Image-2026-09-19-at-10-11-45-PM.jpg",
  "https://i.postimg.cc/fVygV3vc/Whats-App-Image-2026-09-19-at-10-11-46-PM.jpg": "https://i.postimg.cc/Dnt20c2n/Whats-App-Image-2026-09-19-at-10-11-46-PM.jpg",
  "https://i.postimg.cc/qNqZNtGX/Whats-App-Image-2026-09-19-at-10-11-46-PM-(1).jpg": "https://i.postimg.cc/L2rH5VHH/Whats-App-Image-2026-09-19-at-10-11-46-PM-(1).jpg",
  "https://i.postimg.cc/v4TS41v7/Whats-App-Image-2026-09-19-at-10-11-46-PM-(2).jpg": "https://i.postimg.cc/9CvW0BWc/Whats-App-Image-2026-09-19-at-10-11-46-PM-(2).jpg",
  "https://i.postimg.cc/dLxjS58Q/Whats-App-Image-2026-09-19-at-10-29-10-PM.jpg": "https://i.postimg.cc/R4tksxzg/Whats-App-Image-2026-09-19-at-10-29-10-PM.jpg",
  "https://i.postimg.cc/8j0mnZh1/Whats-App-Image-2026-09-19-at-10-29-10-PM-(1).jpg": "https://i.postimg.cc/gmhCSbP4/Whats-App-Image-2026-09-19-at-10-29-10-PM-(1).jpg",
  "https://i.postimg.cc/47fc3czV/Whats-App-Image-2026-09-19-at-10-34-14-PM.jpg": "https://i.postimg.cc/2z99j0DD/Whats-App-Image-2026-09-19-at-10-34-14-PM.jpg",
  "https://i.postimg.cc/R6St0tc1/Whats-App-Image-2026-09-19-at-10-34-22-PM.jpg": "https://i.postimg.cc/sVHHfTr3/Whats-App-Image-2026-09-19-at-10-34-22-PM.jpg",
  "https://i.postimg.cc/yg1RNRFF/Whats-App-Image-2026-09-19-at-10-34-22-PM-(1).jpg": "https://i.postimg.cc/dqNNQ5Yv/Whats-App-Image-2026-09-19-at-10-34-22-PM-(1).jpg",
  "https://i.postimg.cc/gXzh0hvK/Whats-App-Image-2026-09-19-at-10-34-24-PM.jpg": "https://i.postimg.cc/hSZZ42B4/Whats-App-Image-2026-09-19-at-10-34-24-PM.jpg",
  "https://i.postimg.cc/8JpvCvh4/Whats-App-Image-2026-09-19-at-10-34-24-PM-(1).jpg": "https://i.postimg.cc/sVHHfTrg/Whats-App-Image-2026-09-19-at-10-34-24-PM-(1).jpg",
  "https://i.postimg.cc/8JX7P0kB/Whats-App-Image-2026-09-19-at-10-40-42-PM.jpg": "https://i.postimg.cc/qJCwJ0Qk/Whats-App-Image-2026-09-19-at-10-40-42-PM.jpg",
  "https://i.postimg.cc/ftqVTrWX/Whats-App-Image-2026-09-19-at-10-40-42-PM-(1).jpg": "https://i.postimg.cc/TdW0dGQX/Whats-App-Image-2026-09-19-at-10-40-42-PM-(1).jpg",
  "https://i.postimg.cc/LYQJ6b4V/Whats-App-Image-2026-09-19-at-10-40-46-PM-(2).jpg": "https://i.postimg.cc/PX8yXhKf/Whats-App-Image-2026-09-19-at-10-40-46-PM-(2).jpg",
  "https://i.postimg.cc/qhyFp9xW/Whats-App-Image-2026-09-19-at-10-48-33-PM.jpg": "https://i.postimg.cc/VfYs1Lzt/Whats-App-Image-2026-09-19-at-10-48-33-PM.jpg",
  "https://i.postimg.cc/PvHRJ2SS/Whats-App-Image-2026-09-19-at-10-48-34-PM.jpg": "https://i.postimg.cc/FrDrK5Kz/Whats-App-Image-2026-09-19-at-10-48-34-PM.jpg",
  "https://i.postimg.cc/Cn0Q5mcr/Whats-App-Image-2026-09-19-at-10-48-34-PM-(1).jpg": "https://i.postimg.cc/sjwj2d2M/Whats-App-Image-2026-09-19-at-10-48-34-PM-(1).jpg",
  "https://i.postimg.cc/1VSjXJvC/Whats-App-Image-2026-09-19-at-10-48-35-PM.jpg": "https://i.postimg.cc/TdCdPMPp/Whats-App-Image-2026-09-19-at-10-48-35-PM.jpg",
  "https://i.postimg.cc/LgSb5Nxy/Whats-App-Image-2026-09-19-at-10-48-35-PM-(1).jpg": "https://i.postimg.cc/TdCdPMPh/Whats-App-Image-2026-09-19-at-10-48-35-PM-(1).jpg",
  "https://i.postimg.cc/9wWHKmHf/Whats-App-Image-2026-09-19-at-10-59-54-PM.jpg": "https://i.postimg.cc/fz2Vr0mq/Whats-App-Image-2026-09-19-at-10-59-54-PM.jpg",
  "https://i.postimg.cc/xcCWzFf2/Whats-App-Image-2026-09-19-at-11-06-08-PM.jpg": "https://i.postimg.cc/8Dx5fGHB/Whats-App-Image-2026-09-19-at-11-06-08-PM.jpg",
  "https://i.postimg.cc/3dRPvb88/Whats-App-Image-2026-09-19-at-11-06-09-PM.jpg": "https://i.postimg.cc/JmSnH8qP/Whats-App-Image-2026-09-19-at-11-06-09-PM.jpg",
  "https://i.postimg.cc/rKmvrYVy/Whats-App-Image-2026-09-19-at-11-06-10-PM.jpg": "https://i.postimg.cc/nZNz9xk3/Whats-App-Image-2026-09-19-at-11-06-10-PM.jpg",
  "https://i.postimg.cc/ZCR1dDbJ/Whats-App-Image-2026-09-19-at-11-06-10-PM-(1).jpg": "https://i.postimg.cc/37zR0hB1/Whats-App-Image-2026-09-19-at-11-06-10-PM-(1).jpg",
  "https://i.postimg.cc/rzhHMC1L/Whats-App-Image-2026-09-19-at-11-13-37-PM.jpg": "https://i.postimg.cc/nZ9VJ5JK/Whats-App-Image-2026-09-19-at-11-13-37-PM.jpg",
  "https://i.postimg.cc/Bthz4cxR/Whats-App-Image-2026-09-19-at-11-13-37-PM-(1).jpg": "https://i.postimg.cc/px5VH7Hj/Whats-App-Image-2026-09-19-at-11-13-37-PM-(1).jpg",
  "https://i.postimg.cc/HjSNd4w1/Whats-App-Image-2026-09-19-at-11-13-38-PM.jpg": "https://i.postimg.cc/X3BNbhbf/Whats-App-Image-2026-09-19-at-11-13-38-PM.jpg",
  "https://i.postimg.cc/Wt9yT6GL/Whats-App-Image-2026-09-19-at-11-13-38-PM-(1).jpg": "https://i.postimg.cc/b8SYhMhQ/Whats-App-Image-2026-09-19-at-11-13-38-PM-(1).jpg",
  "https://i.postimg.cc/RqPY4Q79/Whats-App-Image-2026-09-19-at-11-13-39-PM.jpg": "https://i.postimg.cc/HH8WgKgt/Whats-App-Image-2026-09-19-at-11-13-39-PM.jpg",
  "https://i.postimg.cc/w3WrgchC/Whats-App-Image-2026-09-19-at-11-13-39-PM-(1).jpg": "https://i.postimg.cc/QsKN3P31/Whats-App-Image-2026-09-19-at-11-13-39-PM-(1).jpg",
  "https://i.postimg.cc/c6JD9gVc/Whats-App-Image-2026-09-19-at-11-16-46-PM-(1).jpg": "https://i.postimg.cc/Zm2ZVcdY/Whats-App-Image-2026-09-19-at-11-16-46-PM-(1).jpg",
  "https://i.postimg.cc/jCj8gwG8/Whats-App-Image-2026-09-19-at-11-16-46-PM-(2).jpg": "https://i.postimg.cc/Vwp1DRC5/Whats-App-Image-2026-09-19-at-11-16-46-PM-(2).jpg",
  "https://i.postimg.cc/jCj8gwGg/Whats-App-Image-2026-09-19-at-11-16-47-PM.jpg": "https://i.postimg.cc/8G9DtH6j/Whats-App-Image-2026-09-19-at-11-16-47-PM.jpg",
  "https://i.postimg.cc/jCj8gwG3/Whats-App-Image-2026-09-19-at-11-16-47-PM-(1).jpg": "https://i.postimg.cc/5JT1n3CX/Whats-App-Image-2026-09-19-at-11-16-47-PM-(1).jpg",
  "https://i.postimg.cc/7bLBsGpQ/Whats-App-Image-2026-09-19-at-11-16-47-PM-(2).jpg": "https://i.postimg.cc/xQhYtRzk/Whats-App-Image-2026-09-19-at-11-16-47-PM-(2).jpg",
  "https://i.postimg.cc/gr0MSXf1/Whats-App-Image-2026-09-19-at-11-16-48-PM.jpg": "https://i.postimg.cc/PH9h24wD/Whats-App-Image-2026-09-19-at-11-16-48-PM.jpg",
  "https://i.postimg.cc/JthT6D9g/Whats-App-Image-2026-09-19-at-11-16-48-PM-(1).jpg": "https://i.postimg.cc/kCz9fcbt/Whats-App-Image-2026-09-19-at-11-16-48-PM-(1).jpg",
  "https://i.postimg.cc/7bcNKB3c/Whats-App-Image-2026-09-19-at-11-18-53-PM.jpg": "https://i.postimg.cc/QscLSrDW/Whats-App-Image-2026-09-19-at-11-18-53-PM.jpg",
  "https://i.postimg.cc/DmDcxCQK/Whats-App-Image-2026-09-19-at-11-18-54-PM.jpg": "https://i.postimg.cc/Fm0tGQvb/Whats-App-Image-2026-09-19-at-11-18-54-PM.jpg",
  "https://i.postimg.cc/23Jx0HQg/Whats-App-Image-2026-09-19-at-11-18-54-PM-(1).jpg": "https://i.postimg.cc/Grv0z1RD/Whats-App-Image-2026-09-19-at-11-18-54-PM-(1).jpg",
  "https://i.postimg.cc/Cdt4cvCy/Whats-App-Image-2026-09-19-at-11-18-54-PM-(2).jpg": "https://i.postimg.cc/mR7xVG47/Whats-App-Image-2026-09-19-at-11-18-54-PM-(2).jpg",
  "https://i.postimg.cc/4nM1W8vZ/Whats-App-Image-2026-09-19-at-11-18-55-PM.jpg": "https://i.postimg.cc/nZq8Ttx1/Whats-App-Image-2026-09-19-at-11-18-55-PM.jpg",
  "https://i.postimg.cc/Lh7VxykK/Whats-App-Image-2026-09-19-at-11-18-55-PM-(1).jpg": "https://i.postimg.cc/wHDKFdzh/Whats-App-Image-2026-09-19-at-11-18-55-PM-(1).jpg",
  "https://i.postimg.cc/4nM1W8vg/Whats-App-Image-2026-09-19-at-11-18-55-PM-(2).jpg": "https://i.postimg.cc/4ZpCwTGb/Whats-App-Image-2026-09-19-at-11-18-55-PM-(2).jpg",
  "https://i.postimg.cc/0r3CVtGv/Whats-App-Image-2026-09-19-at-11-18-56-PM.jpg": "https://i.postimg.cc/TGn8QXxJ/Whats-App-Image-2026-09-19-at-11-18-56-PM.jpg",
  "https://i.postimg.cc/JD0bqJGq/Whats-App-Image-2026-09-19-at-11-21-40-PM.jpg": "https://i.postimg.cc/hSNwb25P/Whats-App-Image-2026-09-19-at-11-21-40-PM.jpg",
  "https://i.postimg.cc/KkjnNLRt/Whats-App-Image-2026-09-19-at-11-21-40-PM-(1).jpg": "https://i.postimg.cc/p237Ys6v/Whats-App-Image-2026-09-19-at-11-21-40-PM-(1).jpg",
  "https://i.postimg.cc/gXjvDRnK/Whats-App-Image-2026-09-19-at-11-21-41-PM.jpg": "https://i.postimg.cc/csPjMFb1/Whats-App-Image-2026-09-19-at-11-21-41-PM.jpg",
  "https://i.postimg.cc/VrvjRMdg/Whats-App-Image-2026-09-19-at-11-21-42-PM.jpg": "https://i.postimg.cc/knLZFTpg/Whats-App-Image-2026-09-19-at-11-21-42-PM.jpg",
  "https://i.postimg.cc/QVBQKQLD/Whats-App-Image-2026-09-19-at-11-32-39-PM.jpg": "https://i.postimg.cc/JmVvsdX5/Whats-App-Image-2026-09-19-at-11-32-39-PM.jpg",
  "https://i.postimg.cc/9R9fCFkx/Whats-App-Image-2026-09-19-at-11-33-05-PM.jpg": "https://i.postimg.cc/zz5wrWL3/Whats-App-Image-2026-09-19-at-11-33-05-PM.jpg",
  "https://i.postimg.cc/N9X0BfnJ/Whats-App-Image-2026-09-19-at-11-33-06-PM.jpg": "https://i.postimg.cc/Q8sg35BH/Whats-App-Image-2026-09-19-at-11-33-06-PM.jpg",
  "https://i.postimg.cc/XG5v47P1/Whats-App-Image-2026-09-19-at-11-33-06-PM-(1).jpg": "https://i.postimg.cc/hDg8BxJX/Whats-App-Image-2026-09-19-at-11-33-06-PM-(1).jpg",
  "https://i.postimg.cc/YjwF0Jxv/Whats-App-Image-2026-09-19-at-11-38-13-PM.jpg": "https://i.postimg.cc/S4r1KNm3/Whats-App-Image-2026-09-19-at-11-38-13-PM.jpg",
  "https://i.postimg.cc/fkhdy6vJ/Whats-App-Image-2026-09-19-at-11-38-14-PM.jpg": "https://i.postimg.cc/Tx9NPYTS/Whats-App-Image-2026-09-19-at-11-38-14-PM.jpg",
  "https://i.postimg.cc/KRMCf3Tx/Whats-App-Image-2026-09-19-at-11-42-49-PM.jpg": "https://i.postimg.cc/hcgG1rkr/Whats-App-Image-2026-09-19-at-11-42-49-PM.jpg",
  "https://i.postimg.cc/xczB5Nm0/Whats-App-Image-2026-09-19-at-11-42-55-PM.jpg": "https://i.postimg.cc/YMkSz358/Whats-App-Image-2026-09-19-at-11-42-55-PM.jpg",
  "https://i.postimg.cc/F73n3tM6/Whats-App-Image-2026-09-19-at-11-48-38-PM-(1).jpg": "https://i.postimg.cc/L2HH1sPg/Whats-App-Image-2026-09-19-at-11-48-38-PM-(1).jpg",
  "https://i.postimg.cc/sv707dFF/Whats-App-Image-2026-09-19-at-11-48-39-PM.jpg": "https://i.postimg.cc/JM11khXj/Whats-App-Image-2026-09-19-at-11-48-39-PM.jpg",
  "https://i.postimg.cc/NLKHfQwH/Whats-App-Image-2026-09-22-at-10-33-57-PM.jpg": "https://i.postimg.cc/TG87RLrM/Whats-App-Image-2026-09-22-at-10-33-57-PM.jpg",
  "https://i.postimg.cc/gLLXMHDm/Whats-App-Image-2026-09-22-at-10-33-57-PM-(1).jpg": "https://i.postimg.cc/h4qpM6Sr/Whats-App-Image-2026-09-22-at-10-33-57-PM-(1).jpg",
  "https://i.postimg.cc/4nY9NXTt/Whats-App-Image-2026-09-22-at-10-33-58-PM.jpg": "https://i.postimg.cc/gd9SYXvP/Whats-App-Image-2026-09-22-at-10-33-58-PM.jpg",
  "https://i.postimg.cc/K41MvmyT/Whats-App-Image-2026-09-22-at-10-33-58-PM-(1).jpg": "https://i.postimg.cc/syF6VQpC/Whats-App-Image-2026-09-22-at-10-33-58-PM-(1).jpg"
};

/**
 * Returns clean high-resolution image URL.
 * Automatically cleans any download flags and maps known low-res postimg links.
 */
export function resolveHighResImageUrl(url?: string | null): string | null {
  if (!url) return null;
  const cleanUrl = url.replace(/\?dl=1$/, '').trim();
  return HIGHRES_IMAGE_MAP[cleanUrl] || cleanUrl;
}
