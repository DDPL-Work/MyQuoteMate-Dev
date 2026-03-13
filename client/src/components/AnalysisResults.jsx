import React, { useEffect, useMemo, useState } from 'react';
import {
  Lock, Unlock, ChevronDown, ChevronUp, Zap, Crown, Star, Download,
  FileText, AlertTriangle, Search, X, Database, BarChart2, TrendingUp, Clock
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area
} from 'recharts';
import { Link } from 'react-router-dom';
import quoteApi from '../services/quoteApi';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const AnalysisResults = ({ jobResult, userTier = 'free', onCompare }) => {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    redFlags: false,
    detailedReview: false,
    questions: false,
    comparison: false,
    benchmarking: false,
    recommendations: false
  });
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [showFullVerdict, setShowFullVerdict] = useState(false);
  const [showTechnicalModal, setShowTechnicalModal] = useState(false);

  // Multi-Quote State
  const isPremiumComparisonTier =
    userTier?.toLowerCase() === 'premium' || jobResult?.tier?.toLowerCase() === 'premium';

  const buildQuoteSlots = (sourceResult, premiumMode = false) => {
    const base = (sourceResult?.allResults && Array.isArray(sourceResult.allResults) && sourceResult.allResults.length)
      ? sourceResult.allResults.slice(0, 3)
      : (sourceResult ? [sourceResult] : []);

    if (premiumMode) {
      while (base.length < 3) base.push(null);
    }
    return base;
  };

  const [comparisonQuotes, setComparisonQuotes] = useState(() =>
    buildQuoteSlots(jobResult, isPremiumComparisonTier)
  );
  const [comparisonResult, setComparisonResult] = useState(jobResult?.quoteComparison || null);
  const [isUploadingQuote, setIsUploadingQuote] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    setComparisonQuotes(buildQuoteSlots(jobResult, isPremiumComparisonTier));
    setComparisonResult(jobResult?.quoteComparison || null);
  }, [jobResult, isPremiumComparisonTier]);

  const getQuoteTotal = (quote) => {
    if (!quote) return 0;
    if (Number.isFinite(quote.overallCost)) return quote.overallCost;
    if (Number.isFinite(quote.cost)) return quote.cost;
    if (Array.isArray(quote.costBreakdown)) {
      return quote.costBreakdown.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0);
    }
    return 0;
  };

  const normalizeComparisonText = (value) => {
    if (typeof value !== 'string') return '';
    const cleaned = value.replace(/\s+/g, ' ').trim();
    if (!cleaned || /^["'`]+$/.test(cleaned) || cleaned.toLowerCase() === 'not provided') return '';
    return cleaned;
  };

  const fallbackComparisonResult = useMemo(() => {
    let available = comparisonQuotes
      .map((quote, index) => ({ quote, index }))
      .filter(({ quote }) => quote);

    if (available.length < 2 && Array.isArray(comparisonResult?.quotes) && comparisonResult.quotes.length >= 2) {
      available = comparisonResult.quotes.map((quote, idx) => ({
        quote: {
          metadata: { title: quote?.name || `Quote ${idx + 1}` },
          overallCost: Number(quote?.cost) || 0,
          redFlags: []
        },
        index: Number.isInteger(quote?.index) ? quote.index : idx
      }));
    }

    if (available.length < 2) return null;

    const enriched = available.map(({ quote, index }) => ({
      index,
      name: quote?.metadata?.title || `Quote ${index + 1}`,
      cost: getQuoteTotal(quote),
      flags: Array.isArray(quote?.redFlags) ? quote.redFlags.length : 0
    }));

    const maxCost = Math.max(1, ...enriched.map(q => q.cost));
    const maxFlags = Math.max(1, ...enriched.map(q => q.flags));

    const winner = enriched.reduce((best, current) => {
      const bestScore = (best.cost / maxCost) * 0.7 + (best.flags / maxFlags) * 0.3;
      const currentScore = (current.cost / maxCost) * 0.7 + (current.flags / maxFlags) * 0.3;
      return currentScore < bestScore ? current : best;
    }, enriched[0]);

    const cheapest = enriched.reduce((a, b) => (a.cost <= b.cost ? a : b));
    const mostExpensive = enriched.reduce((a, b) => (a.cost >= b.cost ? a : b));
    const spread = Math.max(0, mostExpensive.cost - cheapest.cost);

    return {
      winner: {
        index: winner.index,
        reason: `${winner.name} currently offers the strongest cost-to-risk balance based on extracted totals and detected red flags. Verify scope inclusions before final sign-off.`
      },
      betterApproach: `${winner.name} appears to provide the best overall technical value when balancing project cost against identified risk indicators.`,
      relativePricing: `Price spread across submitted quotes is $${spread.toLocaleString()} AUD.`,
      valueAssessment: `${winner.name} is presently the best value candidate from available comparison data.`,
      keyDifferences: [
        `Lowest cost: ${cheapest.name} ($${cheapest.cost.toLocaleString()}).`,
        `Highest cost: ${mostExpensive.name} ($${mostExpensive.cost.toLocaleString()}).`,
        `Total price spread: $${spread.toLocaleString()} AUD.`
      ]
    };
  }, [comparisonQuotes, comparisonResult]);

  const effectiveComparisonResult = useMemo(() => {
    const baseFallback = fallbackComparisonResult || {
      winner: {
        index: 0,
        reason: 'Comparison summary was incomplete, so fallback logic was applied from available quote data.'
      },
      betterApproach: 'Technical approach details were not fully returned by AI. Review scope and exclusions across quotes.',
      relativePricing: 'Relative pricing details were incomplete in AI output.',
      valueAssessment: 'Value assessment was incomplete in AI output.',
      keyDifferences: ['Detailed comparison points were not fully returned by AI output.']
    };

    if (!comparisonResult) return fallbackComparisonResult;

    const keyDifferences = Array.isArray(comparisonResult.keyDifferences)
      ? comparisonResult.keyDifferences.map(normalizeComparisonText).filter(Boolean)
      : [];

    const winnerIndex = Number.isInteger(comparisonResult?.winner?.index)
      ? comparisonResult.winner.index
      : baseFallback.winner.index;

    return {
      ...comparisonResult,
      winner: {
        index: winnerIndex,
        reason: normalizeComparisonText(comparisonResult?.winner?.reason) || baseFallback.winner.reason
      },
      betterApproach: normalizeComparisonText(comparisonResult?.betterApproach) || baseFallback.betterApproach,
      relativePricing: normalizeComparisonText(comparisonResult?.relativePricing) || baseFallback.relativePricing,
      valueAssessment: normalizeComparisonText(comparisonResult?.valueAssessment) || baseFallback.valueAssessment,
      keyDifferences: keyDifferences.length ? keyDifferences : baseFallback.keyDifferences
    };
  }, [comparisonResult, fallbackComparisonResult]);

  // --- CHART HELPERS & DATA ---
  const chartData = jobResult?.visualizations || {
    riskProfile: [
      { category: "Pricing", value: 65 },
      { category: "Scope", value: 80 },
      { category: "Terms", value: 55 },
      { category: "Compliance", value: 75 },
      { category: "Risk", value: 40 }
    ],
    costDistribution: [
      { name: "Labour", value: 0 },
      { name: "Materials", value: 0 },
      { name: "Other", value: 0 }
    ],
    savingsROI: [
      { strategy: "Negotiation", current: 100, potential: 90 },
      { strategy: "Timing", current: 100, potential: 95 }
    ],
    timelineEstimates: [
      { phase: "Start", days: 0 },
      { phase: "Finish", days: 10 }
    ]
  };

  const CHART_COLORS = ['#f97316', '#fb923c', '#fdba74', '#ea580c', '#c2410c'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg ring-1 ring-black/5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">{label || payload[0].name}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }}></span>
            <p className="text-sm font-black text-gray-900">
              {typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  // ---------------------------

  // Helper for alert replacement
  const showTierAlert = () => {
    Swal.fire({
      title: 'Premium Feature',
      text: 'Professional PDF Reports are available for Standard and Premium users.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'View Plans',
      confirmButtonColor: '#f97316',
      cancelButtonText: 'Maybe Later'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/pricing';
      }
    });
  };

  const handleDownloadReport = async () => {
    if (!jobResult?.jobId) return;

    try {
      setIsDownloadingReport(true);
      const blob = await quoteApi.generateReport(jobResult.jobId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Analysis_Report_${jobResult.jobId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      Swal.fire({
        title: 'Success!',
        text: 'Professional Report downloaded successfully!',
        icon: 'success',
        confirmButtonColor: '#f97316'
      });
    } catch (err) {
      console.error('Report download error:', err);
      Swal.fire({
        title: 'Download Failed',
        text: 'Failed to generate professional report. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f97316'
      });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleOpenTechnicalModal = () => {
    setShowTechnicalModal(true);
  };

  const toggleExpand = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sample/mock data for demonstration
  const mockJobResult = {
    summary: "This is a comprehensive bathroom renovation quote from a licensed plumber. The quote includes quality materials with a mix of mid-range and premium fixtures, reasonable labor costs, and clear itemization. The scope covers complete fixture replacement with new connections and testing. Overall, this represents fair market pricing for the work described.",
    verdict: "good",
    verdictScore: 78,
    overallCost: 7458,
    labourCost: 2280,
    materialsCost: 4500,
    fairPriceRange: { min: 6500, max: 8500 },
    costBreakdown: [
      {
        description: "Labor - Bathroom Installation (3 days @ $95/hour)",
        quantity: 24,
        unitPrice: 95,
        totalPrice: 2280,
        category: "labor",
        flagged: false
      },
      {
        description: "Caroma Solus Wall-Mounted Toilet Suite",
        quantity: 1,
        unitPrice: 580,
        totalPrice: 580,
        category: "fixtures",
        flagged: false
      },
      {
        description: "Caroma Liano 1700mm Freestanding Bath",
        quantity: 1,
        unitPrice: 1200,
        totalPrice: 1200,
        category: "fixtures",
        flagged: false
      },
      {
        description: "Custom 1500mm Double Vanity with Stone Top",
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
        category: "fixtures",
        flagged: false
      },
      {
        description: "Astra Walker Icon Mixer Tap Set",
        quantity: 1,
        unitPrice: 340,
        totalPrice: 340,
        category: "fixtures",
        flagged: false
      },
      {
        description: "Plumbing Fittings, Connections & Testing",
        quantity: 1,
        unitPrice: 800,
        totalPrice: 800,
        category: "materials",
        flagged: false
      }
    ],
    redFlags: [
      {
        title: "Old fixture disposal not explicitly mentioned",
        description: "Verify whether the quote includes cost of removing and disposing of old bathroom fixtures. This can add $300-500 if not included.",
        severity: "medium",
        category: "scope"
      },
      {
        title: "Warranty period is relatively short",
        description: "5-year warranty on workmanship is standard but industry best practice is 7-10 years. Consider negotiating for an extended warranty.",
        severity: "low",
        category: "warranty"
      },
      {
        title: "No contingency for structural issues",
        description: "Quote doesn't mention what happens if water damage or mold is discovered during installation. Clarify responsibility and additional costs.",
        severity: "medium",
        category: "risk"
      }
    ],
    questionsToAsk: [
      {
        question: "Is the removal and disposal of old bathroom fixtures included in this quote, or will there be additional charges?",
        category: "scope",
        importance: "must-ask"
      },
      {
        question: "What is the breakdown of warranty - is it 5 years on both labor AND all fixtures, or separately?",
        category: "warranty",
        importance: "must-ask"
      },
      {
        question: "Will you provide a detailed timeline showing when different trades will be on site (plumber, painter, tiler)?",
        category: "timeline",
        importance: "must-ask"
      },
      {
        question: "What is your contingency process and additional cost if we discover water damage or mold behind the walls?",
        category: "risk",
        importance: "should-ask"
      },
      {
        question: "Are plaster repairs after chasing walls for pipes included, or is that quoted separately?",
        category: "scope",
        importance: "should-ask"
      },
      {
        question: "What is the payment schedule - full upfront, installments, or 50/50 deposit?",
        category: "payment",
        importance: "should-ask"
      }
    ],
    detailedReview: `Quote Analysis Summary:\n\nThe quote demonstrates Standard preparation with itemized costs and clear material selections. Labor at $95/hour is competitive for Sydney (market range: $80-120/hour). \n\nMaterial Pricing:\n• Caroma Solus toilet ($580) - Fair price, standard quality\n• Freestanding bath ($1200) - Mid-range pricing\n• Double vanity with stone ($1500) - Premium selection\n• Mixer set ($340) - Good value for Astra Walker brand\n\nStrengths:\n✓ Detailed itemization\n✓ Quality brand selections\n✓ Includes warranty\n✓ Clear scope of work\n\nConcerns:\n⚠ Disposal costs unclear\n⚠ Timeline not detailed\n⚠ Contingency plan not mentioned`,
    recommendations: [
      {
        title: "Negotiate fixture disposal inclusion",
        description: "Request that old fixture removal and responsible disposal be included at no extra cost. This is a standard practice and could save $300-500.",
        potentialSavings: 400,
        difficulty: "easy"
      },
      {
        title: "Request extended warranty",
        description: "Ask for 7-year warranty on labor (vs 5 years) in exchange for committing to payment terms. This small concession often costs the tradie nothing but adds value.",
        potentialSavings: 0,
        difficulty: "easy"
      },
      {
        title: "Ask about references for similar work",
        description: "Request contact details for 2-3 recent bathroom renovations they've completed. Verify quality and confirm timeline accuracy.",
        potentialSavings: 0,
        difficulty: "easy"
      },
      {
        title: "Clarify contingency plan upfront",
        description: "Get written agreement on process and costs if water damage/mold is discovered. Protects both parties and prevents surprise charges.",
        potentialSavings: 0,
        difficulty: "moderate"
      }
    ],
    benchmarking: [
      {
        item: "Labor Rate (per hour)",
        quotePrice: 95,
        marketMin: 80,
        marketAvg: 95,
        marketMax: 120,
        percentile: 48
      },
      {
        item: "Toilet Suite Cost",
        quotePrice: 580,
        marketMin: 400,
        marketAvg: 650,
        marketMax: 900,
        percentile: 32
      },
      {
        item: "Freestanding Bath",
        quotePrice: 1200,
        marketMin: 800,
        marketAvg: 1200,
        marketMax: 1800,
        percentile: 50
      },
      {
        item: "Overall Project Cost",
        quotePrice: 7458,
        marketMin: 6500,
        marketAvg: 7800,
        marketMax: 9200,
        percentile: 46
      }
    ],
    marketContext: {
      city: "Sydney, NSW",
      tradeType: "Plumbing",
      projectType: "Bathroom Renovation",
      averageQuoteValue: 7800,
      pricePercentile: 46
    }
  };

  // Use mock data if jobResult is not provided
  const displayResult = jobResult || mockJobResult;

  const normalizeDetailedReview = (value) => {
    if (Array.isArray(value)) {
      return value
        .map(item => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
    }

    if (typeof value !== 'string') {
      return [];
    }

    const normalized = value
      .replace(/\r/g, '\n')
      .replace(/[•●▪◦]/g, '\n')
      .replace(/[✓✔]/g, '\n')
      .replace(/[⚠]/g, '\n')
      .trim();

    let points = normalized
      .split(/\n+/)
      .map(part => part.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);

    if (points.length <= 1) {
      points = normalized
        .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
        .map(part => part.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
    }

    return points.filter(point => point.length > 8);
  };

  // Normalize tier names to lowercase - PRIORITIZE jobResult.tier if it exists
  const effectiveTier = jobResult?.tier || userTier;
  const normalizedTier = effectiveTier?.toLowerCase() === 'standard' ? 'standard' :
    effectiveTier?.toLowerCase() === 'premium' ? 'premium' :
      effectiveTier?.toLowerCase() || 'free';

  // Tier access mapping
  const tierAccess = {
    free: ['summary', 'verdict'],
    standard: ['summary', 'verdict', 'costBreakdown', 'redFlags', 'detailedReview', 'questions', 'benchmarking', 'recommendations'],
    premium: ['summary', 'verdict', 'costBreakdown', 'redFlags', 'detailedReview', 'questions', 'comparison', 'benchmarking', 'recommendations']
  };

  const currentTierAccess = tierAccess[normalizedTier] || tierAccess.free;

  const getVerdictDisplay = () => {
    if (!displayResult?.verdictScore) return displayResult?.verdict || 'Analyzing pricing...';

    // Detect if score is on 0-10 or 0-100 scale
    let scoreValue = displayResult.verdictScore;
    if (scoreValue > 10) scoreValue = scoreValue / 10;

    const getLabel = (s) => {
      if (s >= 90) return 'Excellent';
      if (s >= 70) return 'Good';
      if (s >= 50) return 'Average';
      return 'Bad';
    };

    const label = getLabel(scoreValue * 10);
    return `${scoreValue.toFixed(1)}/10 - ${label}`;
  };

  const verdictContent = getVerdictDisplay();

  // Feature definitions
  const features = {
    summary: {
      title: (normalizedTier === 'standard' || normalizedTier === 'premium') ? 'Analysis Summary' : 'Basic Summary',
      description: 'AI-generated overview of your quote',
      icon: '📋',
      tier: 'free',
      content: displayResult?.summary || 'Processing summary...'
    },
    verdict: {
      title: 'Price Verdict',
      description: 'Assessment of pricing fairness',
      icon: '⚖️',
      tier: 'free',
      content: verdictContent
    },
    costBreakdown: {
      title: 'Detailed Cost Overview',
      description: 'Line-by-line breakdown of all costs',
      icon: '💰',
      tier: 'standard',
      content: displayResult?.costBreakdown || [],
      isList: true,
      isTable: true
    },
    redFlags: {
      title: 'Red Flags & Concerns',
      description: 'Potential issues identified in the quote',
      icon: '🚩',
      tier: 'standard',
      content: displayResult?.redFlags || [],
      isList: true
    },
    detailedReview: {
      title: 'Detailed Cost Review',
      description: 'Line-by-line breakdown of all costs',
      icon: '🔍',
      tier: 'standard',
      content: normalizeDetailedReview(displayResult?.detailedReview),
      isList: true
    },
    questions: {
      title: 'Questions to Ask',
      description: 'Important questions to clarify with the tradie',
      icon: '❓',
      tier: 'standard',
      content: displayResult?.questionsToAsk || [],
      isList: true
    },
    benchmarking: {
      title: 'Market Benchmarking',
      description: 'Compare against local market rates',
      icon: '📈',
      tier: 'standard',
      content: displayResult?.benchmarking || [],
      isList: true
    },
    recommendations: {
      title: 'Advanced Recommendations',
      description: 'AI-powered negotiation tips and savings opportunities',
      icon: '💡',
      tier: 'standard',
      content: displayResult?.recommendations || [],
      isList: true
    },
    comparison: {
      title: normalizedTier === 'premium' && !displayResult?.quoteComparison ? 'AI Strategic Alignment' : 'Quote Comparison',
      description: normalizedTier === 'premium' && !displayResult?.quoteComparison ? 'AI-powered strategic analysis and market positioning' : 'Side-by-side analysis of multiple quotes',
      icon: normalizedTier === 'premium' && !displayResult?.quoteComparison ? '🎯' : '📊',
      tier: 'premium',
      content: displayResult?.benchmarkingOverview || displayResult?.strategicAnalysis || displayResult?.quoteComparison || 'Upload additional quotes to compare',
      isList: false
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getTierLabel = (requiredTier) => {
    if (requiredTier === 'free') return null;
    if (requiredTier === 'standard') return 'Standard';
    if (requiredTier === 'premium') return 'Premium';
  };

  const getTierColor = (requiredTier) => {
    if (requiredTier === 'standard') return 'from-orange-500 to-amber-600';
    if (requiredTier === 'premium') return 'from-black to-gray-900';
    return '';
  };

  const getTierIcon = (requiredTier) => {
    if (requiredTier === 'standard') return <Zap className="w-4 h-4" />;
    if (requiredTier === 'premium') return <Crown className="w-4 h-4" />;
    return null;
  };

  const isFeatureUnlocked = (featureKey) => {
    // If the job itself was processed as a certain tier, prioritize that
    const jobTier = jobResult?.tier?.toLowerCase() || 'free';
    const effectiveTier = (jobTier === 'premium' || normalizedTier === 'premium') ? 'premium' :
      (jobTier === 'standard' || normalizedTier === 'standard') ? 'standard' : 'free';

    return tierAccess[effectiveTier].includes(featureKey);
  };

  const renderFeatureContent = (feature, featureKey, isExpanded) => {
    const isUnlocked = isFeatureUnlocked(featureKey);

    if (!isUnlocked) {
      // Check if user is already on Premium and trying to access Premium features
      if (normalizedTier === 'premium' && feature.tier === 'premium') {
        return (
          <div className="text-center py-8">
            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold mb-2">
              You're already on the Premium plan!
            </p>
            <p className="text-sm text-gray-600">
              This feature will be available once you analyze a quote.
            </p>
          </div>
        );
      }

      // Check if user is on Standard trying to access Premium
      if (normalizedTier === 'standard' && feature.tier === 'premium') {
        return (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              This feature is exclusive to Premium users
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Unlock with <strong>Premium Plan</strong>
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-black to-gray-900 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </Link>
            </div>
          </div>
        );
      }

      // Default upgrade prompt for Free users
      return (
        <div className="text-center py-8">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            This feature is locked for free tier users
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Unlock with <strong>{getTierLabel(feature.tier)} Plan</strong>
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {getTierIcon(feature.tier)}
              Upgrade to {getTierLabel(feature.tier)}
            </Link>
          </div>
        </div>
      );
    }

    // Detailed Cost Section (Premium): Show all quotes with breakdowns
    if (featureKey === 'costBreakdown' && (normalizedTier === 'premium')) {
      // Show all uploaded quotes (2 or 3) in a grid
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonQuotes.map((q, idx) => (
            <div key={idx} className="relative flex flex-col border-2 rounded-2xl min-h-[320px] bg-white p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{idx === 0 ? 'Primary Quote' : `Quote ${idx + 1}`}</span>
              </div>
              <h4 className="font-bold text-gray-900 truncate mb-1" title={q?.metadata?.title}>
                {q?.metadata?.title || (idx === 0 ? 'Primary Quote' : `Quote ${idx + 1}`)}
              </h4>
              {q
                ? <p className="text-2xl font-black text-gray-900 mb-2">${(q.overallCost || q.cost || (q.costBreakdown ? q.costBreakdown.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0) : 0)).toLocaleString()}</p>
                : <p className="text-lg font-bold text-gray-400 italic mb-2">Not Provided</p>}
              {/* Cost breakdown for each quote */}
              {q && Array.isArray(q.costBreakdown) && q.costBreakdown.length > 0 ? (
                <div className="flex flex-col flex-1 mt-2">
                  <div className="text-xs font-bold text-gray-500 mb-1">Cost Breakdown</div>
                  <div className="overflow-y-auto max-h-[220px] rounded-xl border border-gray-100 bg-white">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="p-2 text-left font-bold text-gray-600">Item</th>
                          <th className="p-2 text-center font-bold text-gray-600">Qty</th>
                          <th className="p-2 text-right font-bold text-gray-600">Unit Price</th>
                          <th className="p-2 text-right font-bold text-gray-600">Total</th>
                          <th className="p-2 text-center font-bold text-gray-600">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {q.costBreakdown.map((item, idx2) => (
                          <tr key={idx2} className="border-b last:border-0 hover:bg-blue-50/30 transition-colors">
                            <td className="p-2 text-gray-900 font-medium whitespace-pre-line break-words max-w-[180px]">{item.description || item.item}</td>
                            <td className="p-2 text-center">{item.quantity || 1}</td>
                            <td className="p-2 text-right">${(item.unitPrice || item.amount || 0).toLocaleString()}</td>
                            <td className="p-2 text-right font-bold text-gray-900">${(item.totalPrice || item.amount || 0).toLocaleString()}</td>
                            <td className="p-2 text-center">
                              <span className="inline-flex px-2 py-1 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 uppercase">{item.category || 'other'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-right text-sm font-black text-green-700">Total: {(q.overallCost || q.cost || q.costBreakdown.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0)).toLocaleString()} AUD</div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-400 italic text-center">No cost breakdown available.</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Quote Comparison Section (Premium): Restore previous logic
    if (featureKey === 'comparison') {
      return (
        <div className="space-y-6">
          {/* Comparison Dashboard - Always show 3 slots for premium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonQuotes.map((q, idx) => (
              <div key={idx} className={`relative p-5 border-2 rounded-2xl min-h-[220px] bg-white ${q && effectiveComparisonResult?.winner?.index === idx
                ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                }`}>
                {q && effectiveComparisonResult?.winner?.index === idx && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-md uppercase tracking-wider">
                    <Crown className="w-3 h-3" />
                    Technical Winner
                  </div>
                )}
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Quote {idx + 1}</span>
                </div>
                <h4 className="font-bold text-gray-900 truncate mb-1" title={q?.metadata?.title}>
                  {q?.metadata?.title || (idx === 0 ? 'Primary Quote' : `Quote ${idx + 1}`)}
                </h4>
                {q
                  ? <p className="text-2xl font-black text-gray-900">${(q.overallCost || q.cost || (q.costBreakdown ? q.costBreakdown.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0) : 0)).toLocaleString()}</p>
                  : <p className="text-lg font-bold text-gray-400 italic">Not Provided</p>}
              </div>
            ))}
          </div>

          {/* Comparison Results */}
          {isComparing ? (
            <div className="py-12 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-2xl">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-gray-900">AI Identifying Better Approach...</p>
              <p className="text-sm text-gray-500">Cross-referencing technical details and 2026 market rates</p>
            </div>
          ) : effectiveComparisonResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-md">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-black text-amber-900 uppercase tracking-tight leading-none">AI Professional Recommendation</h5>
                    <p className="text-[10px] text-amber-700 font-bold mt-1">Definitive Technical & Strategic Opinion</p>
                  </div>
                </div>
                <div className="prose prose-sm prose-amber max-w-none text-amber-900 leading-relaxed font-medium">
                  {effectiveComparisonResult.winner?.reason?.split('\n\n').map((p, i) => {
                    const isOpinionLine = p.toLowerCase().includes('in my opinion') || p.toLowerCase().includes('conclusion:');
                    return (
                      <p key={i} className={`mb-4 last:mb-0 ${isOpinionLine ? 'p-4 bg-white/60 border-l-4 border-amber-600 rounded-r-lg font-black text-base' : ''}`}>
                        {p}
                      </p>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
                  <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
                    <Zap className="w-4 h-4" /> Technical Approach Analysis
                  </h5>
                  <p className="text-sm text-blue-800 leading-relaxed font-medium">{effectiveComparisonResult.betterApproach}</p>
                </div>
                <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm">
                  <h5 className="font-bold text-indigo-900 mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
                    <Search className="w-4 h-4" /> Granular Comparison Points
                  </h5>
                  <ul className="space-y-2.5">
                    {effectiveComparisonResult.keyDifferences?.map((diff, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-indigo-800 font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0 shadow-sm" />
                        {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-5 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Final Value Assessment</p>
                  <Zap className="w-3 h-3 text-amber-400" />
                </div>
                <p className="text-sm text-gray-200 leading-relaxed font-medium italic">{effectiveComparisonResult.valueAssessment}</p>
              </div>
            </div>
          )}

          {!effectiveComparisonResult && !isComparing && comparisonQuotes.filter(q => q).length < 2 && (
            <div className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Ready for Comparison</h4>
              <p className="text-sm text-gray-600 max-w-xs mx-auto mb-6">
                Upload a second quote to see a technical side-by-side analysis and identified "Winner" based on 2026 market standards.
              </p>
            </div>
          )}
        </div>
      );
    }

    // Handle Cost Breakdown Table & Bar Graph
    if (feature.isTable) {
      const items = Array.isArray(feature.content) ? feature.content : [];
      const totalCost = items.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0);
      const maxPrice = Math.max(...items.map(item => item.totalPrice || item.amount || 0), 1);

      return (
        <div className="space-y-6">
          {/* Total Cost Display Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-green-800 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Total Extracted Cost
            </h4>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900">
                ${(displayResult?.overallCost || totalCost || 0).toLocaleString()}
              </p>
              <p className="text-sm font-bold text-gray-500">AUD (inc. GST)</p>
            </div>
            <p className="text-xs text-green-700 mt-2 font-medium">Verified by AI Document Extraction</p>
          </div>

          {/* Bar Graph Visualization */}
          <div className="space-y-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cost Distribution</h5>
            <div className="space-y-3">
              {items.slice(0, 5).map((item, idx) => {
                const price = item.totalPrice || item.amount || 0;
                const percentage = totalCost > 0 ? (price / totalCost) * 100 : 0;
                const barWidth = (price / maxPrice) * 100;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span className="truncate max-w-[70%]">{item.description || item.item}</span>
                      <span>${price.toLocaleString()}</span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{percentage.toFixed(1)}% of total</span>
                    </div>
                  </div>
                );
              })}
              {items.length > 5 && (
                <p className="text-[10px] text-gray-400 italic text-center pt-2">+ {items.length - 5} additional items analyzed</p>
              )}
            </div>
          </div>

          {/* Detailed Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Item Details</th>
                  <th className="p-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="p-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors group">
                      <td className="p-3">
                        <div className="text-sm text-gray-900 font-bold group-hover:text-blue-700 transition-colors line-clamp-1">{item.description || item.item}</div>
                        {item.quantity && <div className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity} {item.unit ? `@ ${item.unitPrice}/${item.unit}` : ''}</div>}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase tracking-tight">
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-900 font-black text-right tabular-nums">
                        ${(item.totalPrice || item.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-400 italic text-sm">No itemized breakdown found in this document.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }


    return (
      <div className="space-y-3">
        {feature.isList ? (
          <ul className="space-y-3">
            {Array.isArray(feature.content) && feature.content.length > 0 ? (
              feature.content.map((item, index) => {
                // Handle different item types
                let displayText = item;
                let displaySubtext = null;
                let category = null;

                if (typeof item === 'string') {
                  displayText = item;
                } else if (item.question) {
                  // Question object
                  displayText = `${item.question}`;
                  category = item.category;
                } else if (item.title) {
                  // Recommendation or red flag object
                  displayText = `${item.title}`;
                  displaySubtext = item.description;
                  category = item.category;
                  if (item.potentialSavings && item.potentialSavings > 0) {
                    displaySubtext = `${displaySubtext} • Potential savings: $${item.potentialSavings}`;
                  }
                } else if (item.item && typeof item.marketAvg === 'number') {
                  // Benchmark object (Enhanced Premium styling)
                  displayText = item.item;
                  const range = (item.marketMax || 0) - (item.marketMin || 0);
                  const pos = range > 0 ? ((item.quotePrice - item.marketMin) / range) * 100 : 50;
                  const clampedPos = Math.max(0, Math.min(100, pos));

                  return (
                    <li key={index} className="flex flex-col gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-900">{displayText}</p>
                        <p className="text-lg font-black text-amber-600">${(item.quotePrice || 0).toLocaleString()}</p>
                      </div>

                      <div className="relative h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                          style={{ width: `${clampedPos}%` }}
                        ></div>
                        <div
                          className="absolute w-4 h-4 bg-white border-2 border-amber-600 rounded-full shadow-md -top-1"
                          style={{ left: `calc(${clampedPos}% - 8px)` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        <span>Min: ${item.marketMin.toLocaleString()}</span>
                        <span>Avg: ${item.marketAvg.toLocaleString()}</span>
                        <span>Max: ${item.marketMax.toLocaleString()}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded uppercase">
                          {item.percentile}th Percentile
                        </span>
                        <span className="text-[10px] text-gray-400 italic">Market Position: {clampedPos < 33 ? 'Competitive' : clampedPos < 66 ? 'Market Average' : 'Premium Pricing'}</span>
                      </div>
                    </li>
                  );
                } else if (item.description) {
                  // Generic object with description
                  displayText = item.description;
                } else if (typeof item === 'object') {
                  // Fallback for unexpected objects to prevent React rendering crashes
                  displayText = item.item || item.name || item.title || JSON.stringify(item);
                }

                return (
                  <li key={index} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all">
                    <span className="text-lg mt-0.5 flex-shrink-0 text-orange-500">✓</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{displayText}</p>
                      {displaySubtext && (
                        <p className="text-sm text-gray-600 mt-1">{displaySubtext}</p>
                      )}
                      {category && (
                        <p className="text-xs text-orange-600 font-medium mt-2 inline-block px-2.5 py-1 bg-orange-50 rounded">
                          {category}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="flex flex-col items-center justify-center py-10 px-6 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <Search className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">Detailed Data Unavailable</p>
                <p className="text-xs text-gray-500 max-w-[200px]">The AI couldn't extract enough specific data from this document to generate this section.</p>
              </li>
            )}
          </ul>
        ) : (
          <div className="p-5 bg-white border border-gray-200 rounded-lg text-gray-700 font-normal leading-relaxed text-sm">
            {featureKey === 'summary' && typeof feature.content === 'string' && feature.content.length > 500 ? (
              <>
                <div className={`${!expandedSections.summaryFull ? 'line-clamp-4' : ''} whitespace-pre-wrap`}>
                  {feature.content}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSections(prev => ({ ...prev, summaryFull: !prev.summaryFull }));
                  }}
                  className="mt-3 text-orange-600 font-bold text-xs flex items-center gap-1 hover:text-orange-700 transition-colors"
                >
                  {expandedSections.summaryFull ? (
                    <>Show Less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Show More <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              </>
            ) : (
              <div className="whitespace-pre-wrap">
                {typeof feature.content === 'object' ? 'No detailed data available yet.' : feature.content}
              </div>
            )}
          </div>
        )}

        {/* Visual Insights Injection Point */}
        {isUnlocked && isExpanded && (featureKey === 'costBreakdown' || featureKey === 'redFlags' || featureKey === 'recommendations' || featureKey === 'benchmarking') && (
          <div className="mt-8 border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl shadow-inner">
                  <BarChart2 className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] leading-none">Executive Visual Intelligence</h4>
                  <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-wider">AI-Driven Synthesis • 2026 Standards</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">Interactive Layer</span>
              </div>
            </div>

            <div className="h-[360px] w-full bg-gradient-to-br from-gray-50/50 to-white/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-sm relative group overflow-hidden transition-all hover:shadow-xl hover:shadow-orange-500/5">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors"></div>

              <ResponsiveContainer width="100%" height="100%">
                {featureKey === 'costBreakdown' ? (
                  <PieChart>
                    <Pie
                      data={chartData.costDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {chartData.costDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', paddingTop: '20px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                  </PieChart>
                ) : featureKey === 'redFlags' ? (
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.riskProfile}>
                    <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Risk intensity"
                      dataKey="value"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.4}
                      dot={{ r: 3, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                ) : featureKey === 'recommendations' ? (
                  <BarChart data={chartData.savingsROI} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="strategy" type="category" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} width={100} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} content={<CustomTooltip />} />
                    <Bar dataKey="current" fill="#f1f5f9" radius={[0, 6, 6, 0]} barSize={16} />
                    <Bar dataKey="potential" fill="#f97316" radius={[0, 6, 6, 0]} barSize={14} />
                  </BarChart>
                ) : (
                  <AreaChart data={chartData.timelineEstimates} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="phase" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="days" stroke="#f97316" fillOpacity={1} fill="url(#colorDays)" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase tracking-wider">
              <span>* Automated Cross-Reference Engine</span>
              <div className="flex items-center gap-1 bg-white px-2 py-0.5 border border-gray-100 rounded shadow-sm NOT_A_LINK">
                <Zap className="w-2.5 h-2.5 text-orange-400" />
                <span className="NOT_A_LINK text-gray-500">Live AI Synthesis</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFeatureCard = (featureKey, feature) => {
    const isUnlocked = isFeatureUnlocked(featureKey);
    const isExpanded = expandedSections[featureKey];
    const tierColor = getTierColor(feature.tier);
    const tierLabel = getTierLabel(feature.tier);

    return (
      <div
        key={featureKey}
        className={`border rounded-xl overflow-hidden transition-all ${isUnlocked
          ? 'bg-white border-gray-200 hover:shadow-lg'
          : 'bg-gray-50 border-gray-300'
          }`}
      >
        {/* Header */}
        <button
          onClick={() => toggleSection(featureKey)}
          className={`w-full p-4 sm:p-6 flex items-center justify-between transition-colors ${isUnlocked ? 'hover:bg-gray-50' : 'hover:bg-gray-100 cursor-default'
            }`}
        >
          <div className="flex items-start gap-4 flex-1 text-left">
            <span className="text-3xl mt-1">{feature.icon}</span>
            <div className="flex-1">
              {featureKey === 'verdict' && displayResult?.verdictDescription && (
                <div className="mb-6">
                  <p className={`text-gray-700 italic border-l-4 border-orange-200 pl-4 py-2 bg-orange-50 rounded-r-lg ${userTier === 'free' && !showFullVerdict ? 'line-clamp-3' : ''}`}>
                    "{displayResult.verdictDescription || "Based on the analysis, this quote appears to be within standard market rates."}"
                  </p>
                  {userTier === 'free' && (
                    <button
                      onClick={() => setShowFullVerdict(!showFullVerdict)}
                      className="text-orange-600 text-sm font-medium mt-2 hover:underline flex items-center gap-1"
                    >
                      {showFullVerdict ? 'Show Less' : 'Show More'} <ChevronDown className={`w-4 h-4 transition-transform ${showFullVerdict ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>
                {!isUnlocked && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${tierColor}`}>
                    {getTierIcon(feature.tier)}
                    <span>{tierLabel}</span>
                  </div>
                )}
                {isUnlocked && feature.tier !== 'free' && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${tierColor}`}>
                    {getTierIcon(feature.tier)}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>

          <div className="ml-4 flex-shrink-0">
            {isUnlocked ? (
              <>
                <Unlock className="w-5 h-5 text-green-500" />
              </>
            ) : (
              <Lock className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isUnlocked && isExpanded && (
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-white">
            {featureKey === 'verdict' && displayResult?.verdictJustification && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-100 rounded-lg text-sm text-gray-800 italic leading-relaxed">
                "{displayResult.verdictJustification}"
              </div>
            )}
            {renderFeatureContent(feature, featureKey, isExpanded)}
          </div>
        )}

        {/* Locked Content Indicator */}
        {!isUnlocked && isExpanded && (
          <div className="p-4 sm:p-6 border-t border-gray-200">
            {renderFeatureContent(feature, featureKey, isExpanded)}
          </div>
        )}
      </div>
    );
  };

  // Technical Data Modal Component
  const TechnicalDataModal = () => {
    if (!showTechnicalModal) return null;

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      try {
        return new Date(dateStr).toLocaleDateString('en-AU', {
          timeZone: 'Australia/Sydney',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateStr;
      }
    };

    const getTierBadge = () => {
      if (normalizedTier === 'premium') {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black text-white">
            <Crown className="w-3 h-3 mr-1.5 text-amber-400" />
            PREMIUM
          </span>
        );
      } else if (normalizedTier === 'standard') {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-600 text-white">
            <Zap className="w-3 h-3 mr-1.5" />
            STANDARD
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
            FREE
          </span>
        );
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex justify-center p-4 pt-20 animate-fadeIn">
        <div className={`rounded-2xl shadow-2xl w-full max-w-4xl h-fit max-h-[85vh] overflow-hidden flex flex-col animate-slideUp ${normalizedTier === 'premium' ? 'bg-gray-900' :
          normalizedTier === 'standard' ? 'bg-gradient-to-br from-orange-50 to-amber-50' :
            'bg-white'
          }`}>
          {/* Modal Header */}
          <div className={`flex items-center justify-between p-6 border-b ${normalizedTier === 'premium' ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' :
            normalizedTier === 'standard' ? 'border-orange-200 bg-gradient-to-r from-orange-100 to-amber-100' :
              'border-gray-200 bg-gradient-to-r from-gray-50 to-white'
            }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${normalizedTier === 'premium' ? 'bg-gradient-to-br from-amber-400 to-amber-500' :
                'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${normalizedTier === 'premium' ? 'text-white' : 'text-gray-900'
                  }`}>Technical Data</h2>
                <p className={`text-sm ${normalizedTier === 'premium' ? 'text-gray-300' :
                  normalizedTier === 'standard' ? 'text-gray-700' :
                    'text-gray-600'
                  }`}>Detailed analysis information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getTierBadge()}
              <button
                onClick={() => setShowTechnicalModal(false)}
                className={`p-2 rounded-lg transition-colors ${normalizedTier === 'premium' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
              >
                <X className={`w-5 h-5 ${normalizedTier === 'premium' ? 'text-gray-300' : 'text-gray-500'
                  }`} />
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${normalizedTier === 'premium' ? 'bg-gray-900' :
            normalizedTier === 'standard' ? 'bg-gradient-to-br from-orange-50 to-amber-50' :
              'bg-white'
            }`}>

            {/* Job Information - Available for ALL tiers */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Job Information
                </h3>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50 w-1/3">Job ID</td>
                      <td className="py-2 px-3 text-gray-900 font-mono text-sm">{jobResult?.jobId || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50">Analysis Date</td>
                      <td className="py-2 px-3 text-gray-900">{formatDate(jobResult?.createdAt)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50">File Name</td>
                      <td className="py-2 px-3 text-gray-900">{jobResult?.metadata?.title || displayResult?.metadata?.fileName || 'Quote Document'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50">Extraction Method</td>
                      <td className="py-2 px-3">
                        {displayResult?.metadata?.extractionMethod === 'vision_api' || displayResult?.metadata?.extractionMethod === 'fallback_placeholder' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-800">
                            <Star className="w-3 h-3 mr-1" />
                            AI Vision
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                            <FileText className="w-3 h-3 mr-1" />
                            Text Extraction
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50">Analysis Tier</td>
                      <td className="py-2 px-3">{getTierBadge()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Summary - Standard & Premium */}
            {(normalizedTier === 'standard' || normalizedTier === 'premium') && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    💰 Cost Summary
                  </h3>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50 w-1/3">Total Cost</td>
                        <td className="py-2 px-3 text-gray-900 font-bold text-lg">
                          ${(displayResult?.overallCost || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50">Labor</td>
                        <td className="py-2 px-3 text-gray-900">
                          ${(displayResult?.labourCost || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50">Materials</td>
                        <td className="py-2 px-3 text-gray-900">
                          ${(displayResult?.materialsCost || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50">Currency</td>
                        <td className="py-2 px-3 text-gray-900">AUD</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Premium Comparison Matrix */}
            {normalizedTier === 'premium' && effectiveComparisonResult && (
              <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl mb-8">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm">
                    <Crown className="w-5 h-5 text-amber-300" /> Technical Comparison Matrix (AU {jobResult?.createdAt ? new Date(jobResult.createdAt).getFullYear() : new Date().getFullYear()})
                  </h3>
                  <div className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-tighter">Premium Access</div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Winner Summary */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 border-l-4 border-l-amber-500">
                    <h4 className="text-amber-400 font-bold mb-3 uppercase text-[10px] tracking-widest">AI Professional Verdict</h4>
                    <p className="text-gray-200 text-sm leading-relaxed italic">
                      {effectiveComparisonResult.winner?.reason?.split('\n\n')[0]}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Better Approach */}
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-5">
                      <h4 className="text-blue-400 font-bold mb-3 uppercase text-[10px] tracking-widest">Strategic Methodology</h4>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        {effectiveComparisonResult.betterApproach}
                      </p>
                    </div>

                    {/* Key Technical Differences */}
                    <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-5">
                      <h4 className="text-indigo-400 font-bold mb-3 uppercase text-[10px] tracking-widest">Differentiators</h4>
                      <ul className="space-y-2">
                        {effectiveComparisonResult.keyDifferences?.slice(0, 4).map((diff, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-gray-300">
                            <Zap className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                            {diff}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Relative Pricing & Value */}
                  <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-4">
                    <h4 className="text-green-400 font-bold mb-2 uppercase text-[10px] tracking-widest">Market Value Assessment</h4>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      {effectiveComparisonResult.valueAssessment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Breakdown Table - Standard & Premium */}
            {(normalizedTier === 'standard' || normalizedTier === 'premium') && displayResult?.costBreakdown?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    📊 Detailed Cost Breakdown
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Item</th>
                        <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Qty</th>
                        <th className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Unit Price</th>
                        <th className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Total</th>
                        <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayResult.costBreakdown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900">{item.description || item.item}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-700">{item.quantity || 1}</td>
                          <td className="py-3 px-4 text-right text-sm text-gray-700">
                            ${(item.unitPrice || item.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                            ${(item.totalPrice || item.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${item.category === 'labour' || item.category === 'labor' ? 'bg-blue-100 text-blue-800' :
                              item.category === 'materials' ? 'bg-green-100 text-green-800' :
                                item.category === 'equipment' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {item.category || 'other'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Red Flags Table - Standard & Premium */}
            {(normalizedTier === 'standard' || normalizedTier === 'premium') && displayResult?.redFlags?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    🚩 Red Flags & Warnings
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Severity</th>
                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayResult.redFlags.map((flag, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${flag.severity === 'critical' ? 'bg-red-600 text-white' :
                              flag.severity === 'high' ? 'bg-red-100 text-red-800' :
                                flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                              }`}>
                              {flag.severity || 'low'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 capitalize">{flag.category || 'general'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{flag.description || flag.title}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{flag.recommendation || 'Review with contractor'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Benchmarking Table - Premium Only */}
            {normalizedTier === 'premium' && displayResult?.benchmarking?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    📈 Market Benchmarking
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Item</th>
                        <th className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Quote Price</th>
                        <th className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Market Min</th>
                        <th className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Market Avg</th>
                        <th className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Market Max</th>
                        <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Percentile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayResult.benchmarking.map((bench, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{bench.item}</td>
                          <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                            ${bench.quotePrice?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-600">
                            ${bench.marketMin?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-700">
                            ${bench.marketAvg?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-600">
                            ${bench.marketMax?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${bench.percentile >= 75 ? 'bg-red-100 text-red-800' :
                              bench.percentile >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {bench.percentile}th
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recommendations Table - Premium Only */}
            {normalizedTier === 'premium' && displayResult?.recommendations?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    💡 Recommendations & Savings
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Strategy</th>
                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                        <th className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Potential Savings</th>
                        <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Difficulty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayResult.recommendations.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">{rec.title}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 max-w-md">{rec.description}</td>
                          <td className="py-3 px-4 text-right text-sm font-bold text-green-700">
                            ${rec.potentialSavings?.toLocaleString() || '0'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${rec.difficulty === 'complex' ? 'bg-red-100 text-red-800' :
                              rec.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {rec.difficulty || 'easy'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Locked Content Indicators */}
            {normalizedTier === 'free' && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 text-center">
                <Lock className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Upgrade to See More</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Unlock detailed cost breakdown, red flags, benchmarking, and recommendations with Standard or Premium.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Zap className="w-4 h-4" />
                  View Plans
                </Link>
              </div>
            )}

            {normalizedTier === 'standard' && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
                <Crown className="w-12 h-12 text-gray-900 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Premium Features Locked</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Upgrade to Premium to unlock market benchmarking and advanced recommendations.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-all"
                >
                  <Crown className="w-4 h-4" />
                  Go Premium
                </Link>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className={`flex items-center justify-between p-4 border-t ${normalizedTier === 'premium' ? 'border-gray-700 bg-gray-800' :
            normalizedTier === 'standard' ? 'border-orange-200 bg-orange-100' :
              'border-gray-200 bg-gray-50'
            }`}>
            <p className={`text-xs ${normalizedTier === 'premium' ? 'text-gray-400' : 'text-gray-500'}`}>
              Generated on {new Date().toLocaleDateString('en-AU')} (AU)
            </p>
            <div className="flex gap-2">
              {normalizedTier === 'premium' && (
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloadingReport}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {isDownloadingReport ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export PDF
                </button>
              )}
              <button
                onClick={() => setShowTechnicalModal(false)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${normalizedTier === 'premium' ? 'bg-gray-700 text-white hover:bg-gray-600' :
                  normalizedTier === 'standard' ? 'bg-orange-200 text-gray-800 hover:bg-orange-300' :
                    'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Technical Data Modal */}
      <TechnicalDataModal />

      {/* Tier & Method Badges */}
      {!displayResult?.isIrrelevant && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {normalizedTier === 'premium' && (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-black text-white shadow-lg border border-gray-800">
                <Crown className="w-4 h-4 mr-2 text-amber-400" />
                PREMIUM ANALYSIS
              </span>
            )}
            {normalizedTier === 'standard' && (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md">
                <Zap className="w-4 h-4 mr-2" />
                STANDARD ANALYSIS
              </span>
            )}
            {normalizedTier === 'free' && (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                BASIC SUMMARY (FREE)
              </span>
            )}

            {displayResult?.metadata?.extractionMethod && (
              displayResult.metadata.extractionMethod === 'vision_api' || displayResult.metadata.extractionMethod === 'fallback_placeholder' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
                  <Star className="w-3 h-3 mr-1.5" />
                  AI Vision
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  <FileText className="w-3 h-3 mr-1.5" />
                  Text Verified
                </span>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Floating/Top Download Button */}
            <button
              onClick={normalizedTier === 'free' ? showTierAlert : handleDownloadReport}
              disabled={isDownloadingReport}
              className={`group flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${isDownloadingReport ? 'bg-blue-100 text-blue-400' :
                normalizedTier === 'free' ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' :
                  'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                }`}
              title={normalizedTier === 'free' ? 'Unlock Professional Report' : 'Download Professional PDF'}
            >
              {isDownloadingReport ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {normalizedTier === 'free' ? <Lock className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  <span className="text-xs">Report</span>
                </>
              )}
            </button>

            {/* Technical Data Button - Available for ALL tiers */}
            <button
              onClick={handleOpenTechnicalModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${normalizedTier === 'premium' ? 'bg-gray-900 text-white hover:bg-black shadow-sm' :
                normalizedTier === 'standard' ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-md' :
                  'bg-gray-700 text-white hover:bg-gray-800 shadow-sm'
                }`}
              title="View Technical Data"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-tight">Technical</span>
            </button>


            <div className="ml-2 text-[10px] text-gray-400 font-mono hidden sm:block">
              {jobResult?.jobId?.substring(0, 8).toUpperCase() || 'MOCK-RESULT'}
            </div>
          </div>
        </div>
      )}

      {/* Tier Information Banner */}
      {
        normalizedTier === 'free' && (
          <div className="mb-8 p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">You're on the Free Tier</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Upgrade to Standard or Premium to unlock detailed analysis, red flag detection, and more.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <Zap className="w-4 h-4" />
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        )
      }

      {
        normalizedTier === 'standard' && (
          <div className="mb-8 p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">You're on the Standard Plan</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Unlock Quote Comparison and Professional Technical Reports with the Premium plan.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 transition-all"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </Link>
              </div>
            </div>
          </div>
        )
      }

      {/* Features Grid */}
      {
        !displayResult?.isIrrelevant && (
          <div className="space-y-4">
            {renderFeatureCard('summary', features.summary)}
            {renderFeatureCard('verdict', features.verdict)}
            {renderFeatureCard('costBreakdown', features.costBreakdown)}
            {renderFeatureCard('redFlags', features.redFlags)}
            {renderFeatureCard('detailedReview', features.detailedReview)}
            {renderFeatureCard('questions', features.questions)}
            {renderFeatureCard('comparison', features.comparison)}
            {renderFeatureCard('benchmarking', features.benchmarking)}
            {renderFeatureCard('recommendations', features.recommendations)}
          </div>
        )
      }


      {/* Action Bar Removed - Moved to Top */}

      {/* Footer CTA */}
      {
        (normalizedTier === 'free' || normalizedTier === 'standard') && (
          <div className="mt-8 p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-center">
            <Crown className="w-8 h-8 text-gray-900 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {normalizedTier === 'free'
                ? 'Get Full Analysis with Standard or Premium'
                : 'Unlock Advanced Features with Premium'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {normalizedTier === 'free'
                ? 'Upgrade to see red flags, detailed cost breakdown, benchmarking, and more.'
                : 'Upgrade to Premium to compare multiple quotes and get technical reports.'}
            </p>
            <Link
              to="/pricing"
              className={`inline-flex items-center gap-2 px-8 py-3 text-white rounded-xl font-bold text-lg transition-all hover:shadow-lg ${normalizedTier === 'free'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-orange-500/30'
                : 'bg-black hover:bg-gray-900'
                }`}
            >
              {normalizedTier === 'free' ? (
                <>
                  <Zap className="w-5 h-5" />
                  Upgrade Now
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Go Premium
                </>
              )}
            </Link>
          </div>
        )
      }
    </div >
  );
};

export default AnalysisResults;

