"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
export function ArticleImages({ locale }: { locale: "en" | "zh" }) {
  const [image, setImage] = useState<{
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null>(null);
  const [fullSize, setFullSize] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const images = document.querySelectorAll<HTMLImageElement>(
      ".article-body figure img",
    );
    const buttons: HTMLButtonElement[] = [];
    images.forEach((img) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "figure-zoom";
      button.setAttribute(
        "aria-label",
        `${locale === "zh" ? "放大图片" : "Enlarge image"}: ${img.alt}`,
      );
      img.replaceWith(button);
      button.append(img);
      button.onclick = () => {
        trigger.current = button;
        setImage({
          src: img.src,
          alt: img.alt,
          width: img.naturalWidth || 1100,
          height: img.naturalHeight || 620,
        });
      };
      buttons.push(button);
    });
    return () =>
      buttons.forEach((button) => {
        const img = button.firstChild;
        if (img) button.replaceWith(img);
      });
  }, [locale]);
  useEffect(() => {
    if (image) dialog.current?.showModal();
  }, [image]);
  function close() {
    dialog.current?.close();
    setImage(null);
    setFullSize(false);
    trigger.current?.focus();
  }
  return (
    <dialog
      className="image-dialog"
      ref={dialog}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button autoFocus className="dialog-close" onClick={close}>
        {locale === "zh" ? "关闭" : "Close"} ×
      </button>
      {image && (
        <>
          <button
            className="dialog-scale"
            onClick={() => setFullSize(!fullSize)}
          >
            {locale === "zh"
              ? fullSize
                ? "适合屏幕"
                : "原始尺寸"
              : fullSize
                ? "Fit to screen"
                : "Full size"}
          </button>
          <div className="image-viewer">
            <Image
              className={fullSize ? "native-size" : undefined}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              onLoad={({ currentTarget }) => {
                const { src, naturalWidth: width, naturalHeight: height } = currentTarget;
                if (width && height) {
                  setImage((current) =>
                    current && current.src === src && (current.width !== width || current.height !== height)
                      ? { ...current, width, height }
                      : current,
                  );
                }
              }}
              unoptimized
            />
          </div>
          <p>{image.alt}</p>
        </>
      )}
    </dialog>
  );
}
