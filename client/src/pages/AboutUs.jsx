import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Target,
  Award,
  Shield,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle2,
  MessageSquare,
  Zap,
  Globe,
  Building,
  Star,
  Medal,
  ChevronRight,
  ArrowRight,
  Brain,
  FileText,
  Home,
  Wrench,
  Hammer,
  Search,
  BookOpen,
  Eye,
  DollarSign,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Trust & Transparency",
      description: "We believe in complete honesty about how we analyze quotes and what data we use."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Customer First",
      description: "Your satisfaction and protection come before everything else."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Accuracy First",
      description: "We constantly update our data to provide the most accurate Australian market rates."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Innovation",
      description: "We're always improving our AI to better serve Australian homeowners."
    }
  ];

  const milestones = [
    {
      year: "2022",
      title: "Founded",
      description: "MyQuoteMate was born from a personal experience with an unfair tradie quote"
    },
    {
      year: "2023",
      title: "AI Launch",
      description: "Launched our AI-powered quote analysis platform"
    },
    {
      year: "2024",
      title: "10,000+ Users",
      description: "Helped over 10,000 Australian homeowners make confident decisions"
    },
    {
      year: "2024",
      title: "Expert Partnerships",
      description: "Partnered with Master Builders Australia and industry experts"
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former construction project manager with 15+ years experience. Started MyQuoteMate after her own renovation nightmare.",
      expertise: ["Construction", "Pricing Analysis", "Customer Advocacy"],
      imageColor: "from-orange-400 to-amber-500"
    },
    {
      name: "Michael Chen",
      role: "Head of AI & Technology",
      bio: "PhD in Machine Learning, previously at CSIRO. Leads our AI development and data analysis teams.",
      expertise: ["AI/ML", "Data Science", "Systems Architecture"],
      imageColor: "from-blue-400 to-cyan-500"
    },
    {
      name: "Emma Wilson",
      role: "Head of Customer Success",
      bio: "10+ years in customer service and dispute resolution. Ensures every user gets the support they need.",
      expertise: ["Customer Support", "Dispute Resolution", "User Education"],
      imageColor: "from-purple-400 to-pink-500"
    },
    {
      name: "David Roberts",
      role: "Industry Relations Director",
      bio: "Former Master Builder with 20+ years trade experience. Manages our industry partnerships and data accuracy.",
      expertise: ["Building Standards", "Trade Regulations", "Industry Networks"],
      imageColor: "from-green-400 to-emerald-500"
    }
  ];

  const stats = [
    {
      value: "10,000+",
      label: "Happy Homeowners",
      icon: <Users className="w-5 h-5" />,
      description: "Trust us for their quote analysis"
    },
    {
      value: "$4.2M+",
      label: "Estimated Savings",
      icon: <DollarSign className="w-5 h-5" />,
      description: "Collectively saved by our users"
    },
    {
      value: "4.9/5",
      label: "Customer Rating",
      icon: <Star className="w-5 h-5" />,
      description: "Based on user reviews"
    },
    {
      value: "97%",
      label: "Accuracy Rate",
      icon: <Target className="w-5 h-5" />,
      description: "On quote price predictions"
    }
  ];

  const partnerships = [
    {
      name: "Master Builders Australia",
      role: "Industry Partner",
      description: "Working together to promote fair trade practices"
    },
    {
      name: "Australian Competition & Consumer Commission",
      role: "Guidance Partner",
      description: "Following ACCC guidelines for consumer protection"
    },
    {
      name: "ServiceSeeking.com.au",
      role: "Data Partner",
      description: "Market rate data collaboration"
    },
    {
      name: "Choice Australia",
      role: "Consumer Advocacy Partner",
      description: "Promoting consumer rights in home services"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-orange-300 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-amber-400 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-6 tracking-wide">
              <Sparkles className="w-4 h-4 mr-2" />
              OUR STORY
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 tracking-tight">
              About MyQuoteMate
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-4xl mx-auto">
              We're on a mission to protect Australian homeowners from unfair tradie quotes through transparent, AI-powered analysis.
            </p>
          </div>

          {/* Mission Card */}
          <div className={`bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-12 text-white transition-all duration-700 mb-12 sm:mb-16 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '200ms' }}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                Our Mission
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed">
                To empower every Australian homeowner with the knowledge and tools to make confident, informed decisions about tradie quotes — saving money, avoiding stress, and ensuring fair treatment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-6 sm:py-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} style={{ transitionDelay: `${300 + index * 100}ms` }}>
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <div className="text-orange-500 bg-orange-50 p-1.5 rounded-lg">
                    {stat.icon}
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {stat.value}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '400ms' }}>
            <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-4 tracking-wide">
              <Building className="w-4 h-4 mr-2" />
              HOW WE STARTED
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
              From Personal Problem to National Solution
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
              Our founder's frustrating experience with an unfair tradie quote sparked a revolution in home service transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '500ms' }}>
              <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl mb-6 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-orange-300 to-amber-400 rounded-full blur-lg opacity-20"></div>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  The Problem We Faced
                </h3>
                <p className="text-gray-600 mb-4">
                  In 2022, our founder Sarah was quoted $18,000 for a bathroom renovation with vague details and no breakdown. After getting multiple quotes, she discovered the fair price was $12,000. This experience highlighted a widespread issue affecting thousands of Australian homeowners.
                </p>
                <p className="text-gray-600">
                  We realized homeowners needed a simple way to verify if quotes were fair without becoming pricing experts overnight. That's when MyQuoteMate was born.
                </p>
              </div>
            </div>

            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '600ms' }}>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Our Solution
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">AI-Powered Analysis</h4>
                      <p className="text-gray-600">Our proprietary AI compares quotes against thousands of Australian market rates in seconds.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Consumer Protection</h4>
                      <p className="text-gray-600">We highlight red flags and missing information that could cost you thousands.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Australian Focus</h4>
                      <p className="text-gray-600">Built specifically for Australian tradies, regulations, and market conditions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className={`mb-16 sm:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '700ms' }}>
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-4 tracking-wide">
                <Heart className="w-4 h-4 mr-2" />
                OUR VALUES
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
                What Drives Us Forward
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className={`bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/30 transition-all duration-300 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                  style={{ transitionDelay: `${800 + index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-orange-500">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '900ms' }}>
            <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-4 tracking-wide">
              <Users className="w-4 h-4 mr-2" />
              MEET THE TEAM
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
              The Experts Behind MyQuoteMate
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
              Our diverse team combines construction expertise, AI technology, and customer advocacy to serve you better.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className={`bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-6 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100/20 transition-all duration-300 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: `${1000 + index * 100}ms` }}
              >
                {/* Avatar Placeholder */}
                <div className={`w-20 h-20 bg-gradient-to-r ${member.imageColor} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 text-center mb-1 group-hover:text-orange-600 transition-colors">
                  {member.name}
                </h3>
                <p className="text-orange-600 font-medium text-center mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm mb-4 text-center">
                  {member.bio}
                </p>

                <div className="space-y-2">
                  {member.expertise.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      {/* <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '1100ms' }}>
            <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-4 tracking-wide">
              <TrendingUp className="w-4 h-4 mr-2" />
              OUR JOURNEY
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
              Milestones & Achievements
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-orange-400 via-orange-500 to-amber-600 hidden lg:block"></div>

            <div className="space-y-8 sm:space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  } ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
                  style={{ transitionDelay: `${1200 + index * 200}ms` }}
                >
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg lg:text-xl">
                        {milestone.year}
                      </span>
                    </div>
                  </div>

                  
                  <div className={`flex-1 bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300 ${
                    index % 2 === 0 ? 'lg:text-right' : ''
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {milestone.title}
                      </h3>
                    </div>
                    <p className="text-gray-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* Partnerships */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '1300ms' }}>
            <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-4 tracking-wide">
              <Globe className="w-4 h-4 mr-2" />
              PARTNERSHIPS
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
              We collaborate with leading organizations to ensure our analysis meets the highest standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerships.map((partner, index) => (
              <div
                key={index}
                className={`bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: `${1400 + index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center mb-4">
                  <Medal className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {partner.name}
                </h3>
                <p className="text-orange-600 font-medium text-sm mb-3">
                  {partner.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-4 sm:mb-6 tracking-wide transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '1500ms' }}>
            READY TO GET STARTED?
          </div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 tracking-tight transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '1600ms' }}>
            Join Thousands of Confident Homeowners
          </h2>
          <p className={`text-lg sm:text-xl text-gray-700 mb-8 sm:mb-10 max-w-2xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '1700ms' }}>
            Experience the peace of mind that comes with knowing your tradie quote is fair and complete.
          </p>

          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '1800ms' }}>
            <Link
              to="/check-quote"
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              <span className="relative z-10">Check Your Quote Now</span>
              <ArrowRight className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-2 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-700 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/contact"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl sm:rounded-2xl font-medium text-base sm:text-lg hover:border-orange-300 hover:text-orange-600 transition-all duration-300 w-full sm:w-auto text-center"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
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

export default AboutUs;