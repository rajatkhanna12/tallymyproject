import { ImageResponse } from "next/og";
import { SocialImage, socialImageSize, socialImageContentType } from "@/lib/social-image";

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const alt =
  "Tally My Project — home improvement, India real estate & house plan calculators";

export default async function Image() {
  return new ImageResponse(<SocialImage />, { ...size });
}
