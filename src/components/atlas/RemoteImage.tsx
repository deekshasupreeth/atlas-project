import { useQuery } from "@tanstack/react-query";
import { imageQuery } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  wiki: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
};

/** Fetches its own image from Wikimedia and designs its own loading / failure states. */
export function RemoteImage({ wiki, alt, className, imgClassName, priority }: Props) {
  const { data, isPending, isError } = useQuery(imageQuery(wiki));

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {isPending && <div className="absolute inset-0 skeleton-sheen" aria-hidden="true" />}

      {isError && (
        <div className="absolute inset-0 grid place-items-center bg-secondary px-4 text-center">
          <p className="label-mono text-muted-foreground">Image unavailable</p>
        </div>
      )}

      {!isPending && !isError && !data && (
        <div className="absolute inset-0 grid place-items-center bg-secondary px-4 text-center">
          <p className="label-mono text-muted-foreground">No photograph yet</p>
        </div>
      )}

      {data && (
        <img
          src={data.url}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "h-full w-full object-cover animate-fade transition-transform duration-700 ease-out",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
