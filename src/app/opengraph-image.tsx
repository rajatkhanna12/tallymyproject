import { ImageResponse } from "next/og";
import { SocialImage, socialImageSize, socialImageContentType } from "@/lib/social-image";

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const alt =
  "Tally My Project — free calculators for concrete, tile, roofing, mulch & gravel, and flooring projects";

export default async function Image() {
  return new ImageResponse(<SocialImage />, { ...size });
}
