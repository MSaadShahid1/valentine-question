import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface PrimaryButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'ghost' | 'light';
  size?: 'md' | 'small';
  icon?: ReactNode;
  /** Animated light sweep across the surface. */
  shine?: boolean;
  children: ReactNode;
}

/** The site's button: spring lift on hover, squish on press, optional shine. */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(function PrimaryButton(
  { variant = 'primary', size = 'md', icon, shine = variant === 'primary', className = '', children, type = 'button', ...props },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      className={`btn btn--${variant} ${size === 'small' ? 'btn--small' : ''} ${className}`}
      whileHover={{ y: -2, scale: 1.035 }}
      whileTap={{ scale: 0.95, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      {...props}
    >
      {shine && <span className="btn__shine" aria-hidden="true" />}
      {icon}
      <span>{children}</span>
    </motion.button>
  );
});
