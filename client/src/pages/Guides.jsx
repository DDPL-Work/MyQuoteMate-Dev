import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Clock,
  User,
  FileText,
  AlertTriangle,
  DollarSign,
  Shield,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Home,
  Wrench,
  Zap,
  Hammer,
  Search,
  BookOpen,
  ArrowRight,
  Filter,
  Star,
  TrendingUp,
  CheckCircle2,
  Eye
} from 'lucide-react';

const Guides = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const guides = [
    {
      id: 1,
      category: "Red Flags",
      readTime: "7 min read",
      title: "10 Red Flags in Tradie Quotes You Should Never Ignore",
      description: "Learn the warning signs that indicate a quote might be dodgy, from vague descriptions to suspiciously low prices.",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      difficulty: "Beginner",
      rating: 4.9,
      content: `
    <div class="space-y-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">10 Red Flags in Tradie Quotes You Should Never Ignore</h1>
        <p class="text-lg text-gray-600">Protect yourself from costly mistakes by recognizing these critical warning signs in tradie quotes</p>
      </div>

      <div class="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-6 rounded-lg mb-8">
        <p class="text-gray-700">
          <strong class="text-gray-900">Expert Insight:</strong> According to the Australian Competition and Consumer Commission (ACCC), homeowners lose millions annually due to poor tradie quotes. Understanding these red flags can save you not just money, but also prevent project delays and quality issues.
        </p>
      </div>

      <!-- Red Flag 1 -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all duration-300">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-orange-600 font-bold text-xl">1</span>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Vague or Incomplete Scope Description</h3>
            <p class="text-gray-600 mb-4">
              One of the most common issues homeowners face is accepting quotes with vague descriptions. A proper quote should specify <strong class="text-gray-900">exactly what work will be done</strong>, including measurements, materials, and methods.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 class="font-medium text-red-600 mb-2">❌ Bad Quote Example</h4>
                <p class="text-sm text-gray-700">"Bathroom renovation" - $15,000</p>
                <p class="text-xs text-gray-500 mt-2">Too vague, no details</p>
              </div>
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="font-medium text-green-600 mb-2">✅ Good Quote Example</h4>
                <p class="text-sm text-gray-700">"Remove existing tiles (12m²), install waterproofing, lay new ceramic tiles (12m²), install new vanity (900mm), replace toilet, install new tapware" - $15,200</p>
                <p class="text-xs text-gray-500 mt-2">Specific, measurable tasks</p>
              </div>
            </div>
            <p class="text-gray-500 text-sm">
              <strong class="text-gray-700">Why it matters:</strong> Vague descriptions allow tradies to cut corners or charge extra for work you assumed was included. Always request itemized breakdowns.
            </p>
          </div>
        </div>
      </div>

      <!-- Red Flag 2 -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all duration-300">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-orange-600 font-bold text-xl">2</span>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Suspiciously Low Prices Compared to Market Rates</h3>
            <p class="text-gray-600 mb-4">
              While everyone loves a bargain, extremely low quotes often indicate one of three problems: <strong class="text-gray-900">incompetence</strong>, <strong class="text-gray-900">cutting corners</strong>, or <strong class="text-gray-900">hidden costs that will appear later</strong>.
            </p>
            
            <div class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Market Rate Comparison</h4>
              <div class="space-y-4">
                <!-- Bathroom Renovation -->
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h5 class="font-medium text-gray-900">Bathroom Renovation</h5>
                    <div class="flex items-center gap-4 mt-1 sm:mt-0">
                      <span class="text-gray-600 text-sm">Average Range:</span>
                      <span class="text-gray-900 font-medium">$15,000 - $35,000</span>
                    </div>
                  </div>
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span class="text-red-600 font-medium text-sm">Red Flag: Below $10,000</span>
                    </div>
                    <span class="text-gray-600 text-sm mt-1 sm:mt-0">Cheap materials, unlicensed work</span>
                  </div>
                </div>

                <!-- Deck Construction -->
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h5 class="font-medium text-gray-900">Deck Construction (15m²)</h5>
                    <div class="flex items-center gap-4 mt-1 sm:mt-0">
                      <span class="text-gray-600 text-sm">Average Range:</span>
                      <span class="text-gray-900 font-medium">$3,500 - $6,000</span>
                    </div>
                  </div>
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span class="text-red-600 font-medium text-sm">Red Flag: Below $2,000</span>
                    </div>
                    <span class="text-gray-600 text-sm mt-1 sm:mt-0">Untreated timber, poor foundations</span>
                  </div>
                </div>

                <!-- Kitchen Renovation -->
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h5 class="font-medium text-gray-900">Kitchen Renovation</h5>
                    <div class="flex items-center gap-4 mt-1 sm:mt-0">
                      <span class="text-gray-600 text-sm">Average Range:</span>
                      <span class="text-gray-900 font-medium">$20,000 - $45,000</span>
                    </div>
                  </div>
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span class="text-red-600 font-medium text-sm">Red Flag: Below $12,000</span>
                    </div>
                    <span class="text-gray-600 text-sm mt-1 sm:mt-0">Poor quality cabinets, shortcuts</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p class="text-gray-500 text-sm">
              <strong class="text-gray-700">Protection Tip:</strong> Always get at least 3 quotes for comparison. If one quote is significantly lower (30%+ difference), ask detailed questions about materials, labor rates, and inclusions.
            </p>
          </div>
        </div>
      </div>

      <!-- Red Flag 3 -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all duration-300">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-orange-600 font-bold text-xl">3</span>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">No Detailed Cost Breakdown</h3>
            <p class="text-gray-600 mb-4">
              A Standard quote should separate labour, materials, and additional costs. Without this breakdown, you can't verify if you're being charged fairly or compare quotes accurately.
            </p>
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">What a proper breakdown includes:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Labour costs per trade (plumber, electrician, etc.)</li>
                  <li>• Materials with brand names and quantities</li>
                  <li>• Subcontractor costs (if applicable)</li>
                  <li>• Equipment hire or rental fees</li>
                  <li>• Waste disposal costs</li>
                  <li>• Council permits and fees</li>
                </ul>
              </div>
              <p class="text-gray-500 text-sm">
                <strong class="text-gray-700">Expert Tip:</strong> Ask for hourly rates and estimated hours for each trade. This helps you understand where your money is going.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Red Flags 4-10 Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-orange-600 font-bold">4</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-2">Missing License or Insurance</h4>
          <p class="text-gray-600 text-sm">Legitimate tradies proudly display their license numbers and insurance details. Always verify their credentials with state authorities.</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-orange-600 font-bold">5</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-2">Pressure to Sign Immediately</h4>
          <p class="text-gray-600 text-sm">High-pressure tactics prevent proper review. Standard tradies understand you need time to decide and compare quotes.</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-orange-600 font-bold">6</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-2">Large Upfront Payment Requests</h4>
          <p class="text-gray-600 text-sm">While a 10-20% deposit is normal, requests for 50% or more upfront are red flags that could indicate cash flow problems.</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-orange-600 font-bold">7</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-2">No Written Contract</h4>
          <p class="text-gray-600 text-sm">A verbal agreement offers no protection. Always insist on a written contract that outlines all terms and conditions.</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-orange-600 font-bold">8</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-2">No References or Portfolio</h4>
          <p class="text-gray-600 text-sm">Reputable tradies should provide recent references and examples of similar work they've completed successfully.</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-orange-600 font-bold">9</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-2">Vague Timeline</h4>
          <p class="text-gray-600 text-sm">"It'll take a few weeks" is not specific enough. Get start and completion dates in writing with milestones.</p>
        </div>
      </div>

      <!-- Action Steps -->
      <div class="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 mt-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">What to Do When You Spot Red Flags</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Get Multiple Quotes</h4>
                <p class="text-gray-600 text-sm">Always compare at least 3 quotes to establish a reasonable price range</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Ask Questions</h4>
                <p class="text-gray-600 text-sm">Don't hesitate to ask for clarifications or additional details</p>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Check Credentials</h4>
                <p class="text-gray-600 text-sm">Verify licenses and insurance with state authorities</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Trust Your Instincts</h4>
                <p class="text-gray-600 text-sm">If something feels off, it probably is. Keep looking for other options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
    },
    {
      id: 2,
      category: "Pricing",
      readTime: "7 min read",
      title: "How Much Should Plumbing Really Cost in Australia?",
      description: "A comprehensive guide to fair plumbing prices across different types of jobs, from fixing leaky taps to full bathroom renovations.",
      icon: <DollarSign className="w-5 h-5" />,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      difficulty: "Intermediate",
      rating: 4.8,
      content: `
      <div class="space-y-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">How Much Should Plumbing Really Cost in Australia?</h1>
          <p class="text-lg text-gray-600">A comprehensive guide to fair plumbing prices across different types of jobs in 2024</p>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg mb-8">
          <p class="text-gray-700">
            <strong class="text-gray-900">Important Note:</strong> Prices vary by state, city, and even suburbs. These are average ranges based on data from the Master Plumbers Association and ServiceSeeking.com.au. Always get multiple quotes for your specific location.
          </p>
        </div>

        <!-- Emergency Plumbing -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Emergency Plumbing Services</h2>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Emergency Service</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Call-Out Fee</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Hourly Rate</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Total Typical Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-700">After-hours leak repair</td>
                  <td class="py-3 px-4 text-gray-700">$150 - $250</td>
                  <td class="py-3 px-4 text-gray-700">$120 - $180/hr</td>
                  <td class="py-3 px-4 text-gray-700">$400 - $800</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-700">Blocked toilet emergency</td>
                  <td class="py-3 px-4 text-gray-700">$100 - $200</td>
                  <td class="py-3 px-4 text-gray-700">$100 - $150/hr</td>
                  <td class="py-3 px-4 text-gray-700">$250 - $500</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-700">Burst pipe repair</td>
                  <td class="py-3 px-4 text-gray-700">$200 - $300</td>
                  <td class="py-3 px-4 text-gray-700">$120 - $180/hr</td>
                  <td class="py-3 px-4 text-gray-700">$500 - $1,200</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Standard Plumbing -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Standard Plumbing Services</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Fixture Installation</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Tap replacement: $80 - $200</li>
                  <li>• Toilet installation: $200 - $600</li>
                  <li>• Shower installation: $400 - $1,200</li>
                  <li>• Bath installation: $600 - $1,500</li>
                  <li>• Sink/basin installation: $150 - $400</li>
                </ul>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Drainage & Pipework</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Clear blocked drain: $150 - $400</li>
                  <li>• CCTV drain inspection: $250 - $500</li>
                  <li>• Install new downpipe: $150 - $300/m</li>
                  <li>• Pipe repair/replacement: $200 - $800</li>
                </ul>
              </div>
            </div>
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Hot Water Systems</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Electric HWS replacement: $800 - $1,500</li>
                  <li>• Gas HWS replacement: $1,000 - $2,000</li>
                  <li>• Solar HWS installation: $3,000 - $5,000</li>
                  <li>• Heat pump installation: $2,500 - $4,000</li>
                </ul>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Gas Fitting</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Install gas cooktop: $300 - $600</li>
                  <li>• Gas heater installation: $500 - $1,200</li>
                  <li>• Gas line installation: $80 - $150/m</li>
                  <li>• Gas compliance certificate: $80 - $150</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Large Projects -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Major Plumbing Projects</h2>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Project Type</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Average Cost Range</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Timeframe</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Key Factors Affecting Price</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-700">Bathroom Renovation</td>
                  <td class="py-3 px-4 text-gray-700">$10,000 - $25,000</td>
                  <td class="py-3 px-4 text-gray-700">1-3 weeks</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Quality of fixtures, accessibility, structural changes</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-700">Kitchen Plumbing</td>
                  <td class="py-3 px-4 text-gray-700">$2,000 - $8,000</td>
                  <td class="py-3 px-4 text-gray-700">3-7 days</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Number of appliances, re-routing pipes, island bench</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-700">Whole House Re-plumb</td>
                  <td class="py-3 px-4 text-gray-700">$8,000 - $20,000</td>
                  <td class="py-3 px-4 text-gray-700">1-3 weeks</td>
                  <td class="py-3 px-4 text-sm text-gray-600">House size, wall access, pipe materials, complexity</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 text-gray-700">New Bathroom Install</td>
                  <td class="py-3 px-4 text-gray-700">$5,000 - $15,000</td>
                  <td class="py-3 px-4 text-gray-700">2-4 weeks</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Location, soil conditions, council requirements</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Regional Price Variations -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Regional Price Variations</h2>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">State/Territory</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Average Hourly Rate</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Call-Out Fee</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-700">New South Wales</td>
                  <td class="py-3 px-4 text-gray-700">$90 - $160/hr</td>
                  <td class="py-3 px-4 text-gray-700">$120 - $250</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Sydney rates higher than regional</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-700">Victoria</td>
                  <td class="py-3 px-4 text-gray-700">$85 - $150/hr</td>
                  <td class="py-3 px-4 text-gray-700">$110 - $220</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Melbourne inner city highest</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-700">Queensland</td>
                  <td class="py-3 px-4 text-gray-700">$80 - $140/hr</td>
                  <td class="py-3 px-4 text-gray-700">$100 - $200</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Brisbane rates comparable to Melbourne</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 text-gray-700">Western Australia</td>
                  <td class="py-3 px-4 text-gray-700">$85 - $155/hr</td>
                  <td class="py-3 px-4 text-gray-700">$115 - $230</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Perth mining boom legacy prices</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cost Factors -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Factors That Affect Plumbing Costs</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-green-600 font-bold">1</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Location & Accessibility</h4>
                <p class="text-gray-600 text-sm">Urban vs regional, ease of access to pipes</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Time of Service</h4>
                <p class="text-gray-600 text-sm">Weekday vs weekend, business hours vs emergency</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Materials Quality</h4>
                <p class="text-gray-600 text-sm">Basic vs premium fixtures and pipes</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-green-600 font-bold">4</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Licensing & Experience</h4>
                <p class="text-gray-600 text-sm">Apprentice vs licensed master plumber</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Money Saving Tips -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mt-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Money-Saving Tips for Plumbing Work</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-1">Schedule Non-Emergency Work</h4>
                  <p class="text-gray-600 text-sm">Book regular plumbing work during business hours to avoid after-hours fees</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-1">Combine Multiple Jobs</h4>
                  <p class="text-gray-600 text-sm">Get multiple issues fixed in one visit to save on call-out fees</p>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-1">Ask About Off-Peak Rates</h4>
                  <p class="text-gray-600 text-sm">Some plumbers offer discounts for work scheduled during quieter periods</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-1">Get Written Quotes</h4>
                  <p class="text-gray-600 text-sm">Always get written quotes to compare and avoid unexpected charges</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    },
    {
      id: 3,
      category: "Checklists",
      readTime: "8 min read",
      title: "Electrical Quote Checklist: What Should Be Included?",
      description: "Find out what every electrical quote should contain, from itemized materials to safety certifications.",
      icon: <Zap className="w-5 h-5" />,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
      difficulty: "Beginner",
      rating: 4.9,
      content: `
      <div class="space-y-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Electrical Quote Checklist: What Should Be Included?</h1>
          <p class="text-lg text-gray-600">A comprehensive checklist to ensure your electrical quote meets Australian standards and protects your safety</p>
        </div>

        <div class="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-8">
          <p class="text-gray-700">
            <strong class="text-gray-900">Safety First:</strong> Electrical work in Australia must be performed by a licensed electrician. According to Energy Safe Victoria, unlicensed electrical work is illegal and poses serious safety risks including electrocution and fire.
          </p>
        </div>

        <!-- Mandatory Information -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Mandatory Information (Required by Law)</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span class="text-yellow-600 font-bold">✓</span>
                  </div>
                  <h3 class="font-semibold text-gray-900">Electrician License Details</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Full name of licensed electrician</li>
                  <li>• Electrical license number</li>
                  <li>• State of registration</li>
                  <li>• Expiry date of license</li>
                  <li>• Contact phone and email</li>
                  <li>• ABN (Australian Business Number)</li>
                </ul>
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span class="text-yellow-600 font-bold">✓</span>
                  </div>
                  <h3 class="font-semibold text-gray-900">Insurance Coverage</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Public liability insurance ($20M minimum)</li>
                  <li>• Workers compensation insurance</li>
                  <li>• Policy number and expiry date</li>
                  <li>• Insurance company details</li>
                  <li>• Certificate of Currency available</li>
                </ul>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span class="text-yellow-600 font-bold">✓</span>
                  </div>
                  <h3 class="font-semibold text-gray-900">Safety Certificates</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Certificate of Electrical Safety (CES)</li>
                  <li>• Test and tag certificates for equipment</li>
                  <li>• Asbestos clearance (if applicable)</li>
                  <li>• Compliance with AS/NZS 3000:2018</li>
                  <li>• Energy efficiency certificates</li>
                </ul>
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span class="text-yellow-600 font-bold">✓</span>
                  </div>
                  <h3 class="font-semibold text-gray-900">Scope of Work</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Detailed description of all work</li>
                  <li>• Specific locations within property</li>
                  <li>• Number and type of fittings</li>
                  <li>• Any demolition/prep work required</li>
                  <li>• Clean-up and waste removal included</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Cost Breakdown -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Detailed Cost Breakdown Checklist</h2>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Cost Category</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">What Should Be Included</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Typical % of Total</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Check</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Labour Costs</td>
                  <td class="py-3 px-4 text-sm text-gray-600">
                    • Hourly rates for each electrician<br>
                    • Estimated hours per task<br>
                    • Supervisor/foreman fees<br>
                    • Travel time and expenses<br>
                    • Overtime rates (if applicable)
                  </td>
                  <td class="py-3 px-4 text-gray-700">40-60%</td>
                  <td class="py-3 px-4">
                    <span class="inline-flex w-6 h-6 bg-green-100 rounded-full items-center justify-center">
                      <span class="text-green-600 text-sm">✓</span>
                    </span>
                  </td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Materials & Equipment</td>
                  <td class="py-3 px-4 text-sm text-gray-600">
                    • Itemized list of all materials<br>
                    • Brand names and specifications<br>
                    • Quantities and unit prices<br>
                    • Delivery fees if applicable<br>
                    • Equipment hire/rental costs
                  </td>
                  <td class="py-3 px-4 text-gray-700">25-40%</td>
                  <td class="py-3 px-4">
                    <span class="inline-flex w-6 h-6 bg-green-100 rounded-full items-center justify-center">
                      <span class="text-green-600 text-sm">✓</span>
                    </span>
                  </td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Additional Costs</td>
                  <td class="py-3 px-4 text-sm text-gray-600">
                    • Council permits and fees<br>
                    • Safety equipment rental<br>
                    • Waste removal/disposal<br>
                    • Contingency allowance (10-15%)<br>
                    • GST clearly stated
                  </td>
                  <td class="py-3 px-4 text-gray-700">15-25%</td>
                  <td class="py-3 px-4">
                    <span class="inline-flex w-6 h-6 bg-green-100 rounded-full items-center justify-center">
                      <span class="text-green-600 text-sm">✓</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pricing Comparison -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Typical Electrical Service Prices</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-gray-900 mb-3">Residential Electrical Work</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span class="text-gray-700">Install power point</span>
                  <span class="font-medium text-gray-900">$80 - $150</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span class="text-gray-700">Install light switch</span>
                  <span class="font-medium text-gray-900">$70 - $120</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span class="text-gray-700">Install light fitting</span>
                  <span class="font-medium text-gray-900">$100 - $200</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span class="text-gray-700">Ceiling fan installation</span>
                  <span class="font-medium text-gray-900">$200 - $350</span>
                </div>
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-3">Safety & Compliance Work</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span class="text-gray-700">Safety switch installation</span>
                  <span class="font-medium text-gray-900">$250 - $400</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span class="text-gray-700">Switchboard upgrade</span>
                  <span class="font-medium text-gray-900">$800 - $1,500</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span class="text-gray-700">Electrical safety inspection</span>
                  <span class="font-medium text-gray-900">$150 - $300</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Smoke alarm installation</span>
                  <span class="font-medium text-gray-900">$120 - $200</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Project Timeline -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Project Timeline & Milestones</h2>
          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-amber-600 font-bold text-lg">1</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-2">Initial Assessment & Quote</h3>
                <p class="text-gray-600 text-sm">Site inspection, detailed quote preparation, permit applications if needed (2-7 days)</p>
                <div class="mt-2">
                  <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Documents to receive: Quote, license copy, insurance certificate</span>
                </div>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-amber-600 font-bold text-lg">2</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Preparation & Materials</h3>
                <p class="text-gray-600 text-sm">Ordering materials, scheduling trades, preparing worksite (3-10 days)</p>
                <div class="mt-2">
                  <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Check: Material delivery schedule, permit approvals</span>
                </div>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-amber-600 font-bold text-lg">3</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Installation Phase</h3>
                <p class="text-gray-600 text-sm">Actual electrical work including rough-in, fittings, and connections (varies by project)</p>
                <div class="mt-2">
                  <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Monitor: Progress photos, daily updates</span>
                </div>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-amber-600 font-bold text-lg">4</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Testing & Certification</h3>
                <p class="text-gray-600 text-sm">Final testing, safety checks, issuing of compliance certificates (1-2 days)</p>
                <div class="mt-2">
                  <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Final deliverables: Certificate of Electrical Safety, warranties, as-built diagrams</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning Signs -->
        <div class="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Warning Signs in Electrical Quotes</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-red-600 font-bold">!</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Cash Only Payment</h4>
                <p class="text-gray-600 text-sm">Standard electricians accept multiple payment methods</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-red-600 font-bold">!</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">No Certificate Offered</h4>
                <p class="text-gray-600 text-sm">All electrical work requires a Certificate of Electrical Safety</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-red-600 font-bold">!</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Unlicensed Work</h4>
                <p class="text-gray-600 text-sm">Check license number with state authorities before hiring</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-red-600 font-bold">!</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Unusually Low Price</h4>
                <p class="text-gray-600 text-sm">If it seems too good to be true, it probably is</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Downloadable Checklist -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mt-8">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Download Printable Checklist</h3>
              <p class="text-gray-600">Print this checklist to compare multiple electrical quotes effectively</p>
            </div>
            <button class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
              Download PDF Checklist
            </button>
          </div>
        </div>
      </div>
    `
    },
    {
      id: 4,
      category: "Renovations",
      readTime: "12 min read",
      title: "Building Renovation Quotes: The Ultimate Guide",
      description: "Everything you need to know about getting, comparing, and accepting building quotes for your home renovation.",
      icon: <Hammer className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      difficulty: "Advanced",
      rating: 4.7,
      content: `
      <div class="space-y-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Building Renovation Quotes: The Ultimate Guide</h1>
          <p class="text-lg text-gray-600">Everything you need to know about getting, comparing, and accepting building quotes for your home renovation</p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
          <p class="text-gray-700">
            <strong class="text-gray-900">Renovation Reality Check:</strong> The average Australian home renovation costs between $20,000 and $100,000+ depending on scope. Proper quote analysis can save you 15-30% while ensuring quality workmanship.
          </p>
        </div>

        <!-- Quote Comparison Framework -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">How to Compare Multiple Renovation Quotes</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span class="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-3">Standardise the Scope</h3>
              <p class="text-gray-600 text-sm">Ensure all quotes cover exactly the same work. Create a detailed brief with measurements, materials, and finishes to give to each builder.</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span class="text-blue-600 font-bold text-xl">2</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-3">Analyse Cost Breakdowns</h3>
              <p class="text-gray-600 text-sm">Compare labour rates, material costs, and profit margins. Look for significant variations that might indicate overpricing or corner-cutting.</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span class="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-3">Evaluate Builder Credentials</h3>
              <p class="text-gray-600 text-sm">Check licenses, insurance, previous work, and references. A slightly higher quote from a more experienced builder is often better value.</p>
            </div>
          </div>
        </div>

        <!-- Cost Breakdown Example -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Typical Kitchen Renovation Cost Breakdown</h2>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Component</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Average Cost</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">% of Total</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Quality Variations</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Cabinetry</td>
                  <td class="py-3 px-4 text-gray-700">$4,000 - $15,000</td>
                  <td class="py-3 px-4 text-gray-700">25-35%</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Flatpack vs custom joinery</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Benchtops</td>
                  <td class="py-3 px-4 text-gray-700">$2,000 - $8,000</td>
                  <td class="py-3 px-4 text-gray-700">15-25%</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Laminate vs stone vs marble</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Appliances</td>
                  <td class="py-3 px-4 text-gray-700">$3,000 - $10,000</td>
                  <td class="py-3 px-4 text-gray-700">20-30%</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Basic vs premium brands</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Plumbing & Electrical</td>
                  <td class="py-3 px-4 text-gray-700">$2,000 - $5,000</td>
                  <td class="py-3 px-4 text-gray-700">10-15%</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Relocations vs new installations</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Labour</td>
                  <td class="py-3 px-4 text-gray-700">$5,000 - $12,000</td>
                  <td class="py-3 px-4 text-gray-700">30-40%</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Experience level, project management</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 font-medium text-gray-900">Flooring</td>
                  <td class="py-3 px-4 text-gray-700">$1,500 - $4,000</td>
                  <td class="py-3 px-4 text-gray-700">8-12%</td>
                  <td class="py-3 px-4 text-sm text-gray-600">Vinyl vs timber vs tiles</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Regional Price Variations -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Renovation Costs by Australian City</h2>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">City</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Average Kitchen Reno</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Average Bathroom Reno</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Whole House Reno</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Cost Factor</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Sydney</td>
                  <td class="py-3 px-4 text-gray-700">$25,000 - $45,000</td>
                  <td class="py-3 px-4 text-gray-700">$20,000 - $35,000</td>
                  <td class="py-3 px-4 text-gray-700">$100,000 - $300,000</td>
                  <td class="py-3 px-4">
                    <span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">High</span>
                  </td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Melbourne</td>
                  <td class="py-3 px-4 text-gray-700">$22,000 - $40,000</td>
                  <td class="py-3 px-4 text-gray-700">$18,000 - $32,000</td>
                  <td class="py-3 px-4 text-gray-700">$90,000 - $250,000</td>
                  <td class="py-3 px-4">
                    <span class="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Medium-High</span>
                  </td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 font-medium text-gray-900">Brisbane</td>
                  <td class="py-3 px-4 text-gray-700">$20,000 - $35,000</td>
                  <td class="py-3 px-4 text-gray-700">$16,000 - $28,000</td>
                  <td class="py-3 px-4 text-gray-700">$80,000 - $200,000</td>
                  <td class="py-3 px-4">
                    <span class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Medium</span>
                  </td>
                </tr>
                <tr>
                  <td class="py-3 px-4 font-medium text-gray-900">Adelaide</td>
                  <td class="py-3 px-4 text-gray-700">$18,000 - $30,000</td>
                  <td class="py-3 px-4 text-gray-700">$15,000 - $25,000</td>
                  <td class="py-3 px-4 text-gray-700">$70,000 - $180,000</td>
                  <td class="py-3 px-4">
                    <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Medium-Low</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Timeline & Milestones -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Standard Renovation Timeline with Payment Milestones</h2>
          <div class="space-y-6">
            <div class="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 font-bold text-xl">5%</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">Deposit & Planning</h3>
                <p class="text-gray-600 text-sm">Initial deposit upon acceptance of quote. Covers council applications, final measurements, and material ordering.</p>
              </div>
              <div class="text-blue-600 font-medium">Week 1-2</div>
            </div>

            <div class="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 font-bold text-xl">20%</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">Demolition & Rough-in</h3>
                <p class="text-gray-600 text-sm">Payment after demolition completion and structural/mechanical rough-in (plumbing, electrical, framing).</p>
              </div>
              <div class="text-blue-600 font-medium">Week 3-4</div>
            </div>

            <div class="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 font-bold text-xl">30%</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">Lock-up Stage</h3>
                <p class="text-gray-600 text-sm">Payment when external walls, roof, windows, and doors are installed and the property is secure.</p>
              </div>
              <div class="text-blue-600 font-medium">Week 5-8</div>
            </div>

            <div class="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 font-bold text-xl">25%</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">Fixing Stage</h3>
                <p class="text-gray-600 text-sm">Payment after internal linings, kitchens, bathrooms, and built-in joinery are installed.</p>
              </div>
              <div class="text-blue-600 font-medium">Week 9-12</div>
            </div>

            <div class="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 font-bold text-xl">20%</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">Practical Completion</h3>
                <p class="text-gray-600 text-sm">Final payment upon completion of all work, cleaning, and handover of all certificates and warranties.</p>
              </div>
              <div class="text-blue-600 font-medium">Week 13+</div>
            </div>
          </div>
        </div>

        <!-- Hidden Costs to Watch For -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Hidden Costs in Renovation Quotes</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span class="text-red-600 font-bold">!</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">Site Preparation Costs</h4>
                  <p class="text-gray-600 text-sm">Asbestos removal, termite treatment, tree removal, soil testing</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span class="text-red-600 font-bold">!</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">Council & Authority Fees</h4>
                  <p class="text-gray-600 text-sm">Development applications, building permits, inspection fees</p>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span class="text-red-600 font-bold">!</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">Temporary Accommodation</h4>
                  <p class="text-gray-600 text-sm">If renovation makes home unlivable during construction</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span class="text-red-600 font-bold">!</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">Variation Orders</h4>
                  <p class="text-gray-600 text-sm">Changes to original scope - typically charged at builder's rates + margin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Builder Selection Checklist -->
        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Builder Selection Checklist</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-gray-900 mb-3">Essential Checks</h3>
              <ul class="space-y-2">
                <li class="flex items-start gap-2">
                  <span class="text-green-600 mt-1">✓</span>
                  <span class="text-gray-700">HIA or MBA membership</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600 mt-1">✓</span>
                  <span class="text-gray-700">Current builders license</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600 mt-1">✓</span>
                  <span class="text-gray-700">$20M public liability insurance</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600 mt-1">✓</span>
                  <span class="text-gray-700">Workers compensation insurance</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-3">Reference Checks</h3>
              <ul class="space-y-2">
                <li class="flex items-start gap-2">
                  <span class="text-green-600 mt-1">✓</span>
                  <span class="text-gray-700">Recent client references (last 12 months)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600 mt-1">✓</span>
                  <span class="text-gray-700">Visit completed projects</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600 mt-1">✓</span>
                  <span class="text-gray-700">Check online reviews</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600 mt-1">✓</span>
                  <span class="text-gray-700">Verify dispute history</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Contract Essentials -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mt-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Essential Contract Clauses</h2>
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Fixed Price Contract</h4>
              <p class="text-gray-600 text-sm">Ensure your contract states a fixed price, not "cost plus" which can blow out</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Progress Payment Schedule</h4>
              <p class="text-gray-600 text-sm">Tie payments to completion of specific, verifiable milestones</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Variation Process</h4>
              <p class="text-gray-600 text-sm">All variations must be in writing, priced, and approved before work starts</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Defects Liability Period</h4>
              <p class="text-gray-600 text-sm">Minimum 3 months for minor defects, 6 years for structural defects</p>
            </div>
          </div>
        </div>
      </div>
    `
    },
    {
      id: 5,
      category: "Tips",
      readTime: "6 min read",
      title: "5 Questions Every Homeowner Should Ask Before Accepting a Quote",
      description: "The essential questions that will help you avoid problems down the track and ensure you're getting a fair deal.",
      icon: <HelpCircle className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      difficulty: "Beginner",
      rating: 5.0,
      content: `
      <div class="space-y-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">5 Essential Questions Every Homeowner Should Ask</h1>
          <p class="text-lg text-gray-600">Critical questions to ask before accepting any tradie quote - your protection against future problems</p>
        </div>

        <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-lg mb-8">
          <p class="text-gray-700">
            <strong class="text-gray-900">Pro Tip:</strong> The way a tradie responds to these questions can tell you as much as their actual answers. Confidence, transparency, and patience are signs of a Standard.
          </p>
        </div>

        <!-- Question 1 -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold text-xl">1</span>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Is This a Fixed Price Quote or an Estimate?</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-purple-50 border border-purple-200 rounded-xl p-5">
                  <h3 class="font-semibold text-purple-600 mb-3">Fixed Price Quote</h3>
                  <ul class="text-sm text-gray-600 space-y-2">
                    <li>• Price won't change (except for variations)</li>
                    <li>• Must be in writing</li>
                    <li>• Requires detailed scope of work</li>
                    <li>• Best for defined projects</li>
                    <li>• Provides price certainty</li>
                  </ul>
                </div>
                <div class="bg-pink-50 border border-pink-200 rounded-xl p-5">
                  <h3 class="font-semibold text-pink-600 mb-3">Estimate</h3>
                  <ul class="text-sm text-gray-600 space-y-2">
                    <li>• Approximate cost only</li>
                    <li>• Can increase significantly</li>
                    <li>• Used for exploratory work</li>
                    <li>• Higher risk for homeowners</li>
                    <li>• Should have clear upper limit</li>
                  </ul>
                </div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">What to Ask for Clarity:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>"Under what circumstances can the price increase?"</li>
                  <li>"How do you handle unexpected issues discovered during work?"</li>
                  <li>"What's your process for approving variation orders?"</li>
                  <li>"Is there a maximum price cap on this quote?"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Question 2 -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold text-xl">2</span>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">What's Included in Your Warranty or Guarantee?</h2>
              <p class="text-gray-600 mb-6">
                Understanding warranty coverage is crucial for long-term protection. Australian Consumer Law provides basic guarantees, but specific trade warranties offer additional protection.
              </p>
              <div class="overflow-x-auto mb-6">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Warranty Type</th>
                      <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Typical Duration</th>
                      <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">What's Covered</th>
                      <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Common Exclusions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-gray-100">
                      <td class="py-3 px-4 font-medium text-gray-900">Workmanship</td>
                      <td class="py-3 px-4 text-gray-700">1-5 years</td>
                      <td class="py-3 px-4 text-sm text-gray-600">Quality of installation and construction</td>
                      <td class="py-3 px-4 text-sm text-gray-600">Normal wear and tear, damage from misuse</td>
                    </tr>
                    <tr class="border-b border-gray-100">
                      <td class="py-3 px-4 font-medium text-gray-900">Materials</td>
                      <td class="py-3 px-4 text-gray-700">Per manufacturer</td>
                      <td class="py-3 px-4 text-sm text-gray-600">Defects in materials supplied</td>
                      <td class="py-3 px-4 text-sm text-gray-600">Improper installation, accidental damage</td>
                    </tr>
                    <tr class="border-b border-gray-100">
                      <td class="py-3 px-4 font-medium text-gray-900">Structural</td>
                      <td class="py-3 px-4 text-gray-700">6-7 years</td>
                      <td class="py-3 px-4 text-sm text-gray-600">Major structural elements (varies by state)</td>
                      <td class="py-3 px-4 text-sm text-gray-600">Minor defects, cosmetic issues</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Key Questions About Warranties:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>"Is the warranty transferable if I sell my home?"</li>
                  <li>"What's the process for making a warranty claim?"</li>
                  <li>"Do I need to register the warranty or is it automatic?"</li>
                  <li>"Who covers labour costs for warranty repairs?"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions 3-5 Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <span class="text-white font-bold text-lg">3</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Who Will Be Doing the Work?</h3>
            <p class="text-gray-600 text-sm mb-4">
              Many tradies subcontract parts of jobs. Know exactly who will be on site, their qualifications, and whether they're employees or subcontractors.
            </p>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span class="text-xs text-gray-700">Ask to meet the team</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span class="text-xs text-gray-700">Check subcontractor licenses</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span class="text-xs text-gray-700">Verify supervision arrangements</span>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <span class="text-white font-bold text-lg">4</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">What's Your Payment Schedule?</h3>
            <p class="text-gray-600 text-sm mb-4">
              A reasonable payment schedule protects both parties. Avoid tradies who demand large upfront payments.
            </p>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-pink-500 rounded-full"></span>
                <span class="text-xs text-gray-700">10-20% deposit maximum</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-pink-500 rounded-full"></span>
                <span class="text-xs text-gray-700">Progress payments tied to milestones</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-pink-500 rounded-full"></span>
                <span class="text-xs text-gray-700">5-10% retention until completion</span>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <span class="text-white font-bold text-lg">5</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">How Do You Handle Clean-up?</h3>
            <p class="text-gray-600 text-sm mb-4">
              A Standard includes site clean-up in their quote. Don't assume it's included - many disputes arise from mess left behind.
            </p>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span class="text-xs text-gray-700">Daily site tidying included</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span class="text-xs text-gray-700">Waste removal specified</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span class="text-xs text-gray-700">Final Standard clean</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bonus Questions -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mt-8">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Bonus Questions for Extra Protection</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-medium text-gray-900 mb-2">Timing & Communication</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>"What are your normal working hours?"</li>
                <li>"Who will be my main point of contact?"</li>
                <li>"How often will you provide progress updates?"</li>
                <li>"What's your process for handling delays?"</li>
              </ul>
            </div>
            <div>
              <h3 class="font-medium text-gray-900 mb-2">Safety & Access</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>"What safety measures will be in place?"</li>
                <li>"Will you need access to electricity/water?"</li>
                <li>"Where will materials be stored?"</li>
                <li>"How will you protect existing features?"</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Dispute Resolution -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 mt-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">What Happens if We Disagree?</h2>
          <p class="text-gray-600 mb-6">
            Even with the best planning, disputes can happen. Knowing the resolution process upfront saves stress later.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Step 1: Informal Resolution</h4>
              <p class="text-gray-600 text-xs">Direct discussion with the tradie, most common and quickest resolution method</p>
              <div class="mt-2">
                <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Recommended First</span>
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Step 2: Mediation</h4>
              <p class="text-gray-600 text-xs">Third-party mediator helps reach agreement, often through industry bodies like HIA or MBA</p>
              <div class="mt-2">
                <span class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Industry Assistance</span>
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Step 3: Formal Channels</h4>
              <p class="text-gray-600 text-xs">State tribunals (NCAT, VCAT, QCAT, etc.) or courts as last resort</p>
              <div class="mt-2">
                <span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Last Resort</span>
              </div>
            </div>
          </div>
          <div class="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">Pro Tip: Document Everything</h4>
            <p class="text-gray-600 text-sm">Keep records of all communications, photos of work progress, and written approvals for any changes. This documentation is crucial if disputes arise.</p>
          </div>
        </div>

        <!-- Action Checklist -->
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mt-8">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-white mb-2">Ready to Check Your Quote?</h3>
              <p class="text-white/90">Use our AI-powered tool to analyze your tradie quote in seconds</p>
            </div>
            <button class="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300">
              Check Your Quote Now
            </button>
          </div>
        </div>
      </div>
    `
    },
    {
      id: 6,
      category: "Education",
      readTime: "9 min read",
      title: "Understanding Tradie Terms: A Plain English Dictionary",
      description: "Decode common tradie jargon and technical terms so you can understand exactly what you're paying for.",
      icon: <BookOpen className="w-5 h-5" />,
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-violet-50",
      difficulty: "Intermediate",
      rating: 4.8,
      content: `
      <div class="space-y-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Tradie Terms: Plain English Dictionary</h1>
          <p class="text-lg text-gray-600">Decode common tradie jargon and technical terms so you can understand exactly what you're paying for</p>
        </div>

        <div class="bg-gradient-to-r from-indigo-50 to-violet-50 border-l-4 border-indigo-500 p-6 rounded-lg mb-8">
          <p class="text-gray-700">
            <strong class="text-gray-900">Why This Matters:</strong> Understanding tradie terminology helps you communicate effectively, spot potential issues in quotes, and ensure you're getting what you pay for. This knowledge can save you thousands.
          </p>
        </div>

        <!-- Quote & Contract Terms -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Quote & Contract Terms Explained</h2>
          <div class="space-y-6">
            <div class="border-b border-gray-100 pb-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3">"Labour and Materials" (L&M)</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-medium text-indigo-600 mb-2">What It Means:</h4>
                  <p class="text-gray-600">The tradie provides both the workers (labour) and all necessary materials for the job. This is the most common pricing method for tradie work in Australia.</p>
                </div>
                <div>
                  <h4 class="font-medium text-indigo-600 mb-2">What to Watch For:</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Should include itemized material list with brand names</li>
                    <li>• Labour rates should be specified (hourly or daily)</li>
                    <li>• Ask if GST is included or added separately</li>
                    <li>• Check if waste removal is included</li>
                    <li>• Verify if equipment hire is extra</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="border-b border-gray-100 pb-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3">"Day Rate" or "Hourly Rate"</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-medium text-indigo-600 mb-2">What It Means:</h4>
                  <p class="text-gray-600">Charging based on time worked rather than a fixed project price. Common for small jobs, emergency repairs, or exploratory work where the full scope isn't known.</p>
                </div>
                <div>
                  <h4 class="font-medium text-indigo-600 mb-2">Typical Australian Rates 2024:</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-700">Apprentice/Junior</span>
                      <span class="text-sm font-medium text-gray-900">$40 - $60/hour</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-700">Licensed Tradesperson</span>
                      <span class="text-sm font-medium text-gray-900">$80 - $120/hour</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-700">Specialist/Master</span>
                      <span class="text-sm font-medium text-gray-900">$120 - $180/hour</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-700">Day Rate (8 hours)</span>
                      <span class="text-sm font-medium text-gray-900">6-7x hourly rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-b border-gray-100 pb-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3">"PC Sum" (Prime Cost Sum)</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-medium text-indigo-600 mb-2">What It Means:</h4>
                  <p class="text-gray-600">An allowance for an item where the exact cost isn't known yet. For example: "kitchen tapware - PC Sum $500". The actual cost may be higher or lower.</p>
                </div>
                <div>
                  <h4 class="font-medium text-indigo-600 mb-2">What to Watch For:</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Ask for a list of all PC Sum items in the quote</li>
                    <li>• Understand how price variations are handled</li>
                    <li>• Get written approval for any changes</li>
                    <li>• Request to see actual invoices for PC items</li>
                    <li>• Some builders add margin to PC items - ask!</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">"Provisional Sum"</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-medium text-indigo-600 mb-2">What It Means:</h4>
                  <p class="text-gray-600">An estimate for work where the scope isn't fully defined yet. Different from PC Sum which is for materials only. Provisional sums are for work that might be needed.</p>
                </div>
                <div>
                  <h4 class="font-medium text-indigo-600 mb-2">What to Watch For:</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• These sums can increase significantly</li>
                    <li>• Ask for worst-case estimates</li>
                    <li>• Request detailed breakdown before work starts</li>
                    <li>• Get fixed price if possible once scope known</li>
                    <li>• Builder's margin often added to provisional sums</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Construction Terms -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Construction & Renovation Terms</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">"Rough-in" or "First Fix"</h3>
                <p class="text-gray-600 text-sm">Installing the basic framework of systems (plumbing pipes, electrical wires, framing) before walls are closed up with plasterboard.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">"Lock-up Stage"</h3>
                <p class="text-gray-600 text-sm">When external doors and windows are installed and the building is secure from weather and unauthorized entry. A key payment milestone.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">"Practical Completion"</h3>
                <p class="text-gray-600 text-sm">When work is complete except for minor defects. This triggers final payment obligations and starts the defects liability period.</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">"Defects Liability Period"</h3>
                <p class="text-gray-600 text-sm">The time after completion (usually 3-12 months) during which the builder must fix any defects that appear. Required by Australian law.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">"Variation" or "Variation Order"</h3>
                <p class="text-gray-600 text-sm">A change to the original scope of work. Must be in writing, priced, and agreed by both parties before work proceeds. Can significantly increase costs.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">"Retention"</h3>
                <p class="text-gray-600 text-sm">A portion of payment (usually 5-10%) held back until the end of the defects liability period. Provides leverage to ensure defects are fixed.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Trade-Specific Terms -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Trade-Specific Jargon Decoded</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-4">
              <h3 class="font-semibold text-violet-600 mb-3">Electrical Terms</h3>
              <div class="bg-violet-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">"Circuit Breaker"</h4>
                <p class="text-gray-600 text-xs">Safety device that automatically cuts power if overload detected. Replaces old-fashioned fuses.</p>
              </div>
              <div class="bg-violet-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">"RCD" (Safety Switch)</h4>
                <p class="text-gray-600 text-xs">Device that cuts power in milliseconds to prevent electrocution. Required in all new homes and renovations.</p>
              </div>
              <div class="bg-violet-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">"Switchboard"</h4>
                <p class="text-gray-600 text-xs">The main electrical panel that distributes power throughout your home. Often needs upgrading in older homes.</p>
              </div>
            </div>
            <div class="space-y-4">
              <h3 class="font-semibold text-violet-600 mb-3">Plumbing Terms</h3>
              <div class="bg-violet-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">"Water Hammer"</h4>
                <p class="text-gray-600 text-xs">Banging noise in pipes when taps shut quickly; indicates need for air chambers or water hammer arrestors.</p>
              </div>
              <div class="bg-violet-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">"Backflow Prevention"</h4>
                <p class="text-gray-600 text-xs">Device to stop contaminated water flowing back into mains supply. Required by law in many situations.</p>
              </div>
              <div class="bg-violet-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">"Waterproofing"</h4>
                <p class="text-gray-600 text-xs">Applying membranes to wet areas (bathrooms, showers) to prevent water damage. Critical for compliance.</p>
              </div>
            </div>
            <div class="space-y-4">
              <h3 class="font-semibold text-violet-600 mb-3">Building Terms</h3>
              <div class="bg-violet-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">"Stud Wall"</h4>
                <p class="text-gray-600 text-xs">Non-load-bearing interior wall made of timber or metal frames covered with plasterboard.</p>
              </div>
              <div class="bg-violet-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">"Damp Course"</h4>
                <p class="text-gray-600 text-xs">Waterproof layer in walls to prevent moisture rising from ground. Required in all Australian buildings.</p>
              </div>
              <div class="bg-violet-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">"Cavity Wall"</h4>
                <p class="text-gray-600 text-xs">Double wall with air gap between for insulation and moisture prevention. Standard in brick homes.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Acronym Dictionary -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Common Australian Trade Acronyms</h2>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Acronym</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Full Name</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">What It Means</th>
                  <th class="py-3 px-4 text-left border-b border-gray-200 text-gray-900">Why It Matters</th>
                </tr>
              </thead>
                <tbody>
                    <tr>
                        <td class="py-3 px-4 font-medium text-gray-900">HIA</td>
                        <td class="py-3 px-4 text-gray-700">Housing Industry Association</td>
                        <td class="py-3 px-4 text-sm text-gray-600">Australia's largest residential building industry association, providing resources and support for builders and homeowners.</td>
                        <td class="py-3 px-4 text-sm text-gray-600">Membership indicates Standardism; they offer dispute resolution services.</td>
                    </tr>
                    <tr>
                        <td class="py-3 px-4 font-medium text-gray-900">MBA</td>
                        <td class="py-3 px-4 text-gray-700">Master Builders Australia</td>
                        <td class="py-3 px-4 text-sm text-gray-600">A leading industry association representing builders and contractors across Australia.</td>     
                        <td class="py-3 px-4 text-sm text-gray-600">Membership suggests credibility; they provide training and advocacy.</td>
                    </tr>
                    </tbody>
            </div>
        </div>
        </div>
    `
    },
  ];
  // Handle guide click
  const handleGuideClick = (guide) => {
    setSelectedGuide(guide);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuide(null);
    document.body.style.overflow = 'auto';
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Categories array - NOW IT CAN USE guides SINCE IT'S DEFINED ABOVE
  const categories = [
    { name: "All", icon: <Home className="w-4 h-4" />, count: guides.length },
    { name: "Red Flags", icon: <AlertTriangle className="w-4 h-4" />, count: guides.filter(g => g.category === "Red Flags").length },
    { name: "Pricing", icon: <DollarSign className="w-4 h-4" />, count: guides.filter(g => g.category === "Pricing").length },
    { name: "Checklists", icon: <FileText className="w-4 h-4" />, count: guides.filter(g => g.category === "Checklists").length },
    { name: "Renovations", icon: <Hammer className="w-4 h-4" />, count: guides.filter(g => g.category === "Renovations").length },
    { name: "Tips", icon: <HelpCircle className="w-4 h-4" />, count: guides.filter(g => g.category === "Tips").length },
    { name: "Education", icon: <BookOpen className="w-4 h-4" />, count: guides.filter(g => g.category === "Education").length },
  ];

  // Filter guides based on category and search
  const filteredGuides = guides.filter(guide => {
    const matchesCategory = activeCategory === 'All' || guide.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Effect for initial animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Effect for escape key handling
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  // Effect for dynamic CSS injection
  useEffect(() => {
    if (isModalOpen) {
      const style = document.createElement('style');
      style.innerHTML = `
        .guide-content h1, .guide-content h2, .guide-content h3, .guide-content h4 {
          font-weight: 600;
          color: #111827;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
        }
        
        .guide-content h1 {
          font-size: 1.875rem;
          line-height: 2.25rem;
        }
        
        .guide-content h2 {
          font-size: 1.5rem;
          line-height: 2rem;
        }
        
        .guide-content h3 {
          font-size: 1.25rem;
          line-height: 1.75rem;
        }
        
        .guide-content p {
          margin-bottom: 1rem;
          color: #4b5563;
        }
        
        .guide-content ul, .guide-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .guide-content li {
          margin-bottom: 0.5rem;
        }
        
        .guide-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }
        
        .guide-content th {
          background-color: #f9fafb;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .guide-content td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .guide-content .bg-white {
          background-color: white;
        }
        
        .guide-content .rounded-xl {
          border-radius: 0.75rem;
        }
        
        .guide-content .space-y-6 > * + * {
          margin-top: 1.5rem;
        }
        
        .guide-content .space-y-8 > * + * {
          margin-top: 2rem;
        }
        
        .guide-content .grid {
          display: grid;
        }
        
        .guide-content .gap-4 {
          gap: 1rem;
        }
        
        .guide-content .gap-6 {
          gap: 1.5rem;
        }
        
        .guide-content .p-6 {
          padding: 1.5rem;
        }
        
        .guide-content .mb-4 {
          margin-bottom: 1rem;
        }
        
        .guide-content .mb-6 {
          margin-bottom: 1.5rem;
        }
        
        .guide-content .mb-8 {
          margin-bottom: 2rem;
        }
        
        .guide-content .mt-8 {
          margin-top: 2rem;
        }
        
        .guide-content .text-center {
          text-align: center;
        }
        
        .guide-content .text-gray-900 {
          color: #111827;
        }
        
        .guide-content .text-gray-700 {
          color: #374151;
        }
        
        .guide-content .text-gray-600 {
          color: #4b5563;
        }
        
        .guide-content .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        
        .guide-content .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }
        
        .guide-content .font-bold {
          font-weight: 700;
        }
        
        .guide-content .font-semibold {
          font-weight: 600;
        }
        
        .guide-content .font-medium {
          font-weight: 500;
        }
        
        .guide-content .border {
          border-width: 1px;
        }
        
        .guide-content .border-gray-200 {
          border-color: #e5e7eb;
        }
        
        .guide-content .rounded-lg {
          border-radius: 0.5rem;
        }
        
        .guide-content .overflow-x-auto {
          overflow-x: auto;
        }
        
        .guide-content .flex {
          display: flex;
        }
        
        .guide-content .items-start {
          align-items: flex-start;
        }
        
        .guide-content .items-center {
          align-items: center;
        }
        
        .guide-content .gap-4 {
          gap: 1rem;
        }
        
        .guide-content .flex-1 {
          flex: 1;
        }
        
        .guide-content .flex-shrink-0 {
          flex-shrink: 0;
        }
        
        .guide-content .justify-center {
          justify-content: center;
        }
        
        .guide-content .w-10 {
          width: 2.5rem;
        }
        
        .guide-content .h-10 {
          height: 2.5rem;
        }
        
        .guide-content .rounded-full {
          border-radius: 9999px;
        }
        
        .guide-content .text-xl {
          font-size: 1.25rem;
          line-height: 1.75rem;
        }
        
        .guide-content .from-orange-100 {
          --tw-gradient-from: #fed7aa;
          --tw-gradient-to: rgb(254 215 170 / 0);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }
        
        .guide-content .to-red-100 {
          --tw-gradient-to: #fecaca;
        }
        
        .guide-content .text-orange-600 {
          color: #ea580c;
        }
        
        @media (min-width: 768px) {
          .guide-content .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .guide-content .md\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `;
      style.id = 'guide-content-styles';
      document.head.appendChild(style);
      return () => {
        const existingStyle = document.getElementById('guide-content-styles');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-orange-300 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-amber-400 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-6 tracking-wide">
            <Sparkles className="w-4 h-4 mr-2" />
            EXPERT KNOWLEDGE BASE
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 tracking-tight">
            Guides & Tips for Smart Homeowners
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Learn how to spot fair quotes and make confident decisions about your home projects
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search guides and tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(category.name)}
                className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ${activeCategory === category.name
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md'
                  }`}
              >
                <div className={activeCategory === category.name ? 'text-white' : 'text-orange-500'}>
                  {category.icon}
                </div>
                <span className="text-sm sm:text-base font-medium">{category.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === category.name
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
                  }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-6 sm:py-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { value: "50+", label: "Expert Guides", icon: <BookOpen className="w-4 h-4" /> },
              { value: "4.8/5", label: "Average Rating", icon: <Star className="w-4 h-4" /> },
              { value: "10,000+", label: "Monthly Readers", icon: <Eye className="w-4 h-4" /> },
              { value: "100%", label: "Free Access", icon: <CheckCircle2 className="w-4 h-4" /> }
            ].map((stat, index) => (
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

      {/* Guides Grid */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchQuery && (
            <div className="mb-6 sm:mb-8">
              <p className="text-gray-600">
                Showing {filteredGuides.length} results for "<span className="font-semibold">{searchQuery}</span>"
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredGuides.map((guide, index) => (
              <div
                key={guide.id}
                onClick={() => handleGuideClick(guide)}
                className={`group bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-orange-300 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 transform hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${guide.bgColor} flex items-center justify-center`}>
                      <div className={`text-white bg-gradient-to-r ${guide.color} rounded-md p-1`}>
                        {guide.icon}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600">{guide.category}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {guide.readTime}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 line-clamp-2">
                  {guide.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base line-clamp-3 mb-4">
                  {guide.description}
                </p>

                {/* Rating & Difficulty */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">{guide.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {guide.difficulty}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Expert</span>
                  </div>
                </div>

                {/* Read More Button */}
                <button className="w-full inline-flex items-center justify-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-semibold hover:gap-2 transition-all py-2 rounded-lg hover:bg-orange-50">
                  Read Full Guide
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No guides found</h3>
              <p className="text-gray-600 mb-6">Try a different search term or category</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                View All Guides
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Guide */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-white/20 text-white rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  MOST POPULAR GUIDE
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                  Red Flags in Tradie Quotes
                </h2>
                <p className="text-white/90 mb-6 text-lg">
                  Learn the 10 warning signs that indicate a quote might be dodgy or unfair. Save yourself from costly mistakes.
                </p>
                <button
                  onClick={() => handleGuideClick(guides[0])}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                >
                  Read Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">What You'll Learn</h4>
                      <p className="text-white/80 text-sm">Critical warning signs in quotes</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {['Vague descriptions', 'Suspiciously low prices', 'Missing cost breakdowns', 'No license info'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/90">
                        <CheckCircle2 className="w-4 h-4" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-4 sm:mb-6 tracking-wide">
            READY TO APPLY WHAT YOU'VE LEARNED?
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 tracking-tight text-gray-900">
            Check Your Quote with Confidence
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Use our AI-powered analysis to get instant clarity on any tradie quote
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              to="/upload"
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              <span className="relative z-10">Check Your Quote Now</span>
              <Search className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-2 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-700 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/how-it-works"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl sm:rounded-2xl font-medium text-base sm:text-lg hover:border-orange-300 hover:text-orange-600 transition-all duration-300 w-full sm:w-auto text-center"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Modal for Guide Content */}
      {isModalOpen && selectedGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm transition-all duration-300"
          onClick={handleOverlayClick}
        >
          <div className={`relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300 ${isModalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${selectedGuide.bgColor} flex items-center justify-center`}>
                    <div className={`text-white bg-gradient-to-r ${selectedGuide.color} rounded-md p-1`}>
                      {selectedGuide.icon}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">{selectedGuide.category}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {selectedGuide.readTime}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-4 text-gray-900">{selectedGuide.title}</h2>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div
                className="guide-content"
                dangerouslySetInnerHTML={{ __html: selectedGuide.content }}
              />

              {/* Action Buttons at Bottom */}
              <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-8">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close Guide
                  </button>
                  <Link
                    to="/upload"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-center"
                  >
                    Check Your Quote Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default Guides;