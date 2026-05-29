import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import type { buttonVariants } from '@/components/ui/button'

export interface DefaultButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  label?: string
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

export function DefaultButton({
  className,
  variant,
  size,
  label,
  isLoading,
  loadingText,
  leftIcon,
  rightIcon,
  children,
  disabled,
  asChild,
  type = 'button',
  ...props
}: DefaultButtonProps) {
  const content = label ?? children

  return (
    <Button
      type={type}
      className={cn(className)}
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      asChild={asChild}
      {...props}
    >
      {asChild ? (
        children
      ) : isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || content}
        </>
      ) : (
        <>
          {!isLoading && leftIcon && <span>{leftIcon}</span>}
          {content}
          {!isLoading && rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </Button>
  )
}
