import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const KPICard = ({ title, value, change, icon: Icon, format = 'number', brandColor }) => {
  const isPositive = change >= 0;
  
  const formatValue = (val) => {
    if (format === 'currency') {
      return `SAR ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return val.toLocaleString('en-US');
  };

  return (
    <div className="bg-secondary border border-border/50 rounded-lg p-6 hover:border-border hover:shadow-lg transition-all duration-200" data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon size={20} style={{ color: brandColor || 'hsl(var(--foreground))' }} />
          </div>
        )}
      </div>
      
      <div>
        <p className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
          {formatValue(value)}
        </p>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-body ${
            isPositive ? 'text-success' : 'text-destructive'
          }`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(change)}% vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};