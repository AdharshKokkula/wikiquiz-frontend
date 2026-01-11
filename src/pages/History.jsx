import React, { useEffect, useState } from 'react';
import API from '../api';
import { QuizDisplay } from './GenerateQuiz';
import { Eye, X, Calendar, Link as LinkIcon, Search, Trophy } from 'lucide-react';

const History = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await API.get('/quizzes');
            // Sort by newest first
            setQuizzes(res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } catch (err) {
            console.error("Failed to fetch history");
        } finally {
            setLoading(false);
        }
    };

    const loadDetails = async (id) => {
        try {
            const res = await API.get(`/quizzes/${id}`);
            setSelectedQuiz(res.data);
        } catch (err) {
            alert("Failed to load details");
        }
    };

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 md:space-y-8 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Quiz History</h1>
                    <p className="text-gray-500 text-sm md:text-base">Manage your previously generated quizzes and track your best scores.</p>
                </div>

                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-72 pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <div className="animate-spin h-8 w-8 border-4 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading history...</p>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 border border-gray-100">
                        <Calendar className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No quizzes yet</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">
                        Generate your first quiz to see it listed here.
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[750px] md:min-w-0">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">ID</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Article Title</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Source</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 hidden sm:table-cell">Date</th>
                                    {/* New Score Column */}
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Best Score</th>
                                    <th className="p-4 pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredQuizzes.map((q) => (
                                    <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4 pl-6 text-sm text-gray-400 font-mono font-medium">#{q.id}</td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{q.title}</div>
                                        </td>
                                        <td className="p-4">
                                            <a href={q.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-blue-100">
                                                <LinkIcon className="h-3 w-3" />
                                                Article
                                            </a>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 hidden sm:table-cell">
                                            {new Date(q.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        {/* Render Best Score */}
                                        <td className="p-4">
                                            {q.top_score !== null && q.top_score !== undefined ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100 text-xs font-bold">
                                                    <Trophy className="h-3 w-3" />
                                                    {q.top_score} pts
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic pl-1">No attempts</span>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button
                                                onClick={() => loadDetails(q.id)}
                                                className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-lg text-xs font-medium inline-flex items-center gap-2 shadow-sm transition-all"
                                            >
                                                View <Eye className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredQuizzes.length === 0 && (
                        <div className="p-12 text-center text-gray-500 text-sm">
                            No quizzes match your search.
                        </div>
                    )}
                </div>
            )}

            {/* Full Screen Details Modal */}
            {selectedQuiz && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 border border-gray-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white rounded-t-2xl z-20">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Quiz Details</h2>
                                {selectedQuiz.top_score !== null && selectedQuiz.top_score !== undefined && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold shadow-sm">
                                        <Trophy className="h-3 w-3" /> Best: {selectedQuiz.top_score}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedQuiz(null)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                title="Close Esc"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
                            <QuizDisplay data={selectedQuiz} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
