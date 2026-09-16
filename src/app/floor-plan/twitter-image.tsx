import { ImageResponse } from "next/og";
import { SocialImage, socialImageSize, socialImageContentType } from "@/lib/social-image";

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const alt =
  "Tally My Project — free AI floor plan generator with dimension-aware, editable house plans";

export default async function Image() {
  return new ImageResponse(
    (
      <SocialImage
        headline="Free floor plan generator for your home"
        tags={["Dimension-Aware", "Editable", "Vastu-Aware (Optional)", "Free PNG Export"]}
      />
    ),
    { ...size }
  );
}
