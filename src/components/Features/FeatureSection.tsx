import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "🔒",
    title: "Secure & Audited",
    description: "Smart contracts audited for maximum security and transparency"
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Deploy your token presale in minutes, not hours"
  },
  {
    icon: "💎",
    title: "Low Fees",
    description: "Minimal platform fees to maximize your fundraising potential"
  },
  {
    icon: "🌐",
    title: "BSC Native",
    description: "Built specifically for Binance Smart Chain ecosystem"
  },
  {
    icon: "📊",
    title: "Real-time Analytics",
    description: "Track your presale performance with live statistics"
  },
  {
    icon: "🤝",
    title: "Community Driven",
    description: "Join a thriving community of builders and investors"
  }
];

export const FeatureSection: React.FC = () => {
  return (
    <section className="px-4 py-20 bg-gradient-to-br from-background to-background-lighter">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold font-display text-primary mb-4">
            Why Choose pad.meme?
          </h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            The most trusted launchpad platform on BSC with enterprise-grade security and user-friendly design
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card hover={true} className="h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};