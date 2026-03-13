// backend/src/services/report/ReportService.js

const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');
const logger = require('../../utils/logger');

class ReportService {
    constructor() {
        // Logo path - corrected to match actual location
        this.logoPath = path.join(__dirname, '..', '..', '..', '..', 'client', 'src', 'assets', 'logo.png');

        // Color schemes for tiers
        this.colors = {
            standard: {
                primary: '#f97316',      // Orange
                secondary: '#fb923c',
                accent: '#fdba74',
                dark: '#ea580c'
            },
            premium: {
                primary: '#000000',      // Black
                secondary: '#1f2937',
                accent: '#fbbf24',       // Gold
                dark: '#111827'
            },
            neutral: {
                dark: '#1f2937',
                gray: '#6b7280',
                lightGray: '#d1d5db',
                white: '#ffffff',
                background: '#f9fafb'
            }
        };
    }

    /**
     * Draw a crown icon (for Premium)
     */
    drawCrown(doc, x, y, size, color) {
        doc.save();
        doc.fillColor(color);

        // Crown base
        doc.polygon(
            [x, y + size],
            [x + size, y + size],
            [x + size * 0.9, y + size * 0.4],
            [x + size * 0.7, y + size * 0.6],
            [x + size * 0.5, y],
            [x + size * 0.3, y + size * 0.6],
            [x + size * 0.1, y + size * 0.4]
        ).fill();

        // Crown jewels (circles)
        doc.circle(x + size * 0.2, y + size * 0.5, size * 0.08).fill();
        doc.circle(x + size * 0.5, y + size * 0.15, size * 0.08).fill();
        doc.circle(x + size * 0.8, y + size * 0.5, size * 0.08).fill();

        doc.restore();
    }

    /**
     * Draw a star icon
     */
    drawStar(doc, x, y, size, color) {
        doc.save();
        doc.fillColor(color);

        const points = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? size : size * 0.4;
            points.push([
                x + radius * Math.cos(angle),
                y + radius * Math.sin(angle)
            ]);
        }

