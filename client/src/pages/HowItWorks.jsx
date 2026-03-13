import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Brain, FileCheck, ArrowRight, CheckCircle2, Clock, Shield, DollarSign, Sparkles, TrendingUp, Users, FileText } from 'lucide-react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const steps = [
    {
      id: 1,
      icon: <Upload className="w-12 h-12" />,
      title: "Upload Your Quote",
      description: "Simply paste the text from your quote or upload a photo/PDF. It takes less than 30 seconds and works with any type of tradie quote - plumbing, electrical, building, landscaping, you name it.",
      details: [
        "Drag & drop PDF files up to 10MB",
        "Paste quote text directly",
        "Upload photos of paper quotes",
        "Works with all tradie types"
      ],
      gradient: "from-orange-400 via-orange-500 to-amber-500"
    },
    {
      id: 2,
      icon: <Brain className="w-12 h-12" />,
      title: "AI Analysis",
      description: "Our smart AI reviews your quote against thousands of Australian tradie quotes, checking for fair pricing, hidden costs, and potential red flags. We break down the labour, materials, and extras in plain English.",
      details: [
        "Compares against Australian market rates",
        "Identifies hidden costs & red flags",
        "Analyzes labor vs material breakdown",
        "Results ready in seconds"
      ],
      gradient: "from-amber-500 via-orange-500 to-orange-400"
    },
    {
      id: 3,
      icon: <FileCheck className="w-12 h-12" />,
      title: "Get Your Results",
      description: "Receive an easy-to-understand report showing if your quote is fair, what questions to ask your tradie, and any concerns to address before signing. You'll feel confident making the right decision.",
      details: [
        "Clear pricing analysis & verdict",
        "Red flags highlighted",
        "Questions to ask your tradie",
        "Confidence score & recommendations"
      ],
      gradient: "from-orange-500 to-amber-600"
    }
  ];

  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Fast Results",
      description: "Get your detailed analysis in less than 60 seconds"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Private",
      description: "Your quote data is encrypted and automatically deleted after 90 days"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Flexible Pricing",
      description: "From $7.99 AUD per report, or $9.99 for 3 reports - no subscriptions"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Satisfaction Guaranteed",
      description: "7-day money-back guarantee if you're not completely satisfied"
    }
  ];

  const benefits = [
    {
      title: "Save Money",
      description: "Average user saves $1,200+ on their quotes",
      icon: <TrendingUp className="w-8 h-8" />
    },
    {
      title: "Build Confidence",
      description: "Make informed decisions with clear insights",
      icon: <Users className="w-8 h-8" />
    },
    {
      title: "Avoid Mistakes",
      description: "Spot hidden costs and unfair pricing before signing",
      icon: <FileText className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-orange-300 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-amber-400 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-6 tracking-wide">
            SIMPLE PROCESS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
            How MyQuoteMate Works
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto">
            Getting clarity on your tradie quote is as easy as 1-2-3
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 mb-16 sm:mb-20">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <div className="text-orange-500">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`mb-16 sm:mb-20 last:mb-0 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                {/* Content Side */}
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  {/* Step Badge */}
                  <div className="inline-flex items-center gap-4 sm:gap-6 mb-6">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r ${step.gradient} flex items-center justify-center text-white shadow-lg`}>
                        {step.icon}
                      </div>
                    </div>
                    <div className="text-5xl sm:text-6xl font-bold text-orange-600">
                      0{step.id}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
                    {step.title}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Details List */}
                  <ul className="space-y-3 mb-8">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Progress Indicator */}
                  {index < steps.length - 1 && (
                    <div className="flex items-center gap-2 text-orange-500">
                      <span className="text-sm font-medium">Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Image/Visual Side */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative group">
                    {/* Decorative background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-10 rounded-3xl blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 hover:border-orange-300 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-100/50">
                      <div className="aspect-video bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-2xl flex items-center justify-center">
                        <div className={`relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center opacity-90`}>
                          <div className="absolute -inset-4 bg-gradient-to-r from-orange-300 to-amber-400 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                          <div className="relative text-white">
                            {step.icon}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-4 tracking-wide">
              WHY CHOOSE US
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
              Trusted by Australian Homeowners
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="relative bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-6 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100/30">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-orange-500">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
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
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HowItWorks;