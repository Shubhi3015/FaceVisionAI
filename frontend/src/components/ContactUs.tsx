import { motion } from 'framer-motion';
import { Mail, MessageSquare, Github } from 'lucide-react';

export const ContactUs = () => {
  const contacts = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Get in touch with our team',
      contact: 'support@skinsense.ai',
      link: 'mailto:support@skinsense.ai'
    },
    {
      icon: MessageSquare,
      title: 'Community Forum',
      description: 'Join discussions with other users',
      contact: 'Community Forum',
      link: '#'
    },
    {
      icon: Github,
      title: 'GitHub',
      description: 'Report issues or contribute',
      contact: 'github.com/skinsense',
      link: '#'
    }
  ];

  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-accent/5 to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Contact Us</h2>
          <p className="text-lg text-text/70 max-w-2xl mx-auto">
            Have questions or need support? We're here to help you with SkinSense AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <contact.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">{contact.title}</h3>
              <p className="text-text/70 mb-2">{contact.description}</p>
              <a
                href={contact.link}
                className="text-accent hover:text-accent/80 font-medium transition-colors"
              >
                {contact.contact}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};