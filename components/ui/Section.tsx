import React from 'react';
import { SectionProps } from '../../types';

const Section: React.FC<SectionProps> = ({ id, className = '', children }) => {
  return (
    <section 
      id={id} 
      className={`min-h-screen w-full flex flex-col justify-center items-start px-6 md:px-20 lg:px-32 relative z-10 pointer-events-none ${className}`}
    >
      <div className="pointer-events-auto max-w-4xl w-full">
        {children}
      </div>
    </section>
  );
};

export default Section;
