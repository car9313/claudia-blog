interface TitleHeaderProps{
    title:string;
    description:string;
}
export default function TitleHeader({title,description}:TitleHeaderProps) {
  return (
     <>
      {title && (
        <div className="text-center m-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">{title}</h2>
          {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">{description}</p>}
        </div>
      )}
    </>
  )
}