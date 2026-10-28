interface SectionHeadingProps {
  title: string
  eyebrow?: string
  description?: string
}

function SectionHeading({ title, eyebrow, description }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      {eyebrow && <span className="section-heading__eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}

export default SectionHeading
