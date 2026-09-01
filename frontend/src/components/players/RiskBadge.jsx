import React from 'react';
import { Badge } from '../ui/Badge';
import { formatProbability } from '../../utils/formatters';

export const RiskBadge = ({ probability, tier, showProb = true, size = 'sm' }) => {
  const prob = typeof probability === 'number' ? probability : 0;
  
  let variant = 'emerald';
  let label = tier || 'Low';

  if (prob >= 0.75 || tier === 'Very High') {
    variant = 'rose';
    label = 'Very High';
  } else if (prob >= 0.50 || tier === 'High') {
    variant = 'orange';
    label = 'High';
  } else if (prob >= 0.30 || tier === 'Moderate') {
    variant = 'amber';
    label = 'Moderate';
  }

  return (
    <Badge variant={variant} size={size} dot>
      {label} {showProb && `(${formatProbability(prob)})`}
    </Badge>
  );
};
