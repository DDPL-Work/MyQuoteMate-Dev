// ============================================
// Premium Features Test Script
// Tests that AI generates and processor uses Premium data
// ============================================

// Load environment variables
require('dotenv').config();

const AIOrchestrator = require('../src/services/ai/AIOrchestrator');
const aiProcessor = require('../src/workers/processors/aiProcessor');

async function testPremiumFeatures() {
    console.log('\n🧪 Testing Premium Features Fix...\n');

    // Sample Australian renovation quote text
    const sampleQuote = `
RENOVATION QUOTE - Kitchen & Bathroom Upgrade
ABC Renovations Pty Ltd
ABN: 12 345 678 901

Project: Full Kitchen and Main Bathroom Renovation
Property: Residential - Single Storey Home

QUOTE BREAKDOWN:

Kitchen Renovation:
- Demolition and disposal: $2,500
- Cabinetry (2PAC finish, soft close): $12,000
- Benchtops (Engineered stone, 20mm): $4,500
- Appliances (oven, cooktop, rangehood): $3,800
- Plumbing modifications: $2,200
- Electrical works: $1,800
- Tiling (floor and splashback): $3,200
- Painting: $1,500

Bathroom Renovation:
- Demolition and disposal: $1,800
- Wall and floor tiling: $4,200
- Vanity and mirror: $2,500
- Toilet suite: $800
- Shower screen and fixtures: $1,900
- Plumbing: $2,400
- Electrical: $1,200
- Waterproofing: $1,500

Labour:
- Project management (15%): $7,200
- Installation and finishing: $18,000

TOTAL PROJECT COST: $72,700 (inc GST)

Payment Schedule:
- 30% deposit: $21,810
- 40% mid-stage: $29,080
- 30% completion: $21,810

Timeline: 6-8 weeks
Inclusions: All materials as specified, site cleanup
Exclusions: Architectural drawings, council approvals
  `;

    try {
        console.log('1️⃣ Calling AIOrchestrator with Premium tier...');
        const aiResult = await AIOrchestrator.analyzeQuote(
            sampleQuote,
            'premium',
            { workCategory: 'Kitchen & Bathroom', propertyType: 'Residential' }
        );

        console.log('\n✅ AI Analysis Complete!\n');
        console.log(`   - Recommendations: ${aiResult.analysis?.recommendations?.length || 0}`);
        console.log(`   - Benchmarks: ${aiResult.analysis?.benchmarking?.length || 0}`);

        if (aiResult.analysis?.recommendations?.length >= 4) {
            console.log('\n✅ AI generated sufficient recommendations (4+)');
            console.log('   Sample recommendation:');
            console.log(`   Title: "${aiResult.analysis.recommendations[0].title}"`);
            console.log(`   Description length: ${aiResult.analysis.recommendations[0].description.length} chars`);
            console.log(`   Savings: $${aiResult.analysis.recommendations[0].potentialSavings}`);
        } else {
            console.log('\n❌ AI generated insufficient recommendations');
        }

        if (aiResult.analysis?.benchmarking?.length >= 5) {
            console.log('\n✅ AI generated sufficient benchmarks (5+)');
            console.log('   Sample benchmark:');
            console.log(`   Item: "${aiResult.analysis.benchmarking[0].item}"`);
            console.log(`   Quote: $${aiResult.analysis.benchmarking[0].quotePrice}`);
            console.log(`   Market Avg: $${aiResult.analysis.benchmarking[0].marketAvg}`);
            console.log(`   Percentile: ${aiResult.analysis.benchmarking[0].percentile}%`);
        } else {
            console.log('\n❌ AI generated insufficient benchmarks');
        }

        // Test processor methods
        console.log('\n2️⃣ Testing processor data usage...\n');

        const recommendations = aiProcessor.ensureRecommendations(
            aiResult.analysis?.recommendations,
            'premium',
            72700
        );

        const benchmarking = aiProcessor.ensureBenchmarking(
            aiResult.analysis?.benchmarking,
            'premium',
            72700,
            aiResult.analysis?.costBreakdown
        );

        console.log(`   Processor returned ${recommendations.length} recommendations`);
        console.log(`   Processor returned ${benchmarking.length} benchmarks`);

        // Check if AI data was used (not fallbacks)
        if (aiResult.analysis?.recommendations?.length > 0) {
            const isAIData = recommendations[0].title === aiResult.analysis.recommendations[0].title;
            if (isAIData) {
                console.log('\n✅ SUCCESS: Processor is using AI-generated recommendations!');
            } else {
                console.log('\n⚠️  WARNING: Processor used fallback recommendations');
            }
        }

        if (aiResult.analysis?.benchmarking?.length > 0) {
            const isAIData = benchmarking[0].item === aiResult.analysis.benchmarking[0].item;
            if (isAIData) {
                console.log('✅ SUCCESS: Processor is using AI-generated benchmarks!');
            } else {
                console.log('⚠️  WARNING: Processor used fallback benchmarks');
            }
        }

        console.log('\n✅ Premium Features Test Complete!\n');
        return true;

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        console.error(error.stack);
        return false;
    }
}

// Run test if executed directly
if (require.main === module) {
    testPremiumFeatures()
        .then(success => process.exit(success ? 0 : 1))
        .catch(err => {
            console.error('Fatal error:', err);
            process.exit(1);
        });
}

module.exports = testPremiumFeatures;
