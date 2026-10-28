import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

function LazyImage({ alt, className = '', loading = 'lazy', src, ...imageProps }: LazyImageProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const image = imageRef.current
    setLoaded(Boolean(image?.complete && image.naturalWidth > 0))
  }, [src])

  function markLoaded() {
    setLoaded(true)
  }

  return (
    <img
      {...imageProps}
      alt={alt}
      className={`lazy-image__img ${className}${loaded ? ' is-loaded' : ''}`.trim()}
      decoding="async"
      loading={loading}
      onError={markLoaded}
      onLoad={markLoaded}
      ref={imageRef}
      src={src}
    />
  )
}

export default LazyImage
