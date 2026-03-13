import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Eye,
  Download,
  Users,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  Trash2,
  Globe,
  Database,
  Phone,
  Bell,
  Calendar,
  Key,
  Server,
  X,
  Sparkles,
  Mail,
  Fingerprint,
  Share2,
  LineChart,
  UserCheck,
  Activity
} from 'lucide-react';

const Privacy = ({ isModal = false, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const contentRef = React.useRef(null);

  useEffect(() => {
    setIsVisible(true);
    if (!isModal) window.scrollTo(0, 0);
  }, [isModal]);

  const privacySections = [
    {
      id: 'collect',
      title: '11. What we collect',
      icon: <Database className="w-8 h-8" />,
      description: "We collect information needed to operate and improve the service, organized into primary categories.",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Fingerprint className="w-8 h-8" />, title: "Account & Payments", desc: "Email, identifiers, and transaction metadata. We do not store full card details.", color: "blue" },
              { icon: <FileText className="w-8 h-8" />, title: "User Content", desc: "Quote text, uploaded files, images, and notes provided for analysis.", color: "orange" },
              { icon: <Activity className="w-8 h-8" />, title: "Usage & Device", desc: "Basic logs and analytics for security, fraud prevention, and troubleshooting.", color: "green" },
              { icon: <LineChart className="w-8 h-8" />, title: "Internal Analytics", desc: "De-identified supplier data, business names, and industry patterns.", color: "purple" }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-900/5 hover:-translate-y-2 transition-all duration-500 group">
                <div className={`w-14 h-14 bg-${item.color}-50 rounded-2xl flex items-center justify-center mb-6 text-${item.color}-600 group-hover:rotate-6 transition-transform`}>
                  {item.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-xl mb-3">{item.title}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'use',
      title: '12. How we use information',
      icon: <Eye className="w-8 h-8" />,
      description: "We utilize data to deliver high-quality reports and maintain platform integrity.",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              { title: "Service Delivery", desc: "Generating and delivering your reports and providing customer support." },
              { title: "Security Protocols", desc: "Maintaining security, preventing fraud, and enforcing acceptable use." },
              { title: "AI Optimization", desc: "Improving product quality, analysis accuracy, and AI reliability." },
              { title: "Supplier Benchmarking", desc: "Identifying scope gaps and market trends for better report accuracy." }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 p-6 bg-white border border-gray-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-orange-900/5 transition-all group">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors mt-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xl mb-1">{item.title}</h4>
                  <p className="text-gray-500 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'visibility',
      title: '13. Visibility and access',
      icon: <Lock className="w-8 h-8" />,
      description: "Supplier KPIs and internal dashboards are strictly restricted to authorized administrators.",
      content: (
        <div className="space-y-6">
          <div className="p-10 bg-gray-950 rounded-[3.5rem] text-white overflow-hidden relative group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent"></div>
            <Lock className="w-16 h-16 text-orange-500 mb-8 relative z-10" />
            <h3 className="text-3xl font-bold mb-8 relative z-10 tracking-tight italic">Internal Access Protocols</h3>
            <p className="text-gray-400 text-2xl font-medium leading-relaxed mb-8 relative z-10 max-w-2xl">
              Supplier KPIs and dashboards are <span className="text-white font-bold underline decoration-orange-600 decoration-4 underline-offset-8">strictly restricted</span> to authorized MyQuoteMate administrators.
            </p>
            <div className="flex items-center gap-4 py-4 px-6 bg-white/5 border border-white/10 rounded-2xl w-fit relative z-10">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
              <span className="text-sm font-bold tracking-widest uppercase text-gray-300">Admin-Only Access Secured</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sharing',
      title: '14. Sharing of information',
      icon: <Share2 className="w-8 h-8" />,
      description: "We maintain a Zero Selling Policy and only share data where necessary for operations.",
      content: (
        <div className="space-y-8">
          <div className="p-10 bg-red-50 border-2 border-dashed border-red-200 rounded-[3rem] flex items-center gap-8 shadow-inner">
            <AlertTriangle className="w-16 h-16 text-red-600 flex-shrink-0 animate-pulse" />
            <div>
              <h4 className="text-3xl font-bold text-red-950 mb-2 tracking-tight italic">Zero Selling Policy</h4>
              <p className="text-red-900 font-bold text-xl leading-relaxed opacity-80 mb-0">We do not sell your personal information. Ever.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-lg">
              <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-3 italic">
                <Users className="w-6 h-6 text-orange-600" /> Trusted Providers
              </h4>
              <p className="text-gray-500 font-medium leading-relaxed">Shared strictly for operations (hosting, analytics, payments) or legal requirements.</p>
            </div>
            <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-lg">
              <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-3 italic">
                <LineChart className="w-6 h-6 text-orange-600" /> Insights & Trends
              </h4>
              <p className="text-gray-500 font-medium leading-relaxed">Aggregated, de-identified industry patterns may be shared with partners for research.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'permissions',
      title: '15. Content permissions',
      icon: <CheckCircle2 className="w-8 h-8" />,
      description: "Using our service grants us limited permissions to process your submitted data.",
      content: (
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100 flex items-start gap-6 transform hover:scale-[1.01] transition-transform shadow-sm">
              <UserCheck className="w-10 h-10 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-orange-950 font-bold text-xl leading-snug mb-2">Verification Authorization</p>
                <p className="text-orange-900/70 font-bold leading-relaxed italic">You confirm you have the right to share tradie details for analysis purposes.</p>
              </div>
            </div>
            <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] flex items-start gap-6 shadow-xl shadow-gray-900/5">
              <Activity className="w-10 h-10 text-gray-300 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-900 font-bold text-xl mb-2">Benchmarking Data</p>
                <p className="text-gray-500 font-medium leading-relaxed">De-identified quote elements are used to build our internal industry benchmarks.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: '16. Storage and security',
      icon: <Shield className="w-8 h-8" />,
      description: "We take reasonable administrative and technical steps to protect your personal data.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-gray-500 font-bold text-xl leading-relaxed italic">Our safeguards are matched to the sensitivity of the data we process.</p>
              <div className="flex items-center gap-4 py-5 px-8 bg-green-50 rounded-[2rem] text-green-700 font-bold shadow-lg shadow-green-900/5 rotate-1">
                <Shield className="w-8 h-8" />
                <span className="text-xl uppercase tracking-tight">Encrypted Protocol</span>
              </div>
            </div>
            <div className="p-10 bg-amber-50 rounded-[3rem] border border-amber-200 shadow-inner">
              <div className="flex items-center gap-4 mb-6 text-amber-950 font-bold text-2xl tracking-tight">
                <AlertTriangle className="w-8 h-8" /> Risk Note
              </div>
              <p className="text-amber-900/70 font-bold leading-relaxed mb-0">No system is absolute. You use MyQuoteMate acknowledging inherent digital risks.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'retention',
      title: '17. Data retention',
      icon: <Clock className="w-8 h-8" />,
      description: "We retain information only as long as necessary for specified business purposes.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {['Delivery', 'Legal', 'Disputes', 'Security'].map((item, i) => (
              <div key={i} className="p-6 bg-white border border-gray-100 rounded-[2.5rem] text-center shadow-lg hover:border-orange-200 transition-all group">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-4 font-bold group-hover:scale-110 transition-transform">
                  0{i + 1}
                </div>
                <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'changes',
      title: '18. Policy changes',
      icon: <Activity className="w-8 h-8" />,
      description: "This policy may be updated dynamically from time to time.",
      content: (
        <div className="space-y-6">
          <div className="p-12 bg-gradient-to-br from-gray-900 to-black rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl -mr-40 -mt-40"></div>
            <Activity className="w-16 h-16 mb-8 text-orange-500" />
            <h3 className="text-4xl font-bold mb-6 tracking-tight italic">Dynamic Updates</h3>
            <p className="text-gray-400 text-2xl font-medium leading-tight mb-0">
              The version in effect <span className="text-white font-bold underline decoration-orange-600 decoration-4">at the time of purchase</span> applies to that specific transaction.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: '19. Contact info',
      icon: <Mail className="w-8 h-8" />,
      description: "Our compliance team is ready to address your privacy inquiries.",
      content: (
        <div className="space-y-8">
          <div className="p-16 bg-white border border-gray-100 rounded-[5rem] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Mail className="w-64 h-64" />
            </div>
            <div className="w-28 h-28 bg-orange-600 rounded-[3rem] flex items-center justify-center text-white shadow-2xl shadow-orange-600/40 mb-10 rotate-6 hover:rotate-0 transition-transform cursor-pointer">
              <Mail className="w-12 h-12" />
            </div>
            <h3 className="text-4xl font-bold text-gray-950 mb-6 tracking-tight italic">Privacy Support</h3>
            <p className="text-gray-400 font-bold text-xl leading-relaxed mb-10 max-w-lg">Address any clarifications to our team regarding data processing.</p>
            <a href="mailto:aus.myquotemate@gmail.com" className="text-gray-950 font-bold text-3xl sm:text-5xl hover:text-orange-600 transition-colors tracking-tight underline decoration-orange-200 underline-offset-8 decoration-8">
              aus.myquotemate@gmail.com
            </a>
          </div>
        </div>
      )
    }
  ];

  const currentSection = privacySections[currentStep];

  useEffect(() => {
    if (isVisible && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < privacySections.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (isModal && onComplete) onComplete();
      else navigate('/contact');
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
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gray-50/80 rounded-full blur-[120px] -mr-96 -mt-96"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50/50 rounded-full blur-[100px] -ml-72 -mb-72 animate-pulse"></div>
      </div>

      {/* Premium Header */}
      {!isModal && (
        <header className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-hidden border-b border-gray-50">
          <div className="absolute inset-0 bg-[url('/Australia.jpg')] bg-cover bg-center opacity-5 pointer-events-none grayscale"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-950 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-gray-950/30 -rotate-3 transition-transform hover:rotate-3">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold tracking-widest uppercase text-xs block mb-1">Protective Framework</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-950 font-bold text-sm uppercase">Privacy Notice</span>
                      <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight px-2">
                Data <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mt-1 sm:mt-2">
                  Security
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
                    Privacy Policy
                  </h1>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    We take your privacy seriously. Here is how we handle and protect your data.
                  </p>
                </div>
                {privacySections.map((section, idx) => (
                  <div key={section.id} className="relative group">
                    {idx !== privacySections.length - 1 && (
                      <div className="absolute left-10 top-24 bottom-[-4rem] w-px bg-gradient-to-b from-gray-200 to-transparent hidden md:block opacity-40 group-hover:opacity-100 transition-opacity"></div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                      <div className="w-20 h-20 shrink-0 rounded-3xl bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center text-gray-950 shadow-xl shadow-gray-900/5 transition-transform group-hover:scale-105">
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
                    <span className="uppercase tracking-wide text-sm">Accept & Close</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Step Content */}
                <div key={currentStep} className="flex-grow animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center text-gray-950 shadow-xl shadow-gray-900/5`}>
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
                    {privacySections.map((s, i) => (
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
                        {currentStep === privacySections.length - 1 ? 'Get Support' : 'Next Step'}
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

          {/* Secure Legend */}
          <div className="mt-16 group p-12 bg-white border border-gray-100 rounded-[4rem] transition-all relative overflow-hidden shadow-2xl shadow-gray-900/5">
            <div className="absolute top-0 right-0 p-8">
              <Lock className="w-24 h-24 text-gray-50 opacity-10 group-hover:text-orange-500 group-hover:scale-125 transition-all duration-1000" />
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight italic">Australian Compliance</h4>
              <p className="text-gray-400 font-bold text-lg leading-relaxed mb-0 max-w-xl">
                We are strictly bound by the Australian Privacy Principles (APPs). We handle all data in accordance with these principles to ensure absolute transparency.
              </p>
            </div>
          </div>

          {/* Nav CTA */}
          {!isModal && (
            <div className="mt-12 flex items-center justify-center gap-6">
              <Link to="/terms" className="text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-orange-600 transition-colors flex items-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                View Terms of Service
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Global Style */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Privacy;