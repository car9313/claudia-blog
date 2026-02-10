import { CopyButton } from "./copy-button";

export function CodeBlock({ children, className, ...props }: any) {
  // language: intenta varias fuentes: data-language, className, props['data-meta']...
  let language = "text";

  // 1) rehype-pretty-code a veces pone data-language en properties
  if (props?.["data-language"]) {
    language = String(props["data-language"]);
  } else if (className) {
    // className puede ser string o array
    const cls = Array.isArray(className) ? className.join(" ") : String(className);
    const match = cls.match(/language-([\w-]+)/);
    if (match) language = match[1];
  } else if (props?.className) {
    const cls = Array.isArray(props.className) ? props.className.join(" ") : String(props.className);
    const match = cls.match(/language-([\w-]+)/);
    if (match) language = match[1];
  }

  // extraer texto del children de forma segura
  let codeText = "";
  if (typeof children === "string") {
    codeText = children;
  } else if (Array.isArray(children) && children.length > 0) {
    // a menudo children es un elemento <code>{texto}</code>
    const first = children[0];
    codeText = first?.props?.children ?? "";
  } else {
    codeText = children?.props?.children ?? "";
  }

  return (
    <div className="code-block-wrapper my-6">
      <div className="code-block-header flex items-center justify-between px-4 py-2 border-b border-border/50">
        <span className="code-block-language text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        <CopyButton code={String(codeText)} />
      </div>
      <pre className={className} {...props}>
        {children}
      </pre>
    </div>
  );
}