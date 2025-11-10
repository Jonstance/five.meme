import { Card } from './Card'

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="text-text-secondary text-sm">{label}</p>
          <p className="text-xl font-display font-bold text-text-primary">{value}</p>
        </div>
      </div>
    </Card>
  )
}