// client/src/pages/AnalysisPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Shield, Printer, Share2 } from 'lucide-react';
import quoteApi from '../services/quoteApi';
import AnalysisResults from '../components/AnalysisResults';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

const AnalysisPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [job, setJob] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const jobData = await quoteApi.getJob(jobId);
                setJob(jobData);

                if (jobData.status === 'completed') {
                    const resultData = await quoteApi.getJobResult(jobId);
                    setResult(resultData);
                } else {
                    setError('Analysis is still in progress or failed.');
                }
            } catch (err) {
                console.error('Failed to load analysis:', err);
                setError('Failed to load analysis results. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [jobId]);

    const handleDownloadPDF = async () => {
        if (!job || !job.documents?.[0]) return;
        try {
            const docId = job.documents[0]._id || job.documents[0];
            const data = await quoteApi.downloadDocument(jobId, docId);
            if (data.url) {
                window.open(data.url, '_blank');
            }
        } catch (err) {
            console.error('Download failed:', err);
            Swal.fire({
                title: 'Download Failed',
                text: 'Failed to download original document. Please try again.',
                icon: 'error',
                confirmButtonColor: '#f97316'
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">Loading Analysis...</h2>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error || 'Analysis results not found.'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to My Reports
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Reports
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        title="Print Report"
                    >
                        <Printer className="w-5 h-5" />
                    </button>
                </div>

                {/* Header */}
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-orange-600 text-sm font-bold uppercase tracking-wider mb-2">
                                <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                                Full Analysis Report
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 mb-4">
                                {job.metadata?.filename || 'Quote Analysis'}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                                    <Shield className="w-4 h-4" />
                                    {job.tier} Plan
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                                    Analyzed: {new Date(job.createdAt).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' })}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Action buttons could go here */}
                        </div>
                    </div>

                    <AnalysisResults
                        jobResult={result}
                        userTier={job.tier?.toLowerCase() || 'free'}
                    />
                </div>

                {/* Footer Section */}
                <div className="text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} MyQuoteMate. All rights reserved.</p>
                    <p className="mt-1">Generated by Advanced Construction AI Analysis</p>
                </div>
            </div>
        </div>
    );
};

export default AnalysisPage;
