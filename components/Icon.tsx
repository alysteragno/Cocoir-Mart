import Image from "next/image";

export default function Icon({
    src ,
    alt = "Image",
    width = 500,
    height = 500,
}: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
}) {
    return (
        <div>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
            />
        </div>
    );
}