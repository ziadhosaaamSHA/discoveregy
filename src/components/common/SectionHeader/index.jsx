import { motion } from "framer-motion";

export function SectionHeader({ title, subtitle, className = "" }) {
  return (
    <div className={`mb-10 text-center ${className}`}>
      <motion.h2 
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-[32px] lg:text-[38px] font-bold text-black"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 mt-2 italic"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
