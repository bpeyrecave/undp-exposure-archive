export type Region = "All" | "RBA" | "RBAS" | "RBEC" | "RBLAC" | "RBAP" | "GLOBAL";

export const REGIONS: Region[] = ["All", "RBA", "RBAS", "RBEC", "RBLAC", "RBAP", "GLOBAL"];

export interface Photo {
  src: string;
  alt: string;
  caption?: string;
}

// One Exposure story, as written by collector/collect.py into public/data/stories.json.
export interface Story {
  id: string;
  region: Exclude<Region, "All">;
  office: string;
  title: string;
  location: string;
  date: string | null; // ISO yyyy-mm-dd
  year: string;
  url: string;
  images: Photo[];
  credits?: string | null;
  photoSet: "full" | "cover";
}

// One photo together with everything needed to show, credit and pick it.
export interface GalleryItem extends Photo {
  storyId: string;
  storyTitle: string;
  storyUrl: string;
  office: string;
  location: string;
  region: Exclude<Region, "All">;
  date: string | null;
  year: string;
  credits?: string | null;
}

export function storyItems(story: Story): GalleryItem[] {
  return story.images.map((photo) => ({
    ...photo,
    storyId: story.id,
    storyTitle: story.title,
    storyUrl: story.url,
    office: story.office,
    location: story.location,
    region: story.region,
    date: story.date,
    year: story.year,
    credits: story.credits,
  }));
}

// Exposure serves resized copies of every photo from its CDN.
export function sized(src: string, width: number) {
  return `${src};resize(${width},_).jpeg?auto=webp`;
}

export function formatDate(date: string | null) {
  if (!date) return "";
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function pad(value: number) {
  return value < 100 ? value.toString().padStart(2, "0") : value.toLocaleString("en-US");
}

// Save the full-resolution original. Exposure's image server allows cross-site
// downloads, so fetch it as a file; if that fails, open it in a new tab instead.
// `number` is the photo's position in its story, when known.
export async function downloadPhoto(item: GalleryItem, number?: number) {
  const extension = (item.src.match(/\.(jpe?g|png|gif|webp)$/i)?.[1] ?? "jpg").toLowerCase();
  const slug = item.storyUrl.split("/").pop() || "photo";
  const photoId = item.src.split("/").slice(-2, -1)[0]?.slice(0, 8) ?? "photo";
  const filename = `${slug}-${number ? pad(number) : photoId}.${extension}`;
  try {
    const response = await fetch(item.src);
    if (!response.ok) throw new Error(String(response.status));
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch {
    window.open(item.src, "_blank", "noopener");
  }
}
