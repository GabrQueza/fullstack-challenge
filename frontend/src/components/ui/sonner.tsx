"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(240 5.9% 10%)",
          "--normal-text": "hsl(0 0% 98%)",
          "--normal-border": "hsl(240 3.7% 15.9%)",
          "--success-bg": "hsl(142 76% 10%)",
          "--success-text": "hsl(142 76% 56%)",
          "--success-border": "hsl(142 76% 20%)",
          "--error-bg": "hsl(0 84% 10%)",
          "--error-text": "hsl(0 84% 60%)",
          "--error-border": "hsl(0 62% 20%)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
