import { motion } from 'framer-motion';
import { Upload, Scan, BarChart3 } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Upload Image',
      description: 'Take a photo or upload an existing image of your skin area.'
    },
    {
      icon: Scan,
      title: 'AI Analysis',
      description: 'Our advanced AI analyzes the image for acne, pigmentation, and redness.'
    },
    {
      icon: BarChart3,
      title: 'Get Results',
      description: 'Receive detailed analysis with severity levels and recommendations.'
    }
  ];

  return (
    <section id="how" className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">How It Works</h2>
          <p className="text-lg text-text/70 max-w-2xl mx-auto">
            Simple 3-step process to get comprehensive skin analysis using cutting-edge AI technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">{step.title}</h3>
              <p className="text-text/70">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};