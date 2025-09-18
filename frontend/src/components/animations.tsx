import { motion } from 'motion/react';

export const DivWithAnimation = ({
  children,
  duration = 0.8,
  ...props
}: React.ComponentProps<typeof motion.div> & { duration?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
