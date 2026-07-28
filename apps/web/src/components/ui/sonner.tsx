import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster(props: ToasterProps) {
  return <Sonner position="bottom-center" richColors closeButton {...props} />
}

export { Toaster }
