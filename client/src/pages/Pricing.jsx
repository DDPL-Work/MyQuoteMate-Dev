// client/src/pages/Pricing.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  FileText,
  Lock,
  Star,
  Sparkles,
  ArrowRight,
  Target,
  Scale,
  Eye,
  Download,
  Crown,
  ChevronRight,
  Award,
  TrendingUp,
  Users,
  Clock,
  HelpCircle,
  Check,
  AlertCircle,
  BarChart3,
  Repeat,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  ShieldCheck,
  Calendar,
  FileCheck,
  RefreshCw,
  Globe,
  Inbox,
  Copy,
  Tag
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import DiscountRedemptionModal from '../components/DiscountRedemptionModal';
import { useAuth } from '../hooks/useAuth';
import { paymentApi } from '../services/paymentApi';
import { toast } from 'react-hot-toast'; // Assuming toast is available, or use alert/console



const Pricing = () => {
  const { user, refreshUser, requestLogin } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [prefilledDiscountCode, setPrefilledDiscountCode] = useState('');

  // Discount States
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [currentDiscountIndex, setCurrentDiscountIndex] = useState(0);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [selectedRedemptionDiscount, setSelectedRedemptionDiscount] = useState(null);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchPlans();
    fetchActiveDiscount();
  }, []);

  const fetchActiveDiscount = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE}/api/v1/discounts/active`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          setActiveDiscounts(result.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch discounts:', err);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Discount code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Static fallback data with all visual metadata
  const staticPlans = [
    {
      name: "Free",
      tier: "free",
      tagline: "Start with confidence",
      price: "0",
      period: "forever",
      popular: false,
      color: "from-gray-800 to-black",
      textColor: "text-gray-800",
      border: "border-gray-300",
      button: "bg-black hover:bg-gray-900 text-white",
      cta: "Get Started Free",
      icon: <Eye className="w-6 h-6" />,
      features: [
        { included: true, text: "AI overview summary" },
        { included: true, text: "Fair price verdict & score" },
        { included: false, text: "Red flag detection", premium: false },
        { included: false, text: "Questions to ask tradie", premium: false },
        { included: false, text: "Detailed cost breakdown", premium: false },
        { included: false, text: "Professional PDF reports", premium: false },
        { included: false, text: "Market benchmarking", premium: true },
        { included: false, text: "Multiple quote comparison", premium: true },
      ],
      limitations: [
        "Basic overview only",
        "No red flags/questions",
        "No PDF downloads"
      ],
      bestFor: "Quick checks, basic validation"
    },
    {
      name: "Standard",
      tier: "standard",
      tagline: "One-time payment for 1 professional analysis",
      price: "7.99",
      period: "per payment",
      popular: true,
      color: "from-orange-500 to-amber-600",
      textColor: "text-orange-600",
      border: "border-orange-300",
      button: "from-orange-500 to-amber-600 hover:shadow-orange-500/30 text-white",
      cta: "Buy 1 Report",
      icon: <Zap className="w-6 h-6" />,
      features: [
        { included: true, text: "Complete AI analysis (Standard Tier)" },
        { included: true, text: "Detailed cost breakdown" },
        { included: true, text: "Market rate benchmarking" },
        { included: true, text: "Advanced recommendations" },
        { included: true, text: "Red Flag detection" },
        { included: true, text: "Standard PDF export" },
        { included: true, text: "Save & organize quotes" },
        { included: false, text: "Multiple quote comparison", premium: true },
        { included: false, text: "Priority 24h processing", premium: true },
      ],
      savings: "Reverts to Free after use",
      included: "Everything in Free, plus:",
      bestFor: "Single quotes, detailed analysis"
    },
    {
      name: "Premium",
      tier: "premium",
      tagline: "Total control over complex projects",
      price: "9.99",
      period: "per payment",
      popular: false,
      color: "from-black to-gray-900",
      textColor: "text-black",
      border: "border-gray-800",
      button: "bg-black hover:bg-gray-900 text-white",
      cta: "Buy 1 Report",
      icon: <Crown className="w-6 h-6" />,
      features: [
        { included: true, text: "Comprehensive AI Analysis (3 included)" },
        { included: true, text: "Compare 3 quotes side-by-side" },
        { included: true, text: "Market rate benchmarking" },
        { included: true, text: "Advanced recommendations" },
        { included: true, text: "Priority 24h processing" },
        { included: true, text: "Bulk upload (up to 3 quotes)" },
        { included: true, text: "Detailed cost breakdown" },
        { included: true, text: "Export to spreadsheet" },
        { included: true, text: "Multiple quote comparison" },
      ],
      savings: "Reverts to Free after 3 uses",
      included: "Everything in Standard, plus:",
      bestFor: "Multiple quotes, complex projects"
    }
  ];

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const apiUrl = `${import.meta.env.VITE_API_BASE}/api/v1/pricing`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        // Merge API data with static visual metadata
        const mergedPlans = staticPlans.map(staticPlan => {
          const apiPlan = result.data.find(p => p.tier === staticPlan.tier);
          if (apiPlan) {
            return {
              ...staticPlan,
              name: apiPlan.name,
              price: apiPlan.price.toString(),
              description: apiPlan.description || staticPlan.tagline,
              // If API has features, maybe use them, but static ones are more detailed for UI
              features: apiPlan.features && apiPlan.features.length > 0
                ? staticPlan.features // keep static ones for icons, or merge if needed
                : staticPlan.features
            };
          }
          return staticPlan;
        });
        setPlans(mergedPlans);
      } else {
        setPlans(staticPlans);
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
      setPlans(staticPlans);
    } finally {
      setLoading(false);
    }
  };
  const handlePlanSelect = (planInput) => {
    // Handle both object (from desktop cards) and string (from mobile buttons)
    const plan = typeof planInput === 'string'
      ? plans.find(p => p.name === planInput) || { name: planInput }
      : planInput;

    if (plan.name === "Free") {
      // Free plan - redirect to upload or dashboard
      navigate('/check-quote');
      return;
    }

    // ALLOW GUEST: User can proceed to Check Quote even if not logged in
    // We will handle auth/payment there

    /* REMOVED: Strict auth check
    if (!user) {
      requestLogin('/pricing');
      return;
    }
    */

    // CHECK: User already has this plan with credits
    if (user && user.subscription && user.subscription.plan === plan.name && user.subscription.credits > 0) {
      // Use Swal for a nice modal as requested
      import('sweetalert2').then(({ default: Swal }) => {
        Swal.fire({
          title: 'Standard Tier Active',
          text: 'You have an active Standard analysis available. Start your technical review now!',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Start Analysis',
          cancelButtonText: 'Buy Another',
          confirmButtonColor: '#ea580c',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/check-quote');
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // User wants to buy more, proceed
            proceedToSelection(plan);
          }
        });
      });
      return;
    }

    proceedToSelection(plan);
  };

  const proceedToSelection = (plan) => {
    // NEW FLOW: Store tier selection and navigate to Check Quote page
    sessionStorage.setItem('selectedPricingTier', JSON.stringify({
      tier: plan.name,
      price: plan.price
    }));

    toast.success(`${plan.name} plan selected! Upload your quote to continue.`);
    navigate('/check-quote');
  };


  const handleDiscountClick = (discount) => {
    setSelectedRedemptionDiscount(discount);
    setShowRedemptionModal(true);
  };

  const handleRedemptionSelect = (planName, code) => {
    setShowRedemptionModal(false);
    // Find the full plan object
    const plan = plans.find(p => p.name === planName) || { name: planName };

    // Set payment state
    setSelectedPlanForPayment(plan);
    setPrefilledDiscountCode(code);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const tierMap = {
        'Standard': 'Standard',
        'Premium': 'Premium'
      };
      const tier = tierMap[selectedPlanForPayment?.name] || 'Standard';

      await paymentApi.mockUpgrade(tier);
      await refreshUser();

      console.log("Upgrade successful!");
      // Modal closes itself via its own timer calling onClose, but we can double check logic
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };


  const tableData = [
    { feature: "AI Overview Summary", Free: "✓", Standard: "✓", Premium: "✓" },
    { feature: "Fair Price Verdict", Free: "✓", Standard: "✓", Premium: "✓" },
    { feature: "Red Flag Detection", Free: "—", Standard: "✓", Premium: "✓" },
    { feature: "Sectioned Questions to Ask", Free: "—", Standard: "✓", Premium: "✓" },
    { feature: "Detailed Cost Breakdown", Free: "—", Standard: "✓", Premium: "✓" },
    { feature: "Professional PDF Export", Free: "—", Standard: "✓", Premium: "✓" },
    { feature: "Market Rate Benchmarking", Free: "—", Standard: "✓", Premium: "✓" },
    { feature: "Advanced Recommendations", Free: "—", Standard: "✓", Premium: "✓" },
    { feature: "Multiple Quote Comparison", Free: "—", Standard: "—", Premium: "✓" },
    { feature: "Bulk Upload (Up to 3 quotes)", Free: "—", Standard: "—", Premium: "✓" }
  ];

  const useCases = [
    {
      plan: "Free",
      title: "Small Home Repairs",
      description: "Quick validation for minor fixes like painting, plumbing, or electrical work under $1,000.",
      color: "border-gray-200 hover:border-gray-300"
    },
    {
      plan: "Free",
      title: "Initial Quote Screening",
      description: "Get a basic read on pricing before committing to detailed analysis.",
      color: "border-gray-200 hover:border-gray-300"
    },
    {
      plan: "Standard",
      title: "Kitchen Renovation",
      description: "Detailed analysis of major renovation quotes with itemized breakdowns.",
      color: "border-orange-200 hover:border-orange-300"
    },
    {
      plan: "Standard",
      title: "Bathroom Remodel",
      description: "Complete assessment of materials, labor, and hidden costs.",
      color: "border-orange-200 hover:border-orange-300"
    },
    {
      plan: "Standard",
      title: "Roof Replacement",
      description: "Ensure fair pricing for high-cost projects with specialized materials.",
      color: "border-orange-200 hover:border-orange-300"
    },
    {
      plan: "Standard",
      title: "Home Addition",
      description: "Validate complex quotes with multiple trades and extended timelines.",
      color: "border-orange-200 hover:border-orange-300"
    },
    {
      plan: "Standard",
      title: "Multiple Contractor Quotes",
      description: "Compare 3 different bids for the same project to find the best value.",
      color: "border-gray-800 hover:border-black"
    },
    {
      plan: "Premium",
      title: "Whole House Renovation",
      description: "Coordinate multiple trades with timeline and budget optimization.",
      color: "border-gray-800 hover:border-black"
    }
  ];

  // Cycle discounts automatically
  useEffect(() => {
    if (activeDiscounts.length > 1) {
      const interval = setInterval(() => {
        setCurrentDiscountIndex((prev) => (prev + 1) % activeDiscounts.length);
      }, 5000); // Change every 5 seconds
      return () => clearInterval(interval);
    }
  }, [activeDiscounts]);

  const activeDiscount = activeDiscounts.length > 0 ? activeDiscounts[currentDiscountIndex] : null;

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Homeowner, Kitchen Reno",
      quote: "The Standard plan saved me $4,200 on my kitchen renovation by identifying overpriced materials.",
      savings: "Saved $4,200",
      plan: "Standard"
    },
    {
      name: "James & Lisa T.",
      role: "First-time Homeowners",
      quote: "Premium comparison showed us which bathroom quote was inflating labor costs by 30%.",
      savings: "Saved $3,500",
      plan: "Premium Plan"
    },
    {
      name: "Michael R.",
      role: "Property Investor",
      quote: "Used Free to screen 5 roof quotes, then Standard for detailed analysis. Worth every penny.",
      savings: "Saved $8,700",
      plan: "Both Plans"
    }
  ];

  const faqs = [
    {
      question: "What's the difference between Free and Standard?",
      answer: "Free gives you a basic overview and a price verdict. Standard provides deep analysis including red flags, a line-by-line cost breakdown, and professional PDF reports."
    },
    {
      question: "Do I need to sign up to use the free Free plan?",
      answer: "No, you can upload and analyze quotes instantly without creating an account. Signup is only required to save your reports."
    },
    {
      question: "How do payments work?",
      answer: "You pay per report. Standard is $7.99 per quote analysis, Premium is $9.99 for multiple quote comparison. One-time payment, no subscriptions."
    },
    {
      question: "What if I'm not satisfied with my report?",
      answer: "We offer a 30-day money-back guarantee. If our analysis doesn't provide value, we'll refund your payment."
    },
    {
      question: "Can I upgrade from Standard to Premium?",
      answer: "Yes, you can upgrade any report to Premium for the price difference within 7 days of purchase."
    },
    {
      question: "How long does analysis take?",
      answer: "Free reports are instant. Standard reports are typically ready within 24 hours. Premium with 24h priority is usually within 4-6 hours."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <DiscountRedemptionModal
        isOpen={showRedemptionModal}
        onClose={() => setShowRedemptionModal(false)}
        discount={selectedRedemptionDiscount}
        onSelectPlan={handleRedemptionSelect}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlanForPayment?.name}
        price={selectedPlanForPayment?.price}
        initialDiscountCode={prefilledDiscountCode}
        onSuccess={handlePaymentSuccess}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-orange-50 to-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            NO SUBSCRIPTIONS, PAY PER REPORT
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-black">Simple, Transparent</span>
            <span className="text-orange-600"> Pricing</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Pay only for what you need. Start free, upgrade when you need detailed analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {activeDiscount ? (
              <div className="animate-fade-in-up w-full max-w-md mx-auto mb-2">
                <div className="bg-white border-2 border-orange-100 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-orange-200 transition-all cursor-pointer" onClick={() => handleDiscountClick(activeDiscount)}>
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    LIMITED TIME
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-orange-50 p-3 rounded-xl flex-shrink-0">
                      <Inbox className="w-6 h-6 text-orange-600" />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 truncate">
                        Special Offer
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Valid until {activeDiscount.expiresAt ? new Date(activeDiscount.expiresAt).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' }) : 'Forever'}</span>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 truncate">
                        {activeDiscount.description || `Get ${activeDiscount.type === 'percentage' ? activeDiscount.value + '%' : '$' + activeDiscount.value} off!`}
                      </p>

                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1.5 border border-gray-200 border-dashed">
                        <Tag className="w-4 h-4 text-gray-400 ml-2" />
                        <code className="flex-1 font-mono font-bold text-gray-800 tracking-wide text-lg text-center">
                          {activeDiscount.code}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(activeDiscount.code);
                          }}
                          className="bg-black hover:bg-gray-800 text-white p-2 rounded-md transition-colors z-20"
                          title="Copy Code"
                        >
                          {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Discounts Indicator */}
                  {activeDiscounts.length > 1 && (
                    <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 pb-1">
                      {activeDiscounts.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentDiscountIndex ? 'bg-orange-500' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 text-center">
                  <Link
                    to="/check-quote"
                    className="inline-flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors"
                  >
                    Check a Quote Free
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                to="/check-quote"
                className="group px-8 py-4 bg-black text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
              >
                Check a Quote Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${hoveredPlan === index ? 'transform scale-105 shadow-2xl' : 'shadow-lg'
                  } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  } ${plan.popular
                    ? 'border-2 border-orange-500 bg-white'
                    : 'border border-gray-200 bg-white'
                  }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                      <Star className="w-4 h-4 fill-white" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {plan.name === "Premium" && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                      <Crown className="w-4 h-4" />
                      BEST VALUE
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.name === "Free" ? 'bg-gray-100 text-gray-700' :
                      plan.name === "Standard" ? 'bg-orange-100 text-orange-600' :
                        'bg-black text-white'
                      }`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="my-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-900">$</span>
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    </div>
                    <div className="text-gray-600 mt-2 text-sm">{plan.period}</div>
                    {plan.savings && (
                      <div className="text-orange-600 text-sm font-medium mt-2">
                        {plan.savings}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  {plan.name === "Free" ? (
                    <Link
                      to="/check-quote"
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${plan.name === "Standard"
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-xl hover:shadow-orange-500/30 text-white'
                        : 'bg-black hover:bg-gray-900 text-white'
                        }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.included && (
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {plan.included}
                    </div>
                  )}

                  {plan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg ${feature.included
                        ? feature.premium
                          ? 'bg-orange-50'
                          : 'bg-gray-50'
                        : 'opacity-50'
                        }`}
                    >
                      {feature.included ? (
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 ${feature.premium ? 'text-orange-500' : 'text-green-500'
                          }`} />
                      ) : (
                        <XCircle className="w-5 h-5 flex-shrink-0 text-gray-300" />
                      )}
                      <span className={`text-sm ${feature.premium ? 'font-medium text-orange-700' : ''}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Best For & Limitations */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="mb-3">
                    <div className="text-sm font-bold text-gray-700 mb-1">Best for:</div>
                    <div className="text-sm text-gray-600">{plan.bestFor}</div>
                  </div>

                  {plan.limitations && (
                    <div>
                      <div className="text-sm font-bold text-gray-700 mb-1">Limitations:</div>
                      <ul className="space-y-1">
                        {plan.limitations.map((limit, idx) => (
                          <li key={idx} className="text-sm text-gray-500 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            {limit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare All Features</h2>
            <p className="text-gray-600">See exactly what you get with each plan</p>
          </div>

          {/* Desktop Table (full width on desktop) */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="text-left p-6 font-bold">Feature</th>
                  <th className="text-center p-6 font-bold">Free</th>
                  <th className="text-center p-6 font-bold bg-orange-500">Standard</th>
                  <th className="text-center p-6 font-bold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="p-6 font-medium text-gray-900">{row.feature}</td>
                    <td className="text-center p-6">
                      <span className={row.Free === "✓" ? "text-green-600 font-bold" : "text-gray-400"}>
                        {row.Free}
                      </span>
                    </td>
                    <td className="text-center p-6 bg-orange-50">
                      <span className={row.Standard === "✓" ? "text-orange-600 font-bold" : "text-gray-400"}>
                        {row.Standard}
                      </span>
                    </td>
                    <td className="text-center p-6">
                      <span className={row.Premium === "✓" ? "text-black font-bold" : "text-gray-400"}>
                        {row.Premium}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Scrollable Table */}
          <div className="lg:hidden">
            {/* Scroll Indicator */}
            <div className="flex justify-center mb-3">
              <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Scroll horizontally to compare</span>
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Scrollable Container with Complete Table */}
            <div className="relative">
              <div className="overflow-x-auto rounded-2xl shadow-lg">
                <div className="min-w-[700px] bg-white">
                  {/* Table Headers */}
                  <div className="grid grid-cols-4 border-b-2 border-gray-200">
                    <div className="p-4 bg-black text-white font-bold text-left">
                      Feature
                    </div>
                    <div className="p-4 bg-black text-white font-bold text-center">
                      Free
                    </div>
                    <div className="p-4 bg-orange-500 text-white font-bold text-center">
                      Standard
                    </div>
                    <div className="p-4 bg-black text-white font-bold text-center">
                      Premium
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50">
                    <div className="p-3 text-sm text-gray-500 font-medium">
                      Price
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">$0</div>
                      <div className="text-xs text-gray-500">Pay nothing</div>
                    </div>
                    <div className="p-3 text-center bg-orange-50">
                      <div className="text-2xl font-bold text-orange-600">$7.99</div>
                      <div className="text-xs text-orange-500">Per Report</div>
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">$9.99</div>
                      <div className="text-xs text-gray-500">For 3 Reports</div>
                    </div>
                  </div>

                  {/* Features Rows */}
                  {tableData.map((row, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-4 border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      {/* Feature Column */}
                      <div className="p-4 font-medium text-gray-900 text-sm flex items-center">
                        {row.feature}
                      </div>

                      {/* Free Column */}
                      <div className="p-4 flex items-center justify-center">
                        <span className={row.Free === "✓" ? "text-green-600 font-bold text-xl" : "text-gray-400 text-xl"}>
                          {row.Free}
                        </span>
                      </div>

                      {/* Standard Column */}
                      <div className="p-4 bg-orange-50 flex items-center justify-center">
                        <span className={row.Standard === "✓" ? "text-orange-600 font-bold text-xl" : "text-gray-400 text-xl"}>
                          {row.Standard}
                        </span>
                      </div>

                      {/* Premium Column */}
                      <div className="p-4 flex items-center justify-center">
                        <span className={row.Premium === "✓" ? "text-black font-bold text-xl" : "text-gray-400 text-xl"}>
                          {row.Premium}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile CTA Buttons */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Link
                  to="/check-quote"
                  className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold py-3 px-2 rounded-lg text-center transition-colors"
                >
                  Start Free
                </Link>
                <button
                  onClick={() => handlePlanSelect('Standard')}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-bold py-3 px-2 rounded-lg text-center transition-all"
                >
                  Try Pro
                </button>
                <button
                  onClick={() => handlePlanSelect('Premium')}
                  className="bg-black hover:bg-gray-900 text-white text-sm font-bold py-3 px-2 rounded-lg text-center transition-colors"
                >
                  Go Premium
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Perfect Plan For Every Project</h2>
            <p className="text-gray-600">Choose based on your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 border-2 transition-all hover:shadow-lg ${useCase.color}`}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${useCase.plan === "Free" ? 'bg-gray-100 text-gray-700' :
                  useCase.plan === "Standard" ? 'bg-orange-100 text-orange-700' :
                    'bg-black text-white'
                  }`}>
                  {useCase.plan}
                </div>
                <h3 className="font-bold text-xl mb-3">{useCase.title}</h3>
                <p className="text-gray-600 mb-4">{useCase.description}</p>
                {useCase.plan === "Free" ? (
                  <Link
                    to="/check-quote"
                    className="inline-flex items-center text-sm font-medium text-gray-700"
                  >
                    Get started <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <button
                    onClick={() => handlePlanSelect(useCase.plan.toLowerCase())}
                    className={`inline-flex items-center text-sm font-medium ${useCase.plan === "Standard" ? 'text-orange-600' : 'text-gray-700'
                      }`}
                  >
                    Get started <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
              REAL SAVINGS, REAL RESULTS
            </div>
            <h2 className="text-3xl font-bold mb-4">Join Thousands of Happy Homeowners</h2>
            <p className="text-gray-600">See how our plans help save money on renovations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${testimonial.plan.includes("Standard") ? 'bg-orange-100 text-orange-700' :
                    testimonial.plan.includes("Premium") ? 'bg-gray-100 text-gray-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {testimonial.plan}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">{testimonial.savings}</div>
                  <div className="flex gap-1 text-orange-500">
                    <Star className="w-5 h-5 fill-orange-500" />
                    <Star className="w-5 h-5 fill-orange-500" />
                    <Star className="w-5 h-5 fill-orange-500" />
                    <Star className="w-5 h-5 fill-orange-500" />
                    <Star className="w-5 h-5 fill-orange-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Got questions? We've got answers</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            READY TO GET STARTED?
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Start Your Free Quote Check
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Upload your first quote now - no signup required for basic analysis
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/upload"
              className="group px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span className="relative z-10">Check a Quote Free</span>
              <ArrowRight className="inline-block w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPlanForPayment(null);
        }}
        plan={selectedPlanForPayment?.name}
        price={selectedPlanForPayment?.price && parseFloat(selectedPlanForPayment.price.replace('$', ''))}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Pricing;