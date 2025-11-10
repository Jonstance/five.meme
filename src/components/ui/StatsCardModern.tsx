import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';

interface StatsCardModernProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: boolean;
}

export const StatsCardModern: React.FC<StatsCardModernProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradient = false
}) => {
  return (
    <Card hover={true} className={gradient ? 'bg-gradient-to-br from-primary/10 to-accent-purple/10 border-primary/20' : ''}>
      <div className="text-center">
        {icon && (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
            {icon}
          </div>
        )}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-3xl font-bold font-display text-primary mb-2">
            {value}
          </h3>
        </motion.div>
        <p className="text-secondary font-medium mb-1">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};