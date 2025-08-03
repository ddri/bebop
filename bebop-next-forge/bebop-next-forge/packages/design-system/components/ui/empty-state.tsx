import React from 'react';
import Link from 'next/link';
import { cn } from '@repo/design-system/lib/utils';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { TableCell, TableRow } from '@repo/design-system/components/ui/table';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  children?: React.ReactNode;
  className?: string;
  variant?: 'card' | 'table' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  colSpan?: number; // For table variant
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
  variant = 'card',
  size = 'md',
  colSpan = 6,
  ...props
}: EmptyStateProps) {
    // Size configurations
    const sizeConfig = {
      sm: {
        container: 'py-6',
        icon: 'h-8 w-8',
        title: 'text-base font-medium',
        description: 'text-xs',
      },
      md: {
        container: 'py-8',
        icon: 'h-10 w-10',
        title: 'text-lg font-semibold',
        description: 'text-sm',
      },
      lg: {
        container: 'py-12',
        icon: 'h-12 w-12',
        title: 'text-xl font-semibold',
        description: 'text-base',
      },
    };

    const config = sizeConfig[size];

    const renderContent = () => (
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center',
          config.container,
          className
        )}
        {...props}
      >
        {Icon && (
          <Icon
            className={cn(
              'text-muted-foreground mb-4',
              config.icon
            )}
            aria-hidden="true"
          />
        )}
        
        <h3 className={cn('mb-2', config.title)}>
          {title}
        </h3>
        
        {description && (
          <p className={cn(
            'text-muted-foreground mb-4 max-w-md',
            config.description
          )}>
            {description}
          </p>
        )}

        {action && (
          <Button
            variant={action.variant || 'default'}
            onClick={action.onClick}
            asChild={!!action.href}
            className="gap-2"
          >
            {action.href ? (
              <Link href={action.href}>
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </Link>
            ) : (
              <>
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </>
            )}
          </Button>
        )}

        {children}
      </div>
    );

    // Table variant - renders as a table row
    if (variant === 'table') {
      return (
        <TableRow>
          <TableCell colSpan={colSpan}>
            {renderContent()}
          </TableCell>
        </TableRow>
      );
    }

    // Card variant - renders wrapped in a Card
    if (variant === 'card') {
      return (
        <Card className={className}>
          <CardContent className="p-0">
            {renderContent()}
          </CardContent>
        </Card>
      );
    }

    // Inline variant - renders as a plain div
    return renderContent();
}

export { EmptyState };