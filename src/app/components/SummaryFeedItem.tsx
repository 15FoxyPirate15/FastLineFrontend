import { motion } from "motion/react";

interface SummaryFeedItemProps {
  title: string;
  description: string;
  delay?: number;
}

export function SummaryFeedItem({ title, description, delay = 0 }: SummaryFeedItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl p-4 shadow-sm border border-black/5"
    >
      <h4 className="text-gray-900">{title}</h4>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </motion.div>
  );
}
