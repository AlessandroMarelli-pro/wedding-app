import { motion } from 'motion/react';

export const DivWithAnimation = ({
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.5, once: true }}
      transition={{ type: 'spring', duration: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
