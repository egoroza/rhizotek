import { useNavigate } from "react-router";
import { Button } from "~/components/Button";

export interface CardProps {
  imageUrl?: string | null;
  imageAlt: string;
  name: string;
  scientificName: string;
  href: string;
}

const Card = ({ imageUrl, imageAlt, name, scientificName, href }: CardProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col overflow-hidden rounded-md border-2 border-text bg-white">
      <div className="aspect-[4/3] w-full bg-accent-sage/20 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-heading text-sm text-text/40">
            no image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-heading text-lg font-semibold">{name}</h3>
        <p className="text-sm italic text-text/70">{scientificName}</p>
      </div>
      <div className="p-4 pt-0 flex gap-2">
        <Button variant="primary" className="w-full" onClick={() => navigate(href)}>
          Learn more
        </Button>
        <Button variant="primary" className="w-full" onClick={() => navigate(href)}>
          Create recipe
        </Button>
      </div>
    </div>
  );
};

export default Card;
