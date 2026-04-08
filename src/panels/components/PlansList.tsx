import React, { memo } from 'react';
import type { PlanItemData } from './types';
import { PlanItem } from './PlanItem';

interface PlansListProps {
  plans: PlanItemData[];
  onPlanClick: (path: string) => void;
  selectedFile?: string;
}

export const PlansList: React.FC<PlansListProps> = memo(
  ({ plans, onPlanClick, selectedFile }) => {
    if (plans.length === 0) {
      return null;
    }

    return (
      <div>
        {plans.map((plan) => (
          <PlanItem
            key={plan.relativePath}
            plan={plan}
            onClick={onPlanClick}
            isSelected={selectedFile === plan.relativePath}
          />
        ))}
      </div>
    );
  }
);

PlansList.displayName = 'PlansList';
