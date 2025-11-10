import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Project {
  id: string;
  name: string;
  description: string;
  logo: string;
  raised: string;
  target: string;
  progress: number;
  status: 'active' | 'upcoming' | 'completed';
  category: string;
}

// Mock data - replace with real data from your API
const featuredProjects: Project[] = [
  {
    id: '1',
    name: 'DeFi Protocol X',
    description: 'Next-generation decentralized finance protocol with innovative yield farming mechanisms.',
    logo: '🚀',
    raised: '850',
    target: '1000',
    progress: 85,
    status: 'active',
    category: 'DeFi'
  },
  {
    id: '2',
    name: 'GameFi Universe',
    description: 'Revolutionary blockchain gaming ecosystem with play-to-earn mechanics.',
    logo: '🎮',
    raised: '0',
    target: '2000',
    progress: 0,
    status: 'upcoming',
    category: 'Gaming'
  },
  {
    id: '3',
    name: 'NFT Marketplace Pro',
    description: 'Premium NFT marketplace with advanced trading features and creator tools.',
    logo: '🎨',
    raised: '1500',
    target: '1500',
    progress: 100,
    status: 'completed',
    category: 'NFT'
  }
];

const statusColors = {
  active: 'text-accent-green',
  upcoming: 'text-accent-yellow',
  completed: 'text-accent-blue'
};

const statusLabels = {
  active: 'Live',
  upcoming: 'Soon',
  completed: 'Success'
};

export const FeaturedProjects: React.FC = () => {
  return (
    <section className="px-4 py-20 bg-gradient-to-br from-background via-background-lighter to-background">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold font-display text-text-primary mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Discover the most promising projects launching on our platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card hover={true} className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{project.logo}</div>
                    <div>
                      <h3 className="font-bold text-text-primary">{project.name}</h3>
                      <span className="text-sm text-text-muted">{project.category}</span>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                </div>
                
                <p className="text-text-secondary mb-6 flex-1">
                  {project.description}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-secondary">Progress</span>
                      <span className="text-text-primary font-semibold">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-background-hover rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Raised: <span className="text-text-primary font-semibold">{project.raised} BNB</span></span>
                    <span className="text-text-secondary">Target: <span className="text-text-primary font-semibold">{project.target} BNB</span></span>
                  </div>
                  
                  <Button 
                    variant={project.status === 'active' ? 'primary' : 'secondary'} 
                    fullWidth
                    className="mt-4"
                  >
                    {project.status === 'active' ? 'Invest Now' : 
                     project.status === 'upcoming' ? 'Learn More' : 'View Details'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Button variant="outline" size="lg">
            View All Projects
          </Button>
        </motion.div>
      </div>
    </section>
  );
};