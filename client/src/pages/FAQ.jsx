import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Search,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Eye,
  Lock,
  Zap,
  DollarSign,
  Home,
  Shield,
  Clock,
  ArrowRight,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

const FAQ = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-orange-500 to-amber-600'
    },
    {
      id: 'how-it-works',
      name: 'How It Works',
      icon: <Eye className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'pricing',
      name: 'Pricing & Plans',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'account',
      name: 'Account Management',
      icon: <Lock className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'analysis',
      name: 'Quote Analysis',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'from-red-500 to-rose-600'
    },
    {
      id: 'security',
      name: 'Security & Privacy',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-indigo-500 to-blue-600'
    }
  ];

  const faqs = {
    'getting-started': [
      {
        question: 'How do I sign up for MyQuoteText?',
        answer: 'Click the "Sign Up" button in the top right corner of our website. Enter your email address and create a password. You can also sign up with your Google account for faster registration. Once verified, you\'ll have access to your free tier immediately.'
      },
      {
        question: 'Is there a free trial available?',
        answer: 'Yes! Every user starts with a Free tier that includes basic quote analysis. You can analyze one quote to see how our service works. To unlock more features and unlimited analyses, you can upgrade to Standard or Premium plans.'
      },
      {
        question: 'Do I need to provide credit card details for the free trial?',
        answer: 'No, absolutely not. Your Free tier access requires no payment information. You can explore all features risk-free. Credit card details are only needed if you choose to upgrade to a paid plan.'
      },
      {
        question: 'How long does it take to get started?',
        answer: 'You can be analyzing quotes within 2 minutes! Sign up, verify your email, and upload your first quote. Our AI analyzes most quotes in under 30 seconds.'
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can delete your account anytime from your Profile settings. This will remove all your personal data and quote history. Once deleted, your account cannot be recovered, so please be certain before proceeding.'
      }
    ],
    'how-it-works': [
      {
        question: 'How does MyQuoteText analyze my quotes?',
        answer: 'Our AI uses advanced machine learning trained on thousands of Australian tradie quotes. It analyzes your quote against current market rates, identifies unusual charges, flags potential red flags, and provides cost breakdowns. The analysis is completed in real-time and saved to your account.'
      },
      {
        question: 'What information do you need from me?',
        answer: 'You can either upload a PDF quote or paste the text directly. Our system extracts key information: tradie name, price, scope of work, and timeline. You don\'t need to provide personal details like your address - just the quote itself.'
      },
      {
        question: 'How accurate is the market price comparison?',
        answer: 'Our database includes pricing data from 50,000+ Australian tradie quotes across all states. We update rates monthly based on current market conditions. Accuracy varies by trade (plumbing: 94%, electrical: 91%, general carpentry: 87%), but it\'s always your starting point for negotiation.'
      },
      {
        question: 'Can I ask questions about my quote?',
        answer: 'Absolutely! Once your analysis is complete, you can chat with our AI assistant. Ask questions about specific line items, get negotiation tips, or request clarifications. Our chat learns from your quote context to provide relevant answers.'
      },
      {
        question: 'What if I disagree with the analysis?',
        answer: 'Your feedback helps us improve! You can rate each analysis section as helpful or unhelpful. If you find an error or have a specific question, contact our support team. We\'ll review it and refine our algorithms.'
      },
      {
        question: 'How long are my analyses saved?',
        answer: 'Free tier analyses are saved for 30 days. Standard tier: 90 days. Premium tier: unlimited (until you delete them). You can download your analysis as a PDF anytime to keep for your records.'
      }
    ],
    'pricing': [
      {
        question: 'What\'s included in the Free plan?',
        answer: 'Free plan includes: 1 quote analysis per month, basic cost breakdown, red flag detection, and limited chat access. Perfect for homeowners analyzing a single renovation quote.'
      },
      {
        question: 'What\'s the difference between Standard and Premium?',
        answer: 'Standard ($7.99 one-time): Detailed breakdowns, red flags, questions, and extended chat access. Premium ($9.99 one-time): All Standard features PLUS benchmarking, recommendations, advanced comparisons, and priority support.'
      },
      {
        question: 'Can I pay per analysis instead of monthly?',
        answer: 'Yes! You can purchase single analyses: $7.99 for standard analysis or $9.99 for premium analysis. Perfect if you only need occasional quotes analyzed. No subscription required.'
      },
      {
        question: 'Is there a discount for annual billing?',
        answer: 'Yes! Subscribe annually and save 20%. Standard: $287.88/year (instead of $359.88). Premium: $959.88/year (instead of $1,199.88). Switch to annual billing in your Account settings.'
      },
      {
        question: 'Do you offer team/business plans?',
        answer: 'We\'re launching team plans soon! Contact sales@myquotetext.com for early access or custom Premium quotes for contractors and property managers.'
      },
      {
        question: 'What\'s your refund policy?',
        answer: '7-day money-back guarantee on all subscriptions. If you\'re not satisfied, email support within 7 days of purchase. Refunds are processed within 5-10 business days. Single analyses are non-refundable once completed.'
      },
      {
        question: 'Can I cancel anytime?',
        answer: 'Yes, cancel your subscription anytime with no penalties. Your access continues until the end of your current billing cycle. Unused time is not refunded, but you can reactivate anytime.'
      }
    ],
    'account': [
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page. Enter your email address and check for a reset link (takes 1-2 minutes). Click the link, create a new password, and you\'re done. The link expires in 24 hours for security.'
      },
      {
        question: 'Can I change my email address?',
        answer: 'Yes! Go to Profile > Account Settings and click "Edit Email". Enter your new email address and verify it. Your old email address will no longer work to login.'
      },
      {
        question: 'How do I upload a profile picture?',
        answer: 'Go to your Profile page and click on your avatar (initials circle). Select "Upload Photo" and choose an image from your computer. We accept JPG and PNG files up to 5MB.'
      },
      {
        question: 'Can I have multiple accounts?',
        answer: 'Each email address can have one account. If you need a second account, use a different email address. You cannot link multiple accounts together, but you can manage separate subscriptions.'
      },
      {
        question: 'How do I update my billing information?',
        answer: 'Go to Account Settings > Billing. Update your card details or change payment method anytime. Changes take effect on your next billing date.'
      },
      {
        question: 'What happens if my payment fails?',
        answer: 'We\'ll email you immediately to update your payment method. You have 5 days to update before your account is suspended. Your data is never deleted - just reactivate when payment is successful.'
      }
    ],
    'analysis': [
      {
        question: 'What file formats can I upload?',
        answer: 'We accept PDF files, images (JPG, PNG), and plain text. Maximum file size: 10MB. If your quote is longer, paste it as text instead. The clearer the document, the better our analysis.'
      },
      {
        question: 'How long does analysis take?',
        answer: 'Most quotes are analyzed within 30 seconds. Complex or longer quotes may take 2-3 minutes. You\'ll see progress updates in real-time and get notified when analysis is complete.'
      },
      {
        question: 'Can I analyze the same quote twice?',
        answer: 'Yes! Upload it again for a fresh analysis. This is useful if you want to compare our analysis over time or if the tradie has updated the quote. Each analysis is saved separately.'
      },
      {
        question: 'What does "Red Flag" mean?',
        answer: 'Red flags are items that appear unusual compared to market standards: vague descriptions ("labor: $2000"), extremely high/low prices, unusual payment terms, or missing information. They don\'t mean the quote is bad - just worth investigating further.'
      },
      {
        question: 'How do you compare my quote to market rates?',
        answer: 'We compare against our database of 50,000+ quotes from licensed tradies across Australia. We adjust for: location (Sydney vs regional), complexity, materials, and timeline. Results show if you\'re above/below average for your area.'
      },
      {
        question: 'Can I share my analysis with others?',
        answer: 'Yes! Download as PDF or email from your analysis page. Share the PDF with family members, other tradies for comparison, or anyone you want advice from. Your personal data is not included in the PDF.'
      }
    ],
    'security': [
      {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use bank-level encryption (AES-256) for all data transmission. Your quotes are stored on encrypted servers in Australia. We comply with Australian Privacy Principles and GDPR standards. Regular security audits verify our protections.'
      },
      {
        question: 'Who can see my quotes?',
        answer: 'Only you can see your quotes and analyses. We never share your data with tradies, contractors, or third parties without your permission. Our AI uses anonymized data to improve algorithms - never your personal quotes.'
      },
      {
        question: 'How long do you keep my data?',
        answer: 'Free tier: 30 days after last login. Standard: 90 days after last login. Premium: 2 years or until you delete. You can request deletion anytime. Backups are retained for 30 days for recovery purposes.'
      },
      {
        question: 'Do you sell my data?',
        answer: 'No, never. We don\'t sell personal data under any circumstances. We may use anonymized, aggregated data (e.g., "average bathroom renovation cost in Brisbane") for reports and research.'
      },
      {
        question: 'Is two-factor authentication available?',
        answer: 'Yes! Enable 2FA in Account Settings. You\'ll receive a code via email (or authenticator app) when logging in on a new device. Highly recommended for security.'
      },
      {
        question: 'What should I do if I suspect a security breach?',
        answer: 'Email security@myquotetext.com immediately with details. Change your password right away. We\'ll investigate and notify you within 24 hours. Your data is protected by our cyber insurance.'
      },
      {
        question: 'Do you comply with Australian privacy laws?',
        answer: 'Yes, 100%. We comply with the Privacy Act 1988 (Cth) and Australian Privacy Principles. See our full Privacy Policy for details. You have the right to access and delete your data anytime.'
      }
    ]
  };

  const filteredFAQs = Object.entries(faqs).reduce((acc, [category, questions]) => {
    const filtered = questions.filter(
      faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  const currentFAQs = searchTerm ? filteredFAQs : faqs;
  const displayFAQs = currentFAQs[activeCategory] || [];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white py-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8" />
            <span className="text-sm font-semibold uppercase tracking-wider opacity-90">Help Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg opacity-95 max-w-2xl">
            Can't find the answer you're looking for? Explore our FAQ or <Link to="/contact" className="underline hover:opacity-75">contact us directly</Link>.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQ... (e.g., 'how to upload', 'pricing', 'security')"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveCategory(Object.keys(currentFAQs)[0] || 'getting-started');
              }}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {!searchTerm && (
          <>
            {/* Category Tabs */}
            <div className="mb-12">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Browse Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`p-4 rounded-lg font-medium transition-all ${activeCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : 'bg-white border border-gray-200 text-gray-900 hover:border-orange-300'
                      }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      {cat.icon}
                      <span className="hidden sm:inline">{cat.name}</span>
                      <span className="sm:hidden text-xs">{cat.name.split(' ')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* FAQ List */}
        {displayFAQs.length > 0 ? (
          <div className="space-y-4">
            {displayFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    <span className="font-medium text-gray-900 text-lg">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFAQ === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {expandedFAQ === index && (
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No questions match your search.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear Search
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Mail className="w-10 h-10 mx-auto mb-3 text-orange-500" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-gray-300 text-sm mb-4">Response within 24 hours</p>
              <a href="mailto:support@myquotetext.com" className="text-orange-400 hover:text-orange-300">
                support@myquotetext.com
              </a>
            </div>

            <div className="text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-orange-500" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-300 text-sm mb-4">Mon-Fri, 9am-5pm AEDT</p>
              <button className="text-orange-400 hover:text-orange-300 font-medium">
                Start Chat
              </button>
            </div>

            <div className="text-center">
              <Phone className="w-10 h-10 mx-auto mb-3 text-orange-500" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300 text-sm mb-4">1300 MY QUOTE</p>
              <a href="tel:1300696878" className="text-orange-400 hover:text-orange-300">
                1300 69 68 78
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
