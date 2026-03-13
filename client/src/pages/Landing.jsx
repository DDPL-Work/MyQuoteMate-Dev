import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, CheckCircle, Shield, Clock, DollarSign, FileText, AlertTriangle, HelpCircle, ArrowRight, Star, TrendingUp, Users, Sparkles } from 'lucide-react';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Pricing Analysis",
      description: "Compare your quote against thousands of Australian tradie quotes to see if pricing is fair"
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Red Flag Detection",
      description: "Identify hidden costs, unclear pricing, and potential issues before you sign"
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: "Questions to Ask",
      description: "Get a tailored list of important questions to ask your tradie"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "What Looks Good",
      description: "Understand which parts of your quote are transparent and fair"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Detailed Breakdown",
      description: "Clear separation of labour costs, materials, and extras in plain English"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Confidence Score",
      description: "Overall clarity, completeness, and fairness ratings for your quote"
    }
  ];

  const steps = [
    {
      number: "01",
      icon: <Upload className="w-8 h-8" />,
      title: "Upload Your Quote",
      description: "Simply paste the text from your quote or upload a photo/PDF. It takes less than 30 seconds and works with any type of tradie quote - plumbing, electrical, building, landscaping, you name it."
    },
    {
      number: "02",
      icon: <Search className="w-8 h-8" />,
      title: "AI Analysis",
      description: "Our smart AI reviews your quote against thousands of Australian tradie quotes, checking for fair pricing, hidden costs, and potential red flags. We break down the labour, materials, and extras in plain English."
    },
    {
      number: "03",
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Get Your Results",
      description: "Receive an easy-to-understand report showing if your quote is fair, what questions to ask your tradie, and any concerns to address before signing. You'll feel confident making the right decision."
    }
  ];

  const trustIndicators = [
    { icon: <Clock className="w-5 h-5" />, text: "Results in seconds" },
    { icon: <Shield className="w-5 h-5" />, text: "Data encrypted & secure" },
    { icon: <DollarSign className="w-5 h-5" />, text: "Tier features for Quotation" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Trusted by Australians" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Homeowner, Sydney",
      text: "Saved me $2,500 on my bathroom renovation. The red flag detection was spot on!",
      rating: 5
    },
    {
      name: "Michael T.",
      role: "First-time Buyer, Melbourne",
      text: "Gave me the confidence to negotiate better terms. Essential for any homeowner!",
      rating: 5
    },
    {
      name: "Lisa R.",
      role: "Property Investor, Brisbane",
      text: "The detailed breakdown helped me understand what I was actually paying for.",
      rating: 5
    }
  ];

  const stats = [
    { value: "10,000+", label: "Quotes Analyzed", icon: <TrendingUp className="w-4 h-4" /> },
    { value: "$4.2M+", label: "Potential Savings", icon: <DollarSign className="w-4 h-4" /> },
    { value: "98%", label: "Satisfaction Rate", icon: <Star className="w-4 h-4" /> },
    { value: "5,000+", label: "Happy Customers", icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white pt-16 sm:pt-20 lg:pt-24">
        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Australia Background */}
          <div className="absolute inset-0 bg-[url('/Australia2.jpg')] bg-cover bg-center opacity-15"></div>

          {/* Orangish Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-white/50 to-white/20"></div>

          {/* Refined floating orbs */}
          <div className="absolute -top-40 -right-40 w-80 h-80 sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-orange-200/30 to-amber-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-orange-100/20 to-amber-200/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-20 pb-16 sm:pb-20 lg:pb-24">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-full mb-6 sm:mb-8 backdrop-blur-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-orange-600 text-sm font-semibold tracking-wide">TRUSTED BY AUSTRALIAN HOMEOWNERS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight px-2">
              <span className="block text-gray-900">Not sure if your </span>
              <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent block mt-1 sm:mt-2">
                Tradie quote is fair?
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 font-light leading-relaxed">
              Upload it and we'll explain it before you accept
            </p>

            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
              Get instant AI-powered analysis of your plumbing, electrical, building, or renovation quote.
              Know exactly what you're paying for and what questions to ask.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-10 px-4">
              <Link
                to="/check-quote"
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-orange-500/20 w-full sm:w-auto"
              >
                <span className="relative z-10">Check Your Quote Now</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-700 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                to="/how-it-works"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl sm:rounded-2xl font-medium text-base sm:text-lg hover:border-orange-300 hover:text-orange-600 transition-all duration-300 w-full sm:w-auto text-center"
              >
                See How It Works
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto px-4 mt-8 sm:mt-12">
              {trustIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4 rounded-xl border border-gray-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="text-orange-500 bg-orange-50 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
                    {indicator.icon}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-bold leading-tight uppercase tracking-wider">{indicator.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <div className="text-orange-500 bg-orange-50 p-1.5 rounded-lg">
                    {stat.icon}
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {stat.value}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 tracking-wide">
              SIMPLE PROCESS
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 tracking-tight">
              How It Works in 3 Steps
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Get clarity on your tradie quote quickly and easily
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative">
            {/* Connection line for desktop */}
            <div className="hidden lg:block absolute top-1/3 left-0 right-0 transform -translate-y-1/2">
              <div className="h-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent rounded-full"></div>
            </div>

            {steps.map((step, index) => (
              <div
                key={index}
                className="relative group"
              >
                {/* Step Card */}
                <div className="relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 transform hover:-translate-y-1">
                  {/* Step Number Badge */}
                  <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                      <span className="text-gray-800 font-bold text-lg sm:text-xl lg:text-2xl">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-4 sm:mb-6 mt-4 sm:mt-6">
                    <div className="relative">
                      <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform duration-300 border border-orange-100">
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center text-gray-900 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile/tablet */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4 sm:my-6">
                    <div className="relative">
                      <ArrowRight className="w-6 h-6 text-orange-400 transform rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section with Carousel */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 tracking-wide">
              COMPREHENSIVE REPORT
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 tracking-tight">
              Your Detailed Quote Analysis
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to make an informed decision
            </p>
          </div>

          {/* Mobile Carousel Indicators */}
          <div className="lg:hidden flex justify-center gap-2 mb-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${activeFeature === index ? 'bg-orange-500 w-8' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>

          <div className="hidden lg:grid lg:grid-cols-2 lg:grid-rows-3 lg:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="relative bg-gradient-to-b from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100/30 h-full">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform duration-300 border border-orange-100">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="lg:hidden space-y-6">
            <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:border-orange-300 transition-all duration-300 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg flex items-center justify-center text-orange-500 border border-orange-100">
                    {features[activeFeature].icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {features[activeFeature].description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveFeature((prev) => (prev - 1 + features.length) % features.length)}
                className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setActiveFeature((prev) => (prev + 1) % features.length)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Next Feature
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-orange-500 to-amber-600 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-80 sm:h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-80 sm:h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 text-white rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 backdrop-blur-sm">
            GET STARTED TODAY
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 text-white tracking-tight">
            Get Instant Clarity on Your Quote
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Upload your tradie quote and get a comprehensive analysis in seconds
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-10 sm:mb-12">
            <Link
              to="/check-quote"
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-orange-700/30 w-full sm:w-auto"
            >
              <span className="relative z-10">Analyze Your Quote</span>
              <ArrowRight className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/pricing"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white border-2 border-white/30 rounded-xl sm:rounded-2xl font-medium text-base sm:text-lg hover:bg-white/10 transition-all duration-300 w-full sm:w-auto text-center"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Add custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Landing;