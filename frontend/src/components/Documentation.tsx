import { motion } from 'framer-motion';
import { FileText, Code, Users } from 'lucide-react';

export const Documentation = () => {
  const docs = [
    {
      icon: FileText,
      title: 'API Documentation',
      description: 'Complete API reference for integrating SkinSense AI into your applications.',
      link: '#'
    },
    {
      icon: Code,
      title: 'Developer Guide',
      description: 'Step-by-step guide for developers to get started with our AI models.',
      link: '#'
    },
    {
      icon: Users,
      title: 'Research Papers',
      description: 'Scientific papers and studies behind our skin analysis technology.',
      link: '#'
    }
  ];

  return (
    <section id="docs" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Documentation</h2>
          <p className="text-lg text-text/70 max-w-2xl mx-auto">
            Explore our comprehensive documentation to understand and integrate SkinSense AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {docs.map((doc, index) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-xl border border-primary/10 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <doc.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">{doc.title}</h3>
              <p className="text-text/70 mb-4">{doc.description}</p>
              <a
                href={doc.link}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Learn More →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};