import { useMemo } from "react";

interface ReferenceImageDisplayProps {
    referenceImageUrl?: string | null;
    referenceImageUrls?: string[] | null;
}

export default function ReferenceImageDisplay({ referenceImageUrl, referenceImageUrls }: ReferenceImageDisplayProps) {
    const urls = useMemo(() => {
        if (referenceImageUrls && referenceImageUrls.length > 0) return referenceImageUrls;
        if (referenceImageUrl) return [referenceImageUrl];
        return [];
    }, [referenceImageUrl, referenceImageUrls]);

    if (urls.length === 0) return null;

    return (
        <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-xl">
            <div className="flex justify-between items-center mb-2">
                <p className="text-label-large text-[var(--md-sys-color-on-surface-variant)]">参考画像</p>
            </div>
            <div className="flex gap-2 flex-wrap">
                {urls.map((url, idx) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={idx} src={url} alt={`参考画像${idx + 1}`}
                        className="max-h-60 max-w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                ))}
            </div>
        </div>
    );
}
