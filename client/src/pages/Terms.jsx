import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  X,
  Zap,
  Eye,
  Lock,
  ArrowRight,
  ChevronRight,
  Scale,
  Activity,
  UserCheck,
  Target,
  Search,
  BookOpen,
  Mail,
  Globe,
  Sparkles
} from 'lucide-react';

const Terms = ({ isModal = false, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const contentRef = React.useRef(null);

  useEffect(() => {
    setIsVisible(true);
    if (!isModal) window.scrollTo(0, 0);
  }, [isModal]);

  const termsSections = [
    {
      id: 'agreement',
      title: '1. Agreement',
      icon: <CheckCircle2 className="w-8 h-8" />,
      color: "orange",
      description: "By accessing, using, or purchasing from MyQuoteMate, you agree to these Terms and the Privacy Notice below.",
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-8 rounded-r-[2rem] shadow-sm transform transition-all hover:scale-[1.02]">
            <div className="flex items-start gap-6">
              <Scale className="w-8 h-8 text-orange-600 mt-1 flex-shrink-0" />
              <p className="text-orange-900 font-bold text-xl leading-relaxed">These Terms constitute a legally binding agreement. Please read them carefully to understand your rights and obligations.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'provision',
      title: '2. Service Provision',
      icon: <Activity className="w-8 h-8" />,
      color: "amber",
      description: "MyQuoteMate provides automated summaries and comparison matrices for tradie quotes you submit.",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-white border border-orange-100 rounded-[2.5rem] shadow-xl shadow-orange-900/5 hover:-translate-y-2 transition-all duration-500 border-b-8 border-b-orange-500 group">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:rotate-6 transition-transform">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-2xl mb-4 tracking-tight">Automated Summary</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Quickly digest complex quotes with structured, AI-driven summaries that highlight what matters most.</p>
            </div>
            <div className="p-8 bg-white border border-amber-100 rounded-[2.5rem] shadow-xl shadow-amber-900/5 hover:-translate-y-2 transition-all duration-500 border-b-8 border-b-amber-500 group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600 group-hover:-rotate-6 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-2xl mb-4 tracking-tight">Comparison Matrix</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Professional side-by-side analysis of inclusions, exclusions, and pricing tiers across different providers.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'advice',
      title: '3. Not Professional Advice',
      icon: <AlertTriangle className="w-8 h-8" />,
      color: "red",
      description: "Our reports are for informational purposes only and do not replace professional trade or legal advice.",
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-100 rounded-[3rem] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <AlertTriangle className="w-32 h-32 text-red-600" />
            </div>
            <h4 className="font-bold text-red-900 text-2xl mb-8 flex items-center gap-4 relative z-10">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> Explicit Disclaimers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {[
                'No Legal or Financial Advice',
                'No Building or Engineering Advice',
                'No Safety or Compliance Certification',
                'No Professional Trade Advice'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-red-800 font-bold bg-white/50 p-4 rounded-2xl border border-red-100/50">
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'verify',
      title: '4. Your Responsibility',
      icon: <UserCheck className="w-8 h-8" />,
      color: "orange",
      description: "You are solely responsible for verifying and deciding on any work, engagement, or payment.",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              'Confirming scope, specifications, and assumptions',
              'Confirming licensing and insurances of any tradie',
              'Checking permits, compliance, and standards',
              'Validating pricing, quantities, and variations',
              'Conducting due diligence before accepting any quote'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-orange-200 transition-all group shadow-sm hover:shadow-xl hover:shadow-orange-900/5">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-all font-bold text-orange-600 text-xl">
                  {i + 1}
                </div>
                <p className="text-gray-800 font-bold text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'tradies',
      title: '5. Tradie Disputes',
      icon: <Users className="w-8 h-8" />,
      color: "gray",
      description: "MyQuoteMate is not a party to any contract or dispute between you and any tradie.",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-950 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-orange-600/20 transition-all duration-1000"></div>
            <h3 className="text-3xl font-bold mb-8 flex items-center gap-4 tracking-tight italic">
              <Users className="w-10 h-10 text-orange-500" /> Professional Independence
            </h3>
            <p className="text-gray-400 text-xl font-medium leading-relaxed mb-8 max-w-2xl">
              You agree MyQuoteMate is not responsible for tradie conduct or outcomes, including <span className="text-white font-bold underline decoration-orange-500/50 decoration-4 underline-offset-8">defects, delays, cancellations, cost overruns, or variations.</span>
            </p>
            <div className="flex items-center gap-3 py-4 px-6 bg-white/5 border border-white/10 rounded-2xl w-fit">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold tracking-widest uppercase text-gray-300">Liability Shield Active</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'limitations',
      title: '6. AI Limitations',
      icon: <Target className="w-8 h-8" />,
      color: "amber",
      description: "Reports depend on user input and AI analysis, which may occasionally miss context.",
      content: (
        <div className="space-y-6">
          <div className="p-10 bg-amber-50 border-2 border-dashed border-amber-200 rounded-[3rem] shadow-inner">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center flex-shrink-0 text-amber-600 shadow-xl shadow-amber-900/10 animate-float">
                <Zap className="w-12 h-12" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-amber-950 mb-4 tracking-tight italic">Independent Verification</h3>
                <p className="text-amber-900 font-bold text-xl leading-relaxed opacity-80">You agree to independently verify critical details and not rely solely on the automated report for major decisions.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'liability',
      title: '7. Limitation of Liability',
      icon: <Shield className="w-8 h-8" />,
      color: "orange",
      description: "Our liability is limited to the maximum extent permitted by Australian law.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Service use or report reliance',
              'Engagement decisions',
              'Quote errors or statements',
              'Project or compliance issues'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-orange-300 hover:shadow-xl transition-all group">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-gray-800 font-bold text-sm tracking-tight">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-8 bg-orange-500 rounded-[2.5rem] text-white font-bold text-center shadow-2xl italic tracking-tight text-xl">
            "Liability is limited to resupplying the service or refunding the specific amount paid."
          </div>
        </div>
      )
    },
    {
      id: 'refunds',
      title: '8. Refunds & Delivery',
      icon: <DollarSign className="w-8 h-8" />,
      color: "green",
      description: "Digital reports are delivered immediately, and purchases are generally non-refundable.",
      content: (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-10 p-12 bg-white border border-gray-100 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl -mr-24 -mb-24"></div>
            <div className="w-24 h-24 bg-green-100 rounded-[2.5rem] flex items-center justify-center flex-shrink-0 text-green-600 shadow-xl shadow-green-900/10 rotate-12 group-hover:rotate-0 transition-transform">
              <DollarSign className="w-12 h-12" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold text-gray-950 mb-4 tracking-tight">Australian Consumer Law</h3>
              <p className="text-gray-500 text-2xl font-medium leading-tight">Refunds are issued where required by <span className="text-green-600 font-bold">ACL</span> (e.g., major failures or non-supply).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      title: '9. Acceptable Use',
      icon: <Lock className="w-8 h-8" />,
      color: "red",
      description: "Users must use the service lawfully and not attempt to bypass platform security.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'No unauthorized content',
              'No unlawful purposes',
              'No scraping or reverse engineering',
              'No malicious code or abuse'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 p-6 bg-red-50/50 border border-red-100 rounded-3xl group hover:bg-red-50 transition-all">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-lg group-hover:scale-110 transition-transform">
                  <X className="w-6 h-6" strokeWidth={3} />
                </div>
                <span className="text-red-950 font-bold text-sm tracking-tight uppercase">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'ip',
      title: '10. Intellectual Property',
      icon: <BookOpen className="w-8 h-8" />,
      color: "orange",
      description: "All branding and report formats are owned by MyQuoteMate or its licensors.",
      content: (
        <div className="space-y-8">
          <div className="relative p-12 bg-gradient-to-br from-orange-600 to-amber-700 rounded-[4rem] text-white shadow-2xl overflow-hidden group">
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            <BookOpen className="w-16 h-16 mb-8 text-orange-200" />
            <h3 className="text-4xl font-bold mb-6 tracking-tight italic">Personal Usage Only</h3>
            <p className="text-orange-100 text-2xl font-bold leading-relaxed mb-0">
              Reselling or large-scale commercial exploitation is strictly prohibited without explicit written permission.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentSection = termsSections[currentStep];

  useEffect(() => {
    if (isVisible && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < termsSections.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (isModal && onComplete) onComplete();
      else navigate('/privacy');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className={`${isModal ? 'min-h-full bg-transparent' : 'min-h-screen bg-white'} selection:bg-orange-200 relative overflow-hidden`}>
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-50/50 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-50/50 rounded-full blur-[100px] -ml-72 -mb-72"></div>
      </div>

      {/* Header Section */}
      {!isModal && (
        <header className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-hidden border-b border-gray-50">
          <div className="absolute inset-0 bg-[url('/Australia.jpg')] bg-cover bg-center opacity-5 pointer-events-none grayscale"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-orange-600/30 rotate-3">
                    <Scale className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold tracking-widest uppercase text-xs block mb-1">Compliance & Ethics</span>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600 font-bold text-sm uppercase">Terms of Service</span>
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Last Updated</div>
                    <div className="text-gray-900 font-bold text-sm">October 2023</div>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight px-2">
                Legal <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mt-1 sm:mt-2">
                  Agreement
                </span>
              </h1>
            </div>
          </div>
        </header>
      )}

      {/* Interactive Flow Layout */}
      <main ref={contentRef} className={`relative ${isModal ? 'py-4 sm:py-8' : 'py-12 sm:py-20 lg:pb-40'}`} style={{ scrollMarginTop: '20px' }}>
        <div className="max-w-5xl mx-auto px-2 sm:px-4">

          {/* Main Card Container */}
          <div className={`relative transition-all duration-700 bg-white ${isModal ? 'rounded-3xl p-6 sm:p-10 shadow-sm border-gray-100' : 'rounded-[4rem] p-8 sm:p-16 border border-gray-100 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.08)]'} min-h-[600px] flex flex-col ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

            {isModal ? (
              <div className="flex flex-col gap-12 sm:gap-16 fade-in animate-in duration-700 pb-16">
                <div className="mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                    Terms of Service
                  </h1>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    Please read these terms carefully before using our platform. By continuing, you agree to these conditions.
                  </p>
                </div>
                {termsSections.map((section, idx) => (
                  <div key={section.id} className="relative group">
                    {idx !== termsSections.length - 1 && (
                      <div className="absolute left-10 top-24 bottom-[-4rem] w-px bg-gradient-to-b from-orange-200 to-transparent hidden md:block opacity-40 group-hover:opacity-100 transition-opacity"></div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                      <div className="w-20 h-20 shrink-0 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-600 shadow-xl shadow-orange-900/5 transition-transform group-hover:scale-105">
                        {section.icon}
                      </div>
                      <div className="pt-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight italic mb-3">
                          {section.title}
                        </h2>
                        <p className="text-gray-500 font-medium text-lg max-w-2xl leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-10 md:pl-[6.5rem] prose prose-orange max-w-none prose-headings:font-bold prose-headings:tracking-tight">
                      {section.content}
                    </div>
                  </div>
                ))}

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white/80 backdrop-blur-md pb-4 z-20">
                  <button
                    onClick={() => { if (onComplete) onComplete() }}
                    className="px-10 py-4 bg-gray-950 text-white rounded-full font-bold hover:bg-orange-600 transition-all shadow-xl shadow-gray-950/10 active:scale-95 flex items-center gap-3"
                  >
                    <span className="uppercase tracking-wide text-sm">Accept & View Privacy Policy</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Step Content */}
                <div key={currentStep} className="flex-grow animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-600 shadow-xl shadow-orange-900/5`}>
                      {currentSection.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl sm:text-5xl font-bold text-gray-950 tracking-tight italic mb-2">
                        {currentSection.title}
                      </h2>
                      <p className="text-gray-400 font-bold text-lg max-w-xl leading-snug">
                        {currentSection.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 mb-12">
                    {currentSection.content}
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="mt-auto pt-10 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-8">

                  {/* Progress Dots */}
                  <div className="flex gap-3">
                    {termsSections.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => setCurrentStep(i)}
                        className={`h-3 rounded-full transition-all duration-700 ${currentStep === i ? 'w-16 bg-orange-600' : 'w-3 bg-gray-100 hover:bg-orange-200'}`}
                        aria-label={`Go to step ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-0 active:scale-90"
                    >
                      <ArrowRight className="w-8 h-8 rotate-180" />
                    </button>

                    <button
                      onClick={handleNext}
                      className="flex-grow sm:flex-initial flex items-center justify-center gap-6 px-12 py-6 bg-gray-950 text-white rounded-[2.5rem] font-bold group hover:bg-orange-600 transition-all shadow-2xl shadow-gray-950/20 active:scale-95"
                    >
                      <span className="text-xl uppercase tracking-tight">
                        {currentStep === termsSections.length - 1 ? 'Read Privacy' : 'Next Step'}
                      </span>
                      <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Contact Help CTA */}
          {!isModal && (
            <div className="mt-16 group p-12 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[4rem] transition-all hover:bg-orange-50/30 hover:border-orange-200/50 text-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Questions about these terms?</p>
              <a href="mailto:aus.myquotemate@gmail.com" className="text-gray-950 font-bold text-3xl sm:text-4xl hover:text-orange-600 transition-colors tracking-tight italic">
                aus.myquotemate@gmail.com
              </a>
            </div>
          )}
        </div>
      </main>

      {/* Global Style */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Terms;