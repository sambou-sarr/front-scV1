import { Carousel } from "./Carousel";

/** Galerie photo d'un bien utilisant le composant Carousel. */
export function Photos({ photos, alt }: { photos: string[]; alt: string }) {
  return (
    <Carousel
      items={photos}
      label="Photo"
      render={(photoUrl, index) => (
        <img
          src={photoUrl}
          alt={index === 0 ? alt : ""}
          loading="lazy"
          draggable="false"
        />
      )}
    />
  );
}