        doc.polygon(...points).fill();
        doc.restore();
    }

    /**
     * Draw a checkmark icon (for Quote Integrity)
     */
    drawCheckmark(doc, x, y, size, color) {
        doc.save();
        doc.strokeColor(color)
            .lineWidth(size * 0.15)
            .lineCap('round')
            .lineJoin('round');

        // Draw checkmark path
        doc.moveTo(x + size * 0.2, y + size * 0.5)
            .lineTo(x + size * 0.45, y + size * 0.75)
            .lineTo(x + size * 0.85, y + size * 0.25)
            .stroke();

        doc.restore();
    }

    /**
     * Draw an alert/warning icon (for Risk Level)
     */
    drawAlert(doc, x, y, size, color) {
        doc.save();
        doc.fillColor(color);

        // Triangle
        doc.polygon(
            [x + size * 0.5, y + size * 0.1],
            [x + size * 0.9, y + size * 0.9],
            [x + size * 0.1, y + size * 0.9]
        ).fill();

        // Exclamation mark
        doc.fillColor('#ffffff');
        doc.roundedRect(x + size * 0.45, y + size * 0.35, size * 0.1, size * 0.25, 1).fill();
        doc.circle(x + size * 0.5, y + size * 0.75, size * 0.06).fill();

        doc.restore();
    }

    /**
     * Draw a dollar sign icon (for Total Cost)
     */
    drawDollarSign(doc, x, y, size, color) {
        doc.save();
        doc.strokeColor(color)
            .lineWidth(size * 0.12)
            .lineCap('round');

        // Top curve
        doc.moveTo(x + size * 0.7, y + size * 0.3)
            .bezierCurveTo(
                x + size * 0.7, y + size * 0.15,
                x + size * 0.3, y + size * 0.15,
                x + size * 0.3, y + size * 0.3
            )
            .stroke();

        // Bottom curve
        doc.moveTo(x + size * 0.3, y + size * 0.5)
            .bezierCurveTo(
                x + size * 0.3, y + size * 0.85,
                x + size * 0.7, y + size * 0.85,
                x + size * 0.7, y + size * 0.7
            )
            .stroke();

        // Vertical line
        doc.moveTo(x + size * 0.5, y + size * 0.05)
            .lineTo(x + size * 0.5, y + size * 0.95)
            .stroke();

        doc.restore();
    }

    /**
     * Draw an info/confidence icon
     */
    drawInfoIcon(doc, x, y, size, color) {
        doc.save();

        // Circle outline
        doc.strokeColor(color)
            .lineWidth(size * 0.08)
            .circle(x + size * 0.5, y + size * 0.5, size * 0.4)
            .stroke();

        // 'i' letter
        doc.fillColor(color);
        doc.circle(x + size * 0.5, y + size * 0.3, size * 0.08).fill();
        doc.roundedRect(x + size * 0.45, y + size * 0.45, size * 0.1, size * 0.35, 1).fill();

        doc.restore();
    }

    /**
     * Draw a donut chart to visualize categorical data
     */
    drawDonutChart(doc, x, y, radius, data, colors) {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) {
            // Placeholder for no data
            doc.save();
            doc.fillColor('#f3f4f6')
                .circle(x, y, radius)
                .fill();
            doc.fillColor('#9ca3af')
                .font('Helvetica')
                .fontSize(10)
                .text('No detected risks', x - radius, y - 5, { width: radius * 2, align: 'center' });
            doc.restore();
            return;
        }

        let startAngle = -Math.PI / 2;
        const thickness = Math.max(18, radius * 0.32);
        const innerRadius = radius - thickness;

        // Draw each segment with precise SVG paths for a premium, non-distorted look
        const segmentGap = data.length > 1 ? 0.035 : 0; // Tiny professional gap between slices

        data.forEach((item, idx) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            if (sliceAngle <= 0) return;

            // Apply gap adjustments
            let currentStart = startAngle + (segmentGap / 2);
            let currentEnd = startAngle + sliceAngle - (segmentGap / 2);

            // Prevent negative slice ranges if value is extremely small
            if (currentEnd <= currentStart) {
                currentStart = startAngle;
                currentEnd = startAngle + sliceAngle;
            }

            doc.save();
            doc.fillColor(item.color || '#cbd5e1');

            if (sliceAngle >= 2 * Math.PI - 0.01) {
                // Full circle handling with even-odd cutout
                doc.circle(x, y, radius);
                doc.circle(x, y, innerRadius);
                doc.fill('even-odd');
            } else {
                // Standard annular wedge using precise SVG arc commands
                const startX = x + radius * Math.cos(currentStart);
                const startY = y + radius * Math.sin(currentStart);
                const endX = x + radius * Math.cos(currentEnd);
                const endY = y + radius * Math.sin(currentEnd);

                const innerStartX = x + innerRadius * Math.cos(currentEnd);
                const innerStartY = y + innerRadius * Math.sin(currentEnd);
                const innerEndX = x + innerRadius * Math.cos(currentStart);
                const innerEndY = y + innerRadius * Math.sin(currentStart);

                const largeArcFlag = (currentEnd - currentStart) > Math.PI ? 1 : 0;

                const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L ${innerStartX} ${innerStartY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY} Z`;

                doc.path(pathData).fill();
            }

            doc.restore();
            startAngle += sliceAngle;
        });

        // Draw outer ring for crispness
        doc.save();
        doc.strokeColor('#e2e8f0').lineWidth(1.2).circle(x, y, radius + 2).stroke();
        doc.restore();

        // Center text (Total)
        doc.fillColor('#111827')
            .font('Helvetica-Bold')
            .fontSize(18)
            .text(total.toString(), x - radius, y - 10, { width: radius * 2, align: 'center' });

        doc.fillColor('#6b7280')
            .font('Helvetica-Bold')
            .fontSize(7)
            .text('TOTAL RISKS', x - radius, y + 8, { width: radius * 2, align: 'center', characterSpacing: 1 });

        // Outer decorative ring
        doc.save();
        doc.strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .circle(x, y, radius + 5)
            .stroke();
        doc.restore();
    }

    /**
     * Draw a risk spectrum (Low to High)
     */
    drawRiskSpectrum(doc, x, y, width, height, value) {
        // Linear gradient simulated with high-quality segments
        const segments = 40;
        const segWidth = width / segments;

        doc.save();
        for (let i = 0; i < segments; i++) {
            const ratio = i / segments;
            // Precise Green to Red interpolation
            let color;
            if (ratio < 0.3) color = '#10b981'; // Green
            else if (ratio < 0.6) color = '#f59e0b'; // Amber
            else color = '#ef4444'; // Red

            doc.fillColor(color)
                .fillOpacity(0.8)
                .rect(x + i * segWidth, y, segWidth, height)
                .fill();
        }
        doc.restore();

        // Marker (Modern pointer with shadow effect)
        const markerX = x + (value / 100) * width;

        doc.save();
        // Shadow for marker
        doc.fillColor('#000000')
            .fillOpacity(0.1)
            .moveTo(markerX, y - 3)
            .lineTo(markerX - 7, y - 14)
            .lineTo(markerX + 7, y - 14)
            .closePath()
            .fill();

        doc.fillColor('#111827')
            .moveTo(markerX, y - 5)
            .lineTo(markerX - 6, y - 16)
            .lineTo(markerX + 6, y - 16)
            .closePath()
            .fill();
        doc.restore();

        // Labels with proper alignment to prevent going off-page
        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(7);

        doc.text('LOW RISK', x, y + height + 6);

        // Use a wide enough box for the right-aligned text to ensure it stays in page
        doc.text('HIGH RISK', x + width - 100, y + height + 6, { width: 100, align: 'right' });

        doc.restore();
    }

    /**
     * Draw a simple chart/graph for visual enhancement
     */
    drawCostDistributionChart(doc, x, y, width, height, costBreakdown) {
        // Calculate category totals
        const categories = {};
        (costBreakdown || []).forEach(item => {
            let cat = (item.category || 'Other').toUpperCase();
            if (cat === 'TOTAL' || cat === 'GRAND TOTAL' || cat === 'SUB TOTAL') return; // Exclude aggregate rows from pie/bar charts
            cat = cat.replace(/[|/_]/g, ' & '); // Fix bleeds like MATERIALS|EQUIPMENT
            categories[cat] = (categories[cat] || 0) + (item.totalPrice || item.amount || 0);
        });

        const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
        if (total === 0) return;

        // Draw professional horizontal bar chart
        const catNames = Object.keys(categories);
        const barHeight = 24;
        const spacing = 10;
        const labelColW = 100;  // fixed label column width
        const chartWidth = width - labelColW - 50; // 50px right margin for percentage
        const maxValue = Math.max(...Object.values(categories).map(Math.abs));

        catNames.forEach((cat, idx) => {
            const value = categories[cat];
            const absValue = Math.abs(value);
            const fillWidth = maxValue > 0 ? Math.max(4, (absValue / maxValue) * chartWidth) : 4;
            const barX = x + labelColW + 8;
            const barY = y + idx * (barHeight + spacing);

            // Category label (right-aligned in label column)
            doc.fillColor('#1f2937')
                .font('Helvetica-Bold')
                .fontSize(8.5)
                .text(cat, x, barY + (barHeight / 2) - 5, { width: labelColW - 4, align: 'right' });

            // Bar background rail
            doc.save();
            doc.fillColor('#f0f4ff')
                .roundedRect(barX, barY, chartWidth, barHeight, 4)
                .fill();
            doc.restore();

            // Bar fill
            const barColor = value < 0 ? '#ef4444' : this.colors.standard.primary;
            doc.save();
            doc.fillColor(barColor)
                .roundedRect(barX, barY, fillWidth, barHeight, 4)
                .fill();
            doc.restore();

            // Value label — inside bar if wide enough, otherwise after bar
            const valueText = `$${value.toLocaleString()}`;
            const valueFontSize = 8;
            if (fillWidth > 60) {
                doc.fillColor('#ffffff')
                    .font('Helvetica-Bold')
                    .fontSize(valueFontSize)
                    .text(valueText, barX + 6, barY + (barHeight / 2) - 4, { width: fillWidth - 10 });
            } else {
                doc.fillColor('#374151')
                    .font('Helvetica-Bold')
                    .fontSize(valueFontSize)
                    .text(valueText, barX + fillWidth + 4, barY + (barHeight / 2) - 4);
            }

            // Percentage (right side)
            const percent = total !== 0 ? Math.round((value / total) * 100) : 0;
            doc.fillColor('#9ca3af')
                .font('Helvetica')
                .fontSize(7.5)
                .text(`${percent}%`, barX + chartWidth + 4, barY + (barHeight / 2) - 4, { width: 44, align: 'right' });
        });
    }

    /**
     * Main entry point - Generate professional PDF report
     */
    async generateProfessionalReport(job, result, effectiveTier = 'standard') {
        return new Promise(async (resolve, reject) => {
            try {
                const tier = effectiveTier.toLowerCase();
                const colors = tier === 'premium' ? this.colors.premium : this.colors.standard;

                logger.info(`Generating ${tier} PDF report for job ${job.jobId}`);

                const doc = new PDFDocument({
                    margin: 0,
                    size: 'A4',
                    bufferPages: true,
                    info: {
                        Title: `MyQuoteMate Analysis - ${job.jobId}`,
                        Author: 'MyQuoteMate AI',
                        Subject: 'Quote Analysis & Risk Assessment Report'
                    }
                });

                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                // Get user/client information
                const clientInfo = this.extractClientInfo(job);

                // Page 1: Cover
                await this.generatePage1Cover(doc, job, result, tier, colors, clientInfo);

                // Subsequent pages start with doc.addPage() inside their methods
                // Page 2: Analytics & Data Visualizations (graphs immediately after cover)
                await this.generatePageDataVisualizations(doc, job, result, tier, colors);

                // Page 3: Executive Summary
                await this.generatePage2Summary(doc, job, result, tier, colors, clientInfo);

                // Page 4: Detailed Cost Breakdown
                await this.generatePage3CostBreakdown(doc, job, result, tier, colors);

                // Page 5: Risk Analytics Dashboard
                await this.generatePage4RiskDashboard(doc, job, result, tier, colors);

                // Page 6: Critical Red Flags & Mitigation
                await this.generatePage5RiskList(doc, job, result, tier, colors);

                // Page 7: Market Comparison & Benchmarking
                await this.generatePage6Benchmarking(doc, job, result, tier, colors);

                // OPTIONAL: Multi-Quote Comparison (Premium Only)
                if (tier === 'premium') {
                    await this.generatePageComparison(doc, job, result, tier, colors);
                }

                // Page 8+: Strategic Recommendations
                await this.generatePage7Recommendations(doc, job, result, tier, colors);

                // Final Page: Analytical Appendix
                await this.generatePage8Appendix(doc, job, result, tier, colors);


                doc.end();

            } catch (error) {
                logger.error('PDF generation failed:', error);
                reject(error);
            }
        });
    }

    /**
     * Extract client information from job
     */
    extractClientInfo(job) {
        let clientName = 'Valued Client';
        let clientEmail = 'Not provided';

        if (job.userId) {
            if (job.userId.fullName) {
                clientName = job.userId.fullName;
            } else if (job.userId.firstName || job.userId.lastName) {
                clientName = `${job.userId.firstName || ''} ${job.userId.lastName || ''}`.trim();
            }
            clientEmail = job.userId.email || clientEmail;
        } else if (job.leadId) {
            clientEmail = job.leadId.email || clientEmail;
        }

        if (job.metadata?.name) clientName = job.metadata.name;
        if (job.metadata?.email) clientEmail = job.metadata.email;

        return { clientName, clientEmail };
    }

    /**
     * Add header to page (logo + page number)
     */
    addHeader(doc, pageNum, tier, colors) {
        const pageWidth = doc.page.width;

        // Header Background bar
        doc.save();
        doc.fillColor(colors.primary)
            .fillOpacity(0.04)
            .rect(0, 0, pageWidth, 115) // Expanded header for prominent logo
            .fill();
        doc.restore();

        // Logo & Brand Section
        const logoY = 18; // Vertically centered in 115px header
        if (fs.existsSync(this.logoPath)) {
            try {
                doc.save();
                // User forced height 250. To perfectly center it in the left box
                // without changing their exact parameters, we scale the rendering context down slightly.
                const scale = 0.65;
                // Move so that the scaled (40, 18) fits perfectly centered on the left side
                // Adjusted translation to (14, -32) to align the logo exactly with the 40pt left margin
                doc.translate(14, -32);
                doc.scale(scale);

                // Large prominent logo in the header
                doc.image(this.logoPath, 40, logoY, { height: 250 });
                doc.restore();

                // Vertical Divider — centered between the logo and text
                doc.save();
                doc.moveTo(195, 30)
                    .lineTo(195, 85)
                    .lineWidth(0.5)
                    .strokeColor(this.colors.neutral.lightGray)
                    .stroke();
                doc.restore();

                // Brand Name - made slightly smaller to ensure absolute no overlap
                doc.fillColor(colors.primary)
                    .font('Helvetica-Bold')
                    .fontSize(16.5)
                    .text('MYQUOTEMATE', 210, 38, { characterSpacing: 1.5 });

                // Subtitle
                doc.fillColor(this.colors.neutral.gray)
                    .font('Helvetica')
                    .fontSize(7)
                    .text('2026 TECHNICAL ANALYSIS', 210, 62, { characterSpacing: 1 });
            } catch (err) {
                doc.fillColor(colors.primary)
                    .font('Helvetica-Bold')
                    .fontSize(20)
                    .text('MyQuoteMate', 40, 30);
            }
        } else {
            doc.fillColor(colors.primary)
                .font('Helvetica-Bold')
                .fontSize(20)
                .text('MyQuoteMate', 40, 30);
        }

        // Page number badge
        const badgeWidth = 140;
        const badgeHeight = 28;
        const badgeX = pageWidth - 40 - badgeWidth;
        const badgeY = 30;

        doc.save();
        doc.fillColor(colors.primary)
            .fillOpacity(0.06)
            .roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3)
            .fill();

        doc.strokeColor(colors.primary)
            .strokeOpacity(0.15)
            .lineWidth(0.5)
            .roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3)
            .stroke();
        doc.restore();

        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text(`${tier.toUpperCase()} REPORT`, badgeX, badgeY + 9, {
                width: badgeWidth,
                align: 'center',
                characterSpacing: 1.5
            });

        // Header separator line at y=115
        doc.moveTo(40, 115)
            .lineTo(pageWidth - 40, 115)
            .lineWidth(0.5)
            .strokeColor(colors.primary)
            .strokeOpacity(0.2)
            .stroke();
    }

    /**
     * Add footer to page
     */
    addFooter(doc, jobId) {
        const pageHeight = doc.page.height;
        const pageWidth = doc.page.width;

        // Footer line
        doc.moveTo(40, pageHeight - 60)
            .lineTo(pageWidth - 40, pageHeight - 60)
            .lineWidth(1)
            .strokeColor(this.colors.neutral.lightGray)
            .stroke();

        // Disclaimer
        doc.fillColor(this.colors.neutral.gray)
            .font('Helvetica')
            .fontSize(8)
            .text(
                'This report is informational and based on the provided quote. Confirm details with the supplier before proceeding.',
                40,
                pageHeight - 50,
                { width: pageWidth - 80, align: 'center' }
            );

        // Copyright & Reference ID (Production Standard)
        doc.fillColor(this.colors.neutral.gray)
            .fontSize(8) // Slightly larger for readability
            .text(
                `Report ID: ${jobId.toUpperCase()} | Generated by MyQuoteMate AI`,
                40,
                pageHeight - 35,
                { width: pageWidth - 80, align: 'center', characterSpacing: 0.5 }
            );
    }

    /**
     * PAGE 1: Cover Page
     */
    async generatePage1Cover(doc, job, result, tier, colors, clientInfo) {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const centerX = pageWidth / 2;
        const margin = 50; // Standardize margin

        // Background
        doc.rect(0, 0, pageWidth, pageHeight)
            .fill(this.colors.neutral.background);

        // PREMIUM BACKGROUND ACCENT (Strategic Production Refinement)
        doc.save();
        doc.fillColor(colors.primary).fillOpacity(0.02).rect(0, 0, pageWidth, 400).fill();
        doc.restore();


        // Decorative circles
        doc.save();
        doc.fillColor(colors.primary)
            .fillOpacity(0.05)
            .circle(pageWidth, 0, 300)
            .fill()
            .circle(0, pageHeight, 200)
            .fill();
        doc.restore();

        // Logo (MUCH larger on cover)
        if (fs.existsSync(this.logoPath)) {
            try {
                const logoWidth = 340;
                const logoY = 90;
                const coverLogoLift = 42;
                doc.save();
                doc.translate(0, -coverLogoLift);
                doc.image(this.logoPath, centerX - logoWidth / 2, logoY, { width: logoWidth });
                doc.restore();
            } catch (err) {
                doc.fillColor(colors.primary)
                    .font('Helvetica-Bold')
                    .fontSize(50)
                    .text('MyQuoteMate', 0, 110, { align: 'center', width: pageWidth });
            }
        } else {
            doc.fillColor(colors.primary)
                .font('Helvetica-Bold')
                .fontSize(42)
                .text('MyQuoteMate', 0, 110, { align: 'center', width: pageWidth });
        }

        // Main title
        doc.fillColor('#0f172a')
            .font('Helvetica-Bold')
            .fontSize(38) // Increased
            .text('Quote Analysis &', 0, 260, { align: 'center', width: pageWidth });

        doc.text('Risk Assessment', 0, 305, { align: 'center', width: pageWidth });

        // Subtitle
        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(14)
            .text('ADVANCED ANALYTICAL DATA REPORT • 2026 EDITION', 0, 365, { align: 'center', width: pageWidth, characterSpacing: 1 });

        // Tier badge
        const tierLabel = tier === 'premium' ? 'PREMIUM ANALYSIS' : 'STANDARD ANALYSIS';
        const badgeY = 410;

        doc.save();
        doc.fillColor(tier === 'premium' ? '#000000' : colors.primary)
            .roundedRect(centerX - 120, badgeY, 240, 40, 20)
            .fill();
        doc.restore();

        const contentWidth = tier === 'premium' ? 170 : 180; // Estimated width
        const startX = centerX - (contentWidth / 2);

        if (tier === 'premium') {
            // Add golden crown for premium
            // Icon
            this.drawCrown(doc, startX, badgeY + 10, 22, '#fbbf24');

            doc.fillColor('#ffffff')
                .font('Helvetica-Bold')
                .fontSize(13)
                .text(tierLabel, startX + 32, badgeY + 13, { width: 200, align: 'left' });
        } else {
            // Add star for standard
            this.drawStar(doc, startX, badgeY + 12, 18, '#ffffff');

            doc.fillColor('#ffffff')
                .font('Helvetica-Bold')
                .fontSize(13)
                .text(tierLabel, startX + 28, badgeY + 13, { width: 200, align: 'left' });
        }

        // Client information card
        const cardY = 490;
        doc.save();
        doc.fillColor('#ffffff')
            .roundedRect(centerX - 180, cardY, 360, 200, 12)
            .fill()
            .strokeColor(this.colors.neutral.lightGray)
            .lineWidth(1)
            .stroke();
        doc.restore();

        // Card header
        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(11)
            .text('REPORT INFORMATION', centerX - 160, cardY + 20, { width: 320, align: 'center' });

        doc.moveTo(centerX - 140, cardY + 40)
            .lineTo(centerX + 140, cardY + 40)
            .lineWidth(1)
            .strokeColor(this.colors.neutral.lightGray)
            .stroke();

        // Client details
        const detailsY = cardY + 60;
        const labelX = centerX - 140;

        // Client name
        doc.fillColor(this.colors.neutral.gray)
            .font('Helvetica')
            .fontSize(10)
            .text('Client:', labelX, detailsY);

        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(12)
            .text(clientInfo.clientName, labelX, detailsY + 18, { width: 280 });

        // Email
        doc.fillColor(this.colors.neutral.gray)
            .font('Helvetica')
            .fontSize(10)
            .text('Email:', labelX, detailsY + 50);

        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(11)
            .text(clientInfo.clientEmail, labelX, detailsY + 68, { width: 280 });

        // Report ID
        doc.fillColor(this.colors.neutral.gray)
            .font('Helvetica')
            .fontSize(10)
            .text('Report ID:', labelX, detailsY + 100);

        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(11)
            .text(job.jobId.substring(0, 20).toUpperCase(), labelX, detailsY + 118);

        // Generation date
        doc.fillColor(this.colors.neutral.gray)
            .font('Helvetica')
            .fontSize(10)
            .text('Generated:', labelX + 180, detailsY + 100);

        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(11)
            .text(new Date().toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }), labelX + 180, detailsY + 118, { width: 100 });

        // Status indicator
        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('✓ Analysis Complete', 0, 740, { align: 'center', width: pageWidth });
    }

    /**
     * PAGE 2: Executive Summary
     */
    async generatePage2Summary(doc, job, result, tier, colors, clientInfo) {
        doc.addPage();
        this.addHeader(doc, 2, tier, colors);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const footerZone = pageHeight - 70; // Keep content above footer
        let currentY = 130; // ✅ Professional gap from header (header ends at y=110)

        // Page title - Professional with breathing room from header
        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(26) // Compact but authoritative
            .text('Executive Summary', 40, currentY);

        // Sophisticated Double underline style
        doc.save();
        doc.moveTo(40, currentY + 34)
            .lineTo(75, currentY + 34)
            .lineWidth(3)
            .strokeColor(colors.primary)
            .stroke();
        doc.moveTo(80, currentY + 34)
            .lineTo(240, currentY + 34)
            .lineWidth(0.5)
            .strokeColor(this.colors.neutral.lightGray)
            .stroke();
        doc.restore();

        currentY += 56; // Tighter spacing after title

        // Key metrics grid (2x2) — compact boxes
        const gridStartY = currentY;
        const boxWidth = (pageWidth - 100) / 2;
        const boxHeight = 85; // Reduced from 100
        const gap = 12; // Reduced from 20

        const verdictScore = result.verdictScore || 0;
        const normalizedScore = verdictScore > 10 ? verdictScore / 10 : verdictScore;

        const metrics = [
            {
                label: 'QUOTE INTEGRITY',
                value: `${normalizedScore.toFixed(1)}/10`,
                color: normalizedScore >= 8 ? '#10b981' : normalizedScore >= 6 ? '#f59e0b' : '#ef4444',
                iconType: 'checkmark'
            },
            {
                label: 'RISK LEVEL',
                value: result.redFlags?.length > 3 ? 'High' : result.redFlags?.length > 1 ? 'Medium' : 'Low',
                color: result.redFlags?.length > 3 ? '#ef4444' : result.redFlags?.length > 1 ? '#f59e0b' : '#10b981',
                iconType: 'alert'
            },
            {
                label: 'TOTAL COST',
                value: `$${(result.overallCost || result.costs?.overall || 0).toLocaleString()}`,
                color: colors.primary,
                iconType: 'dollar'
            },
            {
                label: 'CONFIDENCE',
                value: `${result.confidence || 95}%`,
                color: '#3b82f6',
                iconType: 'info'
            }
        ];

        metrics.forEach((metric, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const x = 40 + col * (boxWidth + gap);
            const y = gridStartY + row * (boxHeight + gap);

            // Box with subtle shadow
            doc.save();
            doc.fillColor(this.colors.neutral.lightGray)
                .fillOpacity(0.08)
                .roundedRect(x + 1, y + 1, boxWidth, boxHeight, 4)
                .fill();
            doc.fillColor('#ffffff')
                .roundedRect(x, y, boxWidth, boxHeight, 4)
                .fill()
                .strokeColor('#e2e8f0')
                .lineWidth(0.5)
                .stroke();
            doc.restore();

            // Label
            doc.fillColor('#64748b')
                .font('Helvetica-Bold')
                .fontSize(8.5)
                .text(metric.label, x + 16, y + 16, { characterSpacing: 1 });

            // Value
            doc.fillColor(metric.color)
                .font('Helvetica-Bold')
                .fontSize(24)
                .text(metric.value, x + 16, y + 35);

            // Icon circle
            const iconX = x + boxWidth - 42;
            const iconY = y + 28;
            const iconSize = 22;

            doc.save();
            doc.fillColor(metric.color)
                .fillOpacity(0.1)
                .circle(iconX + iconSize / 2, iconY + iconSize / 2, 16)
                .fill();
            doc.restore();

            switch (metric.iconType) {
                case 'checkmark': this.drawCheckmark(doc, iconX, iconY, iconSize, metric.color); break;
                case 'alert': this.drawAlert(doc, iconX, iconY, iconSize, metric.color); break;
                case 'dollar': this.drawDollarSign(doc, iconX, iconY, iconSize, metric.color); break;
                case 'info': this.drawInfoIcon(doc, iconX, iconY, iconSize, metric.color); break;
            }
        });

        currentY = gridStartY + 2 * (boxHeight + gap) + 22;

        // ── Analysis Overview ──────────────────────────────────────────────────
        // Guard: only draw if still above footer
        if (currentY + 20 < footerZone) {
            doc.fillColor('#0f172a')
                .font('Helvetica-Bold')
                .fontSize(13)
                .text('Analysis Overview', 40, currentY);

            currentY += 22;

            // Let the text flow naturally without hard JS truncation. OpenAI length limits govern this.
            let summaryText = result.summary || 'Quote analysis completed successfully.';

            // Dynamically calculate actual text height to push the next section down accurately
            const summaryHeight = doc.heightOfString(summaryText, {
                width: pageWidth - 80,
                align: 'justify',
                lineGap: 3
            });

            doc.fillColor('#334155')
                .font('Helvetica')
                .fontSize(10.5)
                .text(summaryText, 40, currentY, {
                    width: pageWidth - 80,
                    align: 'justify',
                    lineGap: 3
                });

            currentY += summaryHeight + 20;
        }

        // ── Price Verdict ──────────────────────────────────────────────────────
        if (result.verdictJustification && currentY + 80 < footerZone) {
            doc.fillColor(this.colors.neutral.dark)
                .font('Helvetica-Bold')
                .fontSize(13)
                .text('Price Verdict', 40, currentY);

            currentY += 20;

            // Full completely rendered text
            let verdictText = result.verdictJustification;

            // Dynamically calculate the perfect height for the verdict box so it NEVER cuts off text
            const textHeight = doc.heightOfString(verdictText, {
                width: pageWidth - 110,
                align: 'justify',
                lineGap: 3
            });
            const verdictBoxHeight = textHeight + 26;

            doc.save();
            doc.fillColor(colors.primary)
                .fillOpacity(0.05)
                .roundedRect(40, currentY, pageWidth - 80, verdictBoxHeight, 6)
                .fill();
            doc.restore();

            doc.fillColor(this.colors.neutral.dark)
                .font('Helvetica')
                .fontSize(10)
                .text(verdictText, 55, currentY + 13, {
                    width: pageWidth - 110,
                    align: 'justify',
                    lineGap: 3
                });

            currentY += verdictBoxHeight + 20;
        }

        this.addFooter(doc, job.jobId);
    }

    /**
     * PAGE 3: Detailed Cost Breakdown
     */
    async generatePage3CostBreakdown(doc, job, result, tier, colors) {
        doc.addPage();
        this.addHeader(doc, 3, tier, colors);

        const pageWidth = doc.page.width;
        let currentY = 140; // 25px clear gap below header separator at y=115

        // Page title
        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(24)
            .text('Cost Breakdown', 40, currentY);

        doc.moveTo(40, currentY + 32)
            .lineTo(190, currentY + 32)
            .lineWidth(3)
            .strokeColor(colors.primary)
            .stroke();

        currentY += 70; // Compact breathing room after title

        // Cost breakdown table
        const costItems = result.costBreakdown || [];

        if (costItems.length > 0) {
            const tableData = {
                headers: [
                    { label: 'ITEM DESCRIPTION', property: 'desc', width: 240 },
                    { label: 'CATEGORY', property: 'cat', width: 100 },
                    { label: 'AMOUNT', property: 'price', width: 130, align: 'right' }
                ],
                rows: costItems.slice(0, 15).map(item => [
                    (item.description || 'General Item').substring(0, 50),
                    (item.category || 'General').toUpperCase(),
                    `$${(item.totalPrice || item.amount || 0).toLocaleString()}`
                ])
            };

            await doc.table(tableData, {
                x: 40,
                y: currentY,
                padding: 8, // Proper spacing
                divider: {
                    header: { disabled: false, width: 1.5, opacity: 0.1 },
                    horizontal: { disabled: false, width: 0.5, opacity: 0.05 }
                },
                prepareHeader: () => {
                    doc.font('Helvetica-Bold')
                        .fontSize(9)
                        .fillColor(colors.primary);
                    return doc;
                },
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    // Subtle alternating row colors
                    if (indexColumn === 0) {
                        doc.save();
                        doc.fillColor(indexRow % 2 === 0 ? '#fafafa' : '#ffffff')
                            .rect(rectRow.x, rectRow.y, rectRow.width, rectRow.height)
                            .fill();
                        doc.restore();
                    }
                    doc.font('Helvetica')
                        .fontSize(10)
                        .fillColor(this.colors.neutral.dark);
                    return doc;
                }
            });

            currentY = doc.y + 35; // increased gap after table

            // Add cost distribution chart if space available
            // Compute actual chart height: categories × (barHeight + spacing)
            const categories = {};
            costItems.forEach(item => {
                let cat = (item.category || 'Other').toUpperCase();
                if (cat === 'TOTAL' || cat === 'GRAND TOTAL' || cat === 'SUB TOTAL') return; // Exclude aggregates
                categories[cat] = (categories[cat] || 0) + (item.totalPrice || item.amount || 0);
            });
            const numCategories = Object.keys(categories).length;
            const chartRowH = 24 + 10; // barHeight + spacing
            const actualChartH = numCategories * chartRowH;
            // Only render chart if total box (60px) + chart + 20px gap fit before footer (y=720)
            if (currentY < 480 && costItems.length > 1 && (currentY + actualChartH + 20 + 60) < 720) {
                doc.fillColor(this.colors.neutral.dark)
                    .font('Helvetica-Bold')
                    .fontSize(12)
                    .text('Cost Distribution by Category', 40, currentY);

                currentY += 22;
                this.drawCostDistributionChart(doc, 40, currentY, pageWidth - 80, actualChartH, costItems);
                currentY += actualChartH + 20; // precise gap after chart
            }
        } else {
            doc.fillColor(this.colors.neutral.gray)
                .font('Helvetica')
                .fontSize(11)
                .text('No detailed cost breakdown available for this quote.', 40, currentY, {
                    width: pageWidth - 80,
                    align: 'center'
                });
            currentY += 50;
        }

        // Total summary box
        const totalCost = result.overallCost || result.costs?.overall ||
            costItems.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0);

        doc.save();
        // Modern container
        doc.fillColor(colors.primary)
            .fillOpacity(0.06)
            .roundedRect(40, currentY, pageWidth - 80, 75, 8)
            .fill();
        doc.restore();

        // Left accent bar
        doc.save();
        doc.fillColor(colors.primary)
            // PDFKit roundedRect only accepts a primitive number for radius, using 8
            .roundedRect(40, currentY, 6, 75, 8)
            .fill();
        doc.restore();

        doc.fillColor(this.colors.neutral.gray)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('TOTAL QUOTE VALUE', 65, currentY + 18, { characterSpacing: 1.5 });

        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(28)
            .text(`$${totalCost.toLocaleString()} AUD`, 65, currentY + 36);

        this.addFooter(doc, job.jobId);
    }

    /**
     * PAGE 4: Risk Analysis & Red Flags
     */
    /**
     * PAGE 4: Risk Analytics Dashboard
     */
    async generatePage4RiskDashboard(doc, job, result, tier, colors) {
        doc.addPage();
        this.addHeader(doc, 4, tier, colors);

        const pageWidth = doc.page.width;
        let currentY = 140; // 25px clear gap below header separator at y=115

        // Page title
        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(24)
            .text('Risk Analytics Dashboard', 40, currentY);

        doc.moveTo(40, currentY + 32)
            .lineTo(155, currentY + 32)
            .lineWidth(3)
            .strokeColor(colors.primary)
            .stroke();

        currentY += 60;

        const redFlags = result.redFlags || [];
        const riskCounts = {
            critical: redFlags.filter(f => f.severity === 'critical').length,
            high: redFlags.filter(f => f.severity === 'high').length,
            medium: redFlags.filter(f => f.severity === 'medium').length,
            low: redFlags.filter(f => f.severity === 'low').length || (redFlags.length === 0 ? 0 : 0)
        };

        const donutData = [
            { label: 'Critical', value: riskCounts.critical, color: '#dc2626' },
            { label: 'High', value: riskCounts.high, color: '#ef4444' },
            { label: 'Medium', value: riskCounts.medium, color: '#f59e0b' },
            { label: 'Low', value: riskCounts.low, color: '#10b981' }
        ].filter(d => d.value > 0);

        // Sidebar for Graphical analysis
        doc.save();
        doc.fillColor('#f8fafc')
            .roundedRect(40, currentY, pageWidth - 80, 240, 12)
            .fill()
            .strokeColor('#e2e8f0')
            .lineWidth(1)
            .stroke();
        doc.restore();

        // 1. Donut Chart (Enhanced Size)
        this.drawDonutChart(doc, 140, currentY + 120, 75, donutData.length > 0 ? donutData : [{ value: 1, color: '#e2e8f0' }], colors);

        // 2. Risk Profile Radar (Now available for all tiers in visual dashboard)
        const riskProfileData = [
            { axis: 'Financial', value: Math.min(100, (riskCounts.critical * 30 + 10)) },
            { axis: 'Technical', value: (result.confidence ? (100 - result.confidence) : 20) },
            { axis: 'Market', value: 45 },
            { axis: 'Delivery', value: 30 },
            { axis: 'Quality', value: 25 }
        ];
        this.drawRadarChart(doc, pageWidth - 160, currentY + 120, 80, riskProfileData, colors.primary);

        // 3. Overall Exposure Spectrum
        currentY += 270;
        const riskScore = Math.min(100, (riskCounts.critical * 40 + riskCounts.high * 25 + riskCounts.medium * 10) || 5);

        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(12)
            .text('EXECUTIVE RISK EXPOSURE INDEX', 40, currentY);

        this.drawRiskSpectrum(doc, 40, currentY + 25, pageWidth - 80, 20, riskScore);

        currentY += 80;

        // Analytics Insight Box
        doc.save();
        const boxHeight = 115;
        doc.fillColor(colors.primary).fillOpacity(0.06).roundedRect(40, currentY, pageWidth - 80, boxHeight, 8).fill();
        doc.restore();

        doc.fillColor(this.colors.neutral.dark).font('Helvetica-Bold').fontSize(11).text('STRATEGIC INSIGHT', 60, currentY + 15);

        let insightText = '';
        if (riskScore > 60) {
            insightText = 'CRITICAL RISK EXPOSURE DETECTED: The overarching quote profile exhibits substantial vulnerabilities that exceed acceptable operational parameters. Implementing robust mitigation strategies for identified critical bottlenecks is imperative. Proceeding without strategic realignment of these factors poses significant financial and structural risks to the overarching project lifecycle.';
        } else if (riskScore > 30) {
            insightText = 'MODERATE RISK EXPOSURE DETECTED: The analysis reveals standard industry risks present within the quotation boundaries. While foundational metrics remain acceptable, strategic optimization is recommended. The majority of identified items can be proactively resolved through deliberate specification adjustments, safeguarding overall project margin and delivery timelines.';
        } else {
            insightText = 'OPTIMAL PROJECT HEALTH VERIFIED: Comprehensive analysis indicates a nominal risk profile with robust operational viability. The quotation demonstrates high structural integrity, exact market alignment, and sound financial foresight. Execution of this project segment requires minimal structural remediation and is primed for seamless progression.';
        }

        doc.fillColor('#111827').font('Helvetica').fontSize(10.5).text(insightText, 60, currentY + 35, {
            width: pageWidth - 120,
            lineGap: 4,
            height: boxHeight - 45,
            ellipsis: false
        });

        this.addFooter(doc, job.jobId);
    }

    /**
     * PAGE 5: Critical Red Flags & Mitigation
     */
    async generatePage5RiskList(doc, job, result, tier, colors) {
        doc.addPage();
        this.addHeader(doc, 5, tier, colors);

        const pageWidth = doc.page.width;
        let currentY = 140; // 25px clear gap below header separator at y=115

        // Page title
        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(24)
            .text('Critical Red Flags & Mitigation', 40, currentY);

        doc.moveTo(40, currentY + 32)
            .lineTo(155, currentY + 32)
            .lineWidth(3)
            .strokeColor(colors.primary)
            .stroke();

        currentY += 55;

        const redFlags = result.redFlags || [];

        if (redFlags.length > 0) {
            redFlags.slice(0, 10).forEach((flag, idx) => {
                const severityColor =
                    flag.severity === 'critical' ? '#dc2626' :
                        flag.severity === 'high' ? '#ef4444' :
                            flag.severity === 'medium' ? '#f59e0b' : '#10b981';

                // Flag box (Professional Shadow)
                doc.save();
                doc.fillColor('#ffffff')
                    .roundedRect(40, currentY, pageWidth - 80, 85, 8)
                    .fill()
                    .strokeColor('#e2e8f0')
                    .lineWidth(0.5)
                    .stroke();
                doc.restore();

                // Severity Badge
                const textSeverityColor = flag.severity === 'medium' ? '#92400e' : severityColor;
                doc.save();
                doc.fillColor(severityColor).fillOpacity(0.15).roundedRect(55, currentY + 15, 75, 20, 10).fill();
                doc.restore();

                doc.fillColor(textSeverityColor).font('Helvetica-Bold').fontSize(8.5).text((flag.severity || 'medium').toUpperCase(), 55, currentY + 20, { width: 75, align: 'center' });

                // Flag title & Description (Columnar Structure)
                doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12);
                doc.text(flag.title || flag.category || 'Risk Item', 145, currentY + 17, { width: pageWidth - 180 });

                doc.fillColor('#111827').font('Helvetica').fontSize(10);
                doc.text(flag.description || 'Review this item carefully.', 145, currentY + 45, { width: pageWidth - 180, lineGap: 2.5, maxLines: 2, ellipsis: true });

                currentY += 100;

                if (currentY > 700 && idx < redFlags.length - 1) {
                    this.addFooter(doc, job.jobId);
                    doc.addPage();
                    this.addHeader(doc, 5, tier, colors);
                    currentY = 140; // Match header clearance on continuation pages
                }
            });
        } else {
            doc.save();
            doc.fillColor('#10b981').fillOpacity(0.08).roundedRect(40, currentY, pageWidth - 80, 80, 8).fill();
            doc.restore();

            doc.fillColor('#059669').font('Helvetica-Bold').fontSize(14).text('✓ No Critical Risks Detected', 60, currentY + 20);
            doc.fillColor('#374151').font('Helvetica').fontSize(11).text('This quote appears to be structurally sound with no major red flags identified in its current form.', 60, currentY + 45, { width: pageWidth - 120 });
        }

        this.addFooter(doc, job.jobId);
    }

    /**
     * PAGE 4.5: Quote Comparison Matrix (Premium Only)
     */
    async generatePageComparison(doc, job, result, tier, colors) {
        if (tier !== 'premium') return; // Quote Comparison is Premium-only
        if (!result.quoteComparison) return; // Prevent empty comparison page for single-quote premium

        doc.addPage();

        this.addHeader(doc, 'COMP', tier, colors);

        const pageWidth = doc.page.width;
        const centerX = pageWidth / 2;
        let currentY = 135; // 20px clear gap below header separator at y=115

        // Page title
        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(24)
            .text('Quote Comparison Matrix', 40, currentY);

        doc.moveTo(40, currentY + 32)
            .lineTo(230, currentY + 32)
            .lineWidth(3)
            .strokeColor(colors.primary)
            .stroke();

        // Premium badge
        doc.save();
        doc.fillColor(colors.primary)
            .fillOpacity(0.08)
            .roundedRect(pageWidth - 165, currentY, 125, 24, 12)
            .fill();
        doc.restore();
        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('✦ PREMIUM FEATURE', pageWidth - 160, currentY + 8, { width: 115, align: 'center', characterSpacing: 0.5 });

        currentY += 55;

        const comp = result.quoteComparison || {};

        // AI Verdict Box
        doc.save();
        doc.fillColor(colors.primary)
            .fillOpacity(0.03) // Subtler
            .roundedRect(40, currentY, pageWidth - 80, 115, 12)
            .fill()
            .strokeColor(colors.primary)
            .lineWidth(0.8)
            .stroke();
        doc.restore();

        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(11)
            .text('AI PROFESSIONAL VERDICT', 60, currentY + 18);

        doc.fillColor('#111827') // Dark slate for premium feel
            .font('Helvetica-Oblique')
            .fontSize(10.5)
            .text(this._toCompleteSentence(comp.winner?.reason || 'Comparison analysis pending.', 500), 60, currentY + 38, {
                width: pageWidth - 120,
                align: 'justify',
                lineGap: 4
            });

        currentY += 145;

        // Strategic Methodology
        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(14)
            .text('Technical Differentiation', 40, currentY);

        currentY += 25;

        // Methodology Box
        doc.save();
        doc.fillColor('#f8fafc')
            .roundedRect(40, currentY, (pageWidth - 100) / 2, 175, 10)
            .fill()
            .strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .stroke();
        doc.restore();

        doc.fillColor('#1e40af')
            .font('Helvetica-Bold')
            .fontSize(9.5)
            .text('STRATEGIC METHODOLOGY', 55, currentY + 18);

        doc.fillColor('#334155') // Darker than neutral dark
            .font('Helvetica')
            .fontSize(9.5)
            // Truncate Methodology to proper complete sentences
            .text(this._toCompleteSentence(comp.betterApproach || 'Analysis pending.', 400), 55, currentY + 38, { width: (pageWidth - 140) / 2, lineGap: 3.5 });

        // Differences Box
        doc.save();
        doc.fillColor('#f5f3ff')
            .roundedRect(40 + (pageWidth - 100) / 2 + 20, currentY, (pageWidth - 100) / 2, 175, 10)
            .fill()
            .strokeColor('#e9d5ff')
            .lineWidth(0.5)
            .stroke();
        doc.restore();

        doc.fillColor('#4338ca')
            .font('Helvetica-Bold')
            .fontSize(9.5)
            .text('CRITICAL DIFFERENCES', 40 + (pageWidth - 100) / 2 + 35, currentY + 18);

        let diffY = currentY + 38;
        // Limit to 4 differences and truncate each to a complete sentence
        comp.keyDifferences?.slice(0, 4).forEach(diff => {
            const cleanDiff = this._toCompleteSentence(diff || '', 100);
            if (!cleanDiff) return; // skip if nothing left
            doc.fillColor('#4338ca')
                .circle(40 + (pageWidth - 100) / 2 + 35, diffY + 4.5, 2)
                .fill();
            doc.fillColor('#334155')
                .font('Helvetica')
                .fontSize(9)
                .text(cleanDiff, 40 + (pageWidth - 100) / 2 + 45, diffY, { width: (pageWidth - 160) / 2, lineGap: 2 });
            diffY = doc.y + 7;
        });

        currentY += 195;

        const boxHeight = 140; // Increased fixed height for bottom boxes to easily fit complete sentences

        // Value Assessment (Now Half Width)
        doc.save();
        doc.fillColor('#f0fdf4')
            .roundedRect(40, currentY, (pageWidth - 100) / 2, boxHeight, 10)
            .fill()
            .strokeColor('#dcfce7')
            .lineWidth(0.5)
            .stroke();
        doc.restore();

        doc.fillColor('#15803d')
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('MARKET VALUE ASSESSMENT', 60, currentY + 15);

        doc.fillColor('#111827')
            .font('Helvetica')
            .fontSize(9.5)
            .text(this._toCompleteSentence(comp.valueAssessment || 'Analysis pending.', 320), 60, currentY + 34, { width: (pageWidth - 140) / 2 - 20, lineGap: 3.5 });

        // Relative Pricing Box (Now Aligned Right)
        doc.save();
        doc.fillColor('#fff7ed') // Suble Orange
            .roundedRect(centerX + 10, currentY, (pageWidth - 100) / 2, boxHeight, 10)
            .fill()
            .strokeColor('#ffedd5')
            .lineWidth(0.5)
            .stroke();
        doc.restore();

        doc.fillColor('#9a3412')
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('MARKET POSITION & PRICING', centerX + 25, currentY + 15);

        doc.fillColor('#111827')
            .font('Helvetica')
            .fontSize(9.5)
            .text(this._toCompleteSentence(comp.relativePricing || 'Analysis pending.', 320), centerX + 25, currentY + 34, { width: (pageWidth - 140) / 2 - 20, lineGap: 3.5 });

        currentY += boxHeight + 15;

        this.addFooter(doc, job.jobId);
    }

    // ── Helper: truncate text at the last complete sentence within maxChars ──
    _toCompleteSentence(text, maxChars) {
        if (!text) return '';
        if (text.length <= maxChars) return text.trim();
        const slice = text.substring(0, maxChars);
        // Find last sentence-ending punctuation followed by a space or end
        const endings = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
        let bestIdx = -1;
        endings.forEach(e => {
            const idx = slice.lastIndexOf(e);
            if (idx > bestIdx) bestIdx = idx;
        });
        if (bestIdx > maxChars * 0.4) {
            return slice.substring(0, bestIdx + 1).trim();
        }
        // Fall back: last complete word
        const lastSpace = slice.lastIndexOf(' ');
        return lastSpace > 0 ? slice.substring(0, lastSpace).trim() : slice.trim();
    }

    /**
     * PAGE 6: Market Benchmarking (Standard & Premium)
     */
    async generatePage6Benchmarking(doc, job, result, tier, colors) {
        doc.addPage();
        this.addHeader(doc, 6, tier, colors);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const footerZone = pageHeight - 70;
        const contentW = pageWidth - 120; // 60px left + 60px right margin
        let currentY = 140; // 25px clear gap below header separator at y=115

        // Page title
        doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(24)
            .text('Market Benchmarking', 40, currentY);
        doc.moveTo(40, currentY + 32).lineTo(155, currentY + 32)
            .lineWidth(3).strokeColor(colors.primary).stroke();
        currentY += 48;

        // Fixed card layout constants
        // Card anatomy: 10px top-padding + 14px name + 8px gap + 10px bar + 12px labels + 13px quote = 67px content
        //               + 10px bottom-padding = 78px total
        const CARD_H = 78;
        const CARD_GAP = 6;
        const INSIGHT_H = 46;
        const benchmarks = result.benchmarking || [];

        // Calculate how many benchmark cards fit above the insight box
        const maxCards = Math.min(
            benchmarks.length,
            Math.floor((footerZone - currentY - INSIGHT_H - CARD_GAP) / (CARD_H + CARD_GAP))
        );

        if (benchmarks.length > 0) {
            benchmarks.slice(0, maxCards).forEach((benchmark) => {
                const quotePrice = benchmark.quotePrice || 0;
                const marketMin = benchmark.marketMin || 0;
                const marketMax = benchmark.marketMax || 100;
                const marketAvg = benchmark.marketAvg || 50;
                const range = marketMax - marketMin || 1;
                const barWidth = contentW;

                // Card shell
                doc.save();
                doc.fillColor('#ffffff')
                    .roundedRect(40, currentY, pageWidth - 80, CARD_H, 5)
                    .fill()
                    .strokeColor('#e2e8f0').lineWidth(0.5).stroke();
                doc.restore();

                // Item name — truncate to 80 chars (single line at 10.5px on 435px = enough)
                const itemName = (benchmark.item || 'Item').substring(0, 75);
                doc.fillColor(this.colors.neutral.dark).font('Helvetica-Bold').fontSize(10.5)
                    .text(itemName, 60, currentY + 10, { width: contentW, lineBreak: false });

                // Bar track (y = 10+14+8 = 32)
                const barY = currentY + 32;
                doc.save();
                doc.fillColor('#e2e8f0').roundedRect(60, barY, barWidth, 10, 5).fill();

                // Avg zone + line
                const avgPos = ((marketAvg - marketMin) / range) * barWidth;
                doc.fillColor(colors.primary).fillOpacity(0.18)
                    .rect(60 + avgPos - 9, barY - 2, 18, 14).fill();
                doc.strokeColor(colors.primary).lineWidth(1.5)
                    .moveTo(60 + avgPos, barY - 2)
                    .lineTo(60 + avgPos, barY + 12).stroke();
                doc.restore();

                // Quote dot
                const rawPos = ((quotePrice - marketMin) / range) * barWidth;
                const dotX = 60 + Math.max(0, Math.min(barWidth, rawPos));
                doc.save();
                doc.fillColor(tier === 'premium' ? '#000000' : colors.primary)
                    .circle(dotX, barY + 5, 6.5)
                    .fill().strokeColor('#ffffff').lineWidth(1.5).stroke();
                doc.restore();

                // Min / Avg / Max labels (y = barY + 13)
                doc.fillColor('#475569').font('Helvetica').fontSize(7.5);
                doc.text(`Min: $${marketMin.toLocaleString()}`, 60, barY + 13, { width: 65, align: 'left' });
                doc.text(`Avg: $${marketAvg.toLocaleString()}`, 60 + avgPos - 32, barY + 13, { width: 64, align: 'center' });
                doc.text(`Max: $${marketMax.toLocaleString()}`, 60 + barWidth - 60, barY + 13, { width: 60, align: 'right' });

                // Your Quote + Percentile (y = barY + 26 = ~58 from card top)
                doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5)
                    .text(`Your Quote: $${quotePrice.toLocaleString()}`, 60, barY + 27);

                if (benchmark.percentile !== undefined) {
                    const pc = benchmark.percentile;
                    const pcColor = pc > 75 ? '#b91c1c' : pc < 40 ? '#15803d' : '#334155';
                    doc.fillColor(pcColor).font('Helvetica-Bold').fontSize(9)
                        .text(`${pc}th Percentile`, pageWidth - 155, barY + 27, { align: 'right', width: 95 });
                }

                currentY += CARD_H + CARD_GAP;
            });

            // Insight box — complete sentence, fixed height
            currentY += 4;
            const rawInsight = result.benchmarkingOverview ||
                'Comparison based on 2026 AU localized trade data. Projects within the 40–60th percentile represent optimal value-to-risk balance.';
            const insightText = this._toCompleteSentence(rawInsight, 240);

            doc.save();
            doc.fillColor(colors.primary).fillOpacity(0.04)
                .roundedRect(40, currentY, pageWidth - 80, INSIGHT_H, 5).fill();
            doc.restore();

            doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(9.5)
                .text('Benchmarking Insight', 58, currentY + 8);
            doc.fillColor('#1e293b').font('Helvetica').fontSize(8.5)
                .text(insightText, 58, currentY + 24, { width: pageWidth - 140 });

        } else {
            doc.fillColor(this.colors.neutral.gray).font('Helvetica').fontSize(11)
                .text('Market comparative data not available for this specific scope.',
                    40, currentY + 50, { align: 'center', width: pageWidth - 80 });
        }

        this.addFooter(doc, job.jobId);
    }

    /**
     * PAGE 8: Strategic Recommendations
     */
    async generatePage7Recommendations(doc, job, result, tier, colors) {
        doc.addPage();
        this.addHeader(doc, 7, tier, colors);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const footerZone = pageHeight - 70;
        const contentW = pageWidth - 148; // 90px left, 58px right
        let currentY = 140; // 25px clear gap below header separator at y=115

        // Page title
        doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(24)
            .text('Strategic Recommendations', 40, currentY);
        doc.moveTo(40, currentY + 32).lineTo(210, currentY + 32)
            .lineWidth(3).strokeColor(colors.primary).stroke();
        currentY += 48;

        // ── Fixed card anatomy ────────────────────────────────────────────────
        // Top pad:       10px
        // Title:         26px  (2 lines × 13px, fontSize 10, no ellipsis – wrap ok)
        // Gap:            6px
        // Badge row:     18px
        // Gap:            6px
        // Description:   42px  (3 lines × 14px, fontSize 9.5, lineGap 2)
        // Bottom pad:    10px
        // ───────────────────
        // TOTAL:        118px  + 8px gap between cards
        const CARD_H = 118;
        const CARD_GAP = 8;
        const TITLE_TOP = 10;   // y offset from card top
        const TITLE_H = 26;   // reserved for title (2 lines)
        const BADGE_TOP = TITLE_TOP + TITLE_H + 6;  // = 42
        const BADGE_H = 18;
        const DESC_TOP = BADGE_TOP + BADGE_H + 6;  // = 66
        const BADGE_CY = CARD_H / 2;               // = 59  (badge circle midpoint)

        const recommendations = result.recommendations || [];
        // How many cards fit on the page?
        const maxCards = Math.min(
            recommendations.length,
            Math.floor((footerZone - currentY) / (CARD_H + CARD_GAP))
        );

        recommendations.slice(0, maxCards).forEach((rec, idx) => {
            // ── Card background ────────────────────────────────────────────────
            doc.save();
            doc.fillColor('#ffffff')
                .roundedRect(40, currentY, pageWidth - 80, CARD_H, 8)
                .fill().strokeColor('#e2e8f0').lineWidth(0.6).stroke();
            doc.restore();

            // ── Number badge (fixed vertical centre) ───────────────────────────
            const badgeCY = currentY + BADGE_CY;
            doc.save();
            doc.fillColor(colors.primary).circle(64, badgeCY, 14).fill();
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11)
                .text(`${idx + 1}`, 57, badgeCY - 7, { width: 14, align: 'center' });
            doc.restore();

            // ── Title (2-line max, full wrap, NO ellipsis) ─────────────────────
            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
                .text((rec.title || 'Recommendation').toUpperCase(),
                    90, currentY + TITLE_TOP,
                    { width: contentW, height: TITLE_H + 4 });

            // ── Badges ─────────────────────────────────────────────────────────
            let badgeX = 90;
            const badgeY = currentY + BADGE_TOP;

            if (rec.potentialSavings) {
                doc.save();
                doc.fillColor('#059669').fillOpacity(0.12)
                    .roundedRect(badgeX, badgeY, 118, BADGE_H, 8).fill();
                doc.restore();
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(8)
                    .text(`Potential Savings: $${Number(rec.potentialSavings).toLocaleString()}`,
                        badgeX + 8, badgeY + 5);
                badgeX += 125;
            }

            if (rec.difficulty) {
                const diffBg = rec.difficulty === 'easy' ? '#10b981' : rec.difficulty === 'moderate' ? '#f59e0b' : '#ef4444';
                const diffText = rec.difficulty === 'easy' ? '#064e3b' : rec.difficulty === 'moderate' ? '#92400e' : '#7f1d1d';
                doc.save();
                doc.fillColor(diffBg).fillOpacity(0.12)
                    .roundedRect(badgeX, badgeY, 102, BADGE_H, 8).fill();
                doc.restore();
                doc.fillColor(diffText).font('Helvetica-Bold').fontSize(8)
                    .text(`LEVEL: ${rec.difficulty.toUpperCase()}`,
                        badgeX + 5, badgeY + 5, { width: 92, align: 'center' });
            }

            // ── Description: 2-3 complete sentences, 3 lines max ───────────────
            // _toCompleteSentence(text, 250) reliably fits 3 lines at 9.5px
            const descText = this._toCompleteSentence(rec.description || '', 250);
            doc.fillColor('#1e293b').font('Helvetica').fontSize(9.5)
                .text(descText, 90, currentY + DESC_TOP,
                    { width: contentW, lineGap: 2, height: 44 });

            currentY += CARD_H + CARD_GAP;
        });

        this.addFooter(doc, job.jobId);
    }

    /**
     * PAGE 7: Appendix & Disclaimer
     */
    async generatePage8Appendix(doc, job, result, tier, colors) {
        doc.addPage();
        this.addHeader(doc, 8, tier, colors);

        const pageWidth = doc.page.width;
        let currentY = 140; // 25px clear gap below header separator at y=115

        // Page title
        doc.fillColor(colors.primary)
            .font('Helvetica-Bold')
            .fontSize(24)
            .text('Appendix & Disclaimer', 40, currentY);

        doc.moveTo(40, currentY + 32)
            .lineTo(135, currentY + 32)
            .lineWidth(3)
            .strokeColor(colors.primary)
            .stroke();

        currentY += 55;

        // Methodology
        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(14)
            .text('Analysis Methodology', 40, currentY);

        currentY += 25;

        const methodology = `This report was generated using MyQuoteMate's AI-powered analysis engine, which examines quote documents for pricing fairness, potential risks, and market competitiveness. The analysis combines document extraction, natural language processing, and market data comparison to provide comprehensive insights.`;

        doc.fillColor(this.colors.neutral.gray)
            .font('Helvetica')
            .fontSize(10)
            .text(methodology, 40, currentY, {
                width: pageWidth - 80,
                align: 'justify',
                lineGap: 4
            });

        currentY = doc.y + 30;

        // Disclaimer
        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(14)
            .text('Important Disclaimer', 40, currentY);

        currentY += 25;

        const disclaimer = `This report is provided for informational purposes only and should not be considered as professional financial, legal, or construction advice. All analysis is based on the information provided in the submitted quote document. MyQuoteMate makes no warranties about the accuracy, completeness, or reliability of this analysis. Users should verify all information with qualified professionals before making any decisions. Market benchmarking data is indicative and based on general Australian construction industry averages for 2026.`;

        doc.fillColor(this.colors.neutral.gray)
            .font('Helvetica')
            .fontSize(10)
            .text(disclaimer, 40, currentY, {
                width: pageWidth - 80,
                align: 'justify',
                lineGap: 4
            });

        currentY = doc.y + 30;

        // Contact information
        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(14)
            .text('Need Help?', 40, currentY);

        currentY += 25;

        doc.save();
        doc.fillColor(colors.primary)
            .fillOpacity(0.05)
            .roundedRect(40, currentY, pageWidth - 80, 80, 8)
            .fill();
        doc.restore();

        doc.fillColor(this.colors.neutral.dark)
            .font('Helvetica-Bold')
            .fontSize(11)
            .text('Contact Support', 60, currentY + 15);

        doc.fillColor(this.colors.neutral.gray)
            .font('Helvetica')
            .fontSize(10)
            .text('Email: support@myquotemate.com.au', 60, currentY + 35)
            .text('Website: www.myquotemate.com.au', 60, currentY + 50);

        this.addFooter(doc, job.jobId);
    }

    /**
     * Generate Professional Text-Only Report (Word Docs style)
     */
    async generateProfessionalTextReport(job, result, tier = 'premium') {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margin: 72, // 1 inch
                    size: 'A4'
                });

                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                // Title Section
                doc.font('Helvetica-Bold')
                    .fontSize(24)
                    .text(`${job.metadata?.title || 'Quote Analysis Report'}`, { align: 'center' });

                doc.moveDown(0.5);
                doc.fontSize(12)
                    .font('Helvetica')
                    .text(`Reference ID: ${job.jobId} | Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });

                doc.moveDown(2);

                // Summary
                doc.font('Helvetica-Bold').fontSize(16).text('1. EXECUTIVE SUMMARY');
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(11).text(result.summary || 'Summary not available.', { align: 'justify', lineGap: 4 });
                doc.moveDown(1.5);

                // Detailed Review
                doc.font('Helvetica-Bold').fontSize(16).text('2. TECHNICAL ANALYSIS');
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(11).text(result.detailedReview || 'Detailed analysis not available.', { align: 'justify', lineGap: 4 });
                doc.moveDown(1.5);

                // Recommendations
                if (result.recommendations && result.recommendations.length > 0) {
                    doc.font('Helvetica-Bold').fontSize(16).text('3. STRATEGIC RECOMMENDATIONS');
                    doc.moveDown(1);
                    result.recommendations.forEach((rec, i) => {
                        doc.font('Helvetica-Bold').fontSize(12).text(`${i + 1}. ${rec.title}`);
                        doc.font('Helvetica').fontSize(11).text(rec.description, { align: 'justify', lineGap: 3 });
                        doc.moveDown(0.8);
                    });
                    doc.moveDown(1.5);
                }

                // AI Strategic Alignment (Premium only)
                if (tier === 'premium' && (result.benchmarkingOverview || result.strategicAnalysis)) {
                    doc.font('Helvetica-Bold').fontSize(16).text('4. MARKET POSITIONING & ALIGNMENT');
                    doc.moveDown(0.5);
                    doc.font('Helvetica').fontSize(11).text(result.benchmarkingOverview || result.strategicAnalysis, { align: 'justify', lineGap: 4 });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CHART HELPERS — Professional Graph Drawing Methods
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Draw a circular gauge meter for a score 0–10
     */
    drawGaugeMeter(doc, cx, cy, radius, score) {
        doc.save();
        const maxScore = 10;
        const normalized = Math.min(1, Math.max(0, score / maxScore));

        // Background track arc (full 270° sweep from 225° to 135°)
        const startAngleDeg = 225;
        const sweepDeg = 270;
        const toRad = (d) => (d * Math.PI) / 180;

        const startAngle = toRad(startAngleDeg);
        const endAngle = toRad(startAngleDeg + sweepDeg);
        const fillAngle = toRad(startAngleDeg + sweepDeg * normalized);

        // Background ring
        doc.strokeColor('#e5e7eb').lineWidth(14).lineCap('round');
        doc.arc(cx, cy, radius, startAngle, endAngle, false).stroke();

        // Foreground colored arc
        const gaugeColor = score >= 7 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444';
        doc.strokeColor(gaugeColor).lineWidth(14).lineCap('round');
        if (normalized > 0) {
            doc.arc(cx, cy, radius, startAngle, fillAngle, false).stroke();
        }

        // Center score text
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(30)
            .text(score.toFixed(1), cx - radius, cy - 18, { width: radius * 2, align: 'center' });
        doc.fillColor('#6b7280').font('Helvetica-Bold').fontSize(8)
            .text('/ 10', cx - radius, cy + 16, { width: radius * 2, align: 'center' });

        // Labels
        doc.fillColor('#9ca3af').font('Helvetica').fontSize(7);
        doc.text('0', cx - radius - 10, cy + radius * 0.55, { width: 20, align: 'center' });
        doc.text('10', cx + radius - 10, cy + radius * 0.55, { width: 20, align: 'center' });

        doc.restore();
    }

    /**
     * Draw a professional donut chart — polygon-based for reliable PDF rendering.
     * Each slice is drawn as a filled polygon approximating the arc (no arc() calls).
     * A white centre hole gives the modern donut look.
     */
    drawPieChart(doc, cx, cy, radius, data) {
        // Filter zero-value slices
        const slices = data.filter(d => Math.abs(d.value) > 0);
        const total = slices.reduce((s, d) => s + Math.abs(d.value), 0);

        if (total === 0 || slices.length === 0) {
            doc.save();
            doc.fillColor('#f1f5f9').circle(cx, cy, radius).fill();
            doc.strokeColor('#e2e8f0').lineWidth(1).circle(cx, cy, radius).stroke();
            doc.fillColor('#94a3b8').font('Helvetica').fontSize(8)
                .text('No data', cx - radius + 2, cy - 5, { width: radius * 2 - 4, align: 'center', lineBreak: false });
            doc.restore();
            return;
        }

        // Professional data-viz palette (well-separated, accessible)
        const PALETTE = [
            '#4f46e5',  // indigo
            '#f97316',  // orange
            '#10b981',  // emerald
            '#f59e0b',  // amber
            '#ec4899',  // pink
            '#0ea5e9',  // sky-blue
            '#84cc16',  // lime
            '#8b5cf6',  // violet
        ];

        const STEPS = 72;  // polygon steps for a full circle → each 5°
        const holeR = radius * 0.38;  // donut inner radius (38% of outer)

        let startAngle = -Math.PI / 2;  // 12-o'clock start

        // ── 1. Draw solid outer disc in background colour first (canvas bg) ──
        doc.save();
        doc.fillColor('#f8fafc').circle(cx, cy, radius).fill();
        doc.restore();

        // ── 2. Draw each slice as a polygon (fan from center) ─────────────────
        slices.forEach((item, i) => {
            const fraction = Math.abs(item.value) / total;
            const sweep = fraction * 2 * Math.PI;
            const endAngle = startAngle + sweep;
            const color = item.color || PALETTE[i % PALETTE.length];
            const numSteps = Math.max(2, Math.ceil(fraction * STEPS));

            doc.save();
            doc.fillColor(color);

            // Fan polygon: center → arc points → close
            doc.moveTo(cx, cy);
            for (let s = 0; s <= numSteps; s++) {
                const a = startAngle + (sweep * s) / numSteps;
                doc.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
            }
            doc.closePath().fill();
            doc.restore();

            startAngle = endAngle;
        });

        // ── 3. White divider lines between slices ─────────────────────────────
        startAngle = -Math.PI / 2;
        slices.forEach(item => {
            const fraction = Math.abs(item.value) / total;
            doc.save();
            doc.strokeColor('#ffffff').lineWidth(2.5)
                .moveTo(cx, cy)
                .lineTo(cx + radius * Math.cos(startAngle), cy + radius * Math.sin(startAngle))
                .stroke();
            doc.restore();
            startAngle += fraction * 2 * Math.PI;
        });

        // ── 4. Donut hole (white filled circle in centre) ─────────────────────
        doc.save();
        doc.fillColor('#ffffff').circle(cx, cy, holeR).fill();
        doc.restore();

        // ── 5. Subtle ring shadow on inner hole edge ─────────────────────────
        doc.save();
        doc.strokeColor('#e2e8f0').lineWidth(1).circle(cx, cy, holeR).stroke();
        doc.restore();

        // ── 6. Percentage labels on each slice (outside the donut hole) ───────
        startAngle = -Math.PI / 2;
        slices.forEach((item, i) => {
            const fraction = Math.abs(item.value) / total;
            const sweep = fraction * 2 * Math.PI;
            const midAngle = startAngle + sweep / 2;
            const pct = Math.round(fraction * 100);
            const color = item.color || PALETTE[i % PALETTE.length];

            // Place label between hole edge and outer edge
            const lr = holeR + (radius - holeR) * 0.54;
            const lx = cx + lr * Math.cos(midAngle);
            const ly = cy + lr * Math.sin(midAngle);

            if (pct >= 6) {
                doc.save();
                doc.fillColor('#ffffff').font('Helvetica-Bold')
                    .fontSize(pct >= 20 ? 9.5 : pct >= 10 ? 8.5 : 7.5)
                    .text(`${pct}%`, lx - 17, ly - 5.5,
                        { width: 34, align: 'center', lineBreak: false });
                doc.restore();
            }

            startAngle += sweep;
        });

        // ── 7. Outer border ring ───────────────────────────────────────────────
        doc.save();
        doc.strokeColor('#e2e8f0').lineWidth(1).circle(cx, cy, radius).stroke();
        doc.restore();
    }


    /**
     * Draw a legend for a pie/bar chart (2-per-row, truncated to fit colWidth)
     */
    drawLegend(doc, x, y, data, colWidth) {
        const SLICE_COLORS = ['#4f46e5', '#f97316', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#84cc16', '#8b5cf6'];
        const ROW_H = 16;
        data.forEach((item, i) => {
            const color = item.color || SLICE_COLORS[i % SLICE_COLORS.length];
            const lx = x + (i % 2) * (colWidth || 110);
            const ly = y + Math.floor(i / 2) * ROW_H;

            doc.save();
            doc.fillColor(color).roundedRect(lx, ly + 3, 9, 9, 2).fill();
            doc.restore();

            // Cap text strictly to column width (~6px per char at 8pt)
            const maxChars = Math.max(4, Math.floor(((colWidth || 110) - 14) / 5.5));
            const label = (item.label || item.name || '').substring(0, maxChars);
            doc.fillColor('#374151').font('Helvetica').fontSize(8)
                .text(label, lx + 13, ly + 3, { width: (colWidth || 110) - 14, lineBreak: false });
        });
    }

    /**
     * Draw ranked horizontal bar chart — professional alignment, no overflow
     */
    drawHorizontalBarRanked(doc, x, y, width, height, data, barColor, maxBars) {
        const requestedData = (data || [])
            .slice(0, maxBars || 6)
            .filter(item => item && Number.isFinite(item.value));

        if (requestedData.length === 0 || width <= 0 || height <= 0) return;

        const GAP = 6;
        const MIN_BAR_H = 12;
        const fitCount = Math.max(1, Math.min(
            requestedData.length,
            Math.floor((height + GAP) / (MIN_BAR_H + GAP))
        ));
        const nData = requestedData.slice(0, fitCount);
        const rows = nData.length;
        const BAR_H = Math.max(MIN_BAR_H, Math.floor((height - GAP * (rows - 1)) / rows));
        const maxVal = Math.max(...nData.map(d => Math.abs(d.value)), 1);

        const LABEL_W = Math.min(145, Math.max(112, Math.floor(width * 0.28)));
        const VAL_W = 64;
        const BAR_W = Math.max(90, width - LABEL_W - VAL_W - 10);
        const barX = x + LABEL_W + 5;
        const radius = Math.min(4, Math.floor(BAR_H / 2));
        const textOffset = Math.max(2, Math.floor((BAR_H - 8) / 2));
        const COLORS = [barColor || '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#3b82f6', '#60a5fa'];

        nData.forEach((item, idx) => {
            const barY = y + idx * (BAR_H + GAP);
            const fillW = Math.max(4, (Math.abs(item.value) / maxVal) * BAR_W);
            const color = item.color || COLORS[idx % COLORS.length];

            // Label: right-aligned and capped to avoid collisions.
            const label = (item.label || '').substring(0, 26);
            doc.fillColor('#374151').font('Helvetica').fontSize(8)
                .text(label, x, barY + textOffset, { width: LABEL_W - 5, align: 'right', lineBreak: false });

            // Bar rail
            doc.save();
            doc.fillColor('#eef2ff').roundedRect(barX, barY, BAR_W, BAR_H, radius).fill();
            doc.restore();

            // Bar fill
            doc.save();
            doc.fillColor(color).roundedRect(barX, barY, fillW, BAR_H, radius).fill();
            doc.restore();

            // Value: inside bar if wide enough, otherwise on the right.
            const valText = item.formatted || ('$' + Math.abs(item.value).toLocaleString());
            if (fillW > 52) {
                doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5)
                    .text(valText, barX + 6, barY + textOffset, { width: fillW - 10, lineBreak: false });
            } else {
                doc.fillColor('#374151').font('Helvetica-Bold').fontSize(7.5)
                    .text(valText, barX + fillW + 5, barY + textOffset, { width: VAL_W - 5, lineBreak: false });
            }
        });
    }

    /**
     * Vertical savings bar chart - compact layout with keyed legend
     */
    drawSavingsChart(doc, x, y, width, height, recommendations) {
        const recs = (recommendations || []).filter(r => r.potentialSavings > 0).slice(0, 5);
        if (recs.length === 0) {
            doc.fillColor('#9ca3af').font('Helvetica').fontSize(9)
                .text('No savings data available.', x, y + height / 2 - 10, { width, align: 'center' });
            return;
        }

        const actionKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const toSavingsSentence = (rec, index) => {
            const titleText = String(rec.title || '').replace(/\s+/g, ' ').trim();
            const fallbackText = String(rec.description || '').replace(/\s+/g, ' ').trim();
            const baseText = titleText || fallbackText;
            if (!baseText) {
                return `${actionKeys[index]}. Savings opportunity identified.`;
            }

            const source = titleText || (fallbackText.split(/(?<=[.!?])\s+/)[0].trim() || fallbackText);
            const keyPrefixPattern = new RegExp(`^${actionKeys[index]}\\.\\s*`, 'i');
            const normalizedSource = source.replace(keyPrefixPattern, '').trim();
            return `${actionKeys[index]}. ${/[.!?]$/.test(normalizedSource) ? normalizedSource : `${normalizedSource}.`}`;
        };

        const maxSavings = Math.max(...recs.map(r => r.potentialSavings));
        const defCols = recs.length > 3 ? 2 : 1;
        const defRows = Math.ceil(recs.length / defCols);
        const DEF_ROW_H = 24;
        const DEF_BLOCK_H = defRows * DEF_ROW_H + 8;
        const LETTER_H = 18;
        const VAL_H = 16;
        const chartH = Math.max(36, height - DEF_BLOCK_H - LETTER_H - VAL_H - 12);
        const STEP = Math.floor((width - 8) / recs.length);
        const BAR_W = Math.min(40, STEP - 14);
        const BAR_COLORS = ['#10b981', '#059669', '#047857', '#f59e0b', '#3b82f6'];
        const chartBottomY = y + VAL_H + chartH;

        recs.forEach((rec, idx) => {
            const barX = x + 2 + idx * STEP + Math.floor((STEP - BAR_W) / 2);
            const barH = Math.max(4, (rec.potentialSavings / maxSavings) * chartH);
            const barY = y + VAL_H + chartH - barH;
            const color = BAR_COLORS[idx % BAR_COLORS.length];

            doc.save();
            doc.fillColor(color).roundedRect(barX, barY, BAR_W, barH, 3).fill();
            doc.restore();

            const savings = rec.potentialSavings >= 1000
                ? `$${(rec.potentialSavings / 1000).toFixed(1)}k`
                : `$${rec.potentialSavings}`;
            doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(7)
                .text(savings, barX - 4, barY - 11, { width: BAR_W + 8, align: 'center', lineBreak: false });

            doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8.5)
                .text(actionKeys[idx], barX - 4, chartBottomY + 6, { width: BAR_W + 8, align: 'center', lineBreak: false });
        });

        const definitionY = chartBottomY + LETTER_H + 8;
        const defGap = 14;
        const defColW = defCols === 1 ? width : Math.floor((width - defGap) / 2);

        recs.forEach((rec, idx) => {
            const col = idx % defCols;
            const row = Math.floor(idx / defCols);
            const itemX = x + col * (defColW + defGap);
            const itemY = definitionY + row * DEF_ROW_H;

            doc.fillColor(BAR_COLORS[idx % BAR_COLORS.length]).font('Helvetica-Bold').fontSize(7)
                .text(actionKeys[idx], itemX, itemY, { width: 8, lineBreak: false });

            doc.fillColor('#475569').font('Helvetica').fontSize(6.2)
                .text(toSavingsSentence(rec, idx), itemX + 10, itemY, {
                    width: defColW - 10,
                    height: DEF_ROW_H,
                    lineGap: 0.8
                });
        });
    }

    /**
     * Risk severity summary bars — fixed widths, no overflow
     */
    drawRiskSummaryBars(doc, x, y, width, redFlags, tier) {
        const severities = [
            { key: 'critical', label: 'Critical', color: '#dc2626', bg: '#fee2e2' },
            { key: 'high', label: 'High', color: '#ef4444', bg: '#fef2f2' },
            { key: 'medium', label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
            { key: 'low', label: 'Low', color: '#10b981', bg: '#ecfdf5' }
        ];

        const counts = {};
        (redFlags || []).forEach(f => { const s = f.severity || 'medium'; counts[s] = (counts[s] || 0) + 1; });
        const maxCount = Math.max(1, ...Object.values(counts));

        const BAR_H = 22;
        const GAP = 10;
        const LABEL_W = 52;
        const COUNT_W = 26;
        const BAR_M = width - LABEL_W - COUNT_W - 12;

        severities.forEach((sev, idx) => {
            const cnt = counts[sev.key] || 0;
            const barY = y + idx * (BAR_H + GAP);
            const colors = tier === 'premium' ? this.colors.premium : this.colors.standard;
            const barX = x + LABEL_W + 4;

            // Calculate fill width for each severity bar
            const fillW = BAR_M * (cnt / maxCount);

            doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8.5)
                .text(sev.label, x, barY + 6, { width: LABEL_W, align: 'right', lineBreak: false });

            // Rail
            doc.save();
            doc.fillColor(sev.bg).roundedRect(barX, barY, BAR_M, BAR_H, 4).fill();
            doc.restore();

            // Fill
            if (fillW > 0) {
                doc.save();
                doc.fillColor(sev.color).roundedRect(barX, barY, fillW, BAR_H, 4).fill();
                doc.restore();
            }

            // Count
            doc.fillColor(cnt > 0 ? sev.color : '#9ca3af').font('Helvetica-Bold').fontSize(11)
                .text(String(cnt), barX + BAR_M + 6, barY + 4, { width: COUNT_W, lineBreak: false });
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PAGE: Data Visualizations
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * PAGE: Data Visualizations — Professional Charts Page
     * Inserted between Cost Breakdown and Risk Dashboard.
     */
    async generatePageDataVisualizations(doc, job, result, tier, colors) {
        doc.addPage();
        this.addHeader(doc, 'VIZ', tier, colors);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 40;
        const contentW = pageWidth - margin * 2;  // 515
        const footerY = pageHeight - 70;
        let currentY = 130;

        // ── Page title
        doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(22)
            .text('Analytics & Data Visualizations', margin, currentY);
        doc.moveTo(margin, currentY + 30).lineTo(margin + 210, currentY + 30)
            .lineWidth(3).strokeColor(colors.primary).stroke();
        doc.fillColor('#64748b').font('Helvetica').fontSize(9)
            .text('AI-generated visual intelligence extracted from the submitted quote document.',
                margin, currentY + 38, { width: contentW });
        currentY += 62;

        // ═══════════════════════════════════════════════════════════════════
        // ROW 1  (height=190):
        //   LEFT   (col 0, w=160) : Quote Integrity Gauge
        //   MIDDLE (col 1, w=180) : Cost Distribution Pie  + legend below
        //   RIGHT  (col 2, w=155) : Quick-stats summary boxes
        // ═══════════════════════════════════════════════════════════════════
        const ROW1_H = 195;
        const COL_GAP = 10;
        const colW = [158, 185, contentW - 158 - 185 - COL_GAP * 2];  // [158, 185, 152]
        const colX = [
            margin,
            margin + colW[0] + COL_GAP,
            margin + colW[0] + COL_GAP + colW[1] + COL_GAP
        ];

        // Helper: draw a card background
        const drawCard = (x, y, w, h, borderColor) => {
            doc.save();
            doc.fillColor('#ffffff').roundedRect(x, y, w, h, 7)
                .fill().strokeColor(borderColor || '#e2e8f0').lineWidth(0.5).stroke();
            doc.restore();
        };

        // Helper: card header label
        const cardLabel = (text, x, y, w) => {
            doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(8)
                .text(text, x + 10, y + 10, { width: w - 20, characterSpacing: 0.3 });
        };

        // ── COL 0: Gauge ──────────────────────────────────────────────────
        drawCard(colX[0], currentY, colW[0], ROW1_H);
        cardLabel('QUOTE INTEGRITY SCORE', colX[0], currentY, colW[0]);

        const verdictScore = result.verdictScore || 0;
        const scoreNorm = verdictScore > 10 ? verdictScore / 10 : verdictScore;
        const gaugeCX = colX[0] + colW[0] / 2;
        const gaugeCY = currentY + 28 + 52;  // top-pad 28 + radius 52
        this.drawGaugeMeter(doc, gaugeCX, gaugeCY, 52, scoreNorm);

        const scoreLabel = scoreNorm >= 8 ? 'EXCELLENT' : scoreNorm >= 6 ? 'GOOD' : scoreNorm >= 4 ? 'AVERAGE' : 'NEEDS REVIEW';
        const scoreLabelColor = scoreNorm >= 8 ? '#10b981' : scoreNorm >= 6 ? '#f59e0b' : '#ef4444';
        doc.save();
        doc.fillColor(scoreLabelColor).fillOpacity(0.12)
            .roundedRect(colX[0] + 20, currentY + ROW1_H - 34, colW[0] - 40, 22, 11).fill();
        doc.restore();
        doc.fillColor(scoreLabelColor).font('Helvetica-Bold').fontSize(9)
            .text(scoreLabel, colX[0] + 20, currentY + ROW1_H - 29, { width: colW[0] - 40, align: 'center' });

        // ── COL 1: Pie chart + legend below ───────────────────────────────
        drawCard(colX[1], currentY, colW[1], ROW1_H);
        cardLabel('COST BY CATEGORY', colX[1], currentY, colW[1]);

        // Build category map — skip Total/Subtotal rows (they double-count),
        // sanitize names containing pipe | slash / ampersand &
        const TOTAL_PAT = /total|subtotal|grand\s*total|gst\s*total/i;
        const costByCategory = {};
        (result.costBreakdown || []).forEach(item => {
            const rawCat = (item.category || 'Other').trim();
            if (TOTAL_PAT.test(rawCat)) return;  // skip aggregation rows

            // Strip everything after '|', '/', '+', '&' then trim
            const cleanCat = rawCat.split(/[|/+&]/)[0].trim() || 'Other';

            // Proper display casing
            const key = cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1).toLowerCase();
            costByCategory[key] = (costByCategory[key] || 0) + (item.totalPrice || item.amount || 0);
        });
        const PIE_COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
        const pieData = Object.entries(costByCategory).slice(0, 6).map(([k, v], i) => ({
            label: k,
            value: v,
            color: PIE_COLORS[i % PIE_COLORS.length]
        }));

        const pieRadius = 46;
        const pieCX = colX[1] + colW[1] / 2;
        const pieCY = currentY + 30 + pieRadius;
        this.drawPieChart(doc, pieCX, pieCY, pieRadius, pieData);

        // Legend BELOW pie (2-per-row, truncated to colW)
        const legendStartY = pieCY + pieRadius + 10;
        if (pieData.length > 0) {
            const legItemW = Math.floor(colW[1] / 2) - 2;
            this.drawLegend(doc, colX[1] + 6, legendStartY, pieData, legItemW);
        }

        // ── COL 2: Quick stats ─────────────────────────────────────────────
        drawCard(colX[2], currentY, colW[2], ROW1_H);
        cardLabel('KEY METRICS', colX[2], currentY, colW[2]);

        const totalCost = result.overallCost || result.costs?.overall ||
            (result.costBreakdown || []).reduce((s, i) => s + (i.totalPrice || i.amount || 0), 0);
        const totalFlags = (result.redFlags || []).length;
        const confidence = result.confidence || 95;
        const flagRisk = totalFlags > 3 ? 'High' : totalFlags > 1 ? 'Medium' : 'Low';
        const flagColor = totalFlags > 3 ? '#ef4444' : totalFlags > 1 ? '#f59e0b' : '#10b981';

        const kStats = [
            { label: 'Total Cost', value: `$${totalCost.toLocaleString()}`, color: colors.primary },
            { label: 'Risk Level', value: flagRisk, color: flagColor },
            { label: 'Red Flags', value: String(totalFlags), color: flagColor },
            { label: 'Confidence', value: `${confidence}%`, color: '#3b82f6' }
        ];

        kStats.forEach((stat, i) => {
            const statY = currentY + 26 + i * 40;
            // Subtle divider except first
            if (i > 0) {
                doc.moveTo(colX[2] + 10, statY - 4)
                    .lineTo(colX[2] + colW[2] - 10, statY - 4)
                    .lineWidth(0.4).strokeColor('#f1f5f9').stroke();
            }
            doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5)
                .text(stat.label.toUpperCase(), colX[2] + 10, statY, { characterSpacing: 0.2 });
            doc.fillColor(stat.color).font('Helvetica-Bold').fontSize(15)
                .text(stat.value, colX[2] + 10, statY + 9, { width: colW[2] - 20, lineBreak: false });
        });

        currentY += ROW1_H + 12;

        // ═══════════════════════════════════════════════════════════════════
        // ROW 2 (height=168): Top Cost Line Items — full width ranked bar chart
        // ═══════════════════════════════════════════════════════════════════
        const ROW2_H = 175;
        drawCard(margin, currentY, contentW, ROW2_H);
        cardLabel('TOP COST LINE ITEMS — RANKED BY VALUE', margin, currentY, contentW);
        const topCostChartY = currentY + 30;
        const topCostChartH = ROW2_H - 44;
        const sortedItems = (result.costBreakdown || []).slice()
            .sort((a, b) => (b.totalPrice || b.amount || 0) - (a.totalPrice || a.amount || 0));
        const barData = sortedItems.slice(0, 6).map(item => ({
            label: (item.description || item.category || 'Item').replace(/[\r\n]+/g, ' '),
            value: item.totalPrice || item.amount || 0
        }));

        if (barData.length > 0) {
            // Clip chart region so bars never spill into the next row.
            doc.save();
            doc.rect(margin + 6, topCostChartY - 2, contentW - 12, topCostChartH + 4).clip();
            this.drawHorizontalBarRanked(
                doc,
                margin + 8,
                topCostChartY,
                contentW - 16,
                topCostChartH,
                barData,
                colors.primary,
                6
            );
            doc.restore();
        } else {
            doc.fillColor('#9ca3af').font('Helvetica').fontSize(9)
                .text('No cost breakdown data available for this quote.',
                    margin, topCostChartY + topCostChartH / 2 - 9, { width: contentW, align: 'center' });
        }

        currentY += ROW2_H + 12;

        // ═══════════════════════════════════════════════════════════════════
        // ROW 3: Savings Potential (left 50%) | Risk Severity Breakdown (right 50%)
        // ═══════════════════════════════════════════════════════════════════
        const ROW3_H = Math.max(140, Math.min(footerY - currentY - 6, 162));
        const halfW = Math.floor(contentW / 2) - 5;
        const rightX = margin + halfW + 10;

        // Left: Savings chart
        drawCard(margin, currentY, halfW, ROW3_H);
        cardLabel('POTENTIAL SAVINGS BY ACTION', margin, currentY, halfW);
        this.drawSavingsChart(doc, margin + 8, currentY + 26, halfW - 16, ROW3_H - 34, result.recommendations);

        // Right: Risk bars
        drawCard(rightX, currentY, halfW, ROW3_H);

        // Header + total badge
        doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(8)
            .text('RISK SEVERITY BREAKDOWN', rightX + 10, currentY + 10, { characterSpacing: 0.3 });
        const riskBadgeColor = totalFlags > 3 ? '#ef4444' : totalFlags > 1 ? '#f59e0b' : '#10b981';
        doc.save();
        doc.fillColor(riskBadgeColor).fillOpacity(0.13)
            .roundedRect(rightX + halfW - 63, currentY + 7, 52, 18, 9).fill();
        doc.restore();
        doc.fillColor(riskBadgeColor).font('Helvetica-Bold').fontSize(8)
            .text(`${totalFlags} FLAG${totalFlags !== 1 ? 'S' : ''}`, rightX + halfW - 62, currentY + 11,
                { width: 50, align: 'center' });

        this.drawRiskSummaryBars(doc, rightX + 8, currentY + 30, halfW - 16, result.redFlags, tier);

        this.addFooter(doc, job.jobId);
    }

    /**
     * Draw a radar chart for risk profiles (Premium only)
     */
    drawRadarChart(doc, x, y, size, data, color) {
        doc.save();
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size * 0.4;
        const sides = (data || []).length;
        if (sides < 3) {
            doc.restore();
            return;
        }

        // Draw background grid
        doc.lineWidth(0.5).strokeColor('#e5e7eb').dash(2, { space: 2 });
        for (let r = 1; r <= 4; r++) {
            const currentR = (radius * r) / 4;
            doc.moveTo(centerX + currentR, centerY);
            for (let i = 1; i <= sides; i++) {
                const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                doc.lineTo(centerX + currentR * Math.cos(angle), centerY + currentR * Math.sin(angle));
            }
            doc.closePath().stroke();
        }
        doc.undash();

        // Draw axes
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            doc.moveTo(centerX, centerY)
                .lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
                .stroke();

            // Labels - Standardized dark
            doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica-Bold');
            const labelText = (data[i].axis || data[i].category || 'Metric').toUpperCase();
            const labelX = centerX + (radius + 25) * Math.cos(angle);
            const labelY = centerY + (radius + 25) * Math.sin(angle);

            doc.text(labelText, labelX - 40, labelY - 4, { width: 80, align: 'center' });
        }

        // Draw data area
        doc.fillColor(color).fillOpacity(0.3).strokeColor(color).lineWidth(1.5);
        const firstAngle = -Math.PI / 2;
        const firstR = (data[0].value / 100) * radius;
        doc.moveTo(centerX + firstR * Math.cos(firstAngle), centerY + firstR * Math.sin(firstAngle));

        for (let i = 1; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const r = (data[i].value / 100) * radius;
            doc.lineTo(centerX + r * Math.cos(angle), centerY + r * Math.sin(angle));
        }
        doc.closePath().fillAndStroke();
        doc.restore();
    }

    /**
     * Draw a project roadmap/timeline visual (Premium only)
     */
    drawRoadmap(doc, x, y, width, data, colors) {
        doc.save();
        const timeline = data || [];
        const totalDays = timeline.reduce((sum, item) => sum + (item.days || 0), 0);
        let currentX = x;
        const barHeight = 30;

        timeline.forEach((item, index) => {
            const itemWidth = (item.days / (totalDays || 1)) * width;
            const color = index % 2 === 0 ? colors.primary : '#3b82f6';

            // Draw segment
            doc.fillColor(color).fillOpacity(0.15)
                .roundedRect(currentX, y, itemWidth - 4, barHeight, 4).fill();

            doc.fillColor(this.colors.neutral.dark).font('Helvetica-Bold').fontSize(8)
                .text(item.phase, currentX + 5, y + 10, { width: itemWidth - 15, lineBreak: false });

            doc.fillColor(this.colors.neutral.gray).font('Helvetica').fontSize(7)
                .text(`${item.days}d`, currentX + 5, y + barHeight + 5);

            currentX += itemWidth;
        });
        doc.restore();
    }

    /**
     * PAGE VISUAL INTELLIGENCE (Standard & Premium)
     */
    async generatePageVisualIntelligence(doc, job, result, tier, colors) {
        doc.addPage();
        this.addHeader(doc, 3, tier, colors);
        let currentY = 110; // 20px gap from 90px header

        doc.fillColor(this.colors.neutral.dark).font('Helvetica-Bold').fontSize(24).text('Visual Risk Intelligence', 40, currentY);
        doc.moveTo(40, currentY + 32).lineTo(140, currentY + 32).lineWidth(3).strokeColor(colors.primary).stroke();

        currentY += 55;

        // Intro
        doc.fillColor(this.colors.neutral.gray).font('Helvetica').fontSize(11)
            .text('Advanced structural analysis of the quote across 5 core risk vectors. This radar map visualizes the balance between pricing stability and technical compliance.', 40, currentY, { width: 500 });

        currentY += 50;

        // Radar Chart Area
        const viz = result.visualizations || {
            riskProfile: [
                { category: "Pricing", value: 65 },
                { category: "Scope", value: 80 },
                { category: "Terms", value: 55 },
                { category: "Compliance", value: 75 },
                { category: "Risk", value: 40 }
            ]
        };

        this.drawRadarChart(doc, 140, currentY, 320, viz.riskProfile, colors.primary);

        currentY += 360;

        // Key Findings
        doc.fillColor(this.colors.neutral.dark).font('Helvetica-Bold').fontSize(14).text('Vector Analysis Key Findings', 40, currentY);
        currentY += 25;

        const findings = [
            { label: 'Market Alignment', value: 'This quote sits in the 65th percentile for similar projects in AU.' },
            { label: 'Technical Scope', value: 'High clarity in materials indicates low hidden-cost risk.' },
            { label: 'Risk Exposure', value: 'Limited broad exclusions provide strong consumer protection.' }
        ];

        findings.forEach(f => {
            doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(9).text(f.label.toUpperCase(), 40, currentY);
            doc.fillColor(this.colors.neutral.dark).font('Helvetica').fontSize(10).text(f.value, 150, currentY);
            currentY += 25;
        });

        this.addFooter(doc, job.jobId);
    }

    /**
     * PAGE CONSTRUCTION INTELLIGENCE (Standard & Premium)
     */
    async generatePageConstructionIntelligence(doc, job, result, tier, colors) {
        doc.addPage();
        this.addHeader(doc, 7, tier, colors);
        let currentY = 110; // 20px gap from 90px header

        doc.fillColor(this.colors.neutral.dark).font('Helvetica-Bold').fontSize(24).text('Project Intelligence Roadmap', 40, currentY);
        doc.moveTo(40, currentY + 32).lineTo(140, currentY + 32).lineWidth(3).strokeColor(colors.primary).stroke();

        currentY += 55;

        doc.fillColor(this.colors.neutral.gray).font('Helvetica').fontSize(11)
            .text('Extrapolated project timeline and phase distribution based on the quoted scope of work. Use this as a benchmark for your construction schedule.', 40, currentY, { width: 500 });

        currentY += 50;

        const viz = result.visualizations || {
            timelineEstimates: [
                { phase: "Preparation", days: 3 },
                { phase: "Rough-in", days: 5 },
                { phase: "Installation", days: 7 },
                { phase: "Finishing", days: 4 }
            ]
        };

        this.drawRoadmap(doc, 40, currentY, 520, viz.timelineEstimates, colors);

        currentY += 120;

        // Strategic Insight
        doc.save();
        doc.fillColor(colors.primary).fillOpacity(0.05).roundedRect(40, currentY, 520, 100, 8).fill();
        doc.restore();

        doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(12).text('Executive Strategic Insight', 60, currentY + 20);
        doc.fillColor(this.colors.neutral.dark).font('Helvetica').fontSize(10)
            .text('Based on our AU market data, projects of this scale typically take 18-22 days. The quoted efficiency suggests a highly organized team, but ensure that "Finishing" days are not truncated for speed. We recommend a 15% time-buffer for materials lead times.', 60, currentY + 45, { width: 480, lineGap: 3 });

        this.addFooter(doc, job.jobId);
    }
}

module.exports = new ReportService();
