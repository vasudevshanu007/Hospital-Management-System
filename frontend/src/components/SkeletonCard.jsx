import React from "react";
import { motion } from "framer-motion";

const SkeletonCard = ({ type = "card" }) => {
  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  if (type === "card") {
    return (
      <motion.div
        className="glass-card p-6 space-y-4"
        variants={skeletonVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="skeleton w-16 h-16 rounded-2xl"
          variants={itemVariants}
        />
        <motion.div
          className="space-y-2"
          variants={itemVariants}
        >
          <div className="skeleton h-6 w-3/4 rounded"></div>
          <div className="skeleton h-4 w-1/2 rounded"></div>
        </motion.div>
        <motion.div
          className="skeleton h-20 w-full rounded"
          variants={itemVariants}
        />
      </motion.div>
    );
  }

  if (type === "list") {
    return (
      <motion.div
        className="space-y-4"
        variants={skeletonVariants}
        initial="hidden"
        animate="visible"
      >
        {[1, 2, 3, 4, 5].map((item) => (
          <motion.div
            key={item}
            className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl"
            variants={itemVariants}
          >
            <div className="skeleton w-12 h-12 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded"></div>
              <div className="skeleton h-3 w-1/2 rounded"></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === "form") {
    return (
      <motion.div
        className="space-y-6"
        variants={skeletonVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="skeleton h-8 w-1/3 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-12 w-full rounded"></div>
          <div className="skeleton h-12 w-full rounded"></div>
        </div>
        <div className="skeleton h-32 w-full rounded"></div>
        <div className="skeleton h-12 w-1/4 rounded mx-auto"></div>
      </motion.div>
    );
  }

  return null;
};

export default SkeletonCard;
