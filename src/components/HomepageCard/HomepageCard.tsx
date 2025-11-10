import React from "react"
import { motion } from "framer-motion"
import "./HomepageCard.css"

type propTypes = {
    borderColor: string,
    circleColor: string,
    value: string | number,
    isCircle1: boolean,
    caption: string,
    isAmountCard: boolean
}

const HomepageCard = ({ borderColor, circleColor, value, isCircle1, caption, isAmountCard }: propTypes) => {
    return (
        <motion.div 
            className="modern-homepage-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
            <div className="card-content">
                <div className="metric-display">
                    <div 
                        className="metric-circle"
                        style={{ 
                            backgroundColor: circleColor,
                            boxShadow: `0 0 20px ${circleColor}40`
                        }}
                    >
                        <span className="metric-value">
                            {isAmountCard ? `${value} BNB` : String(value)}
                        </span>
                    </div>
                    <div className={`pulse-ring ${isCircle1 ? "primary-pulse" : "blue-pulse"}`}></div>
                </div>
                
                <h3 className="metric-caption" style={{ color: borderColor }}>
                    {caption}
                </h3>
            </div>
            
            <div className="card-gradient-border" style={{ borderColor }}></div>
        </motion.div>
    )
}

export default HomepageCard